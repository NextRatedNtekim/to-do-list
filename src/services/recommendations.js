/**
 * services/recommendations.js
 * Recommendation engine for Taskr.
 *
 * Architecture:
 *   - Mock data now (no API needed)
 *   - Swap `fetchFromAPI` implementation when backend is ready
 *   - Shape is stable — components never change regardless of data source
 *
 * Future integration: Replace MOCK_ENABLED with env var or feature flag.
 */

const MOCK_ENABLED = true // set to false when real API is ready

// ── Types (JSDoc) ────────────────────────────────────────────
/**
 * @typedef {Object} Recommendation
 * @property {string} id
 * @property {'task'|'routine'} type
 * @property {string} title
 * @property {string} description
 * @property {string} icon       - emoji
 * @property {'high'|'medium'|'low'} priority
 * @property {string} [duration] - e.g. "20 min"
 * @property {string} [category] - e.g. "health", "focus", "growth"
 */

// ── Mock data ────────────────────────────────────────────────
const MOCK_TASKS = [
  {
    id: 'rec_task_1',
    type: 'task',
    title: 'Deep Work Session',
    description: 'Block 2 hours for focused, distraction-free work on your most important project.',
    icon: '🎯',
    priority: 'high',
    duration: '2 hours',
    category: 'focus',
  },
  {
    id: 'rec_task_2',
    type: 'task',
    title: 'Weekly Planning',
    description: 'Review last week, set priorities for the coming week.',
    icon: '📋',
    priority: 'high',
    duration: '30 min',
    category: 'planning',
  },
  {
    id: 'rec_task_3',
    type: 'task',
    title: 'Inbox Zero',
    description: 'Process your email inbox and clear the backlog.',
    icon: '📨',
    priority: 'medium',
    duration: '45 min',
    category: 'admin',
  },
]

const MOCK_ROUTINES = [
  {
    id: 'rec_routine_1',
    type: 'routine',
    title: 'Morning Exercise',
    description: 'Start your day with 20 minutes of movement. Even a short walk counts.',
    icon: '🏃',
    priority: 'high',
    duration: '20 min',
    category: 'health',
  },
  {
    id: 'rec_routine_2',
    type: 'routine',
    title: 'Daily Reading',
    description: 'Read 10 pages of a book every day. Consistency beats intensity.',
    icon: '📚',
    priority: 'medium',
    duration: '15 min',
    category: 'growth',
  },
  {
    id: 'rec_routine_3',
    type: 'routine',
    title: 'Journaling',
    description: 'Spend 5 minutes writing down your thoughts, wins, and intentions.',
    icon: '✍️',
    priority: 'medium',
    duration: '5 min',
    category: 'mindfulness',
  },
  {
    id: 'rec_routine_4',
    type: 'routine',
    title: 'Evening Wind-Down',
    description: 'No screens 30 minutes before bed. Prep for tomorrow.',
    icon: '🌙',
    priority: 'low',
    duration: '30 min',
    category: 'health',
  },
]

// ── API layer (future) ───────────────────────────────────────
async function fetchFromAPI(userId, context) {
  // TODO: Replace with actual API call
  // const res = await fetch(`/api/recommendations?userId=${userId}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(context),
  // })
  // return res.json()
  throw new Error('Real API not yet implemented')
}

// ── Public API ───────────────────────────────────────────────
/**
 * Fetch task recommendations.
 * @param {string} userId
 * @param {Object} context - { existingTaskTitles, completedCount, streak }
 * @returns {Promise<Recommendation[]>}
 */
export async function fetchTaskRecommendations(userId, context = {}) {
  if (MOCK_ENABLED) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 200))
    return MOCK_TASKS
  }
  return fetchFromAPI(userId, { ...context, type: 'tasks' })
}

/**
 * Fetch routine recommendations.
 * @param {string} userId
 * @param {Object} context - { existingRoutines, currentStreak }
 * @returns {Promise<Recommendation[]>}
 */
export async function fetchRoutineRecommendations(userId, context = {}) {
  if (MOCK_ENABLED) {
    await new Promise(r => setTimeout(r, 200))
    return MOCK_ROUTINES
  }
  return fetchFromAPI(userId, { ...context, type: 'routines' })
}

/**
 * Fetch all recommendations (tasks + routines combined).
 */
export async function fetchAllRecommendations(userId, context = {}) {
  const [tasks, routines] = await Promise.all([
    fetchTaskRecommendations(userId, context),
    fetchRoutineRecommendations(userId, context),
  ])
  return { tasks, routines }
}