// // /**
// //  * pages/RoutinesPage.jsx
// //  * Complete Routines page for Taskr 2.0.
// //  *
// //  * Features:
// //  *   - Weekly calendar carousel (date filtering)
// //  *   - Streak badge + stats
// //  *   - Activity heatmap (collapsible)
// //  *   - Grouped routine list (pending / completed)
// //  *   - Create / Edit / Delete routines
// //  *   - Completion toggle with particle burst
// //  *   - Empty state
// //  *
// //  * Integration in App.jsx:
// //  *   import { RoutinesPage } from '@/pages/RoutinesPage'
// //  *   // Add to PAGE_MAP:
// //  *   routines: RoutinesPage,
// //  *   // Add to sidebar/nav as 'routines'
// //  */

// // import { useEffect, useState, useMemo, useCallback } from 'react'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import { format, isToday } from 'date-fns'

// // import { useRoutineStore }     from '@/store/routineStore'
// // import { useUserStore }        from '@/store'
// // import { useStreakCalculator }  from '@/hooks/useStreakCalculator'

// // import { WeeklyCarousel }      from '@/components/calendar/WeeklyCarousel'
// // import { StreakBadge }         from '@/components/routines/StreakBadge'
// // import { HabitHeatmap }        from '@/components/routines/HabitHeatmap'
// // import { RoutineCard }         from '@/components/routines/RoutineCard'
// // import { RoutineModal }        from '@/components/routines/RoutineModal'
// // import { RoutineDeleteSheet }  from '@/components/routines/RoutineDeleteSheet'
// // import { GlassCard }           from '@/components/ui/GlassCard'
// // import { AnimatedCounter }     from '@/components/ui/AnimatedCounter'

// // // ── Empty state ───────────────────────────────────────────────
// // function EmptyState({ onAdd }) {
// //   return (
// //     <motion.div
// //       className="flex flex-col items-center justify-center text-center py-16 px-8"
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
// //     >
// //       <div className="text-5xl mb-4">🌱</div>
// //       <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
// //         No routines yet
// //       </h3>
// //       <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
// //         Routines are habits you track daily. Start with one small habit — consistency beats intensity.
// //       </p>
// //       <button
// //         onClick={onAdd}
// //         className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold"
// //         style={{
// //           background: 'rgba(34,197,94,0.15)',
// //           border:     '1px solid rgba(34,197,94,0.25)',
// //           color:      '#22c55e',
// //         }}
// //       >
// //         <span className="text-lg">+</span>
// //         Create your first routine
// //       </button>

// //       {/* Suggestion chips */}
// //       <div className="flex flex-wrap gap-2 justify-center mt-6">
// //         {['🏃 Morning Run','📚 Read 10 pages','✍️ Journal','💧 Drink water','🧘 Meditate'].map(s => (
// //           <button
// //             key={s}
// //             onClick={() => onAdd(s.split(' ').slice(1).join(' '))}
// //             className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
// //             style={{
// //               background: 'rgba(255,255,255,0.05)',
// //               border:     '1px solid rgba(255,255,255,0.08)',
// //               color:      'var(--text-secondary)',
// //             }}
// //           >
// //             {s}
// //           </button>
// //         ))}
// //       </div>
// //     </motion.div>
// //   )
// // }

// // // ── Section header ────────────────────────────────────────────
// // function SectionHeader({ label, count, color = 'rgba(255,255,255,0.4)', badgeColor }) {
// //   return (
// //     <div className="flex items-center gap-2 mb-3">
// //       <h4 className="text-xs font-semibold tracking-wider" style={{ color }}>
// //         {label}
// //       </h4>
// //       {count > 0 && (
// //         <span
// //           className="text-xs font-bold px-2 py-0.5 rounded-full"
// //           style={{
// //             background: badgeColor ?? 'rgba(255,255,255,0.07)',
// //             color:      badgeColor ? 'white' : 'var(--text-tertiary)',
// //           }}
// //         >
// //           {count}
// //         </span>
// //       )}
// //     </div>
// //   )
// // }

// // // ── Main page ─────────────────────────────────────────────────
// // export function RoutinesPage() {
// //   const {
// //     routines,
// //     completedToday,
// //     completions,
// //     loading,
// //     loadAll,
// //     addRoutine,
// //     editRoutine,
// //     removeRoutine,
// //     toggleCompletion,
// //     getCompletionDatesForRoutine,
// //     getAllCompletionDates,
// //   } = useRoutineStore()

// //   const profile  = useUserStore(s => s.profile ?? {})

// //   // UI state
// //   const [selectedDate,  setSelectedDate]  = useState(new Date())
// //   const [modalOpen,     setModalOpen]     = useState(false)
// //   const [editTarget,    setEditTarget]    = useState(null)   // Routine | null
// //   const [deleteTarget,  setDeleteTarget]  = useState(null)   // Routine | null
// //   const [heatmapOpen,   setHeatmapOpen]   = useState(false)
// //   const [initialTitle,  setInitialTitle]  = useState(null)

// //   // Load on mount
// //   useEffect(() => { loadAll() }, [])

// //   // Streak calculation over ALL completions
// //   const allCompletionDates = useMemo(() => getAllCompletionDates(), [completions])
// //   const {
// //     currentStreak,
// //     bestStreak,
// //     completionRate,
// //     missedDays,
// //     streakActive,
// //   } = useStreakCalculator(allCompletionDates)

