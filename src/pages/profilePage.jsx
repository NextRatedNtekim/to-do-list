// src/pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Complete ProfilePage — built from scratch.
// Connects to your existing stores and Supabase tables.
// No external section files needed — fully self-contained.
//
// Sections:
//   1. Hero card      — avatar, name, level badge, XP progress bar
//   2. Stats grid     — tasks done, completion %, focus hours, weekly XP
//   3. Streak card    — streak flame, longest streak, freeze button
//   4. Badge grid     — 12 badges, locked/unlocked states with glow
//   5. Level road map — mini progress through all 15 levels
//   6. Settings strip — goal category, quiet hours, notifications toggle
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  Trophy, Flame, Zap, CheckCircle2, Target,
  Timer, Activity, Lock, RefreshCw, Send,
  HeartHandshake, Rocket, Hash, Star, Swords,
  Sunrise, Bell, BellOff, Moon, ChevronRight,
  LogOut, Shield, TrendingUp,
} from 'lucide-react'

import { useTaskStore  } from '@/store'
import { useUserStore  } from '@/store'
import { useAuthStore  } from '@/store/authStore'
import { supabase      } from '@/lib/supabase'
import {
  getLevel, getNextLevel, getLevelProgress,
  xpToNextLevel, getUnlockedBadges, LEVELS,
} from '@/lib/xp'

// ─── Motion preset ───────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] },
})

// ─── Glass card style (shared) ───────────────────────────────────────────────
const glass = (overrides = {}) => ({
  background:           'rgba(255,255,255,0.04)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         20,
  ...overrides,
})

