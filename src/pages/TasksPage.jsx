// // import { useState, useMemo } from 'react'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
// // import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
// // import { Plus, Search, X, ChevronDown, Download, Trash2 } from 'lucide-react'
// // import { useTaskStore, useUIStore } from '@/store'
// // import { useAuthStore } from '@/store/authStore'
// // import { useTaskActions, useFilteredTasks } from '@/hooks'
// // import { TaskItem } from '@/components/tasks/TaskItem'
// // import { AddTaskModal } from '@/components/tasks/AddTaskModal'
// // import { EmptyState } from '@/components/ui/EmptyState'
// // import { deleteCompletedTasks, deleteAllTasks } from '@/services/taskService'

// // const FILTERS = [
// //   { key: 'all',      label: 'All' },
// //   { key: 'active',   label: 'Active' },
// //   { key: 'done',     label: 'Done' },
// //   { key: 'today',    label: '📅 Today' },
// //   { key: 'overdue',  label: '⚠️ Overdue' },
// //   { key: 'urgent',   label: 'Urgent',  dot: '#ef4444' },
// //   { key: 'high',     label: 'High',    dot: '#f43f5e' },
// //   { key: 'medium',   label: 'Medium',  dot: '#f59e0b' },
// //   { key: 'low',      label: 'Low',     dot: '#22c55e' },
// // ]
// // const SORTS = [
// //   { value: 'newest',   label: 'Newest' },
// //   { value: 'oldest',   label: 'Oldest' },
// //   { value: 'priority', label: 'Priority' },
// //   { value: 'alpha',    label: 'A → Z' },
// //   { value: 'dueDate',  label: 'Due date' },
// // ]

// // export function TasksPage() {
// //   const [filter,    setFilter]    = useState('all')
// //   const [search,    setSearch]    = useState('')
// //   const [sortMode,  setSortMode]  = useState('newest')
// //   const [editingId, setEditingId] = useState(null)
// //   const [showModal, setShowModal] = useState(false)

// //   const { tasks, reorderTasks, clearCompleted, clearAll } = useTaskStore()
// //   const { showToast }                = useUIStore()
// //   const { user }                     = useAuthStore()
// //   const { completeTask, addTask, deleteTask, updateTask } = useTaskActions()
// //   const getFiltered = useFilteredTasks(filter, search, sortMode)
// //   const visible     = useMemo(() => getFiltered(), [getFiltered])

// //   const sensors = useSensors(
// //     useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
// //     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
// //   )

// //   function handleDragEnd({ active, over }) {
// //     if (!over || active.id === over.id) return
// //     const oi = tasks.findIndex(t => t.id === active.id)
// //     const ni = tasks.findIndex(t => t.id === over.id)
// //     reorderTasks(arrayMove(tasks, oi, ni))
// //   }

// //   function handleSaveEdit(id, val) {
// //     const t = val?.trim(); if (!t) return
// //     updateTask(id, { text: t }); setEditingId(null)
// //   }

// //   // Clear completed — local + Supabase
// //   async function handleClearCompleted() {
// //     const count = tasks.filter(t => t.done).length
// //     if (!count) { showToast('No completed tasks to clear', 'info'); return }
// //     clearCompleted()
// //     showToast(`Cleared ${count} task${count !== 1 ? 's' : ''}`, 'success')
// //     if (user?.id) {
// //       deleteCompletedTasks(user.id).catch(err => console.error('[Taskr] Clear completed error:', err))
// //     }
// //   }

// //   // Clear all — local + Supabase
// //   async function handleClearAll() {
// //     if (!tasks.length) { showToast('No tasks to clear', 'info'); return }
// //     if (!window.confirm('Delete ALL tasks permanently?')) return
// //     clearAll()
// //     showToast('All tasks cleared', 'info')
// //     if (user?.id) {
// //       deleteAllTasks(user.id).catch(err => console.error('[Taskr] Clear all error:', err))
// //     }
// //   }

// //   function exportTasks() {
// //     if (!tasks.length) { showToast('No tasks to export', 'info'); return }
// //     const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n')
// //     const a = document.createElement('a')
// //     a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }))
// //     a.download = 'taskr-export.txt'; a.click(); URL.revokeObjectURL(a.href)
// //     showToast('Exported!', 'success')
// //   }

// //   const total = tasks.length
// //   const done  = tasks.filter(t => t.done).length
// //   const pct   = total ? Math.round(done / total * 100) : 0

// //   return (
// //     <div>
// //       {/* Header */}
// //       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(16px,2.5vw,24px)', flexWrap: 'wrap', gap: 12 }}>
// //         <div>
// //           <h1 className="page-title">Tasks</h1>
// //           <p className="page-subtitle">{done}/{total} completed · {pct}% done</p>
// //         </div>
// //         <motion.button
// //           whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
// //           onClick={() => setShowModal(true)}
// //           className="btn btn-primary"
// //         >
// //           <Plus size={16} strokeWidth={2.5} /> New Task
// //         </motion.button>
// //       </div>

