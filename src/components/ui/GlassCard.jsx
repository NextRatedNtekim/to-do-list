/**
 * GlassCard.jsx
 * Reusable Liquid Glass card container.
 * Drop-in replacement / wrapper for any card in the app.
 *
 * Props:
 *   variant  - 'default' | 'elevated' | 'accent' | 'flat'
 *   padding  - Tailwind padding class string (default 'p-4')
 *   className - extra classes
 *   onClick  - optional press handler (adds hover/active animations)
 *   children
 */

import { motion } from 'framer-motion'

const VARIANTS = {
  default:  'glass-card',
  elevated: 'glass-card glass-card-elevated',
  accent:   'glass-card glass-card-accent',
  flat:     'rounded-2xl border border-white/[0.08] bg-white/[0.04]',
}

export function GlassCard({
  variant   = 'default',
  padding   = 'p-4',
  className = '',
  onClick,
  children,
  style,
  ...rest
}) {
  const base = VARIANTS[variant] ?? VARIANTS.default

  if (onClick) {
    return (
      <motion.div
        className={`${base} ${padding} ${className} cursor-pointer`}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...rest}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={`${base} ${padding} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}