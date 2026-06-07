/**
 * components/dashboard/TodaySection.jsx
 * Displays today's tasks and routines with priority indicators.
 * Non-breaking: receives items as props from parent Dashboard.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { CheckmarkBurst, useCompletionBurst } from '@/components/ui/CompletionEffect'

// Priority config
const PRIORITY = {
  high:   { label: 'High',   dot: 'priority-dot-high',   text: '#f87171' },
  medium: { label: 'Medium', dot: 'priority-dot-medium', text: '#fb923c' },
  low:    { label: 'Low',    dot: 'priority-dot-low',    text: '#60a5fa' },
}

function TaskRow({ task, onToggle, index }) {
  const { ref, burst } = useCompletionBurst()
  const p = PRIORITY[task.priority] ?? PRIORITY.low

  function handleToggle() {
    if (!task.completed) burst(ref.current)
    onToggle?.(task.id)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Priority dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />

      {/* Title */}
      <span
        className={`flex-1 text-sm font-medium truncate transition-all duration-300 ${
          task.completed ? 'line-through opacity-40' : ''
        }`}
        style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
      >
        {task.title}
      </span>

      {/* Due time */}
      {task.due_time && !task.completed && (
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
          {task.due_time}
        </span>
      )}

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          borderColor: task.completed ? '#22c55e' : 'rgba(255,255,255,0.2)',
          background:  task.completed ? '#22c55e' : 'transparent',
        }}
      >
        {task.completed && (
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>
    </motion.div>
  )
}

function RoutineRow({ routine, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: 'rgba(96,165,250,0.15)' }}
      >
        {routine.icon ?? '🔄'}
      </div>

      {/* Title */}
      <span
        className={`flex-1 text-sm font-medium truncate ${routine.completed ? 'line-through opacity-40' : ''}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {routine.title}
      </span>

      {/* Streak */}
      {routine.streak > 0 && (
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#fbbf24' }}>
          🔥 {routine.streak}d
        </span>
      )}

      {/* Status badge */}
      <div
        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
        style={{
          background: routine.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
          color: routine.completed ? '#22c55e' : 'var(--text-tertiary)',
        }}
      >
        {routine.completed ? 'Done' : 'Pending'}
      </div>
    </motion.div>
  )
}

export function TodaySection({ tasks = [], routines = [], onToggleTask }) {
  const hasTasks    = tasks.length > 0
  const hasRoutines = routines.length > 0

  return (
    <div className="space-y-4 mb-5">
      {/* Today's Tasks */}
      {hasTasks && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              TODAY'S TASKS
            </h3>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
            >
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </span>
          </div>
          <GlassCard variant="flat" padding="px-4 py-1">
            <AnimatePresence>
              {tasks.map((task, i) => (
                <TaskRow key={task.id} task={task} onToggle={onToggleTask} index={i} />
              ))}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      )}

      {/* Today's Routines */}
      {hasRoutines && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              TODAY'S ROUTINES
            </h3>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
            >
              {routines.filter(r => r.completed).length}/{routines.length}
            </span>
          </div>
          <GlassCard variant="flat" padding="px-4 py-1">
            {routines.map((routine, i) => (
              <RoutineRow key={routine.id} routine={routine} index={i} />
            ))}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}