// //       {/* Filter chips */}
// //       <div style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }} className="scrollbar-none">
// //         <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
// //           {FILTERS.map(f => {
// //             const active = filter === f.key
// //             return (
// //               <motion.button key={f.key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
// //                 onClick={() => setFilter(f.key)}
// //                 style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`, background: active ? 'var(--brand)' : 'var(--bg-surface)', color: active ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .14s', whiteSpace: 'nowrap' }}
// //               >
// //                 {f.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : f.dot }} />}
// //                 {f.label}
// //               </motion.button>
// //             )
// //           })}
// //         </div>
// //       </div>

// //       {/* Search + sort */}
// //       <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
// //         <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
// //           <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
// //           <input type="text" placeholder="Search tasks, tags..." value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: 36, paddingRight: search ? 36 : 14 }} />
// //           <AnimatePresence>
// //             {search && (
// //               <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
// //                 onClick={() => setSearch('')}
// //                 style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface-3)', border: 'none', cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
// //                 <X size={10} />
// //               </motion.button>
// //             )}
// //           </AnimatePresence>
// //         </div>
// //         <div style={{ position: 'relative', flexShrink: 0 }}>
// //           <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="input-base" style={{ appearance: 'none', paddingRight: 28, cursor: 'pointer', width: 'auto', minWidth: 110 }}>
// //             {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
// //           </select>
// //           <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
// //         </div>
// //       </div>

// //       {/* Task list */}
// //       <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
// //         <div style={{ padding: '10px 16px', borderBottom: visible.length ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //             <span className="section-label">Tasks</span>
// //             <motion.span key={visible.length} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="badge badge-brand">
// //               {visible.length}
// //             </motion.span>
// //           </div>
// //           {total > 0 && (
// //             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
// //               <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{done}</span> / {total} done
// //             </div>
// //           )}
// //         </div>

// //         <div className="scrollbar-thin" style={{ maxHeight: 'clamp(300px, 52vh, 560px)', overflowY: 'auto' }}>
// //           <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
// //             <SortableContext items={visible.map(t => t.id)} strategy={verticalListSortingStrategy}>
// //               <AnimatePresence mode="popLayout">
// //                 {visible.length === 0 ? (
// //                   <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
// //                     <EmptyState hasFilter={!!(search || filter !== 'all')} onAddTask={() => setShowModal(true)} />
// //                   </motion.div>
// //                 ) : visible.map(task => (
// //                   <TaskItem
// //                     key={task.id} task={task} editingId={editingId}
// //                     onToggle={completeTask} onDelete={deleteTask}
// //                     onUpdate={updateTask} onStartEdit={setEditingId}
// //                     onSaveEdit={handleSaveEdit} onCancelEdit={() => setEditingId(null)}
// //                   />
// //                 ))}
// //               </AnimatePresence>
// //             </SortableContext>
// //           </DndContext>
// //         </div>
// //       </div>

// //       {/* Footer actions */}
// //       <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
// //         {[
// //           { label: 'Clear completed', Icon: Trash2, action: handleClearCompleted, danger: false },
// //           { label: 'Export',          Icon: Download, action: exportTasks,           danger: false },
// //           { label: 'Clear all',       Icon: Trash2, action: handleClearAll,          danger: true },
// //         ].map(({ label, Icon, action, danger }) => (
// //           <button key={label} onClick={action} className="btn btn-ghost btn-sm"
// //             style={{ color: danger ? '#f43f5e' : 'var(--text-muted)' }}
// //             onMouseEnter={e => e.currentTarget.style.color = danger ? '#ef4444' : 'var(--text-primary)'}
// //             onMouseLeave={e => e.currentTarget.style.color = danger ? '#f43f5e' : 'var(--text-muted)'}
// //           >
// //             <Icon size={13} /> {label}
// //           </button>
// //         ))}
// //       </div>

// //       <AnimatePresence>
// //         {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
// //       </AnimatePresence>
// //     </div>
// //   )
// // }




// /**
//  * pages/TasksPage.jsx  (replaces existing Tasks.jsx — same export name)
//  * ══════════════════════════════════════════════════════════════
//  * Modern redesign keeping ALL existing logic.
//  * Adds:
//  *  - Task / Routine tab toggle
//  *  - Weekly calendar carousel (date filter)
//  *  - Priority-grouped task list
//  *  - Alarm indicators on tasks
//  *  - Unified create modal (TaskRoutineModal)
//  *  - Drag-to-reorder infrastructure (dnd-kit)
//  *
//  * CRITICAL: reads from useTaskStore + useRoutineStore
//  * CRITICAL: calls existing toggleTask, deleteTask, addTask
//  * ══════════════════════════════════════════════════════════════
//  */

// import { useState, useMemo, useCallback, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { format, isToday, isTomorrow, isPast, parseISO, isValid } from 'date-fns'
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from '@dnd-kit/core'
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
//   arrayMove,
// } from '@dnd-kit/sortable'
// import { CSS } from '@dnd-kit/utilities'

// // Existing stores
// import { useTaskStore }    from '@/store'
// import { useUserStore }    from '@/store'
// import { useRoutineStore } from '@/store/routineStore'

// // New components
// import { WeeklyCarousel }      from '@/components/calendar/WeeklyCarousel'
// import { GlassCard }           from '@/components/ui/GlassCard'
// import { AnimatedCounter }     from '@/components/ui/AnimatedCounter'
// import { TaskRoutineModal }    from '@/components/tasks/TaskRoutineModal'
// import { RoutineCard }         from '@/components/routines/RoutineCard'
// import { triggerCompletionBurst } from '@/components/ui/CompletionEffect'
// import { cancelAlarm, hasPendingAlarm } from '@/services/alarmEngine'

