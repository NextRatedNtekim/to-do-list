import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  uid,
  startOfDay,
  XP_PER_TASK,
  levelFromXP,
  STREAK_MILESTONES,
} from '@/utils/constants'

// ── Task Store ────────────────────────────────────────────────────
// persist() keeps tasks in localStorage as a cache.
// Supabase is the source of truth — syncFromSupabase() overwrites the cache on login.
// This means tasks show instantly on refresh while Supabase loads in background.
export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks:      [],
      categories: [],

      syncFromSupabase: (tasks) => set({ tasks }),

      addTask: (data) => {
        const task = {
          id:          uid(),
          text:        data.text,
          done:        false,
          priority:    data.priority  || 'medium',
          category:    data.category  || null,
          tags:        data.tags      || [],
          dueDate:     data.dueDate   || null,
          recurring:   data.recurring || null,
          notes:       data.notes     || '',
          subtasks:    data.subtasks  || [],
          created:     Date.now(),
          completedAt: null,
          xpAwarded:   false,
        }
        set(s => ({ tasks: [task, ...s.tasks] }))
        return task
      },

      updateTask: (id, updates) =>
        set(s => ({
          tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        })),

      deleteTask: (id) =>
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

      reorderTasks: (newOrder) => set({ tasks: newOrder }),

      toggleDone: (id) => {
        const { tasks } = get()
        const task = tasks.find(t => t.id === id)
        if (!task) return null
        const nowDone = !task.done
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, done: nowDone, completedAt: nowDone ? Date.now() : null }
              : t
          ),
        }))
        return { task, nowDone }
      },

      clearCompleted: () =>
        set(s => ({ tasks: s.tasks.filter(t => !t.done) })),

      clearAll: () => set({ tasks: [] }),

      addSubtask: (taskId, text) => {
        const sub = { id: uid(), text, done: false, created: Date.now() }
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t
          ),
        }))
      },

      toggleSubtask: (taskId, subId) =>
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(st => st.id === subId ? { ...st, done: !st.done } : st) }
              : t
          ),
        })),
    }),
    {
      name:    'taskr-tasks-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── User / XP / Streak Store ──────────────────────────────────────
export const useUserStore = create(
  persist(
    (set, get) => ({
      profile: {
        name:     'Taskr User',
        avatar:   null,
        joinedAt: Date.now(),
      },

      totalXP:    0,
      weeklyXP:   0,
      weekStart:  startOfDay(Date.now()),

      streak:           0,
      longestStreak:    0,
      lastCompletedDay: null,
      streakFreezes:    2,
      streakShields:    0,

      dailyActivity:      {},
      unlockedMilestones: [],

      loadProfile: (profile) => {
        if (!profile) return
        set({
          profile: {
            name:     profile.name   || 'Taskr User',
            avatar:   profile.avatar || null,
            joinedAt: Date.now(),
          },
          totalXP:            profile.totalXP            || 0,
          weeklyXP:           profile.weeklyXP           || 0,
          weekStart:          profile.weekStart           || startOfDay(Date.now()),
          streak:             profile.streak              || 0,
          longestStreak:      profile.longestStreak       || 0,
          lastCompletedDay:   profile.lastCompletedDay    || null,
          streakFreezes:      profile.streakFreezes       ?? 2,
          dailyActivity:      profile.dailyActivity       || {},
          unlockedMilestones: profile.unlockedMilestones  || [],
        })
      },

      updateProfile: (updates) =>
        set(s => ({ profile: { ...s.profile, ...updates } })),

      awardXP: (amount, taskId = null) => {
        const state = get()
        const now   = Date.now()
        const todayKey = new Date(now).toISOString().slice(0, 10)

        let { weeklyXP, weekStart } = state
        if (now - weekStart > 7 * 86400000) {
          weeklyXP  = 0
          weekStart = startOfDay(now)
        }

        const prev = state.dailyActivity[todayKey] || { completed: 0, xp: 0 }
        const newActivity = {
          ...state.dailyActivity,
          [todayKey]: {
            completed: prev.completed + (taskId ? 1 : 0),
            xp:        prev.xp + amount,
          },
        }

        set({
          totalXP:       state.totalXP + amount,
          weeklyXP:      weeklyXP + amount,
          weekStart,
          dailyActivity: newActivity,
        })
      },

      updateStreak: () => {
        const state = get()
        const now   = Date.now()
        const today = startOfDay(now)
        const { lastCompletedDay, streak, longestStreak, streakFreezes } = state

        if (lastCompletedDay === null) {
          set({ streak: 1, longestStreak: 1, lastCompletedDay: today })
          return { newStreak: 1, streakBroken: false }
        }

        const yesterday = today - 86400000
        if (lastCompletedDay === today) {
          return { newStreak: streak, streakBroken: false }
        }

        if (lastCompletedDay === yesterday) {
          const newStreak  = streak + 1
          const newLongest = Math.max(longestStreak, newStreak)
          set({ streak: newStreak, longestStreak: newLongest, lastCompletedDay: today })
          return { newStreak, streakBroken: false }
        }

        const daysMissed = Math.floor((today - lastCompletedDay) / 86400000) - 1
        if (daysMissed <= streakFreezes) {
          const newStreak  = streak + 1
          const newLongest = Math.max(longestStreak, newStreak)
          set({ streak: newStreak, longestStreak: newLongest, lastCompletedDay: today, streakFreezes: streakFreezes - daysMissed })
          return { newStreak, streakBroken: false, freezeUsed: daysMissed }
        }

        set({ streak: 1, lastCompletedDay: today })
        return { newStreak: 1, streakBroken: true, prevStreak: streak }
      },

      addStreakFreeze: () =>
        set(s => ({ streakFreezes: Math.min(s.streakFreezes + 1, 3) })),

      checkMilestones: () => {
        const { streak, unlockedMilestones } = get()
        const newMilestones = STREAK_MILESTONES.filter(
          m => streak >= m && !unlockedMilestones.includes(m)
        )
        if (newMilestones.length > 0) {
          set(s => ({ unlockedMilestones: [...s.unlockedMilestones, ...newMilestones] }))
          return newMilestones
        }
        return []
      },
    }),
    {
      name:    'taskr-user-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── UI Store (ephemeral) ──────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen:    true,
  activeView:     'dashboard',
  theme:          'dark',
  xpFloats:       [],
  toast:          null,
  levelUpVisible: false,
  onboardingDone: false,

  setSidebarOpen:    (v) => set({ sidebarOpen: v }),
  setActiveView:     (v) => set({ activeView: v }),
  toggleTheme:       ()  => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setTheme:          (t) => set({ theme: t }),
  setOnboardingDone: (v) => set({ onboardingDone: v }),
  showLevelUp:       ()  => set({ levelUpVisible: true }),
  hideLevelUp:       ()  => set({ levelUpVisible: false }),

  spawnXPFloat: (x, y, amount) => {
    const id = uid()
    set(s => ({ xpFloats: [...s.xpFloats, { id, x, y, amount }] }))
    setTimeout(() => set(s => ({ xpFloats: s.xpFloats.filter(f => f.id !== id) })), 1500)
  },

  showToast: (msg, type = 'info', duration = 3000) => {
    const id = uid()
    set({ toast: { id, msg, type, duration } })
    setTimeout(() => set(s => (s.toast?.id === id ? { toast: null } : {})), duration)
  },

  dismissToast: () => set({ toast: null }),
}))

// ── Leaderboard Store ─────────────────────────────────────────────
export const useLeaderboardStore = create(
  persist(
    (set) => ({
      entries: [
        { id: 'u1', name: 'Precious Ntekim',     avatar: null, xp: 750, streak: 23, rank: 1, weeklyXP: 300 },
        { id: 'u2', name: 'Prince Richard',  avatar: null, xp: 735, streak: 15, rank: 2, weeklyXP: 290 },
        { id: 'u3', name: 'Munachi Eze',    avatar: null, xp: 720, streak: 31, rank: 3, weeklyXP: 285 },
        { id: 'u4', name: 'Odudu Etim',  avatar: null, xp: 715, streak: 8,  rank: 4, weeklyXP: 280 },
        { id: 'u5', name: 'Joe Igwe', avatar: null, xp: 685, streak: 5,  rank: 5, weeklyXP: 250 },
        { id: 'u6', name: 'Samuel Akpan',   avatar: null, xp: 660, streak: 12, rank: 6, weeklyXP: 235 },
        { id: 'u7', name: 'David Ideyi',   avatar: null, xp: 650, streak: 3,  rank: 7, weeklyXP: 210 },
      ],
      userEntry: null,
      syncUserEntry: (name, xp, streak, weeklyXP) =>
        set({ userEntry: { id: 'me', name, xp, streak, weeklyXP, rank: 0 } }),
    }),
    { name: 'taskr-leaderboard-v1', storage: createJSONStorage(() => localStorage) }
  )
)
