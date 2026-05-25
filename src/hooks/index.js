/**
 * hooks/index.js
 * --------------
 * Only change from previous version:
 *  - completeTask now also calls broadcastActivity to partner + inserts
 *    a notification for streak milestones and level-ups
 *  - Uses usePartnerStore from new partnerStore.js (same API)
 *  - All other hooks unchanged
 */

import { useCallback } from 'react'
import { useTaskStore, useUserStore, useUIStore } from '@/store'
import { useAuthStore }         from '@/store/authStore'
import { usePartnerStore }      from '@/store/partnerStore'
import { XP_PER_TASK, uid, levelFromXP } from '@/utils/constants'

import {
  createTask   as dbCreateTask,
  updateTask   as dbUpdateTask,
  deleteTask   as dbDeleteTask,
  deleteCompletedTasks as dbDeleteCompleted,
  deleteAllTasks       as dbDeleteAll,
} from '@/services/taskService'
import { patchProfile }     from '@/services/profileService'
import { broadcastActivity } from '@/services/partnerService'
import { insertNotification } from '@/services/notificationService'

// ── Helpers ───────────────────────────────────────────────────────

function getUserId()   { return useAuthStore.getState().user?.id   || null }
function getUserName() { return useAuthStore.getState().user?.name || 'Someone' }

function syncProfile(userId) {
  if (!userId) return
  const s = useUserStore.getState()
  patchProfile(userId, {
    totalXP:            s.totalXP,
    weeklyXP:           s.weeklyXP,
    weekStart:          s.weekStart,
    streak:             s.streak,
    longestStreak:      s.longestStreak,
    lastCompletedDay:   s.lastCompletedDay,
    streakFreezes:      s.streakFreezes,
    dailyActivity:      s.dailyActivity,
    unlockedMilestones: s.unlockedMilestones,
  }).catch(err => console.error('[Taskr] Profile sync error:', err))
}

// ── useTaskActions ─────────────────────────────────────────────────
export function useTaskActions() {
  const taskStore   = useTaskStore()
  const userStore   = useUserStore()
  const { showToast, spawnXPFloat } = useUIStore()
  const { addFeedItem, partner } = usePartnerStore()

  const completeTask = useCallback((id, event) => {
    const result = taskStore.toggleDone(id)
    if (!result) return

    const { task, nowDone } = result
    const userId   = getUserId()
    const userName = getUserName()

    if (nowDone) {
      // ── Local XP + streak ──
      const xpAmount     = XP_PER_TASK[task.priority] || 10
      userStore.awardXP(xpAmount, id)
      const streakResult = userStore.updateStreak()
      const milestones   = userStore.checkMilestones()

      if (event) {
        const rect = event.currentTarget.getBoundingClientRect()
        spawnXPFloat(rect.left + rect.width / 2, rect.top, xpAmount)
      }

      // ── Toast ──
      let msg = `+${xpAmount} XP earned! ✨`
      if (streakResult?.streakBroken)       msg = `Streak reset 😅 — you're back! +${xpAmount} XP`
      else if (streakResult?.newStreak > 1) msg = `🔥 ${streakResult.newStreak}-day streak! +${xpAmount} XP`
      showToast(msg, 'success')

      if (milestones.length > 0) {
        setTimeout(() => {
          showToast(`🏆 Streak milestone: ${milestones[milestones.length - 1]} days!`, 'milestone', 4000)
        }, 1200)
      }

      // ── Local feed item ──
      addFeedItem({ id: uid(), user: 'You', action: 'completed', text: task.text, xp: xpAmount, ts: Date.now() })

      // ── Background Supabase: task update + profile ──
      dbUpdateTask(id, { done: true, completedAt: Date.now(), xpAwarded: true })
        .catch(err => console.error('[Taskr] Task sync error:', err))
      syncProfile(userId)

      // ── Broadcast to partner (Realtime) ──
      if (userId && partner?.id) {
        broadcastActivity({
          userId,
          partnerId:  partner.id,
          actorName:  userName,
          action:     'completed',
          text:       task.text,
          xp:         xpAmount,
        }).catch(() => {})
      }

      // ── Self-notification for streak milestones ──
      if (userId && milestones.length > 0) {
        const milestone = milestones[milestones.length - 1]
        insertNotification(userId, {
          type:  'streak_milestone',
          title: `🔥 ${milestone}-day streak unlocked!`,
          body:  `You've been consistent for ${milestone} days in a row.`,
          meta:  { streak: milestone },
        }).catch(() => {})
      }

      // ── Self-notification for level-ups ──
      // Check if XP award pushed us to a new level
      if (userId) {
        const { level: levelBefore } = levelFromXP(userStore.totalXP - xpAmount)
        const { level: levelAfter  } = levelFromXP(userStore.totalXP)
        if (levelAfter > levelBefore) {
          insertNotification(userId, {
            type:  'level_up',
            title: `⬆️ Level ${levelAfter} reached!`,
            body:  'Keep completing tasks to unlock new ranks.',
            meta:  { level: levelAfter },
          }).catch(() => {})
          // Show the level-up overlay
          useUIStore.getState().showLevelUp()
        }
      }

    } else {
      dbUpdateTask(id, { done: false, completedAt: null })
        .catch(err => console.error('[Taskr] Task sync error:', err))
    }

    return result
  }, [taskStore, userStore, showToast, spawnXPFloat, addFeedItem, partner])

  const addTask = useCallback((data) => {
    const task   = taskStore.addTask(data)
    const userId = getUserId()
    showToast('Task added!', 'success')
    if (userId) {
      dbCreateTask(task, userId).catch(err => {
      console.error('[Taskr] Create task error:', err)
      useUIStore.getState().showToast('Task saved locally — sync failed: ' + err.message, 'error', 5000)
    })
    }
    return task
  }, [taskStore, showToast])

  const deleteTask = useCallback((id) => {
    taskStore.deleteTask(id)
    showToast('Task deleted', 'info')
    dbDeleteTask(id).catch(err => console.error('[Taskr] Delete task error:', err))
  }, [taskStore, showToast])

  const updateTask = useCallback((id, updates) => {
    taskStore.updateTask(id, updates)
    showToast('Task updated!', 'success')
    dbUpdateTask(id, updates).catch(err => {
      console.error('[Taskr] Update task error:', err)
    })
  }, [taskStore, showToast])

  return { completeTask, addTask, deleteTask, updateTask }
}

