// src/lib/xp.js
// Centralised XP and level logic — import anywhere in the app.

// ─── XP values per action ─────────────────────────────────────────────────────
export const XP = {
  task_low:        10,
  task_medium:     20,
  task_high:       35,
  task_urgent:     50,
  early_bird:      15,   // completed before alarm_time
  perfect_day:    100,   // all daily tasks done
  daily_checkin:   25,   // accountability check-in
  focus_session:   30,   // completed a Pomodoro block
  recovery:        15,   // recovered a missed task
  partner_bonus:   20,   // your partner completed a shared goal
  shared_streak:  150,   // both you and partner hit streak milestone
  streak_daily:     5,   // per-day streak multiplier base (×streak days, max 50)
};

export function xpForTask(priority) {
  return XP[`task_${priority}`] ?? XP.task_medium;
}

export function xpForStreak(streakDays) {
  return Math.min(XP.streak_daily * streakDays, 50);
}

// ─── Level definitions ────────────────────────────────────────────────────────
export const LEVELS = [
  { level:  1, xp:     0, title: 'Seedling',      icon: '🌱' },
  { level:  2, xp:   200, title: 'Sprout',         icon: '🌿' },
  { level:  3, xp:   500, title: 'Focused',        icon: '⚡' },
  { level:  4, xp:  1000, title: 'Builder',        icon: '🔨' },
  { level:  5, xp:  2000, title: 'Achiever',       icon: '🎯' },
  { level:  6, xp:  3500, title: 'Momentum',       icon: '🚀' },
  { level:  7, xp:  5500, title: 'Warrior',        icon: '⚔️'  },
  { level:  8, xp:  8000, title: 'Champion',       icon: '🏆' },
  { level:  9, xp: 11000, title: 'Expert',         icon: '🧠' },
  { level: 10, xp: 15000, title: 'Master',         icon: '👑' },
  { level: 11, xp: 20000, title: 'Diamond',        icon: '💎' },
  { level: 12, xp: 27000, title: 'Legend',         icon: '🌟' },
  { level: 13, xp: 36000, title: 'Mythic',         icon: '🔱' },
  { level: 14, xp: 48000, title: 'Transcendent',   icon: '✨' },
  { level: 15, xp: 65000, title: 'Immortal',       icon: '🌌' },
];

// ─── Level helpers ────────────────────────────────────────────────────────────

export function getLevel(totalXp) {
  return (
    [...LEVELS].reverse().find((l) => totalXp >= l.xp) ?? LEVELS[0]
  );
}

export function getNextLevel(totalXp) {
  return LEVELS.find((l) => l.xp > totalXp) ?? LEVELS[LEVELS.length - 1];
}

/** Returns 0–100 progress percentage within the current level band */
export function getLevelProgress(totalXp) {
  const current = getLevel(totalXp);
  const next    = getNextLevel(totalXp);
  if (current.level === next.level) return 100; // max level
  const band = next.xp - current.xp;
  const done = totalXp - current.xp;
  return Math.round((done / band) * 100);
}

/** XP remaining to next level */
export function xpToNextLevel(totalXp) {
  const next = getNextLevel(totalXp);
  return Math.max(0, next.xp - totalXp);
}

// ─── Badges ───────────────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_task',      label: 'First Step',      desc: 'Complete your first task',           icon: 'CheckCircle2', color: '#22c55e' },
  { id: 'first_partner',   label: 'First Partner',   desc: 'Connect an accountability partner',  icon: 'HeartHandshake',color: '#3b82f6'},
  { id: 'streak_7',        label: '7-Day Streak',    desc: 'Maintain a 7-day streak',            icon: 'Flame',        color: '#f59e0b' },
  { id: 'streak_30',       label: '30-Day Warrior',  desc: 'Maintain a 30-day streak',           icon: 'Swords',       color: '#22c55e' },
  { id: 'streak_100',      label: 'Century',         desc: 'Maintain a 100-day streak',          icon: 'Trophy',       color: '#fbbf24' },
  { id: 'perfect_day',     label: 'Perfect Day',     desc: 'Complete all tasks in one day',      icon: 'Star',         color: '#8b5cf6' },
  { id: 'early_bird',      label: 'Early Bird',      desc: 'Complete a task before its alarm',   icon: 'Sunrise',      color: '#f59e0b' },
  { id: 'overachiever',    label: 'Overachiever',    desc: 'Complete 10 tasks in one day',       icon: 'Rocket',       color: '#ef4444' },
  { id: 'tasks_100',       label: '100 Tasks',       desc: 'Complete 100 tasks total',           icon: 'Hash',         color: '#8b5cf6' },
  { id: 'focus_10',        label: 'Deep Worker',     desc: 'Complete 10 focus sessions',         icon: 'Timer',        color: '#3b82f6' },
  { id: 'recovery_hero',   label: 'Comeback Kid',    desc: 'Recover 5 missed tasks',             icon: 'RefreshCw',    color: '#22c55e' },
  { id: 'team_player',     label: 'Team Player',     desc: 'Nudge your partner 10 times',        icon: 'Send',         color: '#3b82f6' },
];

/** Check which badges a user has unlocked based on their stats */
export function getUnlockedBadges(stats) {
  const {
    totalTasks = 0, streak = 0, longestStreak = 0,
    focusSessions = 0, recoveredTasks = 0, nudgesSent = 0,
    hasPartner = false, perfectDays = 0, earlyBirds = 0,
  } = stats;

  const unlocked = new Set();
  if (totalTasks >= 1)      unlocked.add('first_task');
  if (hasPartner)           unlocked.add('first_partner');
  if (longestStreak >= 7)   unlocked.add('streak_7');
  if (longestStreak >= 30)  unlocked.add('streak_30');
  if (longestStreak >= 100) unlocked.add('streak_100');
  if (perfectDays >= 1)     unlocked.add('perfect_day');
  if (earlyBirds >= 1)      unlocked.add('early_bird');
  if (totalTasks >= 100)    unlocked.add('tasks_100');
  if (focusSessions >= 10)  unlocked.add('focus_10');
  if (recoveredTasks >= 5)  unlocked.add('recovery_hero');
  if (nudgesSent >= 10)     unlocked.add('team_player');

  return BADGES.map((b) => ({ ...b, unlocked: unlocked.has(b.id) }));
}