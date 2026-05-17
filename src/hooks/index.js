import { useCallback } from 'react'
import { useTaskStore, useUserStore, useUIStore, usePartnerStore } from '@/store'
import { XP_PER_TASK, uid } from '@/utils/constants'

// ── useTaskActions ─────────────────────────────────────────────────
// Wraps task mutations with XP, streak, and toast side-effects
export function useTaskActions() {
  const taskStore    = useTaskStore()
  const userStore    = useUserStore()
  const { showToast, spawnXPFloat } = useUIStore()
  const { addFeedItem } = usePartnerStore()

  const completeTask = useCallback((id, event) => {
    const result = taskStore.toggleDone(id)
    if (!result) return

    const { task, nowDone } = result

    if (nowDone) {
      // Award XP
      const xpAmount = XP_PER_TASK[task.priority] || 10
      userStore.awardXP(xpAmount, id)

      // Update streak
      const streakResult = userStore.updateStreak()

      // Check milestones
      const newMilestones = userStore.checkMilestones()

      // Spawn floating XP indicator near the click/tap
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect()
        spawnXPFloat(rect.left + rect.width / 2, rect.top, xpAmount)
      }

      // Toast
      let msg = `+${xpAmount} XP earned! ✨`
      if (streakResult?.streakBroken)
        msg = `Streak reset 😅 — but you're back! +${xpAmount} XP`
      else if (streakResult?.newStreak > 1)
        msg = `🔥 ${streakResult.newStreak}-day streak! +${xpAmount} XP`

      showToast(msg, 'success')

      // Milestone toast
      if (newMilestones.length > 0) {
        setTimeout(() => {
          showToast(`🏆 Streak milestone: ${newMilestones[newMilestones.length - 1]} days!`, 'milestone', 4000)
        }, 1200)
      }

      // Partner feed
      addFeedItem({
        id:     uid(),
        user:   'You',
        action: 'completed',
        text:   task.text,
        xp:     xpAmount,
        ts:     Date.now(),
      })
    }

    return result
  }, [taskStore, userStore, showToast, spawnXPFloat, addFeedItem])

  const addTask = useCallback((data) => {
    const task = taskStore.addTask(data)
    showToast('Task added!', 'success')
    return task
  }, [taskStore, showToast])

  const deleteTask = useCallback((id) => {
    taskStore.deleteTask(id)
    showToast('Task deleted', 'info')
  }, [taskStore, showToast])

  const updateTask = useCallback((id, updates) => {
    taskStore.updateTask(id, updates)
    showToast('Task updated!', 'success')
  }, [taskStore, showToast])

  return { completeTask, addTask, deleteTask, updateTask }
}

// ── useFilteredTasks ───────────────────────────────────────────────
export function useFilteredTasks(filter, searchQ, sortMode) {
  const { tasks } = useTaskStore()

  return useCallback(() => {
    let arr = [...tasks]

    // Search
    if (searchQ) {
      const q = searchQ.toLowerCase()
      arr = arr.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        t.notes?.toLowerCase().includes(q)
      )
    }

    // Filter
    switch (filter) {
      case 'active':    arr = arr.filter(t => !t.done);                       break
      case 'done':      arr = arr.filter(t => t.done);                        break
      case 'today':     arr = arr.filter(t => !t.done && isDueToday(t));      break
      case 'overdue':   arr = arr.filter(t => !t.done && isOverdue(t));       break
      case 'high':
      case 'medium':
      case 'low':
      case 'urgent':    arr = arr.filter(t => t.priority === filter);         break
      default:          break
    }

    // Category filter
    if (filter?.startsWith('cat:')) {
      const catId = filter.slice(4)
      arr = arr.filter(t => t.category === catId)
    }

    // Sort
    const P = { urgent: -1, high: 0, medium: 1, low: 2 }
    arr.sort((a, b) => {
      switch (sortMode) {
        case 'oldest':   return a.created - b.created
        case 'priority': return (P[a.priority] ?? 99) - (P[b.priority] ?? 99)
        case 'alpha':    return a.text.localeCompare(b.text)
        case 'dueDate':  return (a.dueDate || Infinity) - (b.dueDate || Infinity)
        default:         return b.created - a.created  // newest first
      }
    })

    return arr
  }, [tasks, filter, searchQ, sortMode])
}

function isDueToday(task) {
  if (!task.dueDate) return false
  const d = new Date(task.dueDate)
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth()    === today.getMonth() &&
         d.getDate()     === today.getDate()
}

function isOverdue(task) {
  if (!task.dueDate) return false
  return Date.now() > task.dueDate
}

// ── useTheme ───────────────────────────────────────────────────────
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useUIStore()

  const applyTheme = useCallback((t) => {
    document.documentElement.classList.toggle('dark', t === 'dark')
    localStorage.setItem('taskr_theme', t)
    setTheme(t)
  }, [setTheme])

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
  }, [theme, applyTheme])

  return { theme, toggleTheme: toggle, setTheme: applyTheme }
}

// ── useAnalytics ───────────────────────────────────────────────────
export function useAnalytics() {
  const { tasks } = useTaskStore()
  const { dailyActivity } = useUserStore()

  const getLast7Days = useCallback(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const data = dailyActivity[key] || { completed: 0, xp: 0 }
      days.push({ key, label, ...data })
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

  const getHeatmapData = useCallback(() => {
    return Object.entries(dailyActivity).map(([date, data]) => ({
      date,
      count: data.completed,
      xp: data.xp,
    }))
  }, [dailyActivity])

  return { getLast7Days, getCompletionRate, getByPriority, getHeatmapData }
}
