/**
 * components/dashboard/GreetingHeader.jsx
 * Dynamic time-of-day greeting with user name and avatar.
 * Reads name from useUserStore (same store the existing app uses).
 *
 * Non-breaking: only reads from store, never writes.
 */

import { motion } from 'framer-motion'
import { useGreeting } from '@/hooks/useGreeting'

const PERIOD_ICONS = {
  morning:   '☀️',
  afternoon: '🌤️',
  evening:   '🌆',
  night:     '🌙',
}

export function GreetingHeader({ userName = 'Samuel', avatarLetter }) {
  const { greeting, period } = useGreeting()
  const icon   = PERIOD_ICONS[period]
  const letter = avatarLetter ?? (userName?.[0] ?? 'U').toUpperCase()

  return (
    <motion.div
      className="flex items-center gap-3 mb-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
        }}
      >
        {letter}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {icon} {greeting}!
        </p>
        <h2
          className="text-xl font-bold leading-tight truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {userName}
        </h2>
      </div>
    </motion.div>
  )
}