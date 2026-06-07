import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Taskr] Missing Supabase env vars.\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'See .env.example for reference.'
  )
}

/**
 * Single shared Supabase client.
 * Import this everywhere you need Supabase — never call createClient() again.
 *
 * Auth session is automatically persisted to localStorage by the SDK.
 * detectSessionInUrl: true  handles the OAuth redirect automatically.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
    storage:           window.localStorage,
  },
})
// src/lib/supabase-additions.js
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTIONS:
//   Copy-paste ALL of these functions into the BOTTOM of your existing
//   src/lib/supabase.js file. Do not replace the file — just append.
// ─────────────────────────────────────────────────────────────────────────────
// Assumes your existing file already exports: supabase (the Supabase client)

// ─── Push subscriptions ───────────────────────────────────────────────────────

export async function savePushSubscription(sub) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const p256dh = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh'))));
  const auth   = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth'))));

  return supabase.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh, auth },
    { onConflict: 'user_id' }
  );
}

// ─── Alarm / task helpers ─────────────────────────────────────────────────────

export async function setTaskAlarm(taskId, alarmTime, reminderOffsets = [60, 30, 10]) {
  return supabase.from('tasks').update({
    alarm_time:       alarmTime,
    reminder_offsets: reminderOffsets,
  }).eq('id', taskId);
}

export async function setMissedTask(taskId, recoveryAction) {
  return supabase.from('tasks').update({
    missed_at:       new Date().toISOString(),
    recovery_action: recoveryAction,
  }).eq('id', taskId);
}

export async function clearMissedTask(taskId) {
  return supabase.from('tasks').update({
    missed_at:       null,
    recovery_action: null,
  }).eq('id', taskId);
}

// Fetch tasks that have an alarm set (for the Alarms screen)
export async function getTasksWithAlarms(userId) {
  return supabase
    .from('tasks')
    .select('id, title, alarm_time, reminder_offsets, priority, completed_at, missed_at')
    .eq('user_id', userId)
    .not('alarm_time', 'is', null)
    .order('alarm_time', { ascending: true });
}

// ─── Accountability partner helpers ──────────────────────────────────────────

export async function sendNudge(partnerId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from('activity_feed').insert({
    user_id:    user.id,
    partner_id: partnerId,
    action:     'nudge',
    metadata:   { message: 'Sent you a nudge 💪' },
  });
}

export async function sendCheckin(partnerId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from('activity_feed').insert({
    user_id:    user.id,
    partner_id: partnerId,
    action:     'checkin',
    metadata:   { timestamp: new Date().toISOString() },
  });
}

export async function getPartnerActivity(partnerId, limit = 20) {
  return supabase
    .from('activity_feed')
    .select('*')
    .or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
}

// ─── Scheduled sessions ───────────────────────────────────────────────────────

export async function scheduleSession({ partnerId, taskId, scheduledFor, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from('scheduled_sessions').insert({
    user_id:       user.id,
    partner_id:    partnerId,
    task_id:       taskId || null,
    scheduled_for: scheduledFor,
    notes:         notes || null,
  });
}

export async function getUpcomingSessions(userId) {
  return supabase
    .from('scheduled_sessions')
    .select('*')
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
    .eq('status', 'planned')
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(5);
}

// ─── Partner invite helpers ───────────────────────────────────────────────────

export async function generateInviteCode() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const code      = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('partner_invites')
    .insert({ user_id: user.id, code, expires_at: expiresAt })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function acceptInviteCode(code) {
  const { data: invite, error } = await supabase
    .from('partner_invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !invite) return { error: 'Invalid or expired code' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (invite.user_id === user.id) return { error: 'Cannot partner with yourself' };

  // Create partner connection (your existing table)
  const { error: connErr } = await supabase.from('partner_connections').insert([
    { user_id: invite.user_id, partner_id: user.id,        status: 'active' },
    { user_id: user.id,        partner_id: invite.user_id, status: 'active' },
  ]);

  if (connErr) return { error: connErr.message };

  // Mark invite used
  await supabase.from('partner_invites').update({ used: true }).eq('id', invite.id);

  // Fire activity_feed event so both users get notified via Realtime
  await supabase.from('activity_feed').insert({
    user_id:    user.id,
    partner_id: invite.user_id,
    action:     'partner_joined',
    metadata:   {},
  });

  return { success: true, partnerId: invite.user_id };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(goalCategory) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from('user_profiles').update({
    onboarding_complete: true,
    goal_category:       goalCategory,
  }).eq('user_id', user.id);
}

export async function checkOnboardingComplete(userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('onboarding_complete')
    .eq('user_id', userId)
    .single();
  return data?.onboarding_complete === true;
}