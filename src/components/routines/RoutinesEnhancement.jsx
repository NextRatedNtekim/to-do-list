/**
 * components/routines/RoutinesEnhancement.jsx
 *
 * Drop-in enhancement for the existing Habits page.
 * Adds: Weekly calendar carousel, streak badge, heatmap.
 * DOES NOT touch existing habit logic.
 *
 * HOW TO USE in your existing pages/Habits.jsx (or wherever):
 *
 *   import { RoutinesEnhancement } from '@/components/routines/RoutinesEnhancement'
 *
 *   // At the TOP of your Habits page JSX:
 *   <RoutinesEnhancement />
 *   ...existing content unchanged...
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, parseISO } from 'date-fns'

import { WeeklyCarousel }  from '@/components/calendar/WeeklyCarousel'
import { StreakBadge, RoutineProgress } from './StreakBadge'
import { HabitHeatmap }    from './HabitHeatmap'
import { GlassCard }       from '@/components/ui/GlassCard'
import { useStreakCalculator } from '@/hooks/useStreakCalculator'

// ── Read from existing store ─────────────────────────────────
// Adjust to match your actual habits/tasks store exports
import { useTaskStore } from '@/store'
import { useUserStore } from '@/store'

export function RoutinesEnhancement() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [heatmapOpen,  setHeatmapOpen]  = useState(false)

  const tasks   = useTaskStore(s => s.tasks   ?? [])
  const profile = useUserStore(s => s.profile ?? {})

  // Build completion dates from completed tasks (proxy for habits until
  // a dedicated routines store is wired in)
  const completionDates = useMemo(() =>
    tasks
      .filter(t => t.completed && t.completed_at)
      .map(t => t.completed_at?.slice(0, 10))
      .filter(Boolean),
    [tasks]
  )

  const {
    currentStreak,
    bestStreak,
    completionRate,
    missedDays,
    streakActive,
  } = useStreakCalculator(completionDates)

  // Date sets for carousel dots
  const taskDateSet = useMemo(() => {
    const s = new Set()
    tasks.forEach(t => {
      if (t.due_date) s.add(t.due_date.slice(0, 10))
    })
    return s
  }, [tasks])

  // Tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd')
    return tasks.filter(t => t.due_date?.slice(0, 10) === key)
  }, [tasks, selectedDate])

  return (
    <div className="px-4 pt-4 pb-2" style={{ color: 'var(--text-primary)' }}>

      {/* Page title */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Routines
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </motion.div>

      {/* Streak badge */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <StreakBadge
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          streakActive={streakActive}
        />
      </motion.div>

      {/* Weekly calendar carousel */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <WeeklyCarousel
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          taskDates={taskDateSet}
          routineDates={new Set()}
        />
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {[
          { label: 'Completion', value: `${completionRate}%`, color: '#22c55e', icon: '📈' },
          { label: 'Best Streak', value: `${bestStreak}d`,   color: '#fbbf24', icon: '🏆' },
          { label: 'Missed',      value: `${missedDays}d`,   color: '#f87171', icon: '📉' },
        ].map(stat => (
          <GlassCard key={stat.label} variant="flat" padding="p-3" className="text-center">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-base font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {stat.label}
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Heatmap (collapsible) */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setHeatmapOpen(o => !o)}
          className="w-full flex items-center justify-between px-1 mb-2"
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            ACTIVITY HEATMAP
          </span>
          <motion.span
            animate={{ rotate: heatmapOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            ▼
          </motion.span>
        </button>

        {heatmapOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HabitHeatmap
              completedDates={completionDates}
              title="Task completions"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Selected date preview */}
      {selectedDateTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>
            {isToday(selectedDate) ? "TODAY'S TASKS" : format(selectedDate, 'MMM d').toUpperCase()}
            {' '}({selectedDateTasks.length})
          </p>
          <GlassCard variant="flat" padding="px-4 py-1">
            {selectedDateTasks.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: t.completed ? '#22c55e' : '#fb923c',
                  }}
                />
                <span
                  className={`flex-1 text-sm ${t.completed ? 'line-through opacity-50' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.title}
                </span>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}