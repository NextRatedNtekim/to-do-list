import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { uid, isSameDay, startOfDay, XP_PER_TASK, XP_STREAK_BONUS, levelFromXP, STREAK_MILESTONES } from '@/utils/constants'

// ── Task Store ────────────────────────────────────────────────────
export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],

      addTask: (data) => {
        const task = {
          id:          uid(),
          text:        data.text,
          done:        false,
          priority:    data.priority    || 'medium',
          category:    data.category    || null,
          tags:        data.tags        || [],
          dueDate:     data.dueDate     || null,
          recurring:   data.recurring   || null, // 'daily' | 'weekly' | 'monthly' | null
          notes:       data.notes       || '',
          subtasks:    data.subtasks    || [],
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
              ? {
                  ...t,
                  subtasks: t.subtasks.map(st =>
                    st.id === subId ? { ...st, done: !st.done } : st
                  ),
                }
              : t
          ),
        })),
    }),
    {
      name: 'taskr-tasks-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── User/XP/Streak Store 
export const useUserStore = create(
  persist(
    (set, get) => ({
      profile: {
        name:   'Taskr User',
        avatar: null,
        joinedAt: Date.now(),
      },

      // XP & Levels
      totalXP:    0,
      weeklyXP:   0,
      weekStart:  startOfDay(Date.now()),

      // Streak
      streak:          0,
      longestStreak:   0,
      lastCompletedDay: null,
      streakFreezes:   2,
      streakShields:   0,

      // Completions per day (for analytics heatmap)
      dailyActivity: {}, // { 'YYYY-MM-DD': { completed: N, xp: N } }

      // Milestone unlocks
      unlockedMilestones: [],

      updateProfile: (updates) =>
        set(s => ({ profile: { ...s.profile, ...updates } })),

      awardXP: (amount, taskId = null) => {
        const state = get()
        const now   = Date.now()
        const todayKey = new Date(now).toISOString().slice(0, 10)

        // Reset weekly XP if new week
        let { weeklyXP, weekStart } = state
        const oneWeek = 7 * 86400000
        if (now - weekStart > oneWeek) {
          weeklyXP = 0
          weekStart = startOfDay(now)
        }

        const prevActivity = state.dailyActivity[todayKey] || { completed: 0, xp: 0 }
        const newActivity  = {
          ...state.dailyActivity,
          [todayKey]: {
            completed: prevActivity.completed + (taskId ? 1 : 0),
            xp:        prevActivity.xp + amount,
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
          // First ever completion
          set({ streak: 1, longestStreak: 1, lastCompletedDay: today })
          return { newStreak: 1, streakBroken: false }
        }

        const yesterday = today - 86400000
        if (lastCompletedDay === today) {
          // Already counted today
          return { newStreak: streak, streakBroken: false }
        }

        if (lastCompletedDay === yesterday) {
          // Consecutive day
          const newStreak = streak + 1
          const newLongest = Math.max(longestStreak, newStreak)
          set({ streak: newStreak, longestStreak: newLongest, lastCompletedDay: today })
          return { newStreak, streakBroken: false }
        }

        // Missed a day — check for freeze
        const daysMissed = Math.floor((today - lastCompletedDay) / 86400000) - 1
        if (daysMissed <= streakFreezes) {
          const newStreak = streak + 1
          const newLongest = Math.max(longestStreak, newStreak)
          set({
            streak:         newStreak,
            longestStreak:  newLongest,
            lastCompletedDay: today,
            streakFreezes:  streakFreezes - daysMissed,
          })
          return { newStreak, streakBroken: false, freezeUsed: daysMissed }
        }

        // Streak broken
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
          set(s => ({
            unlockedMilestones: [...s.unlockedMilestones, ...newMilestones],
          }))
          return newMilestones
        }
        return []
      },
    }),
    {
      name: 'taskr-user-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── UI Store (ephemeral — no persistence) ─────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen:    true,
  activeView:     'dashboard',
  theme:          'dark',
  xpFloats:       [],  // { id, x, y, amount }
  toast:          null, // { id, msg, type, duration }
  levelUpVisible: false,
  onboardingDone: false,

  setSidebarOpen:    (v)    => set({ sidebarOpen: v }),
  setActiveView:     (v)    => set({ activeView: v }),
  toggleTheme:       ()     => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setTheme:          (t)    => set({ theme: t }),
  setOnboardingDone: (v)    => set({ onboardingDone: v }),
  showLevelUp:       ()     => set({ levelUpVisible: true }),
  hideLevelUp:       ()     => set({ levelUpVisible: false }),

  spawnXPFloat: (x, y, amount) => {
    const id = uid()
    set(s => ({ xpFloats: [...s.xpFloats, { id, x, y, amount }] }))
    setTimeout(() =>
      set(s => ({ xpFloats: s.xpFloats.filter(f => f.id !== id) })),
      1500
    )
  },

  showToast: (msg, type = 'info', duration = 3000) => {
    const id = uid()
    set({ toast: { id, msg, type, duration } })
    setTimeout(() => set(s => (s.toast?.id === id ? { toast: null } : {})), duration)
  },

  dismissToast: () => set({ toast: null }),
}))

// ── Leaderboard Store (mock — ready for socket.io upgrade) ────────
export const useLeaderboardStore = create(
  persist(
    (set, get) => ({
      entries: [
        { id: 'u1', name: 'Alex Chen',      avatar: null, xp: 4820, streak: 23, rank: 1, weeklyXP: 620 },
        { id: 'u2', name: 'Maria Santos',   avatar: null, xp: 3950, streak: 15, rank: 2, weeklyXP: 540 },
        { id: 'u3', name: 'Jordan Kim',     avatar: null, xp: 3100, streak: 31, rank: 3, weeklyXP: 480 },
        { id: 'u4', name: 'Priya Sharma',   avatar: null, xp: 2700, streak: 8,  rank: 4, weeklyXP: 390 },
        { id: 'u5', name: 'Carlos Rivera',  avatar: null, xp: 2200, streak: 5,  rank: 5, weeklyXP: 310 },
        { id: 'u6', name: 'Yuki Tanaka',    avatar: null, xp: 1900, streak: 12, rank: 6, weeklyXP: 290 },
        { id: 'u7', name: 'Sam Okonkwo',    avatar: null, xp: 1450, streak: 3,  rank: 7, weeklyXP: 210 },
      ],
      userEntry: null,

      syncUserEntry: (name, xp, streak, weeklyXP) =>
        set({ userEntry: { id: 'me', name, xp, streak, weeklyXP, rank: 0 } }),
    }),
    { name: 'taskr-leaderboard-v2', storage: createJSONStorage(() => localStorage) }
  )
)

// ── Partner Store ─────────────────────────────────────────────────
export const usePartnerStore = create(
  persist(
    (set) => ({
      partner: null,
      pendingInvite: null,
      activityFeed: [
        { id: 'a1', user: 'Alex Chen',    action: 'completed',  text: 'Finish Q3 report',     xp: 20, ts: Date.now() - 3600000 },
        { id: 'a2', user: 'Alex Chen',    action: 'streak',     text: '🔥 23-day streak!',     xp: 0,  ts: Date.now() - 7200000 },
        { id: 'a3', user: 'Maria Santos', action: 'completed',  text: 'Morning workout',       xp: 10, ts: Date.now() - 10800000 },
        { id: 'a4', user: 'Maria Santos', action: 'level_up',   text: 'Reached Level 18!',     xp: 0,  ts: Date.now() - 18000000 },
      ],

      setPartner:     (p) => set({ partner: p }),
      removePartner:  ()  => set({ partner: null }),
      addFeedItem:    (item) => set(s => ({ activityFeed: [item, ...s.activityFeed].slice(0, 50) })),
    }),
    { name: 'taskr-partner-v2', storage: createJSONStorage(() => localStorage) }
  )
)
