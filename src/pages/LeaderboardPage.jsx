// import { motion } from 'framer-motion'
// import { Trophy } from 'lucide-react'
// import { Leaderboard } from '@/components/gamification/Leaderboard'

// const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, delay: d, ease: [0.22,1,0.36,1] } })

// export function LeaderboardPage() {
//   return (
//     <div>
//       <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
//         <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <Trophy size={28} color="#f59e0b" strokeWidth={2} /> Leaderboard
//         </h1>
//         <p className="page-subtitle">See how you rank against the community</p>
//       </motion.div>
//       <motion.div {...fadeUp(0.08)}>
//         <Leaderboard />
//       </motion.div>
//     </div>
//   )
// }


// import { motion } from 'framer-motion'
// import { Trophy, Sun, Moon } from 'lucide-react'
// import { Leaderboard } from '@/components/gamification/Leaderboard'
// import { useTheme } from '@/hooks'

// const fadeUp = (d = 0) => ({
//   initial: { opacity: 0, y: 12 },
//   animate: { opacity: 1, y: 0 },
//   transition: { duration: 0.32, delay: d, ease: [0.22, 1, 0.36, 1] },
// })

// export function LeaderboardPage() {
//   const { theme, toggleTheme } = useTheme()

//   return (
//     <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 640, margin: '0 auto' }}>

//       {/* ── Header row ── */}
//       <motion.div
//         {...fadeUp()}
//         style={{
//           display:        'flex',
//           alignItems:     'flex-start',
//           justifyContent: 'space-between',
//           marginBottom:   'clamp(18px,3vw,28px)',
//           gap:            12,
//         }}
//       >
//         {/* Title + subtitle */}
//         <div>
//           <h1
//             className="page-title"
//             style={{ display: 'flex', alignItems: 'center', gap: 10 }}
//           >
//             {/* Gold trophy — glass pill behind it */}
//             <span style={{
//               width:               42,
//               height:              42,
//               borderRadius:        'var(--radius-md)',
//               background:          'var(--glass-card)',
//               backdropFilter:      'blur(16px)',
//               WebkitBackdropFilter:'blur(16px)',
//               border:              '1px solid var(--glass-card-border)',
//               boxShadow:           '0 4px 14px rgba(245,158,11,0.18)',
//               display:             'flex',
//               alignItems:          'center',
//               justifyContent:      'center',
//               flexShrink:          0,
//             }}>
//               <Trophy size={22} color="#f59e0b" strokeWidth={2} fill="rgba(245,158,11,0.18)" />
//             </span>
//             Leaderboard
//           </h1>
//           <p className="page-subtitle">See how you rank against the community</p>
//         </div>

//         {/* Dark / light toggle — glass circle button */}
//         <motion.button
//           whileHover={{ scale: 1.08 }}
//           whileTap={{ scale: 0.88 }}
//           onClick={toggleTheme}
//           aria-label="Toggle theme"
//           style={{
//             width:               40,
//             height:              40,
//             borderRadius:        '50%',
//             flexShrink:          0,
//             marginTop:           4,
//             background:          'var(--glass-btn)',
//             backdropFilter:      'blur(16px)',
//             WebkitBackdropFilter:'blur(16px)',
//             border:              '1px solid var(--glass-btn-border)',
//             boxShadow:           'var(--shadow-sm)',
//             display:             'flex',
//             alignItems:          'center',
//             justifyContent:      'center',
//             cursor:              'pointer',
//             color:               'var(--text-muted)',
//             transition:          'background 0.15s, border-color 0.15s',
//           }}
//         >
//           {theme === 'dark'
//             ? <Sun  size={17} strokeWidth={2} />
//             : <Moon size={17} strokeWidth={2} />
//           }
//         </motion.button>
//       </motion.div>

//       {/* ── Leaderboard component ── */}
//       <motion.div {...fadeUp(0.08)}>
//         <Leaderboard />
//       </motion.div>
//     </div>
//   )
// }


import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, Star, Medal } from 'lucide-react'
import { useLeaderboardStore } from '@/store/useLeaderboardStore'

// ── Rank medal colours ─────────────────────────────────────────────────────────
const RANK_META = {
  1: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Medal size={14} /> },
  2: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <Medal size={14} /> },
  3: { color: '#cd7c3e', bg: 'rgba(205,124,62,0.12)',  icon: <Medal size={14} /> },
}

