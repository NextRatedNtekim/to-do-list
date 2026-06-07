// src/stores/alarmStore.js
import { create } from 'zustand';
import { scheduleLocalAlarm, cancelLocalAlarm } from '../lib/push';

/**
 * Manages alarm scheduling state and missed task detection.
 *
 * Flow:
 *  1. Tasks loaded → loadAlarms() called → schedules local timers
 *  2. Timer fires 'withtaskr:task-missed' event → triggerMissed()
 *  3. MissedTaskRecovery component shows → user picks action
 *  4. recoverMissed() clears state + updates DB
 */
export const useAlarmStore = create((set, get) => ({
  // Active alarms: { taskId, title, alarmTime, reminderOffsets }
  alarms: [],

  // Tasks past their alarm_time without completion
  missedTasks: [],

  // ─── Load alarms from tasks array ─────────────────────────────────────
  loadAlarms: (tasks) => {
    const tasksWithAlarms = tasks.filter(
      (t) => t.alarm_time && !t.completed_at && !t.missed_at
    );

    // Cancel all existing local timers first
    get().alarms.forEach((a) => cancelLocalAlarm(a.taskId));

    // Schedule new timers
    tasksWithAlarms.forEach((t) => {
      scheduleLocalAlarm({
        id:               t.id,
        title:            t.title,
        alarm_time:       t.alarm_time,
        reminder_offsets: t.reminder_offsets ?? [60, 30, 10],
      });
    });

    set({
      alarms: tasksWithAlarms.map((t) => ({
        taskId:          t.id,
        title:           t.title,
        alarmTime:       t.alarm_time,
        reminderOffsets: t.reminder_offsets ?? [60, 30, 10],
        priority:        t.priority,
      })),
    });
  },

  // ─── Add / update a single alarm ──────────────────────────────────────
  setAlarm: (task) => {
    cancelLocalAlarm(task.id);
    scheduleLocalAlarm({
      id:               task.id,
      title:            task.title,
      alarm_time:       task.alarm_time,
      reminder_offsets: task.reminder_offsets ?? [60, 30, 10],
    });

    set((s) => ({
      alarms: [
        ...s.alarms.filter((a) => a.taskId !== task.id),
        {
          taskId:          task.id,
          title:           task.title,
          alarmTime:       task.alarm_time,
          reminderOffsets: task.reminder_offsets ?? [60, 30, 10],
          priority:        task.priority,
        },
      ],
    }));
  },

  // ─── Remove an alarm (task completed or deleted) ───────────────────────
  clearAlarm: (taskId) => {
    cancelLocalAlarm(taskId);
    set((s) => ({
      alarms: s.alarms.filter((a) => a.taskId !== taskId),
    }));
  },

  // ─── Missed task detection ─────────────────────────────────────────────
  triggerMissed: (taskId, title) =>
    set((s) => ({
      missedTasks: s.missedTasks.find((m) => m.taskId === taskId)
        ? s.missedTasks
        : [...s.missedTasks, { taskId, title, missedAt: new Date().toISOString() }],
    })),

  recoverMissed: (taskId) =>
    set((s) => ({
      missedTasks: s.missedTasks.filter((m) => m.taskId !== taskId),
    })),

  clearAllMissed: () => set({ missedTasks: [] }),
}));

// ─── Listen for missed-task events from push.js ───────────────────────────────
// Call this once from App.jsx to wire up the event listener.
export function initAlarmListener() {
  window.addEventListener('withtaskr:task-missed', (e) => {
    const { taskId, title } = e.detail;
    useAlarmStore.getState().triggerMissed(taskId, title);
  });
}