// //   // Per-routine streak (for individual cards)
// //   const perRoutineStreak = useMemo(() => {
// //     const map = {}
// //     routines.forEach(r => {
// //       const dates = getCompletionDatesForRoutine(r.id)
// //       // simple current streak for this routine
// //       let streak = 0
// //       const today = format(new Date(), 'yyyy-MM-dd')
// //       const daysSet = new Set(dates)
// //       let cursor = new Date()
// //       while (true) {
// //         const key = format(cursor, 'yyyy-MM-dd')
// //         if (daysSet.has(key)) {
// //           streak++
// //           cursor = new Date(cursor.getTime() - 86_400_000)
// //         } else break
// //       }
// //       map[r.id] = streak
// //     })
// //     return map
// //   }, [completions, routines])

// //   // Filter active routines for selected date
// //   // (For now: show all active routines every day, filter by days_of_week if weekly)
// //   const visibleRoutines = useMemo(() => {
// //     const dayOfWeek = (selectedDate.getDay() + 6) % 7 // 0=Mon
// //     return routines.filter(r => {
// //       if (!r.is_active) return false
// //       if (r.frequency === 'weekly') {
// //         return !r.days_of_week?.length || r.days_of_week.includes(dayOfWeek)
// //       }
// //       return true
// //     })
// //   }, [routines, selectedDate])

// //   // For non-today dates, derive completions from the completions array
// //   const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
// //   const isSelectedToday = isToday(selectedDate)

// //   const completedOnSelected = useMemo(() => {
// //     if (isSelectedToday) return completedToday
// //     return new Set(
// //       completions
// //         .filter(c => c.completed_on === selectedDateStr)
// //         .map(c => c.routine_id)
// //     )
// //   }, [completedToday, completions, selectedDateStr, isSelectedToday])

// //   // Split into pending / done
// //   const pendingRoutines   = visibleRoutines.filter(r => !completedOnSelected.has(r.id))
// //   const completedRoutines = visibleRoutines.filter(r =>  completedOnSelected.has(r.id))

// //   // Date sets for calendar dots
// //   const routineDateSet = useMemo(() => {
// //     const s = new Set()
// //     completions.forEach(c => s.add(c.completed_on))
// //     return s
// //   }, [completions])

// //   // Progress percentage for today
// //   const progressPct = visibleRoutines.length > 0
// //     ? Math.round((completedOnSelected.size / visibleRoutines.length) * 100)
// //     : 0

// //   // ── Handlers ─────────────────────────────────────────────
// //   function openCreate(suggestedTitle = null) {
// //     setEditTarget(null)
// //     setInitialTitle(suggestedTitle)
// //     setModalOpen(true)
// //   }

// //   function openEdit(routine) {
// //     setEditTarget(routine)
// //     setInitialTitle(null)
// //     setModalOpen(true)
// //   }

// //   async function handleSave(fields) {
// //     if (editTarget) {
// //       await editRoutine(editTarget.id, fields)
// //     } else {
// //       await addRoutine(fields)
// //     }
// //   }

// //   async function handleDelete(id) {
// //     await removeRoutine(id)
// //     setDeleteTarget(null)
// //   }

// //   const handleToggle = useCallback((id) => {
// //     if (isSelectedToday) {
// //       toggleCompletion(id)
// //     }
// //     // For past dates, toggle is disabled (read-only view)
// //   }, [isSelectedToday, toggleCompletion])

// //   // ── Render ────────────────────────────────────────────────
// //   return (
// //     <div
// //       className="min-h-screen taskr-bg taskr-scroll overflow-y-auto pb-28"
// //       style={{ color: 'var(--text-primary)' }}
// //     >
// //       <div className="px-4 pt-6">

// //         {/* Page header */}
// //         <motion.div
// //           className="flex items-center justify-between mb-5"
// //           initial={{ opacity: 0, y: -10 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4 }}
// //         >
// //           <div>
// //             <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
// //               Routines
// //             </h1>
// //             <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
// //               {format(new Date(), 'EEEE, MMMM d')}
// //             </p>
// //           </div>

// //           {/* Add button */}
// //           <motion.button
// //             onClick={() => openCreate()}
// //             className="w-9 h-9 rounded-full flex items-center justify-center"
// //             style={{
// //               background: '#22c55e',
// //               boxShadow:  '0 4px 14px rgba(34,197,94,0.35)',
// //             }}
// //             whileHover={{ scale: 1.08 }}
// //             whileTap={{ scale: 0.92 }}
// //           >
// //             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //               <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
// //             </svg>
// //           </motion.button>
// //         </motion.div>

// //         {/* Streak badge */}
// //         {routines.length > 0 && (
// //           <motion.div
// //             className="mb-4"
// //             initial={{ opacity: 0, y: 10 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.05 }}
// //           >
// //             <StreakBadge
// //               currentStreak={currentStreak}
// //               bestStreak={bestStreak}
// //               streakActive={streakActive}
// //             />
// //           </motion.div>
// //         )}

// //         {/* Weekly carousel */}
// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.1 }}
// //           className="mb-4"
// //         >
// //           <WeeklyCarousel
// //             selectedDate={selectedDate}
// //             onSelectDate={setSelectedDate}
// //             routineDates={routineDateSet}
// //             taskDates={new Set()}
// //           />
// //         </motion.div>

// //         {/* Progress bar for today */}
// //         {visibleRoutines.length > 0 && (
// //           <motion.div
// //             className="mb-5"
// //             initial={{ opacity: 0, y: 8 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.15 }}
// //           >
// //             <GlassCard variant="accent" padding="p-4">
// //               <div className="flex items-center justify-between mb-3">
// //                 <div>
// //                   <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
// //                     {isSelectedToday
// //                       ? progressPct === 100
// //                         ? '🎉 All routines done!'
// //                         : `${completedOnSelected.size} of ${visibleRoutines.length} complete`
// //                       : `${completedOnSelected.size} of ${visibleRoutines.length} completed`
// //                     }
// //                   </p>
// //                   <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
// //                     {isSelectedToday ? "Today's routines" : format(selectedDate, 'MMMM d')}
// //                   </p>
// //                 </div>
// //                 <AnimatedCounter
// //                   value={progressPct}
// //                   suffix="%"
// //                   className="text-2xl font-bold"
// //                   style={{ color: '#22c55e' }}
// //                 />
// //               </div>

