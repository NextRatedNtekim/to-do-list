import { supabase } from '@/lib/supabase'

/**
 * partnerService
 * --------------
 * Manages partner_connections, partner_invites, and activity_feed tables.
 */

// ── Invite codes ───────────────────────────────────────────────────

/** Generate a random 6-character uppercase invite code. */
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

/** Create and store a new invite. Returns the code. */
export async function createInvite(userId, userName) {
  const code = generateInviteCode()
  const { error } = await supabase
    .from('partner_invites')
    .insert({ code, inviter_id: userId, inviter_name: userName })

  if (error) throw error
  return code
}

/**
 * Look up an invite by code.
 * Returns { code, inviter_id, inviter_name, used, expires_at } or null.
 */
export async function lookupInvite(code) {
  const { data, error } = await supabase
    .from('partner_invites')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

/**
 * Accept an invite.
 * - Marks invite as used
 * - Creates two partner_connections rows (A→B and B→A)
 * - Inserts a partner_joined notification for the inviter
 */
export async function acceptInvite(code, acceptorId, acceptorName) {
  const invite = await lookupInvite(code)

  if (!invite)               throw new Error('Invite code not found.')
  if (invite.used)           throw new Error('This invite has already been used.')
  if (new Date(invite.expires_at) < new Date()) throw new Error('This invite has expired.')
  if (invite.inviter_id === acceptorId) throw new Error("You can't connect with yourself.")

  // Mark invite as used
  await supabase
    .from('partner_invites')
    .update({ used: true, accepted_by: acceptorId })
    .eq('code', code)

  // Create both directions of the connection
  await supabase.from('partner_connections').upsert([
    { user_id: invite.inviter_id, partner_id: acceptorId,       partner_name: acceptorName,       status: 'active' },
    { user_id: acceptorId,        partner_id: invite.inviter_id, partner_name: invite.inviter_name, status: 'active' },
  ], { onConflict: 'user_id,partner_id' })

  // Notify the inviter in real time
  await supabase.from('notifications').insert({
    user_id: invite.inviter_id,
    type:    'partner_joined',
    title:   `${acceptorName} accepted your invite! 🤝`,
    body:    "You're now accountability partners.",
    meta:    { partner_id: acceptorId, partner_name: acceptorName },
  })

  return { partnerId: invite.inviter_id, partnerName: invite.inviter_name }
}

/** Fetch active partner connection for a user. Returns the first one, or null. */
export async function fetchPartner(userId) {
  const { data, error } = await supabase
    .from('partner_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
    ? { id: data.partner_id, name: data.partner_name, connectedAt: new Date(data.created_at).getTime() }
    : null
}

/** Remove partner connection (both directions). */
export async function removePartner(userId, partnerId) {
  await supabase
    .from('partner_connections')
    .update({ status: 'removed' })
    .or(`and(user_id.eq.${userId},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${userId})`)
}

// ── Activity feed ──────────────────────────────────────────────────

/**
 * Broadcast an activity event to a partner.
 * Supabase Realtime delivers this to the partner's subscription instantly.
 */
export async function broadcastActivity({ userId, partnerId, actorName, action, text = '', xp = 0, meta = {} }) {
  const { error } = await supabase.from('activity_feed').insert({
    user_id:    userId,
    partner_id: partnerId,
    actor_name: actorName,
    action,
    text,
    xp,
    meta,
  })
  if (error) console.error('[Taskr] Broadcast activity error:', error)
}

/** Fetch the last 50 activity events visible to this user. */
export async function fetchActivityFeed(userId) {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('*')
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []).map(row => ({
    id:     row.id,
    user:   row.actor_name,
    action: row.action,
    text:   row.text,
    xp:     row.xp,
    ts:     new Date(row.created_at).getTime(),
    meta:   row.meta,
  }))
}

/**
 * Subscribe to new activity_feed rows where current user is the recipient.
 * Returns an unsubscribe function.
 */
export function subscribeToActivityFeed(userId, onNewItem) {
  const channel = supabase
    .channel(`activity-feed-${userId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'activity_feed',
        filter: `partner_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new
        onNewItem({
          id:     row.id,
          user:   row.actor_name,
          action: row.action,
          text:   row.text,
          xp:     row.xp,
          ts:     new Date(row.created_at).getTime(),
          meta:   row.meta,
        })
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ── Nudge ──────────────────────────────────────────────────────────

/** Send a nudge to a partner — creates activity event + notification. */
export async function sendNudge({ userId, partnerId, actorName }) {
  await Promise.all([
    broadcastActivity({
      userId,
      partnerId,
      actorName,
      action: 'nudge',
      text:   `${actorName} sent you a nudge 👋`,
    }),
    supabase.from('notifications').insert({
      user_id: partnerId,
      type:    'nudge',
      title:   `${actorName} nudged you! 👋`,
      body:    "Don't forget to complete your tasks today.",
      meta:    { from_user_id: userId, from_name: actorName },
    }),
  ])
}

/** Send a daily check-in to partner. */
export async function sendCheckin({ userId, partnerId, actorName, text }) {
  await broadcastActivity({
    userId,
    partnerId,
    actorName,
    action: 'checkin',
    text,
  })
}