// // ── Priority config ──────────────────────────────────────────
// const PRIORITY = {
//   high:   { label: 'High',   color: '#f87171', bg: 'rgba(248,113,113,0.12)', dot: '#f87171' },
//   medium: { label: 'Medium', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  dot: '#fb923c' },
//   low:    { label: 'Low',    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  dot: '#60a5fa' },
// }

// // ── Due date badge ────────────────────────────────────────────
// function getDueBadge(dateStr) {
//   if (!dateStr) return null
//   try {
//     const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
//     if (!isValid(d)) return null
//     if (isToday(d))    return { label: 'Today',     color: '#22c55e' }
//     if (isTomorrow(d)) return { label: 'Tomorrow',  color: '#fb923c' }
//     if (isPast(d))     return { label: 'Overdue',   color: '#f87171' }
//     return               { label: format(d, 'MMM d'), color: 'rgba(255,255,255,0.4)' }
//   } catch { return null }
// }

// // ── Sortable task row ─────────────────────────────────────────
// function SortableTaskRow({ task, onToggle, onEdit, onDelete }) {
//   const {
//     attributes, listeners, setNodeRef,
//     transform, transition, isDragging,
//   } = useSortable({ id: task.id })

//   const style = {
//     transform:  CSS.Transform.toString(transform),
//     transition,
//     opacity:    isDragging ? 0.5 : 1,
//     zIndex:     isDragging ? 50 : 'auto',
//   }

//   const p       = PRIORITY[task.priority] ?? PRIORITY.low
//   const due     = getDueBadge(task.due_date)
//   const hasAlarm = hasPendingAlarm(task.id)
//   const btnRef  = { current: null }

//   function handleToggle() {
//     if (!task.completed && btnRef.current) {
//       const rect = btnRef.current.getBoundingClientRect()
//       triggerCompletionBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
//     }
//     onToggle?.(task.id)
//     if (task.completed === false) cancelAlarm(task.id) // clear alarm on complete
//   }

//   return (
//     <div ref={setNodeRef} style={style}>
//       <motion.div
//         layout
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, height: 0, marginBottom: 0 }}
//         transition={{ duration: 0.25 }}
//         className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
//         style={{
//           background: task.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
//           border:     `1px solid ${task.completed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`,
//           borderLeft: `3px solid ${task.completed ? 'rgba(34,197,94,0.3)' : p.dot}`,
//         }}
//       >
//         {/* Drag handle */}
//         <div
//           {...attributes}
//           {...listeners}
//           className="flex-shrink-0 cursor-grab active:cursor-grabbing"
//           style={{ color: 'rgba(255,255,255,0.15)', touchAction: 'none' }}
//         >
//           <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
//             <circle cx="3" cy="3"  r="1.5"/><circle cx="9" cy="3"  r="1.5"/>
//             <circle cx="3" cy="8"  r="1.5"/><circle cx="9" cy="8"  r="1.5"/>
//             <circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/>
//           </svg>
//         </div>

//         {/* Priority dot */}
//         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.dot, opacity: task.completed ? 0.3 : 1 }} />

//         {/* Icon */}
//         {task.icon && (
//           <span className="text-base flex-shrink-0" style={{ opacity: task.completed ? 0.4 : 1 }}>
//             {task.icon}
//           </span>
//         )}

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <p
//             className={`text-sm font-medium truncate transition-all ${task.completed ? 'line-through opacity-40' : ''}`}
//             style={{ color: 'var(--text-primary)' }}
//           >
//             {task.title}
//           </p>
//           <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//             {due && (
//               <span className="text-xs font-semibold" style={{ color: due.color }}>
//                 {due.label}
//               </span>
//             )}
//             {task.due_time && !task.completed && (
//               <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
//                 🕐 {task.due_time}
//               </span>
//             )}
//             {hasAlarm && !task.completed && (
//               <span className="text-xs" style={{ color: '#fbbf24' }}>⏰</span>
//             )}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-1 flex-shrink-0">
//           <button
//             onClick={() => onEdit?.(task)}
//             className="w-7 h-7 rounded-lg flex items-center justify-center"
//             style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)' }}
//           >
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
//               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
//             </svg>
//           </button>

//           <motion.button
//             ref={el => btnRef.current = el}
//             onClick={handleToggle}
//             className="w-7 h-7 rounded-full flex items-center justify-center"
//             style={{
//               background:  task.completed ? '#22c55e' : 'transparent',
//               border:      `2px solid ${task.completed ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
//               boxShadow:   task.completed ? '0 0 10px rgba(34,197,94,0.35)' : 'none',
//             }}
//             whileTap={{ scale: 0.82 }}
//           >
//             {task.completed && (
//               <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none"
//                 initial={{ scale: 0 }} animate={{ scale: 1 }}
//                 transition={{ type: 'spring', stiffness: 500 }}
//               >
//                 <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </motion.svg>
//             )}
//           </motion.button>
//         </div>
//       </motion.div>
//     </div>
//   )
// }