// //               {/* Progress bar */}
// //               <div
// //                 className="h-2 rounded-full overflow-hidden"
// //                 style={{ background: 'rgba(255,255,255,0.08)' }}
// //               >
// //                 <motion.div
// //                   className="h-full rounded-full"
// //                   style={{
// //                     background: 'linear-gradient(90deg, #22c55e, #4ade80)',
// //                     boxShadow:  '0 0 8px rgba(34,197,94,0.4)',
// //                   }}
// //                   initial={{ width: 0 }}
// //                   animate={{ width: `${progressPct}%` }}
// //                   transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
// //                 />
// //               </div>
// //             </GlassCard>
// //           </motion.div>
// //         )}

// //         {/* Stats row */}
// //         {routines.length > 0 && (
// //           <motion.div
// //             className="grid grid-cols-3 gap-3 mb-5"
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             transition={{ delay: 0.18 }}
// //           >
// //             {[
// //               { label: '30d Rate',    value: `${completionRate}%`, color: '#22c55e', icon: '📈' },
// //               { label: 'Best Streak', value: `${bestStreak}d`,    color: '#fbbf24', icon: '🏆' },
// //               { label: 'Missed',      value: `${missedDays}d`,    color: '#f87171', icon: '📉' },
// //             ].map((stat, i) => (
// //               <motion.div
// //                 key={stat.label}
// //                 initial={{ opacity: 0, y: 8 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.18 + i * 0.05 }}
// //               >
// //                 <GlassCard variant="flat" padding="p-3" className="text-center">
// //                   <div className="text-base mb-1">{stat.icon}</div>
// //                   <AnimatedCounter
// //                     value={parseInt(stat.value)}
// //                     suffix={stat.value.replace(/\d/g, '')}
// //                     className="text-base font-bold"
// //                     style={{ color: stat.color }}
// //                   />
// //                   <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
// //                     {stat.label}
// //                   </div>
// //                 </GlassCard>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         )}

// //         {/* Heatmap toggle */}
// //         {allCompletionDates.length > 0 && (
// //           <motion.div
// //             className="mb-5"
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             transition={{ delay: 0.22 }}
// //           >
// //             <button
// //               onClick={() => setHeatmapOpen(o => !o)}
// //               className="w-full flex items-center justify-between px-1 mb-2"
// //             >
// //               <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
// //                 ACTIVITY HEATMAP
// //               </span>
// //               <motion.span
// //                 animate={{ rotate: heatmapOpen ? 180 : 0 }}
// //                 transition={{ duration: 0.2 }}
// //                 className="text-xs"
// //                 style={{ color: 'var(--text-tertiary)' }}
// //               >
// //                 ▼
// //               </motion.span>
// //             </button>
// //             <AnimatePresence>
// //               {heatmapOpen && (
// //                 <motion.div
// //                   initial={{ height: 0, opacity: 0 }}
// //                   animate={{ height: 'auto', opacity: 1 }}
// //                   exit={{ height: 0, opacity: 0 }}
// //                   transition={{ duration: 0.3 }}
// //                   style={{ overflow: 'hidden' }}
// //                 >
// //                   <HabitHeatmap
// //                     completedDates={allCompletionDates}
// //                     title="Routine completions"
// //                   />
// //                 </motion.div>
// //               )}
// //             </AnimatePresence>
// //           </motion.div>
// //         )}

// //         {/* Past date notice */}
// //         {!isSelectedToday && (
// //           <motion.div
// //             className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl"
// //             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //           >
// //             <span className="text-sm">📅</span>
// //             <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
// //               Viewing {format(selectedDate, 'MMMM d')} — past dates are read-only
// //             </p>
// //           </motion.div>
// //         )}

// //         {/* ── Routines list ───────────────────────────────── */}
// //         {loading && routines.length === 0 ? (
// //           <div className="space-y-3">
// //             {[1,2,3].map(i => (
// //               <div key={i} className="h-16 rounded-2xl shimmer" />
// //             ))}
// //           </div>
// //         ) : routines.length === 0 ? (
// //           <EmptyState onAdd={openCreate} />
// //         ) : (
// //           <div>
// //             {/* Pending */}
// //             {pendingRoutines.length > 0 && (
// //               <motion.div
// //                 className="mb-5"
// //                 initial={{ opacity: 0, y: 10 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.25 }}
// //               >
// //                 <SectionHeader
// //                   label="PENDING"
// //                   count={pendingRoutines.length}
// //                   badgeColor={isSelectedToday ? '#fb923c' : undefined}
// //                 />
// //                 <div className="space-y-2.5">
// //                   <AnimatePresence>
// //                     {pendingRoutines.map(routine => (
// //                       <RoutineCard
// //                         key={routine.id}
// //                         routine={routine}
// //                         isCompleted={false}
// //                         streak={perRoutineStreak[routine.id] ?? 0}
// //                         onToggle={isSelectedToday ? handleToggle : undefined}
// //                         onEdit={openEdit}
// //                         onDelete={setDeleteTarget}
// //                       />
// //                     ))}
// //                   </AnimatePresence>
// //                 </div>
// //               </motion.div>
// //             )}

