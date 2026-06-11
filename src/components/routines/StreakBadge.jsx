// /**
//  * components/routines/StreakBadge.jsx
//  * Displays current streak with fire animation and best streak.
//  *
//  * components/routines/RoutineProgress.jsx
//  * Compact progress ring for individual routines.
//  */

// import { motion } from 'framer-motion'
// import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

// // ── StreakBadge ──────────────────────────────────────────────
// export function StreakBadge({
//   currentStreak = 0,
//   bestStreak    = 0,
//   streakActive  = false,
// }) {
//   return (
//     <motion.div
//       className="flex items-center gap-4 p-4 rounded-2xl"
//       style={{
//         background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.05) 100%)',
//         border: '1px solid rgba(251,191,36,0.2)',
//       }}
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
//     >
//       {/* Fire emoji */}
//       <motion.div
//         className="text-3xl streak-glow"
//         animate={streakActive
//           ? { scale: [1, 1.15, 1], rotate: [-3, 3, -3, 0] }
//           : { scale: 1 }
//         }
//         transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
//       >
//         {streakActive ? '🔥' : '💤'}
//       </motion.div>

//       {/* Stats */}
//       <div className="flex-1">
//         <div className="flex items-baseline gap-1.5">
//           <AnimatedCounter
//             value={currentStreak}
//             className="text-2xl font-bold"
//             style={{ color: '#fbbf24' }}
//           />
//           <span className="text-sm font-semibold" style={{ color: 'rgba(251,191,36,0.7)' }}>
//             day streak
//           </span>
//         </div>
//         <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
//           Best: <span style={{ color: '#fbbf24' }}>{bestStreak}d</span>
//           {' · '}
//           {streakActive ? '✅ Active today' : '⚠️ Complete today to maintain'}
//         </p>
//       </div>
//     </motion.div>
//   )
// }

// // ── RoutineProgress ──────────────────────────────────────────
// export function RoutineProgress({
//   completionRate = 0,
//   missedDays     = 0,
//   size           = 56,
// }) {
//   const radius      = (size - 8) / 2
//   const circumference = 2 * Math.PI * radius
//   const offset      = circumference - (completionRate / 100) * circumference

//   return (
//     <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
//       <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
//         <circle
//           cx={size / 2} cy={size / 2} r={radius}
//           fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5}
//         />
//         <motion.circle
//           cx={size / 2} cy={size / 2} r={radius}
//           fill="none" stroke="#22c55e" strokeWidth={5}
//           strokeLinecap="round"
//           strokeDasharray={circumference}
//           initial={{ strokeDashoffset: circumference }}
//           animate={{ strokeDashoffset: offset }}
//           transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
//           style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.4))' }}
//         />
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
//           {completionRate}%
//         </span>
//       </div>
//     </div>
//   )
// }


/**
 * src/components/routines/StreakBadge.jsx
 * Fixed: CSS vars from globals.css only, Lucide icons, theme-aware
 */
import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

export function StreakBadge({ currentStreak = 0, bestStreak = 0, streakActive = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        padding:      '12px 16px',
        borderRadius: 'var(--radius-lg)',
        background:   'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)',
        border:       '1px solid rgba(245,158,11,0.22)',
        boxShadow:    'var(--shadow-sm)',
      }}
    >
      {/* Fire icon */}
      <motion.div
        animate={streakActive
          ? { scale: [1, 1.15, 1], rotate: [-3, 3, -3, 0] }
          : { scale: 1 }
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame
          size={28}
          color={streakActive ? 'var(--streak-fire)' : 'var(--text-muted)'}
          fill={streakActive ? 'rgba(251,146,60,0.25)' : 'none'}
        />
      </motion.div>

      {/* Stats */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--xp-gold)', lineHeight: 1 }}>
            {currentStreak}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(245,158,11,0.7)', fontFamily: 'var(--font-body)' }}>
            day streak
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            <Trophy size={10} color="var(--xp-gold)" />
            Best: <strong style={{ color: 'var(--xp-gold)' }}>{bestStreak}d</strong>
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 11, color: streakActive ? 'var(--brand)' : 'var(--priority-medium)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            {streakActive ? '✓ Active today' : '⚠ Complete today'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function RoutineProgress({ completionRate = 0, size = 56 }) {
  const radius       = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (completionRate / 100) * circumference
  return (
    <div style={{ position:'relative',width:size,height:size,flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-surface-3)" strokeWidth={5} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--brand)" strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.19,1,0.22,1], delay: 0.2 }}
        />
      </svg>
      <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontSize:11,fontWeight:800,color:'var(--text-primary)',fontFamily:'var(--font-display)' }}>
          {completionRate}%
        </span>
      </div>
    </div>
  )
}