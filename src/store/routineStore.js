/**
 * store/routineStore.js
 * Zustand store for routines + completions.
 * Follows the same pattern as your existing task/user stores.
 *
 * Import in your store/index.js:
 *   export { useRoutineStore } from './routineStore'
 */

import { create } from 'zustand'
import { format, subDays } from 'date-fns'
import {
  fetchRoutines,
  fetchAllCompletions,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  uncompleteRoutine,
  fetchCompletedIdsForDate,
} from '@/services/routineService'

export const useRoutineStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  routines:      [],       // Routine[]
  completions:   [],       // { routine_id, completed_on, completed_at }[]
  completedToday: new Set(), // Set<routineId> completed today
  loading:       false,
  error:         null,

  // ── Computed helpers (called inline) ─────────────────────
  getTodayRoutines() {
    return get().routines.filter(r => r.is_active)
  },

  isCompletedToday(routineId) {
    return get().completedToday.has(routineId)
  },

  /**
   * All dates (string "YYYY-MM-DD") where ANY routine was completed.
   * Used by heatmap + streak calculator.
   */
  getAllCompletionDates() {
    return get().completions.map(c => c.completed_on)
  },

  /**
   * Completion dates for a specific routine.
   */
  getCompletionDatesForRoutine(routineId) {
    return get().completions
      .filter(c => c.routine_id === routineId)
      .map(c => c.completed_on)
  },

  // ── Actions ───────────────────────────────────────────────

  /**
   * Load all routines + completions from Supabase.
   * Call once after auth, similar to fetchTasks().
   */
  async loadAll() {
    set({ loading: true, error: null })
    try {
      const [routines, completions] = await Promise.all([
        fetchRoutines(),
        fetchAllCompletions(),
      ])

      const today = format(new Date(), 'yyyy-MM-dd')
      const completedToday = new Set(
        completions
          .filter(c => c.completed_on === today)
          .map(c => c.routine_id)
      )

      set({ routines, completions, completedToday, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error('[RoutineStore] loadAll error:', err)
    }
  },

  /**
   * Sync routines from an external array (e.g. from Supabase real-time).
   */
  syncRoutines(routines) {
    set({ routines })
  },

  /**
   * Add a new routine.
   */
  async addRoutine(fields) {
    try {
      const routine = await createRoutine(fields)
      set(s => ({ routines: [...s.routines, routine] }))
      return routine
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  /**
   * Update an existing routine.
   */
  async editRoutine(id, fields) {
    try {
      const updated = await updateRoutine(id, fields)
      set(s => ({
        routines: s.routines.map(r => r.id === id ? updated : r),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  /**
   * Delete a routine (and all its completions via cascade).
   */
  async removeRoutine(id) {
    try {
      await deleteRoutine(id)
      set(s => ({
        routines:    s.routines.filter(r => r.id !== id),
        completions: s.completions.filter(c => c.routine_id !== id),
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  /**
   * Toggle completion for a routine for today.
   * Optimistic update — reverts on error.
   */
  async toggleCompletion(routineId) {
    const isCompleted = get().completedToday.has(routineId)
    const today = format(new Date(), 'yyyy-MM-dd')

    // Optimistic update
    set(s => {
      const next = new Set(s.completedToday)
      if (isCompleted) {
        next.delete(routineId)
      } else {
        next.add(routineId)
      }
      return { completedToday: next }
    })

    try {
      if (isCompleted) {
        await uncompleteRoutine(routineId)
        // Remove from completions array
        set(s => ({
          completions: s.completions.filter(
            c => !(c.routine_id === routineId && c.completed_on === today)
          ),
        }))
      } else {
        const completion = await completeRoutine(routineId)
        set(s => ({
          completions: [completion, ...s.completions],
        }))
      }
    } catch (err) {
      // Revert on failure
      set(s => {
        const reverted = new Set(s.completedToday)
        if (isCompleted) reverted.add(routineId)
        else reverted.delete(routineId)
        return { completedToday: reverted, error: err.message }
      })
      console.error('[RoutineStore] toggleCompletion error:', err)
    }
  },

  clearError() {
    set({ error: null })
  },
}))