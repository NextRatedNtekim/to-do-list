import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore, useUserStore } from '@/store'
import { levelFromXP, getRankForLevel } from '@/utils/constants'

export function XPFloatLayer() {
  const { xpFloats } = useUIStore()
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }} aria-hidden>
      <AnimatePresence>
        {xpFloats.map(f => (
          <motion.div key={f.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -72, scale: 1.25 }}
            exit={{}}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: f.y, left: f.x - 22,
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 17, color: '#f59e0b',
              textShadow: '0 2px 8px rgba(245,158,11,0.55)',
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}
          >
            +{f.amount} XP ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function LevelUpOverlay() {
  const { levelUpVisible, hideLevelUp } = useUIStore()
  const { totalXP } = useUserStore()
  const { level }   = levelFromXP(totalXP)
  const rank        = getRankForLevel(level)

  return (
    <AnimatePresence>
      {levelUpVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={hideLevelUp}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', padding: 20, cursor: 'pointer' }}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
            animate={{ scale: 1,   opacity: 1, rotate: 0 }}
            exit={{   scale: 0.8,  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 'clamp(28px,5vw,44px) clamp(24px,5vw,52px)', textAlign: 'center', maxWidth: 360, width: '100%', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Particle burst */}
            {[...Array(10)].map((_, i) => (
              <motion.div key={i}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, x: Math.cos((i / 10) * Math.PI * 2) * 110, y: Math.sin((i / 10) * Math.PI * 2) * 110 }}
                transition={{ duration: 0.85, delay: i * 0.04 }}
                style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: ['#22c55e','#f59e0b','#3b82f6','#f43f5e'][i % 4], pointerEvents: 'none' }}
              />
            ))}

            <motion.div animate={{ rotate: [0, 12, -10, 0] }} transition={{ duration: 0.5, delay: 0.18 }}
              style={{ fontSize: 60, marginBottom: 16, display: 'block' }}>
              {rank.icon}
            </motion.div>

            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>Level Up!</div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,12vw,60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, background: `linear-gradient(135deg, ${rank.color}, ${rank.color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 }}>
              {level}
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: rank.color, marginBottom: 26, fontFamily: 'var(--font-display)' }}>
              {rank.icon} {rank.title}
            </div>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={hideLevelUp} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Keep Going! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
