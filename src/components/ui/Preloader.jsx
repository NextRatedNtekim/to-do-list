import { AnimatePresence, motion } from 'framer-motion'

const LETTERS = ['T', 'a', 's', 'k', 'r']

export function Preloader({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         9999,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            32,
            background:     '#080f09',
            overflow:       'hidden',
          }}
        >
          {/* Dot grid background */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
            aria-hidden
          >
            <defs>
              <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Glow orb */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 2.2, opacity: 0.1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              position:     'absolute',
              width:        280,
              height:       280,
              borderRadius: '50%',
              background:   'radial-gradient(circle, #22c55e 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Letter reveal */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, position: 'relative' }}>
            {LETTERS.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 48, rotateX: -80, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0,  rotateX: 0,   filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  y:       i % 2 === 0 ? -36 : 36,
                  rotateX: i % 2 === 0 ? 60 : -60,
                  filter:  'blur(8px)',
                }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     'clamp(56px, 14vw, 80px)',
                  fontWeight:   800,
                  color:        i === 4 ? '#22c55e' : '#ffffff',
                  letterSpacing: '-3px',
                  display:      'inline-block',
                  transformOrigin: '50% 100%',
                  textShadow:   i === 4 ? '0 0 40px rgba(34,197,94,.6)' : 'none',
                }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10, letterSpacing: '0.5em' }}
            animate={{ opacity: 0.4, y: 0,  letterSpacing: '0.2em' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              margin:         0,
              fontSize:       11,
              color:          '#fff',
              textTransform:  'uppercase',
              fontFamily:     'var(--font-body)',
              fontWeight:     500,
            }}
          >
            Gamified Productivity Platform
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{
              width:        160,
              height:       3,
              background:   'rgba(255,255,255,0.08)',
              borderRadius: 99,
              overflow:     'hidden',
              position:     'relative',
            }}
          >
            <motion.div
              animate={{ x: ['0%', '300%'] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut', repeatDelay: 0.1 }}
              style={{
                position:     'absolute',
                top:          0,
                left:         0,
                width:        '40%',
                height:       '100%',
                background:   'linear-gradient(90deg, transparent, #22c55e, transparent)',
                borderRadius: 99,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
