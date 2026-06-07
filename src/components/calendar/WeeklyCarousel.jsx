/**
 * components/calendar/WeeklyCarousel.jsx
 * Apple Calendar-style horizontal week date selector.
 * Swipe/drag between weeks. Selected date animates.
 *
 * Props:
 *   selectedDate   - Date
 *   onSelectDate   - (date: Date) => void
 *   taskDates      - Set<string> of "YYYY-MM-DD" that have tasks
 *   routineDates   - Set<string> of "YYYY-MM-DD" that have routines
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, format, isToday, isSameDay,
  isSameMonth,
} from 'date-fns'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_START = { weekStartsOn: 1 } // Monday

export function WeeklyCarousel({
  selectedDate = new Date(),
  onSelectDate,
  taskDates    = new Set(),
  routineDates = new Set(),
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [direction,  setDirection]  = useState(0)
  const dragStartX = useRef(0)

  const weekStart = startOfWeek(
    addWeeks(new Date(), weekOffset),
    WEEK_START
  )
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, WEEK_START),
  })

  function goNext() {
    setDirection(1)
    setWeekOffset(w => w + 1)
  }
  function goPrev() {
    setDirection(-1)
    setWeekOffset(w => w - 1)
  }
  function goToday() {
    setDirection(0)
    setWeekOffset(0)
  }

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -50) goNext()
    else if (info.offset.x > 50) goPrev()
  }, [])

  const weekLabel = format(weekStart, 'MMMM yyyy')

  return (
    <div className="mb-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goPrev} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
          ‹
        </button>

        <button onClick={goToday} className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          {weekLabel}
        </button>

        <button onClick={goNext} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold"
            style={{ color: 'var(--text-tertiary)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date row — animated */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={weekOffset}
          className="grid grid-cols-7 gap-1"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
        >
          {days.map(day => {
            const key       = format(day, 'yyyy-MM-dd')
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const hasTasks   = taskDates.has(key)
            const hasRoutines = routineDates.has(key)
            const isThisMonth = isSameMonth(day, new Date())

            return (
              <button
                key={key}
                onClick={() => onSelectDate?.(day)}
                className="flex flex-col items-center gap-0.5 py-2 rounded-2xl relative transition-all duration-200"
                style={{
                  background: isSelected
                    ? '#22c55e'
                    : isCurrentDay
                    ? 'rgba(34,197,94,0.12)'
                    : 'transparent',
                  boxShadow: isSelected
                    ? '0 4px 16px rgba(34,197,94,0.35)'
                    : 'none',
                }}
              >
                {/* Day number */}
                <span
                  className="text-sm font-bold leading-none"
                  style={{
                    color: isSelected
                      ? 'white'
                      : isCurrentDay
                      ? '#22c55e'
                      : isThisMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-tertiary)',
                  }}
                >
                  {format(day, 'd')}
                </span>

                {/* Dot indicators */}
                <div className="flex gap-0.5 h-1.5">
                  {hasTasks && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.7)' : '#22c55e',
                      }}
                    />
                  )}
                  {hasRoutines && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.7)' : '#60a5fa',
                      }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}