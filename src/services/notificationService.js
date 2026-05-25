import { supabase } from '@/lib/supabase'

/**
 * notificationService
 * --------------------
 * Manages the `notifications` table.
 * Supabase Realtime pushes INSERT events to the client instantly —
 * no polling needed.
 */

/** Fetch all notifications for a user, newest first. */
export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) throw error
  return (data || []).map(dbToNotification)
}

/** Mark a single notification as read. */
export async function markRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)

  if (error) console.error('[Taskr] markRead error:', error)
}

/** Mark ALL notifications as read for a user. */
export async function markAllRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) console.error('[Taskr] markAllRead error:', error)
}

/**
 * Insert a notification directly (for events triggered by the current user
 * that target themselves, e.g. streak milestone, level-up).
 */
export async function insertNotification(userId, { type, title, body = '', meta = {} }) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, body, meta })

  if (error) console.error('[Taskr] insertNotification error:', error)
}

/**
 * Subscribe to real-time notification inserts for this user.
 * The callback receives a single formatted notification object.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function subscribeToNotifications(userId, onNew) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNew(dbToNotification(payload.new))
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ── Shape converter ───────────────────────────────────────────────

function dbToNotification(row) {
  return {
    id:        row.id,
    type:      row.type,
    title:     row.title,
    body:      row.body || '',
    read:      row.read,
    meta:      row.meta || {},
    createdAt: new Date(row.created_at).getTime(),
  }
}
