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


import { motion } from 'framer-motion'
import { Trophy, Sun, Moon } from 'lucide-react'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { useTheme } from '@/hooks'

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay: d, ease: [0.22, 1, 0.36, 1] },
})

export function LeaderboardPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 640, margin: '0 auto' }}>

      {/* ── Header row ── */}
      <motion.div
        {...fadeUp()}
        style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          marginBottom:   'clamp(18px,3vw,28px)',
          gap:            12,
        }}
      >
        {/* Title + subtitle */}
        <div>
          <h1
            className="page-title"
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Gold trophy — glass pill behind it */}
            <span style={{
              width:               42,
              height:              42,
              borderRadius:        'var(--radius-md)',
              background:          'var(--glass-card)',
              backdropFilter:      'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              border:              '1px solid var(--glass-card-border)',
              boxShadow:           '0 4px 14px rgba(245,158,11,0.18)',
              display:             'flex',
              alignItems:          'center',
              justifyContent:      'center',
              flexShrink:          0,
            }}>
              <Trophy size={22} color="#f59e0b" strokeWidth={2} fill="rgba(245,158,11,0.18)" />
            </span>
            Leaderboard
          </h1>
          <p className="page-subtitle">See how you rank against the community</p>
        </div>

        {/* Dark / light toggle — glass circle button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width:               40,
            height:              40,
            borderRadius:        '50%',
            flexShrink:          0,
            marginTop:           4,
            background:          'var(--glass-btn)',
            backdropFilter:      'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            border:              '1px solid var(--glass-btn-border)',
            boxShadow:           'var(--shadow-sm)',
            display:             'flex',
            alignItems:          'center',
            justifyContent:      'center',
            cursor:              'pointer',
            color:               'var(--text-muted)',
            transition:          'background 0.15s, border-color 0.15s',
          }}
        >
          {theme === 'dark'
            ? <Sun  size={17} strokeWidth={2} />
            : <Moon size={17} strokeWidth={2} />
          }
        </motion.button>
      </motion.div>

      {/* ── Leaderboard component ── */}
      <motion.div {...fadeUp(0.08)}>
        <Leaderboard />
      </motion.div>
    </div>
  )
}