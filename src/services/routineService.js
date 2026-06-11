/**
 * services/routineService.js
 * All Supabase interactions for routines + completions.
 * Mirrors the pattern of your existing taskService.js.
 */

import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

// ── Routines CRUD ────────────────────────────────────────────

export async function fetchRoutines() {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createRoutine(fields) {
  const { data: { user } } = await supabase.auth.getUser()

  const payload = {
    user_id:     user.id,
    title:       fields.title,
    description: fields.description ?? null,
    icon:        fields.icon        ?? '🔄',
    color:       fields.color       ?? '#22c55e',
    frequency:   fields.frequency   ?? 'daily',
    days_of_week: fields.days_of_week ?? [],
    time_of_day: fields.time_of_day ?? null,
    is_active:   true,
    order_index: fields.order_index ?? 0,
  }

  const { data, error } = await supabase
    .from('routines')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRoutine(id, fields) {
  const { data, error } = await supabase
    .from('routines')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRoutine(id) {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleRoutineActive(id, isActive) {
  return updateRoutine(id, { is_active: isActive })
}

// ── Completions ───────────────────────────────────────────────

/**
 * Fetch completions for a date range.
 * @param {string} from - "YYYY-MM-DD"
 * @param {string} to   - "YYYY-MM-DD"
 */
export async function fetchCompletions(from, to) {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*')
    .gte('completed_on', from)
    .lte('completed_on', to)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Fetch all completions (for heatmap, streak calculation).
 */
export async function fetchAllCompletions() {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('routine_id, completed_on, completed_at')
    .order('completed_on', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Mark a routine as complete for today.
 * Uses upsert — safe to call multiple times.
 */
export async function completeRoutine(routineId, note = null) {
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('routine_completions')
    .upsert(
      {
        routine_id:   routineId,
        user_id:      user.id,
        completed_on: today,
        completed_at: new Date().toISOString(),
        note,
      },
      { onConflict: 'routine_id,completed_on' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Un-complete a routine for today.
 */
export async function uncompleteRoutine(routineId) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { error } = await supabase
    .from('routine_completions')
    .delete()
    .eq('routine_id', routineId)
    .eq('completed_on', today)

  if (error) throw error
}

/**
 * Check which routine IDs are completed for a given date.
 * Returns Set<routineId>
 */
export async function fetchCompletedIdsForDate(dateStr) {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('routine_id')
    .eq('completed_on', dateStr)

  if (error) throw error
  return new Set((data ?? []).map(r => r.routine_id))
}