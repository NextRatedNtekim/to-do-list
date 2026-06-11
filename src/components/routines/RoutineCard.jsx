// /**
//  * components/routines/RoutineCard.jsx
//  * Individual routine card showing status, streak, and completion toggle.
//  * Used in the Routines page list.
//  */

// import { useRef } from 'react'
// import { motion } from 'framer-motion'
// import { triggerCompletionBurst } from '@/components/ui/CompletionEffect'

// const FREQ_LABEL = {
//   daily:   'Daily',
//   weekly:  'Weekly',
//   monthly: 'Monthly',
//   custom:  'Custom',
// }

// const DAY_SHORT = ['Mo','Tu','We','Th','Fr','Sa','Su']

// export function RoutineCard({ routine, isCompleted, streak = 0, onToggle, onEdit, onDelete }) {
//   const cardRef = useRef(null)

//   function handleToggle() {
//     if (!isCompleted) {
//       const el = cardRef.current
//       if (el) {
//         const rect = el.getBoundingClientRect()
//         triggerCompletionBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
//       }
//     }
//     onToggle?.(routine.id)
//   }

//   const freqLabel = routine.frequency === 'weekly' && routine.days_of_week?.length
//     ? routine.days_of_week.map(d => DAY_SHORT[d]).join(' · ')
//     : FREQ_LABEL[routine.frequency] ?? 'Daily'

//   return (
//     <motion.div
//       ref={cardRef}
//       layout
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ type: 'spring', stiffness: 300, damping: 28 }}
//       className="relative rounded-2xl overflow-hidden"
//       style={{
//         background: isCompleted
//           ? 'rgba(255,255,255,0.03)'
//           : 'rgba(255,255,255,0.06)',
//         border: `1px solid ${isCompleted
//           ? 'rgba(34,197,94,0.2)'
//           : 'rgba(255,255,255,0.09)'}`,
//       }}
//     >
//       {/* Left color accent bar */}
//       <div
//         className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
//         style={{
//           background: isCompleted
//             ? 'linear-gradient(to bottom, #22c55e, #16a34a)'
//             : `linear-gradient(to bottom, ${routine.color}, ${routine.color}88)`,
//           opacity: isCompleted ? 1 : 0.8,
//         }}
//       />

//       <div className="flex items-center gap-3 pl-4 pr-3 py-3">
//         {/* Icon */}
//         <div
//           className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300"
//           style={{
//             background: isCompleted
//               ? 'rgba(34,197,94,0.15)'
//               : `${routine.color}1a`,
//             opacity: isCompleted ? 0.6 : 1,
//           }}
//         >
//           {routine.icon ?? '🔄'}
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <p
//             className={`text-sm font-semibold truncate transition-all duration-300 ${
//               isCompleted ? 'line-through opacity-50' : ''
//             }`}
//             style={{ color: 'var(--text-primary)' }}
//           >
//             {routine.title}
//           </p>
//           <div className="flex items-center gap-2 mt-0.5">
//             <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
//               {freqLabel}
//             </span>
//             {routine.time_of_day && (
//               <>
//                 <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
//                 <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
//                   {routine.time_of_day}
//                 </span>
//               </>
//             )}
//             {streak > 0 && (
//               <>
//                 <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
//                 <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
//                   🔥 {streak}d
//                 </span>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex items-center gap-1.5 flex-shrink-0">
//           {/* Edit */}
//           <button
//             onClick={() => onEdit?.(routine)}
//             className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
//             style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)' }}
//           >
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
//               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
//             </svg>
//           </button>

//           {/* Complete toggle */}
//           <motion.button
//             onClick={handleToggle}
//             className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250"
//             style={{
//               background:  isCompleted ? '#22c55e' : 'transparent',
//               border:      `2px solid ${isCompleted ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
//               boxShadow:   isCompleted ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
//             }}
//             whileTap={{ scale: 0.85 }}
//           >
//             {isCompleted && (
//               <motion.svg
//                 width="14" height="14" viewBox="0 0 24 24" fill="none"
//                 initial={{ scale: 0, rotate: -20 }}
//                 animate={{ scale: 1, rotate: 0 }}
//                 transition={{ type: 'spring', stiffness: 500 }}
//               >
//                 <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </motion.svg>
//             )}
//           </motion.button>
//         </div>
//       </div>
//     </motion.div>
//   )
// }


/**
 * src/components/routines/RoutineCard.jsx
 * Fixed: CSS vars from globals.css only, Lucide icons, theme-aware
 */
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Check, Flame, Clock } from 'lucide-react'
import { triggerCompletionBurst } from '@/components/ui/CompletionEffect'

const FREQ_LABEL = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', custom:'Custom' }
const DAY_SHORT  = ['Mo','Tu','We','Th','Fr','Sa','Su']

export function RoutineCard({ routine, isCompleted, streak = 0, onToggle, onEdit, onDelete }) {
  const cardRef = useRef(null)

  function handleToggle() {
    if (!isCompleted) {
      const el = cardRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        triggerCompletionBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }
    onToggle?.(routine.id)
  }

  const freqLabel = routine.frequency === 'weekly' && routine.days_of_week?.length
    ? routine.days_of_week.map(d => DAY_SHORT[d]).join(' · ')
    : FREQ_LABEL[routine.frequency] ?? 'Daily'

  const accentColor = routine.color ?? '#22c55e'

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="card-sm"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        10,
        padding:    '10px 12px',
        borderLeft: `3px solid ${isCompleted ? 'var(--brand)' : accentColor}`,
        opacity:    isCompleted ? 0.65 : 1,
        transition: 'opacity 0.25s',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 38, height: 38,
        borderRadius:   'var(--radius-sm)',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        fontSize:       20, flexShrink: 0,
        background:     isCompleted ? 'var(--brand-muted)' : `${accentColor}18`,
        border:         `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : accentColor + '30'}`,
      }}>
        {routine.icon ?? '🔄'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {routine.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {freqLabel}
          </span>
          {routine.time_of_day && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={10} /> {routine.time_of_day}
            </span>
          )}
          {streak > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: 'var(--xp-gold)' }}>
              <Flame size={10} color="var(--xp-gold)" /> {streak}d
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit?.(routine)}
          className="btn-icon"
          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }}
          aria-label="Edit"
        >
          <Pencil size={12} />
        </button>

        <motion.button
          onClick={onToggle ? handleToggle : undefined}
          whileTap={onToggle ? { scale: 0.82 } : {}}
          style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            border:     `2px solid ${isCompleted ? 'var(--brand)' : 'var(--border-strong)'}`,
            background: isCompleted ? 'var(--brand)' : 'transparent',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            cursor:     onToggle ? 'pointer' : 'default',
            transition: 'all 0.18s',
            boxShadow:  isCompleted ? 'var(--shadow-brand)' : 'none',
          }}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500 }}>
              <Check size={14} color="white" strokeWidth={3} />
            </motion.div>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}