// // ── Priority group ────────────────────────────────────────────
// function PriorityGroup({ priority, tasks, onToggle, onEdit, onDelete }) {
//   const [open, setOpen] = useState(true)
//   const p = PRIORITY[priority] ?? PRIORITY.low
//   const done = tasks.filter(t => t.completed).length

//   return (
//     <div className="mb-4">
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="w-full flex items-center gap-2 mb-2 px-1"
//       >
//         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.dot }} />
//         <span className="text-xs font-semibold tracking-wider" style={{ color: p.color }}>
//           {p.label.toUpperCase()}
//         </span>
//         <span className="text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>
//           {done}/{tasks.length}
//         </span>
//         <div className="flex-1" />
//         <motion.span
//           animate={{ rotate: open ? 180 : 0 }}
//           transition={{ duration: 0.2 }}
//           className="text-xs"
//           style={{ color: 'var(--text-tertiary)' }}
//         >
//           ▼
//         </motion.span>
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.22 }}
//             style={{ overflow: 'hidden' }}
//           >
//             <AnimatePresence>
//               {tasks.map(task => (
//                 <SortableTaskRow
//                   key={task.id}
//                   task={task}
//                   onToggle={onToggle}
//                   onEdit={onEdit}
//                   onDelete={onDelete}
//                 />
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// // ── Empty state ───────────────────────────────────────────────
// function EmptyState({ tab, onAdd }) {
//   const isTask = tab === 'tasks'
//   return (
//     <motion.div
//       className="flex flex-col items-center justify-center text-center py-14 px-6"
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       <div className="text-5xl mb-4">{isTask ? '✅' : '🔄'}</div>
//       <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
//         {isTask ? 'No tasks here' : 'No routines yet'}
//       </h3>
//       <p className="text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
//         {isTask ? 'Tap + to add your first task for this day.' : 'Tap + to create a recurring habit.'}
//       </p>
//       <button
//         onClick={onAdd}
//         className="px-5 py-2.5 rounded-2xl text-sm font-bold"
//         style={{ background: isTask ? 'rgba(34,197,94,0.15)' : 'rgba(96,165,250,0.15)', border: `1px solid ${isTask ? 'rgba(34,197,94,0.3)' : 'rgba(96,165,250,0.3)'}`, color: isTask ? '#22c55e' : '#60a5fa' }}
//       >
//         + Create {isTask ? 'Task' : 'Routine'}
//       </button>
//     </motion.div>
//   )
// }

// // ── Main Page ─────────────────────────────────────────────────
// export function TasksPage() {
//   const [activeTab,    setActiveTab]    = useState('tasks')      // 'tasks' | 'routines'
//   const [selectedDate, setSelectedDate] = useState(new Date())
//   const [modalOpen,    setModalOpen]    = useState(false)
//   const [editTarget,   setEditTarget]   = useState(null)
//   const [taskOrder,    setTaskOrder]    = useState([])

//   // ── Stores ───────────────────────────────────────────────
//   // Existing task store — use whatever selectors already exist
//   const tasks          = useTaskStore(s => s.tasks ?? [])
//   const toggleTask     = useTaskStore(s => s.toggleTask     ?? s.toggle ?? (() => {}))
//   const addTask        = useTaskStore(s => s.addTask        ?? s.add    ?? (() => {}))
//   const updateTask     = useTaskStore(s => s.updateTask     ?? s.update ?? (() => {}))
//   const deleteTask     = useTaskStore(s => s.deleteTask     ?? s.remove ?? (() => {}))

//   // Routine store
//   const {
//     routines,
//     completedToday,
//     loadAll:       loadRoutines,
//     addRoutine,
//     editRoutine,
//     toggleCompletion,
//   } = useRoutineStore()

//   const profile = useUserStore(s => s.profile ?? {})

//   useEffect(() => { loadRoutines() }, [])

//   // ── Date sets for calendar dots ───────────────────────────
//   const taskDateSet = useMemo(() => {
//     const s = new Set()
//     tasks.forEach(t => { if (t.due_date) s.add(t.due_date.slice(0, 10)) })
//     return s
//   }, [tasks])

//   const routineDateSet = useMemo(() => {
//     const s = new Set()
//     routines.forEach(() => {
//       // routines appear every day — mark today + recent completions
//       s.add(format(new Date(), 'yyyy-MM-dd'))
//     })
//     return s
//   }, [routines])

//   // ── Filter tasks for selected date ────────────────────────
//   const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

//   const filteredTasks = useMemo(() => {
//     return tasks.filter(t => {
//       if (!t.due_date) return isToday(selectedDate)
//       return t.due_date.slice(0, 10) === selectedDateStr
//     })
//   }, [tasks, selectedDateStr, selectedDate])

//   // Group by priority
//   const grouped = useMemo(() => {
//     const g = { high: [], medium: [], low: [] }
//     filteredTasks.forEach(t => {
//       const p = t.priority ?? 'low'
//       if (g[p]) g[p].push(t)
//       else g.low.push(t)
//     })
//     return g
//   }, [filteredTasks])

//   // Stats
//   const completedCount = filteredTasks.filter(t => t.completed).length
//   const totalCount     = filteredTasks.length
//   const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

//   // ── DnD sensors ──────────────────────────────────────────
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
//   )

