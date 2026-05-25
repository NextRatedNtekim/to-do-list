// ── Priority ──────────────────────────────────────────────────────
export const PRIORITY_ORDER = { urgent: -1, high: 0, medium: 1, low: 2 }
export const PRIORITY_COLOR = {
  urgent: '#ef4444',
  high:   '#f43f5e',
  medium: '#f59e0b',
  low:    '#22c55e',
}
export const PRIORITY_LABEL = {
  urgent: 'Urgent',
  high:   'High',
  medium: 'Medium',
  low:    'Low',
}
export const PRIORITY_XP = {
  urgent: 30,
  high:   20,
  medium: 10,
  low:    5,
}

// ── XP & Leveling ─────────────────────────────────────────────────
export const XP_PER_TASK = { urgent: 30, high: 20, medium: 10, low: 5 }
export const XP_STREAK_BONUS = 5   // extra XP per streak day milestone
export const XP_EARLY_BONUS = 15   // completing before due date
export const XP_PERFECT_DAY = 50   // complete all tasks in a day

export function xpForLevel(level) {
  // Exponential curve: 100, 250, 450, 700, 1000 ...
  return Math.floor(100 * Math.pow(level, 1.6))
}

export function levelFromXP(totalXP) {
  let level = 1
  let accumulated = 0
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level)
    level++
  }
  return { level, accumulated, nextThreshold: xpForLevel(level) }
}

export const RANKS = [
  { minLevel: 1,  title: 'Seedling',    color: '#6ee7b7', gradient: 'from-emerald-400 to-teal-500',   icon: '🌱' },
  { minLevel: 5,  title: 'Sprout',      color: '#22c55e', gradient: 'from-green-400 to-emerald-500',  icon: '🌿' },
  { minLevel: 10, title: 'Builder',     color: '#f59e0b', gradient: 'from-amber-400 to-yellow-500',   icon: '⚡' },
  { minLevel: 20, title: 'Achiever',    color: '#3b82f6', gradient: 'from-blue-400 to-indigo-500',    icon: '🎯' },
  { minLevel: 35, title: 'Virtuoso',    color: '#8b5cf6', gradient: 'from-violet-400 to-purple-500',  icon: '💎' },
  { minLevel: 50, title: 'Legendary',   color: '#f43f5e', gradient: 'from-rose-400 to-pink-500',      icon: '👑' },
  { minLevel: 75, title: 'Transcendent',color: '#06b6d4', gradient: 'from-cyan-400 to-sky-500',       icon: '🌌' },
]

export function getRankForLevel(level) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r
  }
  return rank
}

// ── Streak ────────────────────────────────────────────────────────
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365]
export const STREAK_FREEZE_MAX = 3

// ── Task Categories ───────────────────────────────────────────────
export const DEFAULT_CATEGORIES = [
  { id: 'work',     label: 'Work',     color: '#3b82f6', icon: '💼' },
  { id: 'personal', label: 'Personal', color: '#8b5cf6', icon: '🏠' },
  { id: 'health',   label: 'Health',   color: '#22c55e', icon: '💪' },
  { id: 'learning', label: 'Learning', color: '#f59e0b', icon: '📚' },
  { id: 'creative', label: 'Creative', color: '#f43f5e', icon: '🎨' },
  { id: 'finance',  label: 'Finance',  color: '#06b6d4', icon: '💰' },
]

// ── Utilities ─────────────────────────────────────────────────────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function formatDate(ts, opts = {}) {
  const defaults = { month: 'short', day: 'numeric', year: 'numeric' }
  return new Date(ts).toLocaleDateString('en-US', { ...defaults, ...opts })
}

export function formatRelative(ts) {
  const now = Date.now()
  const diff = now - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return formatDate(ts)
}

export function isSameDay(ts1, ts2) {
  const d1 = new Date(ts1)
  const d2 = new Date(ts2)
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth()    === d2.getMonth() &&
         d1.getDate()     === d2.getDate()
}

export function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return Date.now() > dueDate && dueDate > 0
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

// Pluralize helper
export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