// //             {/* Completed */}
// //             {completedRoutines.length > 0 && (
// //               <motion.div
// //                 className="mb-5"
// //                 initial={{ opacity: 0, y: 10 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.3 }}
// //               >
// //                 <SectionHeader
// //                   label="COMPLETED"
// //                   count={completedRoutines.length}
// //                   color="rgba(34,197,94,0.6)"
// //                 />
// //                 <div className="space-y-2.5">
// //                   <AnimatePresence>
// //                     {completedRoutines.map(routine => (
// //                       <RoutineCard
// //                         key={routine.id}
// //                         routine={routine}
// //                         isCompleted={true}
// //                         streak={perRoutineStreak[routine.id] ?? 0}
// //                         onToggle={isSelectedToday ? handleToggle : undefined}
// //                         onEdit={openEdit}
// //                         onDelete={setDeleteTarget}
// //                       />
// //                     ))}
// //                   </AnimatePresence>
// //                 </div>
// //               </motion.div>
// //             )}

// //             {/* All done empty message */}
// //             {pendingRoutines.length === 0 && completedRoutines.length > 0 && isSelectedToday && (
// //               <motion.div
// //                 className="text-center py-6"
// //                 initial={{ opacity: 0, scale: 0.9 }}
// //                 animate={{ opacity: 1, scale: 1 }}
// //               >
// //                 <div className="text-3xl mb-2">🎉</div>
// //                 <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
// //                   All routines complete!
// //                 </p>
// //                 <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
// //                   Streak maintained. Keep it up tomorrow.
// //                 </p>
// //               </motion.div>
// //             )}
// //           </div>
// //         )}
// //       </div>

// //       {/* FAB — always visible when routines exist */}
// //       {routines.length > 0 && (
// //         <motion.button
// //           onClick={() => openCreate()}
// //           className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-30"
// //           style={{
// //             background: '#22c55e',
// //             boxShadow:  '0 8px 28px rgba(34,197,94,0.4)',
// //             border:     '1px solid rgba(255,255,255,0.2)',
// //           }}
// //           whileHover={{ scale: 1.08 }}
// //           whileTap={{ scale: 0.92 }}
// //           initial={{ scale: 0 }}
// //           animate={{ scale: 1 }}
// //           transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
// //         >
// //           <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
// //             <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
// //           </svg>
// //         </motion.button>
// //       )}

// //       {/* Create / Edit modal */}
// //       <RoutineModal
// //         open={modalOpen}
// //         onClose={() => { setModalOpen(false); setEditTarget(null) }}
// //         onSave={handleSave}
// //         initial={editTarget
// //           ? editTarget
// //           : initialTitle
// //           ? { ...DEFAULT_EMPTY, title: initialTitle }
// //           : null
// //         }
// //       />

// //       {/* Delete confirmation */}
// //       <RoutineDeleteSheet
// //         routine={deleteTarget}
// //         onConfirm={handleDelete}
// //         onCancel={() => setDeleteTarget(null)}
// //       />
// //     </div>
// //   )
// // }

// // const DEFAULT_EMPTY = {
// //   title: '', description: '', icon: '🔄', color: '#22c55e',
// //   frequency: 'daily', days_of_week: [], time_of_day: '',
// // }


// /**
//  * pages/RoutinesPage.jsx  — v2, fully connected
//  * ══════════════════════════════════════════════════════════════
//  * Connected to:
//  *   useRoutineStore — routines, completions, streak data
//  *   useUserStore    — profile.name, profile.streak
//  *   useAuthStore    — user object
//  *
//  * Changes vs v1:
//  *   - Real user name in page header
//  *   - Streak pulled from profile AND calculated locally
//  *   - TaskRoutineModal replaces RoutineModal (unified)
//  *   - initAlarmEngine called for routine alarms
//  * ══════════════════════════════════════════════════════════════
//  */

// import { useEffect, useState, useMemo, useCallback } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { format, isToday }        from 'date-fns'

// import { useRoutineStore }     from '@/store/routineStore'
// import { useUserStore }        from '@/store'
// import { useAuthStore }        from '@/store/authStore'
// import { useStreakCalculator }  from '@/hooks/useStreakCalculator'

// import { WeeklyCarousel }      from '@/components/calendar/WeeklyCarousel'
// import { StreakBadge }         from '@/components/routines/StreakBadge'
// import { HabitHeatmap }        from '@/components/routines/HabitHeatmap'
// import { RoutineCard }         from '@/components/routines/RoutineCard'
// import { RoutineDeleteSheet }  from '@/components/routines/RoutineDeleteSheet'
// import { TaskRoutineModal }    from '@/components/tasks/TaskRoutineModal'
// import { GlassCard }           from '@/components/ui/GlassCard'
// import { AnimatedCounter }     from '@/components/ui/AnimatedCounter'

// // ── Empty state ───────────────────────────────────────────────
// function EmptyState({ userName, onAdd }) {
//   const first = userName?.split(' ')[0] ?? 'there'
//   return (
//     <motion.div
//       className="flex flex-col items-center text-center py-14 px-6"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       <div className="text-5xl mb-4">🌱</div>
//       <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
//         Hey {first}, start your first routine!
//       </h3>
//       <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
//         Track daily habits, build streaks, and become the best version of yourself.
//       </p>
//       <button
//         onClick={() => onAdd()}
//         className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold"
//         style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
//       >
//         <span>+</span> Create first routine
//       </button>
//       <div className="flex flex-wrap gap-2 justify-center mt-5">
//         {['🏃 Morning Run','📚 Read','✍️ Journal','💧 Hydrate','🧘 Meditate','💪 Workout'].map(s => (
//           <button
//             key={s}
//             onClick={() => onAdd(s.split(' ').slice(1).join(' '))}
//             className="px-3 py-1.5 rounded-full text-xs font-medium"
//             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
//           >
//             {s}
//           </button>
//         ))}
//       </div>
//     </motion.div>
//   )
// }

