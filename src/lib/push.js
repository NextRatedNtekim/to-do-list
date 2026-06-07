// src/lib/push.js
// Web Push registration + local alarm scheduler
// Called once from App.jsx on mount via registerSW()

import { savePushSubscription } from './supabase';

// ─── 1. Register Service Worker + subscribe to push ──────────────────────────
export async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service Workers not supported in this browser.');
    return;
  }
  if (!('PushManager' in window)) {
    console.warn('[Push] Web Push not supported in this browser.');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[Push] Service Worker registered:', reg.scope);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Notification permission denied.');
      return;
    }

    // Check if already subscribed
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await savePushSubscription(existing);
      return;
    }

    // Subscribe with VAPID key from .env
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('[Push] VITE_VAPID_PUBLIC_KEY not set in .env');
      return;
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await savePushSubscription(subscription);
    console.log('[Push] Subscribed successfully.');
  } catch (err) {
    console.error('[Push] Registration failed:', err);
  }
}

// ─── 2. Schedule client-side local alarms (when app is open) ──────────────────
// Called whenever a task with alarm_time is loaded or created.
// Uses setTimeout + Web Notifications API as a fallback for when the app is open.

const scheduledTimers = new Map(); // taskId → [timeoutId, ...]

export function scheduleLocalAlarm(task) {
  const { id: taskId, title, alarm_time, reminder_offsets = [60, 30, 10] } = task;

  // Cancel any existing timers for this task
  cancelLocalAlarm(taskId);

  const alarmMs = new Date(alarm_time).getTime();
  const now     = Date.now();
  const timers  = [];

  // Pre-task reminders
  reminder_offsets.forEach((mins) => {
    const fireAt = alarmMs - mins * 60 * 1000;
    const delay  = fireAt - now;
    if (delay > 0) {
      const t = setTimeout(() => {
        fireLocalNotification({
          title: `${title} in ${mins} minute${mins > 1 ? 's' : ''}`,
          body:  getPreTaskCopy(mins),
          tag:   `alarm-pre-${taskId}-${mins}`,
          url:   '/',
        });
      }, delay);
      timers.push(t);
    }
  });

  // Task start alarm
  const startDelay = alarmMs - now;
  if (startDelay > 0) {
    const t = setTimeout(() => {
      fireLocalNotification({
        title: `Time for: ${title}`,
        body:  'Your accountability sprint starts now. Open focus mode.',
        tag:   `alarm-start-${taskId}`,
        url:   '/focus',
        actions: [
          { action: 'do_now',  title: '▶ Start now' },
          { action: 'dismiss', title: 'Dismiss'     },
        ],
      });
    }, startDelay);
    timers.push(t);
  }

  // Missed task detection — fires 30 min after alarm_time if not completed
  const missedDelay = alarmMs + 30 * 60 * 1000 - now;
  if (missedDelay > 0) {
    const t = setTimeout(() => {
      // The alarmStore will handle the missed state UI
      window.dispatchEvent(new CustomEvent('withtaskr:task-missed', { detail: { taskId, title } }));
    }, missedDelay);
    timers.push(t);
  }

  scheduledTimers.set(taskId, timers);
}

export function cancelLocalAlarm(taskId) {
  const timers = scheduledTimers.get(taskId);
  if (timers) {
    timers.forEach(clearTimeout);
    scheduledTimers.delete(taskId);
  }
}

export function cancelAllLocalAlarms() {
  scheduledTimers.forEach((timers) => timers.forEach(clearTimeout));
  scheduledTimers.clear();
}

// ─── 3. Helpers ───────────────────────────────────────────────────────────────

function fireLocalNotification({ title, body, tag, url, actions }) {
  if (Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      tag,
      icon:    '/icon-192.png',
      badge:   '/badge-72.png',
      data:    { url },
      actions: actions || [],
      vibrate: [200, 100, 200],
    });
  });
}

function getPreTaskCopy(mins) {
  if (mins >= 60) return 'Upcoming in 1 hour — plan ahead.';
  if (mins === 30) return 'Clear your space. Starting soon.';
  if (mins <= 10)  return 'Almost time — wrap up what you\'re doing.';
  return `Starting in ${mins} minutes.`;
}

// Converts VAPID base64 URL key to Uint8Array for PushManager.subscribe()
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}