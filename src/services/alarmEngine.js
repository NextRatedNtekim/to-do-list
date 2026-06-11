/**
 * services/alarmEngine.js
 * ══════════════════════════════════════════════════════════════
 * Central alarm engine for Taskr.
 * Schedules browser Notification API alerts when a task/routine
 * due-time is reached.
 *
 * Architecture:
 *  - Uses setTimeout chains (no service worker needed for in-tab)
 *  - Persists scheduled alarms in localStorage so they survive
 *    page refreshes (re-schedules on init)
 *  - Integrates with your existing alarmStore
 *  - Requests Notification permission lazily on first alarm add
 *
 * Public API:
 *  scheduleAlarm(item)     — add/update an alarm
 *  cancelAlarm(id)         — remove an alarm
 *  cancelAllAlarms()       — clear everything
 *  initAlarmEngine()       — call once on app boot (after auth)
 *  requestPermission()     — call on first user interaction
 * ══════════════════════════════════════════════════════════════
 */

const STORAGE_KEY = 'taskr_alarms_v2'

// In-memory timer map: id → timeoutId
const _timers = new Map()

// ── Persistence helpers ──────────────────────────────────────
function loadPersistedAlarms() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function savePersistedAlarms(alarms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
  } catch {}
}

// ── Permission ───────────────────────────────────────────────
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// ── Fire a notification ───────────────────────────────────────
function fireNotification(alarm) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const icon = alarm.icon ?? '⚡'
  const n = new Notification(`${icon} ${alarm.title}`, {
    body:    alarm.description ?? (alarm.type === 'routine' ? 'Time for your routine!' : 'Task due now!'),
    icon:    '/icon-192.png',   // your PWA icon
    badge:   '/badge-72.png',
    tag:     `taskr-${alarm.id}`,
    renotify: false,
    silent:  false,
  })

  // Auto-close after 8 seconds
  setTimeout(() => n.close(), 8000)

  // Optional: clicking the notification focuses the tab
  n.onclick = () => {
    window.focus()
    n.close()
  }

  // Also dispatch a custom DOM event so the app can react in-UI
  window.dispatchEvent(new CustomEvent('taskr:alarm', { detail: alarm }))
}

// ── Schedule a single alarm ───────────────────────────────────
/**
 * @param {Object} alarm
 * @param {string} alarm.id          - task/routine id
 * @param {string} alarm.title       - display title
 * @param {string} alarm.description - optional body
 * @param {string} alarm.icon        - emoji
 * @param {'task'|'routine'} alarm.type
 * @param {string} alarm.dueDateTime - ISO string "2026-06-08T09:00:00"
 */
export function scheduleAlarm(alarm) {
  if (!alarm?.id || !alarm?.dueDateTime) return

  const fireAt = new Date(alarm.dueDateTime).getTime()
  const now    = Date.now()
  const delay  = fireAt - now

  // Cancel any existing timer for this id
  cancelAlarm(alarm.id)

  if (delay <= 0) return  // already past

  const timerId = setTimeout(() => {
    fireNotification(alarm)
    // Remove from persistence after firing
    const stored = loadPersistedAlarms()
    delete stored[alarm.id]
    savePersistedAlarms(stored)
    _timers.delete(alarm.id)
  }, delay)

  _timers.set(alarm.id, timerId)

  // Persist
  const stored = loadPersistedAlarms()
  stored[alarm.id] = alarm
  savePersistedAlarms(stored)
}

// ── Cancel an alarm ───────────────────────────────────────────
export function cancelAlarm(id) {
  if (_timers.has(id)) {
    clearTimeout(_timers.get(id))
    _timers.delete(id)
  }
  const stored = loadPersistedAlarms()
  delete stored[id]
  savePersistedAlarms(stored)
}

// ── Cancel all ────────────────────────────────────────────────
export function cancelAllAlarms() {
  _timers.forEach(timerId => clearTimeout(timerId))
  _timers.clear()
  savePersistedAlarms({})
}

// ── Init on app boot ─────────────────────────────────────────
/**
 * Re-schedules all persisted alarms that haven't fired yet.
 * Call this once in App.jsx after auth is confirmed.
 */
export function initAlarmEngine() {
  const stored = loadPersistedAlarms()
  const now    = Date.now()
  let rescheduled = 0

  Object.values(stored).forEach(alarm => {
    const fireAt = new Date(alarm.dueDateTime).getTime()
    if (fireAt > now) {
      scheduleAlarm(alarm)
      rescheduled++
    } else {
      // Past — clean up
      delete stored[alarm.id]
    }
  })

  savePersistedAlarms(stored)
  if (rescheduled > 0) {
    console.log(`[AlarmEngine] Rescheduled ${rescheduled} alarm(s)`)
  }
}

// ── Helper: build dueDateTime from date + time strings ───────
/**
 * @param {string} dateStr "YYYY-MM-DD"
 * @param {string} timeStr "HH:MM"
 * @returns {string} ISO datetime string
 */
export function buildDueDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  return `${dateStr}T${timeStr}:00`
}

// ── Helper: check if an item has a pending alarm ──────────────
export function hasPendingAlarm(id) {
  return _timers.has(id)
}

// ── Helper: get all pending alarm ids ────────────────────────
export function getPendingAlarmIds() {
  return [..._timers.keys()]
}