// // ── Main page ─────────────────────────────────────────────────
// export function RoutinesPage() {
//   const {
//     routines, completedToday, completions, loading,
//     loadAll, addRoutine, editRoutine, removeRoutine,
//     toggleCompletion, getCompletionDatesForRoutine, getAllCompletionDates,
//   } = useRoutineStore()

//   const profile  = useUserStore(s => s.profile ?? {})
//   const user     = useAuthStore(s => s.user)
//   const userName = profile.name ?? profile.username ?? user?.email?.split('@')[0] ?? 'Samuel'

//   const [selectedDate,  setSelectedDate]  = useState(new Date())
//   const [modalOpen,     setModalOpen]     = useState(false)
//   const [editTarget,    setEditTarget]    = useState(null)
//   const [deleteTarget,  setDeleteTarget]  = useState(null)
//   const [heatmapOpen,   setHeatmapOpen]   = useState(false)
//   const [initialTitle,  setInitialTitle]  = useState(null)

//   useEffect(() => { loadAll() }, [])

//   // Streak calculation
//   const allCompletionDates = useMemo(() => getAllCompletionDates(), [completions])
//   const {
//     currentStreak, bestStreak, completionRate, missedDays, streakActive,
//   } = useStreakCalculator(allCompletionDates)

//   // Per-routine streak
//   const perRoutineStreak = useMemo(() => {
//     const map = {}
//     routines.forEach(r => {
//       const dates = getCompletionDatesForRoutine(r.id)
//       let streak  = 0
//       const set   = new Set(dates)
//       let cursor  = new Date()
//       while (true) {
//         const key = format(cursor, 'yyyy-MM-dd')
//         if (set.has(key)) { streak++; cursor = new Date(cursor.getTime() - 86_400_000) }
//         else break
//       }
//       map[r.id] = streak
//     })
//     return map
//   }, [completions, routines])

//   // Visible routines for selected date
//   const visibleRoutines = useMemo(() => {
//     const dow = (selectedDate.getDay() + 6) % 7
//     return routines.filter(r => {
//       if (!r.is_active) return false
//       if (r.frequency === 'weekly') return !r.days_of_week?.length || r.days_of_week.includes(dow)
//       return true
//     })
//   }, [routines, selectedDate])

//   const selectedDateStr  = format(selectedDate, 'yyyy-MM-dd')
//   const isSelectedToday  = isToday(selectedDate)

//   const completedOnSelected = useMemo(() => {
//     if (isSelectedToday) return completedToday
//     return new Set(completions.filter(c => c.completed_on === selectedDateStr).map(c => c.routine_id))
//   }, [completedToday, completions, selectedDateStr, isSelectedToday])

//   const pendingRoutines   = visibleRoutines.filter(r => !completedOnSelected.has(r.id))
//   const completedRoutines = visibleRoutines.filter(r =>  completedOnSelected.has(r.id))

//   const progressPct = visibleRoutines.length > 0
//     ? Math.round((completedOnSelected.size / visibleRoutines.length) * 100)
//     : 0

//   const routineDateSet = useMemo(() => {
//     const s = new Set()
//     completions.forEach(c => s.add(c.completed_on))
//     return s
//   }, [completions])

//   // ── Handlers ────────────────────────────────────────────
//   function openCreate(suggestedTitle = null) {
//     setEditTarget(null)
//     setInitialTitle(typeof suggestedTitle === 'string' ? suggestedTitle : null)
//     setModalOpen(true)
//   }

//   async function handleSaveRoutine(fields) {
//     if (editTarget) return await editRoutine(editTarget.id, fields)
//     return await addRoutine(fields)
//   }

//   async function handleDelete(id) {
//     await removeRoutine(id)
//     setDeleteTarget(null)
//   }

//   const handleToggle = useCallback((id) => {
//     if (isSelectedToday) toggleCompletion(id)
//   }, [isSelectedToday, toggleCompletion])

//   // ── Render ───────────────────────────────────────────────
//   return (
//     <div className="min-h-screen taskr-bg taskr-scroll overflow-y-auto pb-28" style={{ color: 'var(--text-primary)' }}>
//       <div className="px-4 pt-6">

//         {/* Header */}
//         <motion.div
//           className="flex items-center justify-between mb-5"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div>
//             <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
//               {format(new Date(), 'EEEE, MMMM d')}
//             </p>
//             <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
//               {userName}'s Routines
//             </h1>
//           </div>
//           <div className="flex items-center gap-2">
//             {/* Avatar */}
//             <div
//               className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
//               style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)', color: 'white' }}
//             >
//               {userName[0]?.toUpperCase() ?? 'S'}
//             </div>
//             {/* Add button */}
//             <motion.button
//               onClick={() => openCreate()}
//               className="w-9 h-9 rounded-full flex items-center justify-center"
//               style={{ background: '#22c55e', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.92 }}
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                 <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//               </svg>
//             </motion.button>
//           </div>
//         </motion.div>

//         {/* Streak badge */}
//         {routines.length > 0 && (
//           <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
//             <StreakBadge currentStreak={currentStreak} bestStreak={bestStreak} streakActive={streakActive} />
//           </motion.div>
//         )}

//         {/* Weekly carousel */}
//         <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
//           <WeeklyCarousel
//             selectedDate={selectedDate}
//             onSelectDate={setSelectedDate}
//             routineDates={routineDateSet}
//             taskDates={new Set()}
//           />
//         </motion.div>

