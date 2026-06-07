/**
 * components/dashboard/StatsCards.jsx
 * Four animated glass stat cards:
 *   Tasks Completed / Routines Completed / Streak / Productivity Score
 *
 * Non-breaking: receives all values as props from parent (Dashboard).
 */

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

const CARDS = [
  {
    key:    'tasks',
    label:  'Tasks Done',
    icon:   '✅',
    color:  '#22c55e',
    glow:   'rgba(34,197,94,0.2)',
  },
  {
    key:    'routines',
    label:  'Routines',
    icon:   '🔄',
    color:  '#60a5fa',
    glow:   'rgba(96,165,250,0.2)',
  },
  {
    key:    'streak',
    label:  'Streak',
    icon:   '🔥',
    color:  '#fbbf24',
    glow:   'rgba(251,191,36,0.2)',
    suffix: 'd',
  },
  {
    key:    'score',
    label:  'Score',
    icon:   '⚡',
    color:  '#a78bfa',
    glow:   'rgba(167,139,250,0.2)',
    suffix: '%',
  },
]

export function StatsCards({
  tasksCompleted    = 0,
  routinesCompleted = 0,
  streak            = 0,
  productivityScore = 0,
}) {
  const values = {
    tasks:    tasksCompleted,
    routines: routinesCompleted,
    streak,
    score:    productivityScore,
  }

  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: i * 0.07,
            ease: [0.19, 1, 0.22, 1],
          }}
        >
          <GlassCard
            variant="flat"
            padding="p-3"
            className="flex flex-col items-center text-center gap-1"
            style={{
              borderColor: `rgba(${hexToRgb(card.color)}, 0.2)`,
            }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{
                background: card.glow,
                boxShadow:  `0 0 12px ${card.glow}`,
              }}
            >
              {card.icon}
            </div>

            {/* Value */}
            <AnimatedCounter
              value={values[card.key]}
              suffix={card.suffix ?? ''}
              duration={900}
              className="text-lg font-bold leading-none"
              style={{ color: card.color }}
            />

            {/* Label */}
            <span
              className="text-[10px] font-medium leading-none"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {card.label}
            </span>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}