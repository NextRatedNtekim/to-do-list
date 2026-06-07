/**
 * CompletionEffect.jsx
 * Renders a brief success animation when a task/routine is completed.
 * Wraps the trigger element; shows particle burst + scale effect.
 *
 * Usage:
 *   <CompletionEffect trigger={isComplete}>
 *     <TaskCard ... />
 *   </CompletionEffect>
 *
 * Or call the imperative version:
 *   const { burst } = useCompletionBurst()
 *   burst(x, y)  // coordinates of the completed item
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Particle burst at given screen coordinates ───────────────
const PARTICLES = 8
const COLORS = ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#ffffff']

function Particle({ x, y, index }) {
  const angle  = (index / PARTICLES) * Math.PI * 2
  const dist   = 40 + Math.random() * 30
  const dx     = Math.cos(angle) * dist
  const dy     = Math.sin(angle) * dist
  const color  = COLORS[index % COLORS.length]
  const size   = 4 + Math.random() * 4

  return (
    <motion.div
      className="fixed pointer-events-none rounded-full z-[9999]"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    />
  )
}

// ── Global burst portal ──────────────────────────────────────
let _setBursts = null

export function CompletionBurstLayer() {
  const [bursts, setBursts] = useState([])

  useEffect(() => {
    _setBursts = setBursts
    return () => { _setBursts = null }
  }, [])

  return (
    <AnimatePresence>
      {bursts.map(b => (
        <div key={b.id}>
          {Array.from({ length: PARTICLES }, (_, i) => (
            <Particle key={i} x={b.x} y={b.y} index={i} />
          ))}
        </div>
      ))}
    </AnimatePresence>
  )
}

export function triggerCompletionBurst(x, y) {
  if (!_setBursts) return
  const id = Date.now() + Math.random()
  _setBursts(prev => [...prev, { id, x, y }])
  setTimeout(() => {
    _setBursts(prev => prev.filter(b => b.id !== id))
  }, 800)
}

// ── Hook for imperative use ──────────────────────────────────
export function useCompletionBurst() {
  const ref = useRef(null)

  function burst(el) {
    const target = el ?? ref.current
    if (!target) return
    const rect = target.getBoundingClientRect()
    triggerCompletionBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    )
  }

  return { ref, burst }
}

// ── Inline animated checkmark ────────────────────────────────
export function CheckmarkBurst({ size = 24, color = '#22c55e' }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <motion.circle
        cx="12" cy="12" r="10"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 400 }}
      />
      <motion.path
        d="M7.5 12.5l3 3 6-6"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}