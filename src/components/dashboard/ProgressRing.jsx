/**
 * components/dashboard/ProgressRing.jsx
 * Animated SVG circular progress ring.
 * Shows tasks + routines completion percentage.
 *
 * Props:
 *   tasksCompleted    - number
 *   tasksTotal        - number
 *   routinesCompleted - number
 *   routinesTotal     - number
 *   size              - px (default 140)
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

export function ProgressRing({
  tasksCompleted    = 0,
  tasksTotal        = 0,
  routinesCompleted = 0,
  routinesTotal     = 0,
  size              = 140,
}) {
  const total     = tasksTotal + routinesTotal
  const completed = tasksCompleted + routinesCompleted
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  const radius    = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset    = circumference - (pct / 100) * circumference

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* SVG ring */}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? offset : circumference }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={pct}
          suffix="%"
          duration={1200}
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        />
        <span
          className="text-xs font-medium mt-0.5"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Done
        </span>
      </div>
    </div>
  )
}