/**
 * AnimatedCounter.jsx
 * Animates a number from 0 (or previous value) to `value`.
 * Uses requestAnimationFrame for smooth 60fps counting.
 *
 * Props:
 *   value    - target number
 *   duration - ms (default 1200)
 *   suffix   - string appended after number (e.g. '%', 'XP')
 *   prefix   - string prepended
 *   decimals - decimal places (default 0)
 *   className
 */

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  value     = 0,
  duration  = 1200,
  suffix    = '',
  prefix    = '',
  decimals  = 0,
  className = '',
}) {
  const [display, setDisplay] = useState(0)
  const frameRef  = useRef(null)
  const startRef  = useRef(null)
  const fromRef   = useRef(0)

  useEffect(() => {
    fromRef.current = display
    startRef.current = null

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp
      const elapsed  = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = fromRef.current + (value - fromRef.current) * eased

      setDisplay(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(value)
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}