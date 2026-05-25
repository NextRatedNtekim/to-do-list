import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export function EmptyState({ hasFilter, onAddTask }) {
  if (hasFilter) {
    return (
      <div style={{ textAlign: 'center', padding: 'clamp(32px,6vw,52px) 24px' }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 44, marginBottom: 14 }}>🔍</motion.div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>No matching tasks</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Try a different filter or search term</p>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(32px,6vw,52px) 24px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: 56, marginBottom: 16 }}>
          🌱
        </motion.div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
        style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
        You're all clear!
      </motion.p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 22px', lineHeight: 1.6 }}>
        Add your first task to start earning XP and building your streak.
      </p>
      {onAddTask && (
        <motion.button whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-brand)' }} whileTap={{ scale: 0.97 }}
          onClick={onAddTask} className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} /> Add First Task
        </motion.button>
      )}
    </div>
  )
}
