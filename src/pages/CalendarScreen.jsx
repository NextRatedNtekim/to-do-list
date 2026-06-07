/**
 * pages/CalendarScreen.jsx
 * NEW calendar page — does NOT replace any existing page.
 * Add to PAGE_MAP in App.jsx as key 'calendar'.
 *
 * Reads from useTaskStore and any routine/habit store.
 * Never modifies existing store logic.
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isSameDay, parseISO, isAfter, isBefore, addDays } from 'date-fns'

import { WeeklyCarousel } from '@/components/calendar/WeeklyCarousel'
import { MonthlyGrid }    from '@/components/calendar/MonthlyGrid'
import { DailyTimeline }  from '@/components/calendar/DailyTimeline'
import { CalendarFAB }    from '@/components/calendar/CalendarFAB'

// ── Read from your existing stores ──────────────────────────
// Adjust these imports to match your actual store exports
import { useTaskStore }  from '@/store'
import { useUIStore }    from '@/store'

export function CalendarScreen() {
  const [selectedDate,  setSelectedDate]  = useState(new Date())
  const [monthExpanded, setMonthExpanded] = useState(false)

  // Read tasks from existing store (non-breaking read)
  const tasks = useTaskStore(s => s.tasks ?? [])

  // Build date sets for dot indicators
  const taskDateSet = useMemo(() => {
    const s = new Set()
    tasks.forEach(t => {
      if (t.due_date) s.add(t.due_date.slice(0, 10))
    })
    return s
  }, [tasks])

  // Build timeline items for selected date
  const selectedItems = useMemo(() => {
    const dayStr = format(selectedDate, 'yyyy-MM-dd')
    return tasks
      .filter(t => t.due_date?.slice(0, 10) === dayStr)
      .map(t => ({
        id:          t.id,
        title:       t.title,
        type:        'task',
        time:        t.due_time ?? null,
        completed:   t.completed ?? false,
        priority:    t.priority ?? 'low',
        description: t.description ?? null,
      }))
  }, [tasks, selectedDate])

  // Navigation to create screens (delegates to existing UI flow)
  const { setActiveView } = useUIStore()

  function handleCreateTask() {
    // Navigate to tasks page where existing create logic lives
    setActiveView?.('tasks')
  }

  function handleCreateRoutine() {
    // Navigate to routines/habits page
    setActiveView?.('habits')
  }

  return (
    <div
      className="min-h-screen taskr-bg taskr-scroll overflow-y-auto pb-24"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <motion.div
        className="px-4 pt-6 pb-2"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Calendar
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      <div className="px-4">
        {/* Weekly carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <WeeklyCarousel
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            taskDates={taskDateSet}
            routineDates={new Set()} // wire in routine dates when store is available
          />
        </motion.div>

        {/* Expandable monthly grid */}
        <MonthlyGrid
          isExpanded={monthExpanded}
          onToggle={() => setMonthExpanded(e => !e)}
          selectedDate={selectedDate}
          onSelectDate={d => { setSelectedDate(d); setMonthExpanded(false) }}
          taskDates={taskDateSet}
          routineDates={new Set()}
        />

        {/* Daily timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <DailyTimeline items={selectedItems} date={selectedDate} />
        </motion.div>
      </div>

      {/* Floating action button */}
      <CalendarFAB
        onCreateTask={handleCreateTask}
        onCreateRoutine={handleCreateRoutine}
      />
    </div>
  )
}