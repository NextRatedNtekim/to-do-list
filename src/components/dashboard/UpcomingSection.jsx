/**
 * components/dashboard/UpcomingSection.jsx
 * Shows tomorrow's tasks + upcoming deadlines + upcoming routines.
 * Non-breaking: receives items as props from Dashboard.
 */

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { format, isToday, isTomorrow, differenceInCalendarDays, parseISO } from 'date-fns'

function getDueDateLabel(dateStr) {
  if (!dateStr) return null
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  if (isToday(d))     return { label: 'Today',    color: '#f87171' }
  if (isTomorrow(d))  return { label: 'Tomorrow', color: '#fb923c' }
  const diff = differenceInCalendarDays(d, new Date())
  if (diff <= 7)  return { label: `In ${diff}d`,  color: '#fbbf24' }
  return { label: format(d, 'MMM d'), color: 'var(--text-tertiary)' }
}

function UpcomingRow({ item, index }) {
  const due = getDueDateLabel(item.due_date)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Type icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{
          background: item.type === 'routine'
            ? 'rgba(96,165,250,0.15)'
            : 'rgba(34,197,94,0.12)',
        }}
      >
        {item.icon ?? (item.type === 'routine' ? '🔄' : '📌')}
      </div>

      {/* Title */}
      <span
        className="flex-1 text-sm font-medium truncate"
        style={{ color: 'var(--text-primary)' }}
      >
        {item.title}
      </span>

      {/* Due date */}
      {due && (
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: due.color }}>
          {due.label}
        </span>
      )}
    </motion.div>
  )
}

export function UpcomingSection({ items = [] }) {
  if (!items.length) return null

  return (
    <motion.div
      className="mb-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          UPCOMING
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}
        >
          {items.length}
        </span>
      </div>

      <GlassCard variant="flat" padding="px-4 py-1">
        {items.slice(0, 5).map((item, i) => (
          <UpcomingRow key={item.id} item={item} index={i} />
        ))}
        {items.length > 5 && (
          <p className="text-xs text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
            +{items.length - 5} more
          </p>
        )}
      </GlassCard>
    </motion.div>
  )
}