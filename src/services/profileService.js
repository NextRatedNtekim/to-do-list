import { supabase } from '@/lib/supabase'

/**
 * profileService
 * --------------
 * Manages the `user_profiles` table.
 * One row per user — created automatically on first sign-in.
 */

/** Fetch profile for the given user id. Returns null if not found yet. */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // PGRST116 = "no rows found" — not an error, profile just doesn't exist yet
  if (error && error.code !== 'PGRST116') throw error
  return data ? dbToProfile(data) : null
}

/**
 * Upsert profile row.
 * Called on first login to create the row, and on every XP/streak update.
 */
export async function upsertProfile(userId, profile) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert([profileToDb(userId, profile)], { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return dbToProfile(data)
}

/** Patch specific columns without a full upsert (more efficient for frequent XP updates). */
export async function patchProfile(userId, updates) {
  const row = {}
  if (updates.name              !== undefined) row.name               = updates.name
  if (updates.totalXP           !== undefined) row.total_xp           = updates.totalXP
  if (updates.weeklyXP          !== undefined) row.weekly_xp          = updates.weeklyXP
  if (updates.weekStart         !== undefined) row.week_start         = new Date(updates.weekStart).toISOString()
  if (updates.streak            !== undefined) row.streak             = updates.streak
  if (updates.longestStreak     !== undefined) row.longest_streak     = updates.longestStreak
  if (updates.lastCompletedDay  !== undefined) row.last_completed_day = updates.lastCompletedDay ? new Date(updates.lastCompletedDay).toISOString() : null
  if (updates.streakFreezes     !== undefined) row.streak_freezes     = updates.streakFreezes
  if (updates.dailyActivity     !== undefined) row.daily_activity     = updates.dailyActivity
  if (updates.unlockedMilestones!== undefined) row.unlocked_milestones= updates.unlockedMilestones

  const { data, error } = await supabase
    .from('user_profiles')
    .update(row)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return dbToProfile(data)
}

// ── Shape converters ──────────────────────────────────────────────

function profileToDb(userId, p) {
  return {
    id:                  userId,
    name:                p.name                || 'Taskr User',
    total_xp:            p.totalXP             || 0,
    weekly_xp:           p.weeklyXP            || 0,
    week_start:          p.weekStart           ? new Date(p.weekStart).toISOString() : new Date().toISOString(),
    streak:              p.streak              || 0,
    longest_streak:      p.longestStreak       || 0,
    last_completed_day:  p.lastCompletedDay    ? new Date(p.lastCompletedDay).toISOString() : null,
    streak_freezes:      p.streakFreezes       ?? 2,
    daily_activity:      p.dailyActivity       || {},
    unlocked_milestones: p.unlockedMilestones  || [],
  }
}

function dbToProfile(row) {
  return {
    name:               row.name               || 'Taskr User',
    totalXP:            row.total_xp           || 0,
    weeklyXP:           row.weekly_xp          || 0,
    weekStart:          row.week_start         ? new Date(row.week_start).getTime() : Date.now(),
    streak:             row.streak             || 0,
    longestStreak:      row.longest_streak     || 0,
    lastCompletedDay:   row.last_completed_day ? new Date(row.last_completed_day).getTime() : null,
    streakFreezes:      row.streak_freezes     ?? 2,
    dailyActivity:      row.daily_activity     || {},
    unlockedMilestones: row.unlocked_milestones|| [],
  }
}