//   function handleDragEnd(event) {
//     const { active, over } = event
//     if (!over || active.id === over.id) return
//     setTaskOrder(prev => {
//       const ids   = prev.length ? prev : filteredTasks.map(t => t.id)
//       const oldIdx = ids.indexOf(active.id)
//       const newIdx = ids.indexOf(over.id)
//       return arrayMove(ids, oldIdx, newIdx)
//     })
//   }

//   // Sorted task list respecting drag order
//   const sortedTasks = useMemo(() => {
//     if (!taskOrder.length) return filteredTasks
//     return [...filteredTasks].sort((a, b) => {
//       const ai = taskOrder.indexOf(a.id)
//       const bi = taskOrder.indexOf(b.id)
//       if (ai === -1) return 1
//       if (bi === -1) return -1
//       return ai - bi
//     })
//   }, [filteredTasks, taskOrder])

//   // ── Handlers ────────────────────────────────────────────
//   function openCreate() {
//     setEditTarget(null)
//     setModalOpen(true)
//   }

//   function openEdit(task) {
//     setEditTarget(task)
//     setModalOpen(true)
//   }

//   async function handleSaveTask(fields) {
//     if (editTarget) {
//       const updated = await updateTask({ ...editTarget, ...fields })
//       return updated ?? { ...editTarget, ...fields }
//     } else {
//       const created = await addTask({
//         ...fields,
//         due_date: fields.due_date || selectedDateStr,
//         completed: false,
//       })
//       return created
//     }
//   }

//   async function handleSaveRoutine(fields) {
//     if (editTarget) {
//       return await editRoutine(editTarget.id, fields)
//     } else {
//       return await addRoutine(fields)
//     }
//   }

//   // Routines for the selected date (day-of-week filtering)
//   const visibleRoutines = useMemo(() => {
//     const dayOfWeek = (selectedDate.getDay() + 6) % 7 // 0=Mon
//     return routines.filter(r => {
//       if (!r.is_active) return false
//       if (r.frequency === 'weekly') {
//         return !r.days_of_week?.length || r.days_of_week.includes(dayOfWeek)
//       }
//       return true
//     })
//   }, [routines, selectedDate])

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
//             <h1 className="text-2xl font-bold">Tasks</h1>
//             <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
//               {format(new Date(), 'EEEE, MMMM d')}
//             </p>
//           </div>
//           <motion.button
//             onClick={openCreate}
//             className="w-9 h-9 rounded-full flex items-center justify-center"
//             style={{ background: '#22c55e', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.92 }}
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//             </svg>
//           </motion.button>
//         </motion.div>

//         {/* Task / Routine toggle */}
//         <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
//           {[
//             { key: 'tasks',    label: '✅ Tasks',    color: '#22c55e', shadow: 'rgba(34,197,94,0.3)'   },
//             { key: 'routines', label: '🔄 Routines', color: '#60a5fa', shadow: 'rgba(96,165,250,0.3)'  },
//           ].map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
//               style={{
//                 background: activeTab === tab.key ? tab.color : 'transparent',
//                 color:      activeTab === tab.key ? 'white' : 'var(--text-tertiary)',
//                 boxShadow:  activeTab === tab.key ? `0 4px 12px ${tab.shadow}` : 'none',
//               }}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Weekly carousel */}
//         <WeeklyCarousel
//           selectedDate={selectedDate}
//           onSelectDate={setSelectedDate}
//           taskDates={activeTab === 'tasks' ? taskDateSet : routineDateSet}
//           routineDates={activeTab === 'routines' ? routineDateSet : new Set()}
//         />

//         {/* Progress bar (tasks tab) */}
//         {activeTab === 'tasks' && totalCount > 0 && (
//           <motion.div
//             className="mb-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             <GlassCard variant="accent" padding="p-3">
//               <div className="flex items-center justify-between mb-2">
//                 <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
//                   {completedCount === totalCount ? '🎉 All done!' : `${completedCount} / ${totalCount} complete`}
//                 </p>
//                 <AnimatedCounter value={progressPct} suffix="%" className="text-sm font-bold" style={{ color: '#22c55e' }} />
//               </div>
//               <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
//                 <motion.div
//                   className="h-full rounded-full"
//                   style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${progressPct}%` }}
//                   transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
//                 />
//               </div>
//             </GlassCard>
//           </motion.div>
//         )}

//         {/* ── TASKS TAB ───────────────────────────────────── */}
//         {activeTab === 'tasks' && (
//           <AnimatePresence mode="wait">
//             <motion.div
//               key="tasks"
//               initial={{ opacity: 0, x: -15 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -15 }}
//               transition={{ duration: 0.2 }}
//             >
//               {filteredTasks.length === 0 ? (
//                 <EmptyState tab="tasks" onAdd={openCreate} />
//               ) : (
//                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                   <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
//                     {['high','medium','low'].map(priority => {
//                       const items = grouped[priority] ?? []
//                       if (!items.length) return null
//                       return (
//                         <PriorityGroup
//                           key={priority}
//                           priority={priority}
//                           tasks={items}
//                           onToggle={toggleTask}
//                           onEdit={openEdit}
//                           onDelete={deleteTask}
//                         />
//                       )
//                     })}
//                   </SortableContext>
//                 </DndContext>
//               )}
//             </motion.div>
//           </AnimatePresence>
//         )}