// ─── Badge icon map — maps the string name from xp.js to a real Lucide icon ──
const BADGE_ICON_MAP = {
  CheckCircle2:   CheckCircle2,
  HeartHandshake: HeartHandshake,
  Flame:          Flame,
  Swords:         Swords,
  Trophy:         Trophy,
  Star:           Star,
  Sunrise:        Sunrise,
  Rocket:         Rocket,
  Hash:           Hash,
  Timer:          Timer,
  RefreshCw:      RefreshCw,
  Send:           Send,
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.07em',
      margin: '0 0 10px',
    }}>
      {children}
    </p>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ h = 120, r = 20, mb = 12 }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.4 }}
      style={{
        height: h, borderRadius: r, marginBottom: mb,
        background: 'rgba(255,255,255,0.05)',
      }}
    />
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Hero card
// ═════════════════════════════════════════════════════════════════════════════
function HeroCard({ profile, levelData, nextLevel, levelPct, xpRemaining }) {
  const initials = (profile.display_name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div {...fadeUp(0)} style={{ ...glass(), padding: '24px 20px', marginBottom: 12, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow behind avatar */}
      <div style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.05 }}
        style={{
          width: 76, height: 76, borderRadius: 24, margin: '0 auto 14px',
          background: 'linear-gradient(135deg, #16a34a, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 28, color: '#fff',
          boxShadow: '0 8px 32px rgba(22,163,74,0.45)',
          position: 'relative', zIndex: 1,
        }}
      >
        {initials}
      </motion.div>

      {/* Name */}
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
        {profile.display_name || 'You'}
      </h1>

      {/* Level badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 18 }}>
        <Trophy size={12} color="#22c55e" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
          Level {levelData.level} — {levelData.title}
        </span>
        <span style={{ fontSize: 13 }}>{levelData.icon}</span>
      </div>

      {/* XP progress bar */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
          <span>{(profile.total_xp ?? 0).toLocaleString()} XP</span>
          <span>{nextLevel.xp.toLocaleString()} XP — {nextLevel.title}</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelPct}%` }}
            transition={{ duration: 1.3, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: '100%', background: 'linear-gradient(to right, #16a34a, #4ade80)', borderRadius: 8 }}
          />
        </div>
        <p style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>
          {xpRemaining.toLocaleString()} XP to Level {nextLevel.level}
        </p>
      </div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Stats grid (2×2)
// ═════════════════════════════════════════════════════════════════════════════
function StatsGrid({ profile, tasksDone, totalTasks }) {
  const completionRate = totalTasks > 0
    ? Math.round((tasksDone / totalTasks) * 100)
    : 0
  const focusHours = Math.floor((profile.focus_minutes ?? 0) / 60)

  const stats = [
    { icon: CheckCircle2, label: 'Tasks done',   value: profile.tasks_completed ?? tasksDone, color: '#22c55e' },
    { icon: Target,       label: 'Completion',   value: `${completionRate}%`,                  color: '#3b82f6' },
    { icon: Timer,        label: 'Focus hours',  value: `${focusHours}h`,                      color: '#8b5cf6' },
    { icon: Activity,     label: 'Weekly XP',    value: (profile.weekly_xp ?? 0).toLocaleString(), color: '#f59e0b' },
  ]

  return (
    <motion.div {...fadeUp(0.08)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1,  scale: 1    }}
          transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
          style={{ ...glass({ borderRadius: 16 }), padding: '14px 14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={14} color={s.color} />
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{s.label}</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {s.value}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Streak card
// ═════════════════════════════════════════════════════════════════════════════
function StreakCard({ profile, onUseFreeze }) {
  const streak          = profile.streak          ?? 0
  const longestStreak   = profile.longest_streak  ?? 0
  const freezesLeft     = profile.streak_freezes  ?? 0

  return (
    <motion.div {...fadeUp(0.14)} style={{ ...glass({ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.2)' }), padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>

      {/* Flame */}
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{ flexShrink: 0 }}
      >
        <Flame size={36} color="#f59e0b" />
      </motion.div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
          {streak}-day streak
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          Longest: {longestStreak} days · {freezesLeft} freeze{freezesLeft !== 1 ? 's' : ''} left
        </div>
      </div>

      {/* Freeze button */}
      {freezesLeft > 0 && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onUseFreeze}
          style={{
            padding: '6px 13px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(245,158,11,0.15)',
            border:     '1px solid rgba(245,158,11,0.3)',
            fontSize: 11, fontWeight: 700, color: '#f59e0b',
            flexShrink: 0,
          }}
        >
          ❄️ Freeze
        </motion.button>
      )}
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Badge grid
// ═════════════════════════════════════════════════════════════════════════════
function BadgeGrid({ badges }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? badges : badges.slice(0, 6)

  return (
    <motion.div {...fadeUp(0.18)} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SectionLabel>Badges</SectionLabel>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? 'Show less' : `See all ${badges.length}`}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <AnimatePresence initial={false}>
          {visible.map((badge, i) => {
            const IconComponent = BADGE_ICON_MAP[badge.icon] ?? Zap
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: badge.unlocked ? 1 : 0.3, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
                title={badge.desc}
                style={{
                  ...glass({
                    borderRadius: 16,
                    border: badge.unlocked
                      ? `1px solid ${badge.color}28`
                      : '1px solid rgba(255,255,255,0.05)',
                  }),
                  padding: '14px 10px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                {/* Glow only for unlocked */}
                {badge.unlocked && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16,
                    background: `radial-gradient(circle at 50% 0%, ${badge.color}20 0%, transparent 65%)`,
                  }} />
                )}

                {/* Icon circle */}
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: badge.unlocked ? `${badge.color}22` : 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                  position: 'relative', zIndex: 1,
                }}>
                  {badge.unlocked
                    ? <IconComponent size={18} color={badge.color} />
                    : <Lock size={15} color="#334155" />
                  }
                </div>

                {/* Label */}
                <div style={{
                  fontSize: 10, fontWeight: 700, lineHeight: 1.3,
                  color: badge.unlocked ? '#f1f5f9' : '#334155',
                  position: 'relative', zIndex: 1,
                }}>
                  {badge.label}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Level road map
// ═════════════════════════════════════════════════════════════════════════════
function LevelRoadmap({ currentLevel }) {
  const [open, setOpen] = useState(false)
  // Show the 3 levels around current, expand to show all 15
  const visible = open ? LEVELS : LEVELS.slice(
    Math.max(0, currentLevel - 2),
    Math.min(LEVELS.length, currentLevel + 2)
  )

  return (
    <motion.div {...fadeUp(0.22)} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SectionLabel>Level road map</SectionLabel>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {open ? 'Collapse' : 'View all 15'}
        </button>
      </div>

      <div style={{ ...glass(), padding: '8px 14px' }}>
        {visible.map((lvl, i) => {
          const isCurrentLevel = lvl.level === currentLevel
          const isPast         = lvl.level < currentLevel
          return (
            <motion.div
              key={lvl.level}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 0',
                borderBottom: i < visible.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {/* Level icon circle */}
              <div style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                background: isCurrentLevel
                  ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                  : isPast
                    ? 'rgba(22,163,74,0.14)'
                    : 'rgba(255,255,255,0.04)',
                border: isCurrentLevel ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}>
                {lvl.icon}
              </div>

              {/* Name and XP */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 13, fontWeight: isCurrentLevel ? 800 : 500,
                    color: isCurrentLevel ? '#f1f5f9' : isPast ? '#64748b' : '#94a3b8',
                  }}>
                    {lvl.title}
                  </span>
                  {isCurrentLevel && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(22,163,74,0.18)', padding: '1px 6px', borderRadius: 6 }}>
                      You are here
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>
                  Level {lvl.level} · {lvl.xp.toLocaleString()} XP
                </div>
              </div>

              {/* Check mark for passed levels */}
              {isPast && <CheckCircle2 size={15} color="#22c55e" />}
              {isCurrentLevel && <TrendingUp size={15} color="#22c55e" />}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Settings strip
// ═════════════════════════════════════════════════════════════════════════════
function SettingsStrip({ profile, onSignOut }) {
  const [notifOn, setNotifOn] = useState(true)

  const rows = [
    {
      icon: Shield, color: '#22c55e',
      label: 'Goal category',
      value: profile.goal_category
        ? profile.goal_category.charAt(0).toUpperCase() + profile.goal_category.slice(1)
        : 'Not set',
      action: () => {},
    },
    {
      icon: Moon, color: '#8b5cf6',
      label: 'Quiet hours',
      value: `${profile.quiet_hours_start ?? 23}:00 – ${profile.quiet_hours_end ?? 7}:00`,
      action: () => {},
    },
    {
      icon: notifOn ? Bell : BellOff,
      color: '#3b82f6',
      label: 'Push notifications',
      value: notifOn ? 'On' : 'Off',
      action: () => setNotifOn(n => !n),
      isToggle: true,
      toggleOn: notifOn,
    },
  ]

  return (
    <motion.div {...fadeUp(0.26)} style={{ marginBottom: 12 }}>
      <SectionLabel>Settings</SectionLabel>
      <div style={{ ...glass(), overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            onClick={row.action}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', cursor: 'pointer',
              borderBottom: i < rows.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${row.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <row.icon size={15} color={row.color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9', flex: 1 }}>{row.label}</span>
            {row.isToggle ? (
              // Toggle switch
              <div style={{ width: 38, height: 22, borderRadius: 11, position: 'relative', background: row.toggleOn ? 'linear-gradient(to right, #16a34a, #22c55e)' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s', flexShrink: 0 }}>
                <motion.div
                  animate={{ left: row.toggleOn ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{row.value}</span>
                <ChevronRight size={13} color="#334155" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sign out */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSignOut}
        style={{
          width: '100%', marginTop: 10, padding: '13px 0',
          borderRadius: 16, cursor: 'pointer',
          background: 'rgba(239,68,68,0.08)',
          border:     '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontWeight: 700, color: '#ef4444',
        }}
      >
        <LogOut size={15} color="#ef4444" />
        Sign out
      </motion.button>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { tasks }   = useTaskStore()
  const { totalXP } = useUserStore()
  const { user }    = useAuthStore()

  const [profile,  setProfile]  = useState(null)
  const [partner,  setPartner]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [freezeMsg, setFreezeMsg] = useState(false)

  // ── Fetch profile from Supabase ────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select(`
          user_id, display_name, total_xp, weekly_xp, streak,
          longest_streak, streak_freezes, last_completed_day,
          tasks_completed, focus_minutes, perfect_days, early_birds,
          focus_sessions, recovered_tasks, nudges_sent,
          quiet_hours_start, quiet_hours_end, goal_category,
          onboarding_complete
        `)
        .eq('user_id', authUser.id)
        .single()

      // Check if partner exists
      const { data: conn } = await supabase
        .from('partner_connections')
        .select('partner_id')
        .eq('user_id', authUser.id)
        .eq('status', 'active')
        .maybeSingle()

      setProfile({
        ...profileData,
        // Merge live XP from store in case it's more up-to-date than DB
        total_xp: Math.max(profileData?.total_xp ?? 0, totalXP ?? 0),
        // Fallback display name from auth if profile row has none
        display_name: profileData?.display_name || user?.name || 'You',
      })
      setPartner(conn?.partner_id ?? null)
      setLoading(false)
    }
    loadProfile()
  }, [totalXP, user])

  // ── Freeze handler ─────────────────────────────────────────────────────────
  const handleUseFreeze = useCallback(async () => {
    if (!profile || (profile.streak_freezes ?? 0) <= 0) return
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    await supabase
      .from('user_profiles')
      .update({ streak_freezes: (profile.streak_freezes ?? 1) - 1 })
      .eq('user_id', authUser.id)

    setProfile(p => ({ ...p, streak_freezes: (p.streak_freezes ?? 1) - 1 }))
    setFreezeMsg(true)
    setTimeout(() => setFreezeMsg(false), 2500)
  }, [profile])

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    // Your app's router will redirect to auth screen automatically
    // because App.jsx listens to onAuthStateChange
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || !profile) {
    return (
      <div style={{ padding: '64px 16px 16px' }}>
        <Skeleton h={220} r={20} mb={12} />
        <Skeleton h={140} r={16} mb={12} />
        <Skeleton h={80}  r={20} mb={12} />
        <Skeleton h={200} r={20} mb={12} />
      </div>
    )
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const totalXp    = profile.total_xp ?? 0
  const levelData  = getLevel(totalXp)
  const nextLevel  = getNextLevel(totalXp)
  const levelPct   = getLevelProgress(totalXp)
  const xpLeft     = xpToNextLevel(totalXp)

  const tasksDone  = tasks.filter(t => t.done || t.completed_at).length
  const totalTasks = tasks.length

  const badgeStats = {
    totalTasks:     profile.tasks_completed ?? tasksDone,
    streak:         profile.streak          ?? 0,
    longestStreak:  profile.longest_streak  ?? 0,
    focusSessions:  profile.focus_sessions  ?? 0,
    recoveredTasks: profile.recovered_tasks ?? 0,
    nudgesSent:     profile.nudges_sent     ?? 0,
    hasPartner:     !!partner,
    perfectDays:    profile.perfect_days    ?? 0,
    earlyBirds:     profile.early_birds     ?? 0,
  }
  const badges = getUnlockedBadges(badgeStats)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '64px 16px 100px', maxWidth: 600, margin: '0 auto', position: 'relative' }}>

      {/* Page title */}
      <motion.div {...fadeUp()} style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>
          Profile
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Your progress, stats and achievements
        </p>
      </motion.div>

      {/* ── 1. Hero card ── */}
      <HeroCard
        profile={profile}
        levelData={levelData}
        nextLevel={nextLevel}
        levelPct={levelPct}
        xpRemaining={xpLeft}
      />

      {/* ── 2. Stats grid ── */}
      <StatsGrid
        profile={profile}
        tasksDone={tasksDone}
        totalTasks={totalTasks}
      />

      {/* ── 3. Streak card ── */}
      <StreakCard
        profile={profile}
        onUseFreeze={handleUseFreeze}
      />

      {/* Freeze used toast */}
      <AnimatePresence>
        {freezeMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{    opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            style={{
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              zIndex: 200, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              padding: '10px 22px', borderRadius: 100,
              boxShadow: '0 8px 32px rgba(22,163,74,0.5)',
            }}
          >
            ❄️ Streak freeze used — you're safe!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Badge grid ── */}
      <BadgeGrid badges={badges} />

      {/* ── 5. Level road map ── */}
      <LevelRoadmap currentLevel={levelData.level} />

      {/* ── 6. Settings strip ── */}
      <SettingsStrip profile={profile} onSignOut={handleSignOut} />

    </div>
  )
}