//         {/* Progress bar */}
//         {visibleRoutines.length > 0 && (
//           <motion.div className="mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
//             <GlassCard variant="accent" padding="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <div>
//                   <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
//                     {isSelectedToday
//                       ? progressPct === 100 ? '🎉 Perfect day!' : `${completedOnSelected.size} of ${visibleRoutines.length} done`
//                       : `${completedOnSelected.size} of ${visibleRoutines.length} completed`}
//                   </p>
//                   <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
//                     {isSelectedToday ? "Today's routines" : format(selectedDate, 'MMMM d')}
//                   </p>
//                 </div>
//                 <AnimatedCounter value={progressPct} suffix="%" className="text-2xl font-bold" style={{ color: '#22c55e' }} />
//               </div>
//               <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
//                 <motion.div
//                   className="h-full rounded-full"
//                   style={{ background: 'linear-gradient(90deg,#22c55e,#4ade80)', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${progressPct}%` }}
//                   transition={{ duration: 0.8, ease: [0.19,1,0.22,1], delay: 0.2 }}
//                 />
//               </div>
//             </GlassCard>
//           </motion.div>
//         )}

//         {/* Stats */}
//         {routines.length > 0 && (
//           <motion.div className="grid grid-cols-3 gap-3 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
//             {[
//               { label: '30d Rate',    value: completionRate, suffix: '%', color: '#22c55e', icon: '📈' },
//               { label: 'Best Streak', value: bestStreak,     suffix: 'd', color: '#fbbf24', icon: '🏆' },
//               { label: 'Missed',      value: missedDays,     suffix: 'd', color: '#f87171', icon: '📉' },
//             ].map((s, i) => (
//               <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.05 }}>
//                 <GlassCard variant="flat" padding="p-3" className="text-center">
//                   <div className="text-base mb-1">{s.icon}</div>
//                   <AnimatedCounter value={s.value} suffix={s.suffix} className="text-base font-bold" style={{ color: s.color }} />
//                   <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
//                 </GlassCard>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* Heatmap */}
//         {allCompletionDates.length > 0 && (
//           <motion.div className="mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
//             <button onClick={() => setHeatmapOpen(o => !o)} className="w-full flex items-center justify-between px-1 mb-2">
//               <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>ACTIVITY HEATMAP</span>
//               <motion.span animate={{ rotate: heatmapOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>▼</motion.span>
//             </button>
//             <AnimatePresence>
//               {heatmapOpen && (
//                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
//                   <HabitHeatmap completedDates={allCompletionDates} title="Routine completions" />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}

//         {/* Past date notice */}
//         {!isSelectedToday && (
//           <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
//             <span>📅</span>
//             <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Viewing {format(selectedDate, 'MMMM d')} — past dates are read-only</p>
//           </div>
//         )}

//         {/* Routines list */}
//         {loading && routines.length === 0 ? (
//           <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div>
//         ) : routines.length === 0 ? (
//           <EmptyState userName={userName} onAdd={openCreate} />
//         ) : (
//           <div>
//             {pendingRoutines.length > 0 && (
//               <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
//                 <div className="flex items-center gap-2 mb-3">
//                   <h4 className="text-xs font-semibold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>PENDING</h4>
//                   <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: isSelectedToday ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.06)', color: isSelectedToday ? '#fb923c' : 'var(--text-tertiary)' }}>
//                     {pendingRoutines.length}
//                   </span>
//                 </div>
//                 <div className="space-y-2.5">
//                   <AnimatePresence>
//                     {pendingRoutines.map(r => (
//                       <RoutineCard key={r.id} routine={r} isCompleted={false} streak={perRoutineStreak[r.id] ?? 0} onToggle={isSelectedToday ? handleToggle : undefined} onEdit={r => { setEditTarget(r); setModalOpen(true) }} onDelete={setDeleteTarget} />
//                     ))}
//                   </AnimatePresence>
//                 </div>
//               </motion.div>
//             )}

//             {completedRoutines.length > 0 && (
//               <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//                 <div className="flex items-center gap-2 mb-3">
//                   <h4 className="text-xs font-semibold tracking-wider" style={{ color: 'rgba(34,197,94,0.6)' }}>COMPLETED</h4>
//                   <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>{completedRoutines.length}</span>
//                 </div>
//                 <div className="space-y-2.5">
//                   <AnimatePresence>
//                     {completedRoutines.map(r => (
//                       <RoutineCard key={r.id} routine={r} isCompleted={true} streak={perRoutineStreak[r.id] ?? 0} onToggle={isSelectedToday ? handleToggle : undefined} onEdit={r => { setEditTarget(r); setModalOpen(true) }} onDelete={setDeleteTarget} />
//                     ))}
//                   </AnimatePresence>
//                 </div>
//               </motion.div>
//             )}

//             {pendingRoutines.length === 0 && completedRoutines.length > 0 && isSelectedToday && (
//               <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
//                 <div className="text-3xl mb-2">🎉</div>
//                 <p className="text-sm font-bold" style={{ color: '#22c55e' }}>All routines complete!</p>
//                 <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Streak maintained · Keep it up tomorrow</p>
//               </motion.div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* FAB */}
//       {routines.length > 0 && (
//         <motion.button
//           onClick={() => openCreate()}
//           className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-30"
//           style={{ background: '#22c55e', boxShadow: '0 8px 28px rgba(34,197,94,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
//           whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
//           initial={{ scale: 0 }} animate={{ scale: 1 }}
//           transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
//         >
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//             <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//           </svg>
//         </motion.button>
//       )}

