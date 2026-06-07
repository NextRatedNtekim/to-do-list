/**
 * components/routines/HabitHeatmap.jsx
 * GitHub-style activity heatmap showing daily completions.
 * Shows 12 weeks (3 months) of data.
 *
 * Props:
 *   completedDates - string[] of "YYYY-MM-DD" completion dates
 *   title          - section title (default "Activity")
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  startOfWeek, addDays, subWeeks, format,
  isToday, parseISO, isSameDay,
} from 'date-fns'
import { GlassCard } from '@/components/ui/GlassCard'

const WEEKS = 13
const WEEK_START = { weekStartsOn: 1 }

function getIntensity(count) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  return 3
}

const INTENSITY_COLORS = [
  'rgba(255,255,255,0.05)',    // 0 - empty
  'rgba(34,197,94,0.25)',      // 1 - light
  'rgba(34,197,94,0.55)',      // 2 - medium
  'rgba(34,197,94,0.90)',      // 3 - full
]

const INTENSITY_SHADOWS = [
  'none',
  'none',
  '0 0 6px rgba(34,197,94,0.3)',
  '0 0 10px rgba(34,197,94,0.5)',
]

export function HabitHeatmap({ completedDates = [], title = 'Activity' }) {
  // Build a map: "YYYY-MM-DD" -> count
  const countMap = useMemo(() => {
    const map = {}
    for (const d of completedDates) {
      const key = typeof d === 'string' ? d.slice(0, 10) : format(d, 'yyyy-MM-dd')
      map[key] = (map[key] ?? 0) + 1
    }
    return map
  }, [completedDates])

  // Build week grid
  const grid = useMemo(() => {
    const today     = new Date()
    const gridStart = startOfWeek(subWeeks(today, WEEKS - 1), WEEK_START)
    const weeks = []

    for (let w = 0; w < WEEKS; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date  = addDays(gridStart, w * 7 + d)
        const key   = format(date, 'yyyy-MM-dd')
        const count = countMap[key] ?? 0
        week.push({ date, key, count, intensity: getIntensity(count) })
      }
      weeks.push(week)
    }
    return weeks
  }, [countMap])

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    grid.forEach((week, wi) => {
      const m = week[0].date.getMonth()
      if (m !== lastMonth) {
        labels.push({ weekIndex: wi, label: format(week[0].date, 'MMM') })
        lastMonth = m
      }
    })
    return labels
  }, [grid])

  const totalCompleted = completedDates.length
  const activeWeeks    = grid.flat().filter(c => c.count > 0).length

  return (
    <GlassCard variant="flat" padding="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {title.toUpperCase()}
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {totalCompleted} completions
        </span>
      </div>

      {/* Month labels */}
      <div className="flex gap-1.5 mb-1 pl-0">
        {grid.map((_, wi) => {
          const label = monthLabels.find(l => l.weekIndex === wi)
          return (
            <div key={wi} className="w-4 flex-shrink-0">
              {label && (
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                  {label.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1.5">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((cell, di) => (
              <motion.div
                key={cell.key}
                className="heatmap-cell w-4 h-4 rounded-[3px] cursor-default"
                style={{
                  background: INTENSITY_COLORS[cell.intensity],
                  boxShadow:  INTENSITY_SHADOWS[cell.intensity],
                  outline: isToday(cell.date)
                    ? '2px solid rgba(34,197,94,0.6)'
                    : 'none',
                  outlineOffset: '1px',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: (wi * 7 + di) * 0.003,
                  duration: 0.2,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                title={`${cell.key}: ${cell.count} completion${cell.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          Less
        </span>
        <div className="flex gap-1">
          {INTENSITY_COLORS.map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ background: c }}
            />
          ))}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          More
        </span>
      </div>
    </GlassCard>
  )
}