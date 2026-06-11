// /**
//  * components/dashboard/RecommendationsSection.jsx
//  * Shown when user has no tasks/routines today.
//  * Fetches from recommendations service (mock for now).
//  */

// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { GlassCard } from '@/components/ui/GlassCard'
// import { fetchAllRecommendations } from '@/services/recommendations'

// function RecommendationCard({ rec, index, onAdd }) {
//   const [adding, setAdding] = useState(false)

//   async function handleAdd() {
//     if (adding) return
//     setAdding(true)
//     await onAdd?.(rec)
//     setAdding(false)
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ delay: index * 0.07, duration: 0.35 }}
//     >
//       <GlassCard
//         variant="flat"
//         padding="p-3"
//         className="flex items-center gap-3"
//       >
//         {/* Icon */}
//         <div
//           className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
//           style={{
//             background: rec.type === 'routine'
//               ? 'rgba(96,165,250,0.15)'
//               : 'rgba(34,197,94,0.12)',
//           }}
//         >
//           {rec.icon}
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
//             {rec.title}
//           </p>
//           <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
//             {rec.duration ? `${rec.duration} · ` : ''}{rec.category}
//           </p>
//         </div>

//         {/* Add button */}
//         <button
//           onClick={handleAdd}
//           disabled={adding}
//           className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-200"
//           style={{
//             background: rec.type === 'routine'
//               ? 'rgba(96,165,250,0.15)'
//               : 'rgba(34,197,94,0.15)',
//             color: rec.type === 'routine' ? '#60a5fa' : '#22c55e',
//             opacity: adding ? 0.5 : 1,
//           }}
//         >
//           + Add
//         </button>
//       </GlassCard>
//     </motion.div>
//   )
// }

// export function RecommendationsSection({ userId, onAddTask, onAddRoutine }) {
//   const [data,    setData]    = useState({ tasks: [], routines: [] })
//   const [loading, setLoading] = useState(true)
//   const [tab,     setTab]     = useState('tasks')

//   useEffect(() => {
//     async function load() {
//       try {
//         const result = await fetchAllRecommendations(userId)
//         setData(result)
//       } catch {
//         // Silently fail — not critical
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [userId])

//   const shown = tab === 'tasks' ? data.tasks : data.routines

//   return (
//     <motion.div
//       className="mb-5"
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
//     >
//       {/* Header */}
//       <div className="text-center mb-4">
//         <div className="text-3xl mb-2">✨</div>
//         <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
//           Ready to be productive?
//         </h3>
//         <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
//           You have nothing scheduled today. Here are some ideas to get started.
//         </p>
//       </div>