function RankBadge({ rank }) {
  const meta = RANK_META[rank]
  if (meta) {
    return (
      <span style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            3,
        width:          32,
        height:         32,
        borderRadius:   'var(--radius-sm, 8px)',
        background:     meta.bg,
        color:          meta.color,
        fontWeight:     700,
        fontSize:       13,
        flexShrink:     0,
      }}>
        {rank}
      </span>
    )
  }
  return (
    <span style={{
      display:        'inline-flex',
      alignItems:     'center',
      justifyContent: 'center',
      width:          32,
      height:         32,
      borderRadius:   'var(--radius-sm, 8px)',
      background:     'var(--glass-card, rgba(255,255,255,0.06))',
      color:          'var(--text-muted)',
      fontWeight:     600,
      fontSize:       12,
      flexShrink:     0,
    }}>
      {rank}
    </span>
  )
}

function Avatar({ name, size = 36 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Deterministic hue from name
  const hue = [...(name ?? '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <span style={{
      width:           size,
      height:          size,
      borderRadius:    '50%',
      background:      `hsl(${hue},55%,45%)`,
      display:         'inline-flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontSize:        size * 0.36,
      fontWeight:      700,
      color:           '#fff',
      letterSpacing:   '-0.01em',
      flexShrink:      0,
      userSelect:      'none',
    }}>
      {initials}
    </span>
  )
}

