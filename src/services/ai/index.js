/**
 * services/ai/index.js
 * Taskr AI Service — Architecture Placeholder
 *
 * This file establishes the service interface for future AI features.
 * No AI logic is implemented. All methods return mock/disabled responses.
 *
 * Future features to implement here:
 *   - AI scheduling assistant
 *   - Accountability coaching
 *   - Smart reminders
 *   - Productivity insights
 *   - Routine optimization
 */

const AI_ENABLED = false // Feature flag — set to true when ready

// ── Service status ───────────────────────────────────────────
export const AI_STATUS = {
  enabled:       AI_ENABLED,
  version:       null,
  message:       'Taskr AI is currently unavailable. Future updates will include AI scheduling, accountability coaching, smart reminders, productivity insights, and routine optimization.',
  comingSoonDate: null, // populate when known
}

// ── Interface stubs ──────────────────────────────────────────

/**
 * Get AI-powered schedule suggestions.
 * @param {Object} context - { tasks, routines, userPreferences }
 * @returns {Promise<{ suggestions: Array, enabled: boolean }>}
 */
export async function getScheduleSuggestions(context) {
  if (!AI_ENABLED) return { suggestions: [], enabled: false }
  // TODO: implement
  throw new Error('AI service not yet implemented')
}

/**
 * Get productivity insights for the current week.
 * @param {Object} stats - { completionRate, streak, xp, level }
 * @returns {Promise<{ insights: Array, enabled: boolean }>}
 */
export async function getProductivityInsights(stats) {
  if (!AI_ENABLED) return { insights: [], enabled: false }
  throw new Error('AI service not yet implemented')
}

/**
 * Get smart reminder suggestions based on task patterns.
 * @param {Array} tasks
 * @returns {Promise<{ reminders: Array, enabled: boolean }>}
 */
export async function getSmartReminders(tasks) {
  if (!AI_ENABLED) return { reminders: [], enabled: false }
  throw new Error('AI service not yet implemented')
}

/**
 * Get routine optimization advice.
 * @param {Array} routines
 * @returns {Promise<{ advice: Array, enabled: boolean }>}
 */
export async function getRoutineOptimization(routines) {
  if (!AI_ENABLED) return { advice: [], enabled: false }
  throw new Error('AI service not yet implemented')
}

/**
 * Send a message to the AI assistant.
 * @param {string} message
 * @param {Object} context
 * @returns {Promise<{ reply: string, enabled: boolean }>}
 */
export async function sendAssistantMessage(message, context = {}) {
  if (!AI_ENABLED) {
    return {
      reply:   AI_STATUS.message,
      enabled: false,
    }
  }
  throw new Error('AI service not yet implemented')
}

export default {
  status:                 AI_STATUS,
  getScheduleSuggestions,
  getProductivityInsights,
  getSmartReminders,
  getRoutineOptimization,
  sendAssistantMessage,
}