/**
 * components/calendar/MonthlyGrid.jsx
 * Expandable monthly calendar that animates in/out.
 * Sits below the WeeklyCarousel and can be toggled.
 *
 * Props:
 *   isExpanded   - boolean
 *   onToggle     - () => void
 *   selectedDate - Date
 *   onSelectDate - (date: Date) => void
 *   taskDates    - Set<string>
 *   routineDates - Set<string>
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isToday,
  isSameMonth, addMonths, subMonths,
} from 'date-fns'
import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

const WEEK_START = { weekStartsOn: 1 }

export function MonthlyGrid({
  isExpanded   = false,
  onToggle,
  selectedDate = new Date(),
  onSelectDate,
  taskDates    = new Set(),
  routineDates = new Set(),
}) {
  const [viewMonth, setViewMonth] = useState(new Date())

  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const gridStart  = startOfWeek(monthStart, WEEK_START)
  const gridEnd    = endOfWeek(monthEnd, WEEK_START)
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="mb-4">
      {/* Expand/collapse toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-colors"
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-tertiary)',
        }}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
        {isExpanded ? 'Collapse month' : 'Show full month'}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <GlassCard variant="flat" padding="p-3 mt-3">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setViewMonth(m => subMonths(m, 1))}
                  className="text-lg leading-none"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ‹
                </button>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {format(viewMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setViewMonth(m => addMonths(m, 1))}
                  className="text-lg leading-none"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {days.map(day => {
                  const key        = format(day, 'yyyy-MM-dd')
                  const isSelected = isSameDay(day, selectedDate)
                  const isNow      = isToday(day)
                  const inMonth    = isSameMonth(day, viewMonth)
                  const hasTasks   = taskDates.has(key)
                  const hasRoutines = routineDates.has(key)

                  return (
                    <button
                      key={key}
                      onClick={() => onSelectDate?.(day)}
                      className="relative flex flex-col items-center py-1 rounded-xl transition-all duration-150"
                      style={{
                        background: isSelected
                          ? '#22c55e'
                          : isNow
                          ? 'rgba(34,197,94,0.12)'
                          : 'transparent',
                        opacity: inMonth ? 1 : 0.25,
                      }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: isSelected ? 'white' : isNow ? '#22c55e' : 'var(--text-primary)',
                        }}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="flex gap-0.5 h-1">
                        {hasTasks && (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#22c55e' }} />
                        )}
                        {hasRoutines && (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#60a5fa' }} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}