//         {/* ── ROUTINES TAB ─────────────────────────────────── */}
//         {activeTab === 'routines' && (
//           <AnimatePresence mode="wait">
//             <motion.div
//               key="routines"
//               initial={{ opacity: 0, x: 15 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 15 }}
//               transition={{ duration: 0.2 }}
//             >
//               {visibleRoutines.length === 0 ? (
//                 <EmptyState tab="routines" onAdd={() => { setEditTarget(null); setModalOpen(true) }} />
//               ) : (
//                 <div className="space-y-2.5">
//                   {visibleRoutines.map(routine => (
//                     <RoutineCard
//                       key={routine.id}
//                       routine={routine}
//                       isCompleted={completedToday.has(routine.id)}
//                       streak={0}
//                       onToggle={toggleCompletion}
//                       onEdit={r => { setEditTarget(r); setModalOpen(true) }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </motion.div>
//           </AnimatePresence>
//         )}
//       </div>

//       {/* FAB */}
//       <motion.button
//         onClick={openCreate}
//         className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-30"
//         style={{ background: '#22c55e', boxShadow: '0 8px 28px rgba(34,197,94,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
//         whileHover={{ scale: 1.08 }}
//         whileTap={{ scale: 0.92 }}
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
//       >
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//           <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//         </svg>
//       </motion.button>

//       {/* Unified modal */}
//       <TaskRoutineModal
//         open={modalOpen}
//         onClose={() => { setModalOpen(false); setEditTarget(null) }}
//         onSaveTask={handleSaveTask}
//         onSaveRoutine={handleSaveRoutine}
//         initialTask={editTarget}
//         initialType={activeTab === 'routines' ? 'routine' : 'task'}
//       />
//     </div>
//   )
// }


