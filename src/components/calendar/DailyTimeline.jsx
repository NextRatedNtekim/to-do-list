/**
 * components/calendar/DailyTimeline.jsx
 * Vertical timeline of tasks + routines for a selected date.
 * Sorted by time, grouped into time slots.
 *
 * Props:
 *   items - Array<{ id, title, type, time, completed, priority, icon }>
 *   date  - Date (for display)
 */

import { motion } from 'framer-motion'
import { format, isToday } from 'date-fns'
import { GlassCard } from '@/components/ui/GlassCard'

const PRIORITY_COLOR = {
  high:   '#f87171',
  medium: '#fb923c',
  low:    '#60a5fa',
}

function TimelineItem({ item, index }) {
  const typeColor = item.type === 'routine' ? '#60a5fa' : '#22c55e'

  return (
    <motion.div
      className="flex gap-4 relative"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      {/* Time column */}
      <div className="w-14 flex-shrink-0 pt-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>
          {item.time ?? '--:--'}
        </span>
      </div>

      {/* Connector dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-3 h-3 rounded-full mt-2.5 z-10"
          style={{
            background: item.completed ? '#22c55e' : typeColor,
            boxShadow: `0 0 8px ${item.completed ? 'rgba(34,197,94,0.4)' : 'transparent'}`,
          }}
        />
        {/* Vertical line (hidden for last item via CSS) */}
        <div
          className="flex-1 w-0.5 mt-1"
          style={{ background: 'rgba(255,255,255,0.06)', minHeight: 20 }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 pb-3">
        <GlassCard
          variant="flat"
          padding="p-3"
          className={`transition-all duration-300 ${item.completed ? 'opacity-50' : ''}`}
          style={{
            borderLeft: `3px solid ${item.completed ? '#22c55e' : typeColor}`,
            borderRadius: '14px',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${item.completed ? 'line-through' : ''}`}
                style={{ color: 'var(--text-primary)' }}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {/* Type badge */}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: item.type === 'routine'
                    ? 'rgba(96,165,250,0.15)'
                    : 'rgba(34,197,94,0.12)',
                  color: typeColor,
                }}
              >
                {item.type}
              </span>

              {/* Priority (tasks only) */}
              {item.type === 'task' && item.priority && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: PRIORITY_COLOR[item.priority] ?? PRIORITY_COLOR.low }}
                />
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}

function EmptyTimeline({ date }) {
  const label = isToday(date) ? 'today' : format(date, 'MMMM d')

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-4xl mb-3">📅</div>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        Nothing scheduled {label}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
        Tap + to add a task or routine
      </p>
    </motion.div>
  )
}

export function DailyTimeline({ items = [], date = new Date() }) {
  const sorted = [...items].sort((a, b) => {
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })

  const dateLabel = isToday(date)
    ? 'Today'
    : format(date, 'EEEE, MMMM d')

  return (
    <div>
      {/* Date label */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          {dateLabel.toUpperCase()}
        </h3>
        {items.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
          >
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyTimeline date={date} />
      ) : (
        <div className="timeline-track">
          {sorted.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}