//       {/* Tab toggle */}
//       <div
//         className="flex gap-1 p-1 rounded-xl mb-3"
//         style={{ background: 'rgba(255,255,255,0.06)' }}
//       >
//         {['tasks', 'routines'].map(t => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className="flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-200"
//             style={{
//               background: tab === t ? '#22c55e' : 'transparent',
//               color: tab === t ? 'white' : 'var(--text-secondary)',
//             }}
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* Recommendations */}
//       {loading ? (
//         <div className="space-y-2">
//           {[1,2,3].map(i => (
//             <div key={i} className="h-16 rounded-2xl shimmer" />
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {shown.map((rec, i) => (
//             <RecommendationCard
//               key={rec.id}
//               rec={rec}
//               index={i}
//               onAdd={rec.type === 'task' ? onAddTask : onAddRoutine}
//             />
//           ))}
//         </div>
//       )}
//     </motion.div>
//   )
// }


/**
 * src/components/dashboard/RecommendationsSection.jsx
 * ─────────────────────────────────────────────────────────────────
 * Shown on the Dashboard ONLY when tasks.length === 0.
 * Fetches from services/recommendations.js.
 *
 * Clicking a recommendation:
 *   - type === 'task'    → calls addTask()    via useTaskActions
 *   - type === 'routine' → calls addRoutine() via useRoutineStore
 *
 * Once all recommendations have been added the section disappears
 * (because tasks.length > 0 and the parent stops rendering this).
 * Individual cards also disappear immediately after being clicked.
 *
 * CSS: only uses vars defined in globals.css. No hardcoded colours.
 * Icons: Lucide React only.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence }          from 'framer-motion'
import { Sparkles, RefreshCw, CheckSquare, Clock, Plus, Loader2 } from 'lucide-react'

import { fetchAllRecommendations } from '@/services/recommendations'
import { useTaskActions }          from '@/hooks'
import { useRoutineStore }         from '@/store/routineStore'
import { useAuthStore }            from '@/store/authStore'
import { useUIStore }              from '@/store'

// ── Animation helpers ─────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Type badge ────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const isTask = type === 'task'
  return (
    <div style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           4,
      fontSize:      10,
      fontWeight:    700,
      fontFamily:    'var(--font-body)',
      padding:       '3px 8px',
      borderRadius:  'var(--radius-full)',
      background:    isTask ? 'var(--brand-muted)' : 'rgba(96,165,250,0.12)',
      color:         isTask ? 'var(--brand)'        : '#60a5fa',
      border:        `1px solid ${isTask ? 'rgba(34,197,94,0.25)' : 'rgba(96,165,250,0.22)'}`,
      letterSpacing: '0.04em',
      flexShrink:    0,
      textTransform: 'uppercase',
    }}>
      {isTask
        ? <CheckSquare size={9} strokeWidth={2.5} />
        : <RefreshCw   size={9} strokeWidth={2.5} />
      }
      {isTask ? 'Task' : 'Routine'}
    </div>
  )
}

// ── Single recommendation card ────────────────────────────────────
function RecCard({ rec, onAdd, adding }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{   opacity: 0, scale: 0.93, transition: { duration: 0.18 } }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="card-sm"
      style={{
        padding:    '12px 14px',
        display:    'flex',
        alignItems: 'center',
        gap:        12,
        cursor:     adding ? 'not-allowed' : 'default',
        opacity:    adding ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Accent icon bubble */}
      <div style={{
        width:          42,
        height:         42,
        borderRadius:   'var(--radius-md)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       22,
        flexShrink:     0,
        background:     `${rec.color}16`,
        border:         `1px solid ${rec.color}28`,
      }}>
        {rec.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontSize:     13,
            fontWeight:   700,
            color:        'var(--text-primary)',
            fontFamily:   'var(--font-display)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {rec.title}
          </span>
          <TypeBadge type={rec.type} />
        </div>

        <p style={{
          margin:       0,
          fontSize:     11,
          color:        'var(--text-muted)',
          fontFamily:   'var(--font-body)',
          lineHeight:   1.5,
          overflow:     'hidden',
          display:      '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {rec.description}
        </p>

        {rec.duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
            <Clock size={10} color="var(--text-muted)" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {rec.duration}
            </span>
          </div>
        )}
      </div>

      {/* Add button */}
      <motion.button
        whileHover={adding ? {} : { scale: 1.08 }}
        whileTap={adding   ? {} : { scale: 0.92 }}
        onClick={() => !adding && onAdd(rec)}
        disabled={adding}
        style={{
          width:          34,
          height:         34,
          borderRadius:   '50%',
          flexShrink:     0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          border:         `1.5px solid ${adding ? 'var(--border)' : rec.color}`,
          background:     adding ? 'var(--bg-surface-2)' : `${rec.color}14`,
          cursor:         adding ? 'not-allowed' : 'pointer',
          transition:     'all 0.15s',
          color:          adding ? 'var(--text-muted)' : rec.color,
        }}
        aria-label={`Add ${rec.title}`}
      >
        {adding
          ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Plus size={14} strokeWidth={2.5} />
        }
      </motion.button>
    </motion.div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────
function RecSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 72, borderRadius: 'var(--radius-md)' }}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export function RecommendationsSection() {
  const [recs,    setRecs]    = useState([])          // all loaded recs
  const [hidden,  setHidden]  = useState(new Set())   // ids removed from view
  const [adding,  setAdding]  = useState(null)        // id currently being added
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('all')       // 'all' | 'tasks' | 'routines'

  const { addTask }    = useTaskActions()
  const { addRoutine } = useRoutineStore()
  const { user }       = useAuthStore()
  const { showToast }  = useUIStore()

  // ── Load recommendations ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { tasks, routines } = await fetchAllRecommendations(user?.id)
        if (!cancelled) {
          // Interleave: task, routine, task, routine ...
          const interleaved = []
          const maxLen = Math.max(tasks.length, routines.length)
          for (let i = 0; i < maxLen; i++) {
            if (tasks[i])    interleaved.push(tasks[i])
            if (routines[i]) interleaved.push(routines[i])
          }
          setRecs(interleaved)
        }
      } catch (err) {
        console.error('[Recommendations] load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  // ── Add handler ───────────────────────────────────────────────
  const handleAdd = useCallback(async (rec) => {
    if (adding) return
    setAdding(rec.id)

    try {
      if (rec.type === 'task') {
        // Map recommendation → task store shape
        addTask({
          text:      rec.title,
          priority:  rec.priority ?? 'medium',
          notes:     rec.description ?? '',
          category:  rec.category   ?? null,
          tags:      [],
          dueDate:   null,
          recurring: null,
        })
        // showToast is called inside addTask (see hooks/index.js)
      } else {
        // Map recommendation → routine store shape
        await addRoutine({
          title:        rec.title,
          description:  rec.description ?? null,
          icon:         rec.icon        ?? '🔄',
          color:        rec.color       ?? '#22c55e',
          frequency:    'daily',
          days_of_week: [],
          time_of_day:  null,
        })
        showToast('Routine added!', 'success')
      }

      // Remove the card from view with exit animation
      setHidden(prev => new Set([...prev, rec.id]))
    } catch (err) {
      showToast('Failed to add: ' + err.message, 'error')
    } finally {
      setAdding(null)
    }
  }, [adding, addTask, addRoutine, showToast])

  // ── Filtered + visible recs ───────────────────────────────────
  const visibleRecs = recs.filter(r => {
    if (hidden.has(r.id)) return false
    if (tab === 'tasks')    return r.type === 'task'
    if (tab === 'routines') return r.type === 'routine'
    return true
  })

  const taskCount    = recs.filter(r => !hidden.has(r.id) && r.type === 'task').length
  const routineCount = recs.filter(r => !hidden.has(r.id) && r.type === 'routine').length

  // ── Render ────────────────────────────────────────────────────
  return (
    <motion.div {...fadeUp(0.1)} style={{ marginBottom: 24 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{
          margin:      0,
          fontSize:    16,
          fontWeight:  800,
          color:       'var(--text-primary)',
          fontFamily:  'var(--font-display)',
          display:     'flex',
          alignItems:  'center',
          gap:         8,
          letterSpacing: '-0.3px',
        }}>
          <div style={{
            width:          30,
            height:         30,
            borderRadius:   'var(--radius-sm)',
            background:     'var(--brand-muted)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={15} color="var(--brand)" strokeWidth={2} />
          </div>
          Recommended for you
        </h2>
      </div>

      {/* Prompt */}
      <p style={{
        margin:     '0 0 14px',
        fontSize:   13,
        color:      'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        lineHeight: 1.55,
      }}>
        You have no tasks yet. Here are some ideas to get started — tap <strong style={{ color: 'var(--text-secondary)' }}>+</strong> to add any to your day.
      </p>

      {/* Tab filters */}
      <div style={{
        display:       'flex',
        gap:           4,
        padding:       4,
        background:    'var(--bg-surface-3)',
        borderRadius:  'var(--radius-full)',
        marginBottom:  14,
      }}>
        {[
          { key: 'all',      label: 'All',      count: taskCount + routineCount },
          { key: 'tasks',    label: 'Tasks',    count: taskCount                },
          { key: 'routines', label: 'Routines', count: routineCount             },
        ].map(t => (
          <motion.button
            key={t.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.key)}
            style={{
              flex:          1,
              padding:       '7px 10px',
              borderRadius:  'var(--radius-full)',
              border:        'none',
              cursor:        'pointer',
              fontFamily:    'var(--font-body)',
              fontSize:      12,
              fontWeight:    600,
              transition:    'all 0.15s',
              background:    tab === t.key ? 'var(--brand)' : 'transparent',
              color:         tab === t.key ? '#fff'          : 'var(--text-muted)',
              boxShadow:     tab === t.key ? 'var(--shadow-brand)' : 'none',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              gap:           5,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize:    10,
                fontWeight:  800,
                padding:     '1px 5px',
                borderRadius:'var(--radius-full)',
                background:  tab === t.key ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-4)',
                color:       tab === t.key ? '#fff' : 'var(--text-muted)',
              }}>
                {t.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <RecSkeleton />
      ) : visibleRecs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)' }}
        >
          No {tab === 'all' ? '' : tab} recommendations available
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence mode="popLayout">
            {visibleRecs.map((rec, i) => (
              <RecCard
                key={rec.id}
                rec={rec}
                adding={adding === rec.id}
                onAdd={handleAdd}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}