function Stat({ icon, value, label, color }) {
  return (
    <span style={{
      display:    'flex',
      alignItems: 'center',
      gap:        3,
      color:      color ?? 'var(--text-muted)',
      fontSize:   12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {icon}
      <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{value}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</span>
    </span>
  )
}

function LeaderboardRow({ entry, isCurrentUser, index }) {
  const rowStyle = isCurrentUser
    ? {
        background:          'linear-gradient(135deg, rgba(34,197,94,0.13) 0%, rgba(22,163,74,0.07) 100%)',
        border:              '1px solid rgba(34,197,94,0.35)',
        boxShadow:           '0 0 0 1px rgba(34,197,94,0.12), 0 4px 16px rgba(34,197,94,0.08)',
      }
    : {
        background:          'var(--glass-card, rgba(255,255,255,0.04))',
        border:              '1px solid var(--glass-card-border, rgba(255,255,255,0.08))',
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            12,
        padding:        '10px 14px',
        borderRadius:   'var(--radius-md, 14px)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        marginBottom:   8,
        cursor:         'default',
        transition:     'background 0.15s, border-color 0.15s',
        ...rowStyle,
      }}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Avatar */}
      <Avatar name={entry.name} size={36} />

      {/* Name + You badge + demo indicator */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        6,
          flexWrap:   'wrap',
        }}>
          <span style={{
            fontSize:     14,
            fontWeight:   isCurrentUser ? 700 : 600,
            color:        isCurrentUser ? 'var(--color-primary, #22c55e)' : 'var(--text-primary)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            maxWidth:     160,
          }}>
            {entry.name ?? 'Anonymous'}
          </span>

          {/* "You" badge — only for current user */}
          {isCurrentUser && (
            <span style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          3,
              padding:      '1px 7px',
              borderRadius: 99,
              background:   'rgba(34,197,94,0.18)',
              border:       '1px solid rgba(34,197,94,0.4)',
              color:        '#22c55e',
              fontSize:     10,
              fontWeight:   700,
              letterSpacing:'0.04em',
              textTransform:'uppercase',
            }}>
              <Star size={9} strokeWidth={2.5} />
              You
            </span>
          )}

          {/* Demo indicator — subtle, so users understand what's seeded */}
          {entry.isDemo && (
            <span style={{
              fontSize:     9,
              fontWeight:   500,
              color:        'var(--text-muted)',
              opacity:      0.5,
              letterSpacing:'0.04em',
              textTransform:'uppercase',
            }}>
              demo
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Stat
          icon={<Flame size={12} color="#f97316" strokeWidth={2.5} />}
          value={entry.streak ?? 0}
          label="d"
          color="#f97316"
        />
        <Stat
          icon={<Zap size={12} color="#a78bfa" strokeWidth={2.5} />}
          value={(entry.weekly_xp ?? 0).toLocaleString()}
          label="wk"
          color="#a78bfa"
        />
        <span style={{
          minWidth:   52,
          textAlign:  'right',
          fontSize:   13,
          fontWeight: 700,
          color:      isCurrentUser ? '#22c55e' : 'var(--text-primary)',
        }}>
          {(entry.xp ?? 0).toLocaleString()}
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>
            XP
          </span>
        </span>
      </div>
    </motion.div>
  )
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonRow({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.1 }}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        padding:      '10px 14px',
        borderRadius: 'var(--radius-md, 14px)',
        background:   'var(--glass-card, rgba(255,255,255,0.04))',
        border:       '1px solid var(--glass-card-border, rgba(255,255,255,0.08))',
        marginBottom: 8,
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--glass-btn, rgba(255,255,255,0.08))' }} />
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--glass-btn)' }} />
      <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'var(--glass-btn)' }} />
      <div style={{ width: 60, height: 12, borderRadius: 6, background: 'var(--glass-btn)' }} />
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function LeaderboardPage() {
  const { entries, currentUserEntry, loading, error, fetchLeaderboard } = useLeaderboardStore()

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // True when the signed-in user exists but sits outside the top 10
  const userInTop10    = entries.some(e => e.id === currentUserEntry?.id)
  const showPinnedUser = currentUserEntry && !userInTop10

  return (
    <div>
      {/* Column header labels */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        padding:      '0 14px 8px',
        fontSize:     10,
        fontWeight:   600,
        color:        'var(--text-muted)',
        letterSpacing:'0.06em',
        textTransform:'uppercase',
      }}>
        <span style={{ width: 32 }}>#</span>
        <span style={{ width: 36 }} />
        <span style={{ flex: 1 }}>Player</span>
        <span style={{ minWidth: 36, textAlign: 'center' }}>Streak</span>
        <span style={{ minWidth: 44, textAlign: 'center' }}>Wkly XP</span>
        <span style={{ minWidth: 52, textAlign: 'right' }}>Total XP</span>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{
          padding:      '20px 14px',
          textAlign:    'center',
          color:        'var(--text-muted)',
          fontSize:     13,
          borderRadius: 'var(--radius-md, 14px)',
          background:   'var(--glass-card)',
          border:       '1px solid var(--glass-card-border)',
        }}>
          Couldn't load the leaderboard. Check your connection and try refreshing.
        </div>
      )}

      {/* Skeleton */}
      {loading && !error && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </>
      )}

      {/* Top 10 rows */}
      <AnimatePresence>
        {!loading && !error && entries.map((entry, i) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            isCurrentUser={currentUserEntry?.id === entry.id}
            index={i}
          />
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div style={{
          padding:      '32px 14px',
          textAlign:    'center',
          color:        'var(--text-muted)',
          fontSize:     13,
        }}>
          No entries yet — complete tasks to appear here!
        </div>
      )}

      {/* ── Pinned "Your position" section (only when user is outside top 10) ── */}
      {!loading && !error && showPinnedUser && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Divider with label */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            10,
            margin:         '16px 0 10px',
          }}>
            <div style={{
              flex:       1,
              height:     1,
              background: 'var(--glass-card-border, rgba(255,255,255,0.08))',
            }} />
            <span style={{
              fontSize:     10,
              fontWeight:   600,
              color:        'var(--text-muted)',
              letterSpacing:'0.06em',
              textTransform:'uppercase',
              whiteSpace:   'nowrap',
            }}>
              Your position
            </span>
            <div style={{
              flex:       1,
              height:     1,
              background: 'var(--glass-card-border, rgba(255,255,255,0.08))',
            }} />
          </div>

          {/* The user's own row */}
          <LeaderboardRow
            entry={currentUserEntry}
            isCurrentUser
            index={10}
          />
        </motion.div>
      )}

      {/* Footer note */}
      {!loading && !error && entries.length > 0 && (
        <p style={{
          marginTop:    16,
          textAlign:    'center',
          fontSize:     11,
          color:        'var(--text-muted)',
          opacity:      0.55,
        }}>
          Rankings update on page load · Showing top 10 players
        </p>
      )}
    </div>
  )
}