//       {/* Unified create/edit modal */}
//       <TaskRoutineModal
//         open={modalOpen}
//         onClose={() => { setModalOpen(false); setEditTarget(null) }}
//         onSaveTask={() => {}}
//         onSaveRoutine={handleSaveRoutine}
//         initialTask={editTarget ? { ...editTarget, _isRoutine: true } : (initialTitle ? { title: initialTitle } : null)}
//         initialType="routine"
//       />

//       {/* Delete sheet */}
//       <RoutineDeleteSheet
//         routine={deleteTarget}
//         onConfirm={handleDelete}
//         onCancel={() => setDeleteTarget(null)}
//       />
//     </div>
//   )
// }

/**
 * src/pages/RoutinesPage.jsx
 * ══════════════════════════════════════════════════════════════
 * FIXES:
 *  1. All CSS uses only vars from globals.css
 *  2. Lucide React icons — no raw SVG
 *  3. Theme-aware (light + dark via .dark class)
 *  4. User name from useUserStore.profile.name
 *  5. All store calls unchanged — only UI layer updated
 * ══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence }    from 'framer-motion'
import { format, isToday }            from 'date-fns'
import {
  Plus, RefreshCw, Flame, Trophy, TrendingDown,
  ChevronDown, Calendar, BarChart2,
} from 'lucide-react'

import { useRoutineStore }    from '@/store/routineStore'
import { useUserStore }       from '@/store'
import { useAuthStore }       from '@/store/authStore'
import { useUIStore }         from '@/store'
import { useStreakCalculator } from '@/hooks/useStreakCalculator'

import { WeeklyCarousel }     from '@/components/calendar/WeeklyCarousel'
import { StreakBadge }        from '@/components/routines/StreakBadge'
import { HabitHeatmap }       from '@/components/routines/HabitHeatmap'
import { RoutineCard }        from '@/components/routines/RoutineCard'
import { RoutineDeleteSheet } from '@/components/routines/RoutineDeleteSheet'
import { RoutineModal }       from '@/components/routines/RoutineModal'

// ── Stat chip ─────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div className="card-sm" style={{ padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ marginBottom: 4 }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({ done, total, label }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {done === total && total > 0 ? '🎉 Perfect day!' : `${done} of ${total} done`}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {label}
          </p>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand)' }}>
          {pct}%
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
        />
      </div>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────
function SectionLabel({ text, count, countColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span className="section-label">{text}</span>
      {count > 0 && (
        <span
          className="badge"
          style={{
            background: countColor ? `${countColor}18` : 'var(--bg-surface-3)',
            color:      countColor ?? 'var(--text-muted)',
            border:     `1px solid ${countColor ? `${countColor}30` : 'var(--border)'}`,
          }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ userName, onAdd }) {
  const first = userName?.split(' ')[0] ?? 'there'
  const SUGGESTIONS = [
    { icon: '🏃', text: 'Morning Run' },
    { icon: '📚', text: 'Read 10 pages' },
    { icon: '✍️', text: 'Journal' },
    { icon: '💧', text: 'Drink water' },
    { icon: '🧘', text: 'Meditate' },
    { icon: '💪', text: 'Workout' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '40px 20px' }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
      <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
        Hey {first}, start a routine!
      </h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
        Routines are habits you track every day.<br />Consistency beats intensity.
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => onAdd()}
        className="btn btn-primary"
        style={{ marginBottom: 20 }}
      >
        <Plus size={15} strokeWidth={2.5} /> Create first routine
      </motion.button>

      {/* Quick-start chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {SUGGESTIONS.map(s => (
          <motion.button
            key={s.text}
            whileTap={{ scale: 0.94 }}
            onClick={() => onAdd(s.text)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            {s.icon} {s.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════
export function RoutinesPage() {
  const {
    routines, completedToday, completions, loading,
    loadAll, addRoutine, editRoutine: saveEdit,
    removeRoutine, toggleCompletion,
    getAllCompletionDates, getCompletionDatesForRoutine,
  } = useRoutineStore()

  const profile    = useUserStore(s => s.profile ?? {})
  const user       = useAuthStore(s => s.user)
  const { showToast } = useUIStore()

  const userName = profile.name ?? user?.email?.split('@')[0] ?? 'Samuel'

  const [selectedDate,  setSelectedDate]  = useState(new Date())
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [heatmapOpen,   setHeatmapOpen]   = useState(false)
  const [initialTitle,  setInitialTitle]  = useState(null)

  useEffect(() => { loadAll() }, [])

  // ── Streak calculation ────────────────────────────────────────
  const allCompletionDates = useMemo(() => getAllCompletionDates(), [completions])
  const { currentStreak, bestStreak, completionRate, missedDays, streakActive } =
    useStreakCalculator(allCompletionDates)

  // Per-routine streak (simple)
  const perRoutineStreak = useMemo(() => {
    const map = {}
    routines.forEach(r => {
      const datesSet = new Set(getCompletionDatesForRoutine(r.id))
      let streak = 0
      let cursor = new Date()
      while (true) {
        const key = format(cursor, 'yyyy-MM-dd')
        if (datesSet.has(key)) { streak++; cursor = new Date(cursor.getTime() - 86_400_000) }
        else break
      }
      map[r.id] = streak
    })
    return map
  }, [completions, routines])

  // ── Visible routines for selected date ───────────────────────
  const visibleRoutines = useMemo(() => {
    const dow = (selectedDate.getDay() + 6) % 7
    return routines.filter(r => {
      if (!r.is_active) return false
      if (r.frequency === 'weekly') return !r.days_of_week?.length || r.days_of_week.includes(dow)
      return true
    })
  }, [routines, selectedDate])

  const selectedDateStr  = format(selectedDate, 'yyyy-MM-dd')
  const isSelectedToday  = isToday(selectedDate)

  const completedOnSelected = useMemo(() => {
    if (isSelectedToday) return completedToday
    return new Set(
      completions
        .filter(c => c.completed_on === selectedDateStr)
        .map(c => c.routine_id)
    )
  }, [completedToday, completions, selectedDateStr, isSelectedToday])

  const pendingRoutines   = visibleRoutines.filter(r => !completedOnSelected.has(r.id))
  const completedRoutines = visibleRoutines.filter(r =>  completedOnSelected.has(r.id))

  const routineDateSet = useMemo(() => {
    const s = new Set()
    completions.forEach(c => s.add(c.completed_on))
    return s
  }, [completions])

  // ── Handlers ─────────────────────────────────────────────────
  function openCreate(suggestedTitle = null) {
    setEditTarget(null)
    setInitialTitle(typeof suggestedTitle === 'string' ? suggestedTitle : null)
    setModalOpen(true)
  }

  async function handleSave(fields) {
    try {
      if (editTarget) {
        await saveEdit(editTarget.id, fields)
        showToast('Routine updated!', 'success')
      } else {
        await addRoutine(fields)
        showToast('Routine added!', 'success')
      }
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
      throw err   // re-throw so RoutineModal stays open
    }
  }

  async function handleDelete(id) {
    try {
      await removeRoutine(id)
      showToast('Routine deleted', 'info')
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error')
    }
    setDeleteTarget(null)
  }

  const handleToggle = useCallback((id) => {
    if (isSelectedToday) toggleCompletion(id)
  }, [isSelectedToday, toggleCompletion])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(14px,2.5vw,22px)', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">
            {userName}'s Routines
          </h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => openCreate()}
          className="btn btn-primary"
        >
          <Plus size={15} strokeWidth={2.5} /> New Routine
        </motion.button>
      </div>

      {/* ── Streak badge ── */}
      {routines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ marginBottom: 14 }}
        >
          <StreakBadge
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            streakActive={streakActive}
          />
        </motion.div>
      )}

      {/* ── Weekly carousel ── */}
      <div style={{ marginBottom: 16 }}>
        <WeeklyCarousel
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          routineDates={routineDateSet}
          taskDates={new Set()}
        />
      </div>

      {/* ── Progress bar ── */}
      {visibleRoutines.length > 0 && (
        <ProgressBar
          done={completedOnSelected.size}
          total={visibleRoutines.length}
          label={isSelectedToday ? "Today's routines" : format(selectedDate, 'MMMM d')}
        />
      )}

      {/* ── Stats row ── */}
      {routines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}
        >
          <StatChip icon={TrendingUp}   label="30-DAY RATE"   value={`${completionRate}%`} color="var(--brand)"            />
          <StatChip icon={Trophy}       label="BEST STREAK"   value={`${bestStreak}d`}     color="var(--xp-gold)"          />
          <StatChip icon={TrendingDown} label="MISSED"        value={`${missedDays}d`}     color="var(--priority-urgent)"  />
        </motion.div>
      )}

      {/* ── Heatmap (collapsible) ── */}
      {allCompletionDates.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setHeatmapOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0', marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={13} color="var(--text-muted)" />
              <span className="section-label">ACTIVITY HEATMAP</span>
            </div>
            <motion.div animate={{ rotate: heatmapOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} color="var(--text-muted)" />
            </motion.div>
          </button>
          <AnimatePresence>
            {heatmapOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <HabitHeatmap completedDates={allCompletionDates} title="Routine completions" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Past-date notice ── */}
      {!isSelectedToday && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            marginBottom: 14,
          }}
        >
          <Calendar size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Viewing {format(selectedDate, 'MMMM d')} — past dates are read-only
          </span>
        </div>
      )}

      {/* ── Routines list ── */}
      {loading && routines.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <EmptyState userName={userName} onAdd={openCreate} />
      ) : (
        <div>
          {/* Pending */}
          {pendingRoutines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: 20 }}
            >
              <SectionLabel
                text="PENDING"
                count={pendingRoutines.length}
                countColor={isSelectedToday ? 'var(--priority-medium)' : undefined}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {pendingRoutines.map(r => (
                    <RoutineCard
                      key={r.id}
                      routine={r}
                      isCompleted={false}
                      streak={perRoutineStreak[r.id] ?? 0}
                      onToggle={isSelectedToday ? handleToggle : undefined}
                      onEdit={r => { setEditTarget(r); setModalOpen(true) }}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Completed */}
          {completedRoutines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ marginBottom: 20 }}
            >
              <SectionLabel
                text="COMPLETED"
                count={completedRoutines.length}
                countColor="var(--brand)"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {completedRoutines.map(r => (
                    <RoutineCard
                      key={r.id}
                      routine={r}
                      isCompleted={true}
                      streak={perRoutineStreak[r.id] ?? 0}
                      onToggle={isSelectedToday ? handleToggle : undefined}
                      onEdit={r => { setEditTarget(r); setModalOpen(true) }}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* All done celebration */}
          {pendingRoutines.length === 0 && completedRoutines.length > 0 && isSelectedToday && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '24px 16px' }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--brand)', margin: 0 }}>
                All routines complete!
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
                Streak maintained · Keep it up tomorrow
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* ── FAB (when routines exist) ── */}
      {routines.length > 0 && (
        <button className="fab" onClick={() => openCreate()} aria-label="New routine">
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Create / Edit modal ── */}
      <RoutineModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        initial={editTarget ?? (initialTitle ? { title: initialTitle } : null)}
      />

      {/* ── Delete confirmation ── */}
      <RoutineDeleteSheet
        routine={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}