// ── useFilteredTasks ───────────────────────────────────────────────
export function useFilteredTasks(filter, searchQ, sortMode) {
  const { tasks } = useTaskStore()

  return useCallback(() => {
    let arr = [...tasks]

    if (searchQ) {
      const q = searchQ.toLowerCase()
      arr = arr.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        t.notes?.toLowerCase().includes(q)
      )
    }

    switch (filter) {
      case 'active':  arr = arr.filter(t => !t.done);                   break
      case 'done':    arr = arr.filter(t => t.done);                    break
      case 'today':   arr = arr.filter(t => !t.done && isDueToday(t)); break
      case 'overdue': arr = arr.filter(t => !t.done && isOverdue(t));  break
      case 'high': case 'medium': case 'low': case 'urgent':
        arr = arr.filter(t => t.priority === filter); break
      default: break
    }

    if (filter?.startsWith('cat:')) {
      arr = arr.filter(t => t.category === filter.slice(4))
    }

    const P = { urgent: -1, high: 0, medium: 1, low: 2 }
    arr.sort((a, b) => {
      switch (sortMode) {
        case 'oldest':   return a.created - b.created
        case 'priority': return (P[a.priority] ?? 99) - (P[b.priority] ?? 99)
        case 'alpha':    return a.text.localeCompare(b.text)
        case 'dueDate':  return (a.dueDate || Infinity) - (b.dueDate || Infinity)
        default:         return b.created - a.created
      }
    })

    return arr
  }, [tasks, filter, searchQ, sortMode])
}

function isDueToday(task) {
  if (!task.dueDate) return false
  const d = new Date(task.dueDate), t = new Date()
  return d.getFullYear() === t.getFullYear() &&
         d.getMonth()    === t.getMonth()    &&
         d.getDate()     === t.getDate()
}
function isOverdue(task) {
  return task.dueDate ? Date.now() > task.dueDate : false
}

// ── useTheme ───────────────────────────────────────────────────────
export function useTheme() {
  const { theme, setTheme } = useUIStore()

  const applyTheme = useCallback((t) => {
    document.documentElement.classList.toggle('dark', t === 'dark')
    localStorage.setItem('taskr_theme', t)
    setTheme(t)
  }, [setTheme])

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, applyTheme])

  return { theme, toggleTheme, setTheme: applyTheme }
}

// ── useAnalytics ───────────────────────────────────────────────────
export function useAnalytics() {
  const { tasks }         = useTaskStore()
  const { dailyActivity } = useUserStore()

  const getLast7Days = useCallback(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        key,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        ...(dailyActivity[key] || { completed: 0, xp: 0 }),
      })
    }
    return days
  }, [dailyActivity])

  const getCompletionRate = useCallback(() => {
    if (!tasks.length) return 0
    return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
  }, [tasks])

  const getByPriority = useCallback(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 }
    tasks.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++ })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const getHeatmapData = useCallback(() =>
    Object.entries(dailyActivity).map(([date, data]) => ({
      date, count: data.completed, xp: data.xp,
    })),
    [dailyActivity]
  )

  return { getLast7Days, getCompletionRate, getByPriority, getHeatmapData }
}
