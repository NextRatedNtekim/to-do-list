import { supabase } from '@/lib/supabase'

/**
 * taskService
 * -----------
 * All database operations for the `tasks` table.
 * RLS on the table ensures users can only touch their own rows.
 */

/** Fetch all tasks for the authenticated user, ordered by created_at desc. */
export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Normalise DB column names → camelCase shape the app expects
  return (data || []).map(dbToTask)
}

/** Insert a new task row. Returns the created task. */
export async function createTask(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskToDb(task, userId)])
    .select()
    .single()

  if (error) throw error
  return dbToTask(data)
}

/** Patch one or more columns on an existing task. */
export async function updateTask(id, updates) {
  const row = {}
  if (updates.text        !== undefined) row.text         = updates.text
  if (updates.done        !== undefined) row.done         = updates.done
  if (updates.priority    !== undefined) row.priority     = updates.priority
  if (updates.category    !== undefined) row.category     = updates.category
  if (updates.tags        !== undefined) row.tags         = updates.tags
  if (updates.dueDate     !== undefined) row.due_date     = updates.dueDate ? new Date(updates.dueDate).toISOString() : null
  if (updates.recurring   !== undefined) row.recurring    = updates.recurring
  if (updates.notes       !== undefined) row.notes        = updates.notes
  if (updates.subtasks    !== undefined) row.subtasks     = updates.subtasks
  if (updates.completedAt !== undefined) row.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null
  if (updates.xpAwarded   !== undefined) row.xp_awarded   = updates.xpAwarded

  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return dbToTask(data)
}

/** Hard-delete a task row. */
export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

/** Delete all completed tasks for the current user. */
export async function deleteCompletedTasks(userId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('user_id', userId)
    .eq('done', true)
  if (error) throw error
}

/** Delete every task for the current user. */
export async function deleteAllTasks(userId) {
  const { error } = await supabase.from('tasks').delete().eq('user_id', userId)
  if (error) throw error
}

// ── Shape converters ──────────────────────────────────────────────

/** Map the app's camelCase task object → DB snake_case row. */
function taskToDb(task, userId) {
  return {
    id:           task.id,
    user_id:      userId,
    text:         task.text,
    done:         task.done,
    priority:     task.priority,
    category:     task.category  || null,
    tags:         task.tags      || [],
    due_date:     task.dueDate   ? new Date(task.dueDate).toISOString() : null,
    recurring:    task.recurring || null,
    notes:        task.notes     || '',
    subtasks:     task.subtasks  || [],
    completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    xp_awarded:   task.xpAwarded  || false,
    created_at:   new Date(task.created).toISOString(),
  }
}

/** Map a DB row → the camelCase shape the Zustand stores/components use. */
function dbToTask(row) {
  return {
    id:          row.id,
    text:        row.text,
    done:        row.done,
    priority:    row.priority,
    category:    row.category    || null,
    tags:        row.tags        || [],
    dueDate:     row.due_date    ? new Date(row.due_date).getTime()    : null,
    recurring:   row.recurring   || null,
    notes:       row.notes       || '',
    subtasks:    row.subtasks    || [],
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
    xpAwarded:   row.xp_awarded  || false,
    created:     new Date(row.created_at).getTime(),
  }
}