/**
 * src/pages/TasksPage.jsx
 * ══════════════════════════════════════════════════════════════
 * FIXES:
 *  1. Field mapping: modal returns { title, priority, due_date, due_time }
 *     → store expects { text, priority, dueDate, ... }
 *  2. Saves to Supabase via useTaskActions (existing hook that handles DB sync)
 *  3. All CSS uses only vars defined in globals.css (no var(--bg-elevated) etc.)
 *  4. Lucide React icons throughout — no raw SVG
 *  5. Theme-aware: respects .dark class, reads var(--bg-surface) etc.
 *  6. Routines tab wired to routineStore + routineService (Supabase)
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isPast, parseISO, isValid } from 'date-fns'
import {
  Plus, CheckSquare, RefreshCw, Calendar, Clock,
  Bell, GripVertical, Pencil, Check, ChevronDown,
  Flame, TrendingUp, AlertCircle, Circle,
} from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useTaskStore, useUIStore, useUserStore } from '@/store'
import { useAuthStore }    from '@/store/authStore'
import { useRoutineStore } from '@/store/routineStore'
import { useTaskActions }  from '@/hooks'

import { WeeklyCarousel }   from '@/components/calendar/WeeklyCarousel'
import { RoutineCard }      from '@/components/routines/RoutineCard'
import { AddTaskModal }     from '@/components/tasks/AddTaskModal'
import { RoutineModal }     from '@/components/routines/RoutineModal'

// ── Priority config (matches existing store values) ──────────────
const PRIORITY_CFG = {
  urgent: { label: 'Urgent', color: 'var(--priority-urgent)', dot: '#ef4444' },
  high:   { label: 'High',   color: 'var(--priority-high)',   dot: '#f43f5e' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', dot: '#f59e0b' },
  low:    { label: 'Low',    color: 'var(--priority-low)',    dot: '#22c55e' },
}

// ── Due date label ────────────────────────────────────────────────
function getDueLabel(dueDate) {
  if (!dueDate) return null
  try {
    const d = typeof dueDate === 'number' ? new Date(dueDate) : parseISO(dueDate)
    if (!isValid(d)) return null
    if (isToday(d))    return { label: 'Today',    color: 'var(--brand)' }
    if (isTomorrow(d)) return { label: 'Tomorrow', color: 'var(--priority-medium)' }
    if (isPast(d))     return { label: 'Overdue',  color: 'var(--priority-urgent)' }
    return               { label: format(d, 'MMM d'), color: 'var(--text-muted)' }
  } catch { return null }
}

// ── Sortable task row ─────────────────────────────────────────────
function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const p   = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.low
  const due = getDueLabel(task.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="card-sm card-hover"
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          padding:       '10px 12px',
          marginBottom:  6,
          borderLeft:    `3px solid ${task.done ? 'var(--brand)' : p.dot}`,
          opacity:       task.done ? 0.55 : 1,
          transition:    'opacity 0.2s',
        }}
      >
        {/* Drag handle */}
        <div
          {...attributes} {...listeners}
          style={{ color: 'var(--text-faint)', cursor: 'grab', flexShrink: 0, touchAction: 'none' }}
        >
          <GripVertical size={14} />
        </div>

        {/* Priority dot */}
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 600,
            color:  'var(--text-primary)', fontFamily: 'var(--font-body)',
            textDecoration: task.done ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
            {due && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: due.color }}>
                <Calendar size={10} /> {due.label}
              </span>
            )}
            {task.notes && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                {task.notes}
              </span>
            )}
          </div>
        </div>

        {/* Edit */}
        <button
          onClick={() => onEdit?.(task)}
          className="btn-icon"
          style={{ width: 28, height: 28, flexShrink: 0 }}
          aria-label="Edit"
        >
          <Pencil size={12} />
        </button>

        {/* Complete toggle */}
        <motion.button
          onClick={() => onToggle?.(task.id)}
          whileTap={{ scale: 0.82 }}
          style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${task.done ? 'var(--brand)' : 'var(--border-strong)'}`,
            background: task.done ? 'var(--brand)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s',
            boxShadow: task.done ? 'var(--shadow-brand)' : 'none',
          }}
        >
          {task.done && <Check size={13} color="white" strokeWidth={3} />}
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── Priority group ────────────────────────────────────────────────
function PriorityGroup({ priority, tasks, onToggle, onEdit }) {
  const [open, setOpen] = useState(true)
  const p    = PRIORITY_CFG[priority] ?? PRIORITY_CFG.low
  const done = tasks.filter(t => t.done).length

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 2px', marginBottom: 6,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: p.color, fontFamily: 'var(--font-body)', letterSpacing: '0.06em' }}>
          {p.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {done}/{tasks.length}
        </span>
        <div style={{ flex: 1 }} />
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} color="var(--text-muted)" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="card-sm" style={{ padding: '12px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
          {done === total && total > 0 ? '🎉 All done!' : `${done} / ${total} complete`}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
          {pct}%
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ isTask, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '48px 24px' }}
    >
      <div style={{ fontSize: 44, marginBottom: 12 }}>{isTask ? '✅' : '🔄'}</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
        {isTask ? 'No tasks today' : 'No routines yet'}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-body)' }}>
        {isTask ? 'Tap + to add your first task.' : 'Build a habit — tap + to create one.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="btn btn-primary btn-sm"
      >
        <Plus size={14} strokeWidth={2.5} />
        {isTask ? 'Add Task' : 'Add Routine'}
      </motion.button>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════
export function TasksPage() {
  const [activeTab,     setActiveTab]     = useState('tasks')
  const [selectedDate,  setSelectedDate]  = useState(new Date())
  const [showAddTask,   setShowAddTask]   = useState(false)
  const [showAddRoutine,setShowAddRoutine]= useState(false)
  const [editRoutine,   setEditRoutine]   = useState(null)
  const [taskOrder,     setTaskOrder]     = useState([])

  // ── Stores ────────────────────────────────────────────────────
  const tasks      = useTaskStore(s => s.tasks ?? [])
  const { user }   = useAuthStore()
  const { showToast } = useUIStore()

  // useTaskActions = the existing hook that does Supabase sync
  const { completeTask, addTask, deleteTask, updateTask } = useTaskActions()

  const {
    routines, completedToday, loading: routinesLoading,
    loadAll: loadRoutines, addRoutine, editRoutine: saveEditRoutine,
    removeRoutine, toggleCompletion,
  } = useRoutineStore()

  useEffect(() => { loadRoutines() }, [])

  // ── Date helpers ──────────────────────────────────────────────
  const selectedDateMs  = selectedDate.getTime()
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const todaySelected   = isToday(selectedDate)

  // Tasks for selected date (store uses dueDate as ms timestamp or null)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return todaySelected     // no due date → show on today
      const d = new Date(t.dueDate)
      return isValid(d) &&
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth()    === selectedDate.getMonth()    &&
        d.getDate()     === selectedDate.getDate()
    })
  }, [tasks, selectedDateMs, todaySelected])

  // Grouped by priority
  const grouped = useMemo(() => {
    const g = { urgent: [], high: [], medium: [], low: [] }
    filteredTasks.forEach(t => {
      const p = t.priority ?? 'low'
      ;(g[p] ?? g.low).push(t)
    })
    return g
  }, [filteredTasks])

  const completedCount = filteredTasks.filter(t => t.done).length
  const totalCount     = filteredTasks.length

  // Calendar dot sets
  const taskDateSet = useMemo(() => {
    const s = new Set()
    tasks.forEach(t => {
      if (t.dueDate) s.add(format(new Date(t.dueDate), 'yyyy-MM-dd'))
    })
    return s
  }, [tasks])

  const routineDateSet = useMemo(() => new Set([format(new Date(), 'yyyy-MM-dd')]), [])

  // Routines for selected date
  const visibleRoutines = useMemo(() => {
    const dow = (selectedDate.getDay() + 6) % 7  // 0=Mon
    return routines.filter(r => {
      if (!r.is_active) return false
      if (r.frequency === 'weekly') {
        return !r.days_of_week?.length || r.days_of_week.includes(dow)
      }
      return true
    })
  }, [routines, selectedDate])

  // ── DnD ───────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    setTaskOrder(prev => {
      const ids    = prev.length ? prev : filteredTasks.map(t => t.id)
      const oldIdx = ids.indexOf(active.id)
      const newIdx = ids.indexOf(over.id)
      return arrayMove(ids, oldIdx, newIdx)
    })
  }

  const sortedTasks = useMemo(() => {
    if (!taskOrder.length) return filteredTasks
    return [...filteredTasks].sort((a, b) => {
      const ai = taskOrder.indexOf(a.id), bi = taskOrder.indexOf(b.id)
      if (ai === -1) return 1; if (bi === -1) return -1
      return ai - bi
    })
  }, [filteredTasks, taskOrder])

  // ── Handlers ─────────────────────────────────────────────────

  /**
   * AddTaskModal calls onAdd({ text, priority, dueDate, category, tags, recurring })
   * useTaskActions.addTask() wraps store.addTask + dbCreateTask — no change needed.
   */
  function handleAddTask(data) {
    addTask(data)
    setShowAddTask(false)
  }

  /**
   * RoutineModal calls onSave({ title, description, icon, color, frequency,
   *   days_of_week, time_of_day }) — goes straight to routineStore → routineService → Supabase
   */
  async function handleSaveRoutine(fields) {
    try {
      if (editRoutine) {
        await saveEditRoutine(editRoutine.id, fields)
        showToast('Routine updated!', 'success')
      } else {
        await addRoutine(fields)
        showToast('Routine created!', 'success')
      }
      setShowAddRoutine(false)
      setEditRoutine(null)
    } catch (err) {
      showToast('Failed to save routine: ' + err.message, 'error')
    }
  }

  async function handleDeleteRoutine(id) {
    try {
      await removeRoutine(id)
      showToast('Routine deleted', 'info')
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(14px,2.5vw,22px)', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">
            {activeTab === 'tasks' ? 'Tasks' : 'Routines'}
          </h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE, MMMM d')}
            {activeTab === 'tasks' && totalCount > 0 && ` · ${completedCount}/${totalCount} done`}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => activeTab === 'tasks' ? setShowAddTask(true) : setShowAddRoutine(true)}
          className="btn btn-primary"
        >
          <Plus size={15} strokeWidth={2.5} />
          {activeTab === 'tasks' ? 'New Task' : 'New Routine'}
        </motion.button>
      </div>

      {/* ── Tab toggle ── */}
      <div
        style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--bg-surface-3)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 16,
        }}
      >
        {[
          { key: 'tasks',    label: 'Tasks',    Icon: CheckSquare },
          { key: 'routines', label: 'Routines', Icon: RefreshCw   },
        ].map(tab => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex:          1,
              display:       'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding:       '8px 12px',
              borderRadius:  'var(--radius-full)',
              border:        'none',
              cursor:        'pointer',
              fontFamily:    'var(--font-body)',
              fontSize:      13,
              fontWeight:    600,
              transition:    'all 0.18s',
              background:    activeTab === tab.key ? 'var(--brand)'        : 'transparent',
              color:         activeTab === tab.key ? '#fff'                : 'var(--text-muted)',
              boxShadow:     activeTab === tab.key ? 'var(--shadow-brand)' : 'none',
            }}
          >
            <tab.Icon size={14} strokeWidth={activeTab === tab.key ? 2.5 : 1.8} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── Weekly carousel ── */}
      <div style={{ marginBottom: 16 }}>
        <WeeklyCarousel
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          taskDates={activeTab === 'tasks' ? taskDateSet : routineDateSet}
          routineDates={activeTab === 'routines' ? routineDateSet : new Set()}
        />
      </div>

      {/* ══ TASKS TAB ══ */}
      <AnimatePresence mode="wait">
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {/* Progress bar */}
            {totalCount > 0 && (
              <ProgressBar done={completedCount} total={totalCount} />
            )}

            {/* Task list */}
            {filteredTasks.length === 0 ? (
              <EmptyState isTask={true} onAdd={() => setShowAddTask(true)} />
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {(['urgent','high','medium','low']).map(priority => {
                    const items = grouped[priority] ?? []
                    if (!items.length) return null
                    return (
                      <PriorityGroup
                        key={priority}
                        priority={priority}
                        tasks={items}
                        onToggle={completeTask}
                        onEdit={() => {/* TODO: open edit modal */}}
                      />
                    )
                  })}
                </SortableContext>
              </DndContext>
            )}
          </motion.div>
        )}

        {/* ══ ROUTINES TAB ══ */}
        {activeTab === 'routines' && (
          <motion.div
            key="routines"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
          >
            {/* Routines progress */}
            {visibleRoutines.length > 0 && (
              <ProgressBar
                done={visibleRoutines.filter(r => completedToday.has(r.id)).length}
                total={visibleRoutines.length}
              />
            )}

            {routinesLoading && routines.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 58, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : visibleRoutines.length === 0 ? (
              <EmptyState isTask={false} onAdd={() => setShowAddRoutine(true)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {visibleRoutines.map(routine => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isCompleted={completedToday.has(routine.id)}
                      streak={0}
                      onToggle={todaySelected ? toggleCompletion : undefined}
                      onEdit={r => { setEditRoutine(r); setShowAddRoutine(true) }}
                      onDelete={handleDeleteRoutine}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            onAdd={handleAddTask}
            onClose={() => setShowAddTask(false)}
          />
        )}
      </AnimatePresence>

      <RoutineModal
        open={showAddRoutine}
        onClose={() => { setShowAddRoutine(false); setEditRoutine(null) }}
        onSave={handleSaveRoutine}
        initial={editRoutine}
      />
    </div>
  )
}