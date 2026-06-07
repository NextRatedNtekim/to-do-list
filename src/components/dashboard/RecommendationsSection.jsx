/**
 * components/dashboard/RecommendationsSection.jsx
 * Shown when user has no tasks/routines today.
 * Fetches from recommendations service (mock for now).
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { fetchAllRecommendations } from '@/services/recommendations'

function RecommendationCard({ rec, index, onAdd }) {
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    if (adding) return
    setAdding(true)
    await onAdd?.(rec)
    setAdding(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <GlassCard
        variant="flat"
        padding="p-3"
        className="flex items-center gap-3"
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: rec.type === 'routine'
              ? 'rgba(96,165,250,0.15)'
              : 'rgba(34,197,94,0.12)',
          }}
        >
          {rec.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {rec.title}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
            {rec.duration ? `${rec.duration} · ` : ''}{rec.category}
          </p>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={adding}
          className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-200"
          style={{
            background: rec.type === 'routine'
              ? 'rgba(96,165,250,0.15)'
              : 'rgba(34,197,94,0.15)',
            color: rec.type === 'routine' ? '#60a5fa' : '#22c55e',
            opacity: adding ? 0.5 : 1,
          }}
        >
          + Add
        </button>
      </GlassCard>
    </motion.div>
  )
}

export function RecommendationsSection({ userId, onAddTask, onAddRoutine }) {
  const [data,    setData]    = useState({ tasks: [], routines: [] })
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('tasks')

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchAllRecommendations(userId)
        setData(result)
      } catch {
        // Silently fail — not critical
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const shown = tab === 'tasks' ? data.tasks : data.routines

  return (
    <motion.div
      className="mb-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">✨</div>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Ready to be productive?
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          You have nothing scheduled today. Here are some ideas to get started.
        </p>
      </div>

      {/* Tab toggle */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-3"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {['tasks', 'routines'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-200"
            style={{
              background: tab === t ? '#22c55e' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              index={i}
              onAdd={rec.type === 'task' ? onAddTask : onAddRoutine}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}