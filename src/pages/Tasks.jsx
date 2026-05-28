import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Search, X, ChevronDown, Download, Trash2 } from 'lucide-react'
import { useTaskStore, useUIStore } from '@/store'
import { useAuthStore } from '@/store/authStore'
import { useTaskActions, useFilteredTasks } from '@/hooks'
import { TaskItem } from '@/components/tasks/TaskItem'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { deleteCompletedTasks, deleteAllTasks } from '@/services/taskService'

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'done',     label: 'Done' },
  { key: 'today',    label: '📅 Today' },
  { key: 'overdue',  label: '⚠️ Overdue' },
  { key: 'urgent',   label: 'Urgent',  dot: '#ef4444' },
  { key: 'high',     label: 'High',    dot: '#f43f5e' },
  { key: 'medium',   label: 'Medium',  dot: '#f59e0b' },
  { key: 'low',      label: 'Low',     dot: '#22c55e' },
]
const SORTS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'oldest',   label: 'Oldest' },
  { value: 'priority', label: 'Priority' },
  { value: 'alpha',    label: 'A → Z' },
  { value: 'dueDate',  label: 'Due date' },
]

export function TasksPage() {
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [sortMode,  setSortMode]  = useState('newest')
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { tasks, reorderTasks, clearCompleted, clearAll } = useTaskStore()
  const { showToast }                = useUIStore()
  const { user }                     = useAuthStore()
  const { completeTask, addTask, deleteTask, updateTask } = useTaskActions()
  const getFiltered = useFilteredTasks(filter, search, sortMode)
  const visible     = useMemo(() => getFiltered(), [getFiltered])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oi = tasks.findIndex(t => t.id === active.id)
    const ni = tasks.findIndex(t => t.id === over.id)
    reorderTasks(arrayMove(tasks, oi, ni))
  }

  function handleSaveEdit(id, val) {
    const t = val?.trim(); if (!t) return
    updateTask(id, { text: t }); setEditingId(null)
  }

  // Clear completed — local + Supabase
  async function handleClearCompleted() {
    const count = tasks.filter(t => t.done).length
    if (!count) { showToast('No completed tasks to clear', 'info'); return }
    clearCompleted()
    showToast(`Cleared ${count} task${count !== 1 ? 's' : ''}`, 'success')
    if (user?.id) {
      deleteCompletedTasks(user.id).catch(err => console.error('[Taskr] Clear completed error:', err))
    }
  }

  // Clear all — local + Supabase
  async function handleClearAll() {
    if (!tasks.length) { showToast('No tasks to clear', 'info'); return }
    if (!window.confirm('Delete ALL tasks permanently?')) return
    clearAll()
    showToast('All tasks cleared', 'info')
    if (user?.id) {
      deleteAllTasks(user.id).catch(err => console.error('[Taskr] Clear all error:', err))
    }
  }

  function exportTasks() {
    if (!tasks.length) { showToast('No tasks to export', 'info'); return }
    const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }))
    a.download = 'taskr-export.txt'; a.click(); URL.revokeObjectURL(a.href)
    showToast('Exported!', 'success')
  }

  const total = tasks.length
  const done  = tasks.filter(t => t.done).length
  const pct   = total ? Math.round(done / total * 100) : 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(16px,2.5vw,24px)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{done}/{total} completed · {pct}% done</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} strokeWidth={2.5} /> New Task
        </motion.button>
      </div>

      {/* Filter chips */}
      <div style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }} className="scrollbar-none">
        <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <motion.button key={f.key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
                onClick={() => setFilter(f.key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`, background: active ? 'var(--brand)' : 'var(--bg-surface)', color: active ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .14s', whiteSpace: 'nowrap' }}
              >
                {f.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : f.dot }} />}
                {f.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search tasks, tags..." value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: 36, paddingRight: search ? 36 : 14 }} />
          <AnimatePresence>
            {search && (
              <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface-3)', border: 'none', cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <X size={10} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="input-base" style={{ appearance: 'none', paddingRight: 28, cursor: 'pointer', width: 'auto', minWidth: 110 }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Task list */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 16px', borderBottom: visible.length ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="section-label">Tasks</span>
            <motion.span key={visible.length} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="badge badge-brand">
              {visible.length}
            </motion.span>
          </div>
          {total > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{done}</span> / {total} done
            </div>
          )}
        </div>

        <div className="scrollbar-thin" style={{ maxHeight: 'clamp(300px, 52vh, 560px)', overflowY: 'auto' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visible.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {visible.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <EmptyState hasFilter={!!(search || filter !== 'all')} onAddTask={() => setShowModal(true)} />
                  </motion.div>
                ) : visible.map(task => (
                  <TaskItem
                    key={task.id} task={task} editingId={editingId}
                    onToggle={completeTask} onDelete={deleteTask}
                    onUpdate={updateTask} onStartEdit={setEditingId}
                    onSaveEdit={handleSaveEdit} onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'Clear completed', Icon: Trash2, action: handleClearCompleted, danger: false },
          { label: 'Export',          Icon: Download, action: exportTasks,           danger: false },
          { label: 'Clear all',       Icon: Trash2, action: handleClearAll,          danger: true },
        ].map(({ label, Icon, action, danger }) => (
          <button key={label} onClick={action} className="btn btn-ghost btn-sm"
            style={{ color: danger ? '#f43f5e' : 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = danger ? '#ef4444' : 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = danger ? '#f43f5e' : 'var(--text-muted)'}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}


// import { useState, useMemo } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   DndContext, closestCenter, KeyboardSensor, PointerSensor,
//   useSensor, useSensors,
// } from '@dnd-kit/core'
// import {
//   SortableContext, sortableKeyboardCoordinates,
//   verticalListSortingStrategy, arrayMove,
// } from '@dnd-kit/sortable'
// import {
//   Plus, Search, X, ChevronDown, Download, Trash2,
//   Bell, Clock, CheckCircle2, Circle, AlertCircle,
//   ChevronRight,
// } from 'lucide-react'
// import { useTaskStore, useUIStore } from '@/store'
// import { useAuthStore } from '@/store/authStore'
// import { useTaskActions, useFilteredTasks } from '@/hooks'
// import { TaskItem } from '@/components/tasks/TaskItem'
// import { AddTaskModal } from '@/components/tasks/AddTaskModal'
// import { EmptyState } from '@/components/ui/EmptyState'
// import { deleteCompletedTasks, deleteAllTasks } from '@/services/taskService'

// /* ─── constants ─────────────────────────────────────────────── */
// const STATUS_FILTERS = [
//   { key: 'all',     label: 'All' },
//   { key: 'active',  label: 'To do' },
//   { key: 'done',    label: 'Completed' },
//   { key: 'overdue', label: '⚠️ Overdue' },
// ]
// const PRIORITY_FILTERS = [
//   { key: 'urgent', label: 'Urgent',  dot: '#ef4444' },
//   { key: 'high',   label: 'High',    dot: '#f43f5e' },
//   { key: 'medium', label: 'Medium',  dot: '#f59e0b' },
//   { key: 'low',    label: 'Low',     dot: '#22c55e' },
// ]
// const SORTS = [
//   { value: 'newest',   label: 'Newest' },
//   { value: 'oldest',   label: 'Oldest' },
//   { value: 'priority', label: 'Priority' },
//   { value: 'alpha',    label: 'A → Z' },
//   { value: 'dueDate',  label: 'Due date' },
// ]

// /* Map priority → status chip styles */
// const STATUS_STYLE = {
//   done:    { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e',  label: 'Done'        },
//   urgent:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444',  label: 'Urgent'      },
//   high:    { bg: 'rgba(244,63,94,0.12)',  color: '#f43f5e',  label: 'High'        },
//   medium:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b',  label: 'In Progress' },
//   low:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e',  label: 'To-do'       },
// }

// /* ─── Date strip ────────────────────────────────────────────── */
// function DateStrip({ selected, onSelect }) {
//   const days = useMemo(() => {
//     const arr = []
//     const today = new Date()
//     for (let i = -2; i <= 4; i++) {
//       const d = new Date(today)
//       d.setDate(today.getDate() + i)
//       arr.push(d)
//     }
//     return arr
//   }, [])

//   const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
//   const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

//   return (
//     <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-none">
//       {days.map((d, i) => {
//         const dateStr = d.toDateString()
//         const active  = selected === dateStr
//         const isToday = d.toDateString() === new Date().toDateString()
//         return (
//           <motion.button key={i} whileTap={{ scale: 0.93 }}
//             onClick={() => onSelect(active ? null : dateStr)}
//             style={{
//               flexShrink:    0,
//               display:       'flex',
//               flexDirection: 'column',
//               alignItems:    'center',
//               gap:           4,
//               padding:       '9px 12px',
//               borderRadius:  'var(--radius-md)',
//               border:        active ? 'none' : '1.5px solid var(--border)',
//               background:    active ? 'var(--brand)' : 'var(--bg-surface)',
//               color:         active ? '#fff' : 'var(--text-muted)',
//               cursor:        'pointer',
//               minWidth:      54,
//               transition:    'all .15s',
//             }}
//           >
//             <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
//               {MONTH_NAMES[d.getMonth()]}
//             </span>
//             <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
//               {d.getDate()}
//             </span>
//             <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75 }}>
//               {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
//             </span>
//           </motion.button>
//         )
//       })}
//     </div>
//   )
// }

// /* ─── Card-style task row ───────────────────────────────────── */
// function TaskCard({ task, onToggle, onDelete }) {
//   const status  = task.done ? STATUS_STYLE.done : (STATUS_STYLE[task.priority] || STATUS_STYLE.low)
//   const timeStr = task.dueDate
//     ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     : null

//   /* Derive group label from priority */
//   const groupLabel = task.priority
//     ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`
//     : 'General task'

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -8, scale: 0.97 }}
//       whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
//       className="card"
//       style={{ padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
//     >
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//             {groupLabel}
//           </p>
//           <p style={{
//             margin: 0,
//             fontSize: 15,
//             fontWeight: 700,
//             color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
//             textDecoration: task.done ? 'line-through' : 'none',
//             fontFamily: 'var(--font-display)',
//             lineHeight: 1.3,
//           }}>
//             {task.text}
//           </p>
//           {timeStr && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
//               <Clock size={12} color="var(--text-muted)" />
//               <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{timeStr}</span>
//             </div>
//           )}
//         </div>
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
//           {/* Priority icon */}
//           <div style={{ width: 32, height: 32, borderRadius: 10, background: `${status.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             {task.done
//               ? <CheckCircle2 size={16} color={status.color} />
//               : task.priority === 'urgent' || task.priority === 'high'
//                 ? <AlertCircle size={16} color={status.color} />
//                 : <Circle size={16} color={status.color} />}
//           </div>
//           {/* Status chip */}
//           <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--radius-full)', background: status.bg, color: status.color }}>
//             {status.label}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// /* ─── TasksPage ─────────────────────────────────────────────── */
// export function TasksPage() {
//   const [filter,      setFilter]      = useState('all')
//   const [search,      setSearch]      = useState('')
//   const [sortMode,    setSortMode]    = useState('newest')
//   const [editingId,   setEditingId]   = useState(null)
//   const [showModal,   setShowModal]   = useState(false)
//   const [selectedDay, setSelectedDay] = useState(null)

//   const { tasks, reorderTasks, clearCompleted, clearAll } = useTaskStore()
//   const { showToast }  = useUIStore()
//   const { user }       = useAuthStore()
//   const { completeTask, addTask, deleteTask, updateTask } = useTaskActions()
//   const getFiltered    = useFilteredTasks(filter, search, sortMode)
//   const visible        = useMemo(() => {
//     const base = getFiltered()
//     if (!selectedDay) return base
//     return base.filter(t => {
//       if (!t.dueDate) return false
//       return new Date(t.dueDate).toDateString() === selectedDay
//     })
//   }, [getFiltered, selectedDay])

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   )

//   function handleDragEnd({ active, over }) {
//     if (!over || active.id === over.id) return
//     const oi = tasks.findIndex(t => t.id === active.id)
//     const ni = tasks.findIndex(t => t.id === over.id)
//     reorderTasks(arrayMove(tasks, oi, ni))
//   }

//   function handleSaveEdit(id, val) {
//     const t = val?.trim(); if (!t) return
//     updateTask(id, { text: t }); setEditingId(null)
//   }

//   async function handleClearCompleted() {
//     const count = tasks.filter(t => t.done).length
//     if (!count) { showToast('No completed tasks to clear', 'info'); return }
//     clearCompleted()
//     showToast(`Cleared ${count} task${count !== 1 ? 's' : ''}`, 'success')
//     if (user?.id) deleteCompletedTasks(user.id).catch(console.error)
//   }

//   async function handleClearAll() {
//     if (!tasks.length) { showToast('No tasks to clear', 'info'); return }
//     if (!window.confirm('Delete ALL tasks permanently?')) return
//     clearAll()
//     showToast('All tasks cleared', 'info')
//     if (user?.id) deleteAllTasks(user.id).catch(console.error)
//   }

//   function exportTasks() {
//     if (!tasks.length) { showToast('No tasks to export', 'info'); return }
//     const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n')
//     const a = document.createElement('a')
//     a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }))
//     a.download = 'taskr-export.txt'; a.click(); URL.revokeObjectURL(a.href)
//     showToast('Exported!', 'success')
//   }

//   const total = tasks.length
//   const done  = tasks.filter(t => t.done).length

//   /* All-filters list (status + priority combined) */
//   const ALL_FILTERS = [...STATUS_FILTERS, ...PRIORITY_FILTERS]

//   return (
//     <div style={{ maxWidth: 680, margin: '0 auto' }}>

//       {/* ── Header ── */}
//       <motion.div
//         initial={{ opacity: 0, y: 14 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.35 }}
//         style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <button className="btn-icon" aria-label="Back">
//             <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
//           </button>
//           <h1 className="page-title" style={{ fontSize: 'clamp(18px,3.5vw,24px)' }}>Today's Tasks</h1>
//         </div>
//         <button className="btn-icon" aria-label="Notifications">
//           <Bell size={20} />
//         </button>
//       </motion.div>

//       {/* ── Date strip ── */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.35, delay: 0.06 }}
//         style={{ marginBottom: 18 }}
//       >
//         <DateStrip selected={selectedDay} onSelect={setSelectedDay} />
//       </motion.div>

//       {/* ── Status filter chips ── */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}
//         className="scrollbar-none"
//       >
//         <div style={{ display: 'flex', gap: 7, width: 'max-content' }}>
//           {ALL_FILTERS.map(f => {
//             const active = filter === f.key
//             return (
//               <motion.button key={f.key} whileTap={{ scale: 0.92 }}
//                 onClick={() => setFilter(f.key)}
//                 style={{
//                   display:        'inline-flex',
//                   alignItems:     'center',
//                   gap:            5,
//                   padding:        '7px 15px',
//                   borderRadius:   'var(--radius-full)',
//                   fontSize:       13,
//                   fontWeight:     700,
//                   border:         `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
//                   background:     active ? 'var(--brand)' : 'var(--bg-surface)',
//                   color:          active ? '#fff' : 'var(--text-secondary)',
//                   cursor:         'pointer',
//                   fontFamily:     'var(--font-body)',
//                   transition:     'all .14s',
//                   whiteSpace:     'nowrap',
//                 }}
//               >
//                 {f.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.75)' : f.dot, flexShrink: 0 }} />}
//                 {f.label}
//               </motion.button>
//             )
//           })}
//         </div>
//       </motion.div>

//       {/* ── Search + sort ── */}
//       <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
//         <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
//           <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
//           <input
//             type="text" placeholder="Search tasks…"
//             value={search} onChange={e => setSearch(e.target.value)}
//             className="input-base" style={{ paddingLeft: 36, paddingRight: search ? 36 : 14 }}
//           />
//           <AnimatePresence>
//             {search && (
//               <motion.button
//                 initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
//                 onClick={() => setSearch('')}
//                 style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface-3)', border: 'none', cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
//               >
//                 <X size={10} />
//               </motion.button>
//             )}
//           </AnimatePresence>
//         </div>
//         <div style={{ position: 'relative', flexShrink: 0 }}>
//           <select value={sortMode} onChange={e => setSortMode(e.target.value)}
//             className="input-base" style={{ appearance: 'none', paddingRight: 28, cursor: 'pointer', width: 'auto', minWidth: 110 }}>
//             {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
//           </select>
//           <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
//         </div>
//       </div>

//       {/* ── Task counter row ── */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <span className="section-label">Tasks</span>
//           <motion.span key={visible.length} initial={{ scale: 0.7 }} animate={{ scale: 1 }}
//             className="badge badge-brand">{visible.length}</motion.span>
//         </div>
//         <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//           <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{done}</span> / {total} done
//         </div>
//       </div>

//       {/* ── Task cards ── */}
//       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext items={visible.map(t => t.id)} strategy={verticalListSortingStrategy}>
//           <AnimatePresence mode="popLayout">
//             {visible.length === 0 ? (
//               <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <EmptyState hasFilter={!!(search || filter !== 'all' || selectedDay)} onAddTask={() => setShowModal(true)} />
//               </motion.div>
//             ) : visible.map(task => (
//               <TaskCard
//                 key={task.id} task={task}
//                 onToggle={completeTask}
//                 onDelete={deleteTask}
//               />
//             ))}
//           </AnimatePresence>
//         </SortableContext>
//       </DndContext>

//       {/* ── Footer actions ── */}
//       {tasks.length > 0 && (
//         <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingBottom: 16 }}>
//           {[
//             { label: 'Clear completed', Icon: Trash2,    action: handleClearCompleted, danger: false },
//             { label: 'Export',          Icon: Download,  action: exportTasks,           danger: false },
//             { label: 'Clear all',       Icon: Trash2,    action: handleClearAll,        danger: true  },
//           ].map(({ label, Icon, action, danger }) => (
//             <button key={label} onClick={action}
//               className="btn btn-ghost btn-sm"
//               style={{ color: danger ? '#f43f5e' : 'var(--text-muted)' }}
//               onMouseEnter={e => e.currentTarget.style.color = danger ? '#ef4444' : 'var(--text-primary)'}
//               onMouseLeave={e => e.currentTarget.style.color = danger ? '#f43f5e' : 'var(--text-muted)'}
//             >
//               <Icon size={13} /> {label}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ── FAB ── */}
//       <motion.button
//         whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
//         onClick={() => setShowModal(true)}
//         style={{
//           position:       'fixed',
//           bottom:         'calc(72px + env(safe-area-inset-bottom))',
//           right:          20,
//           width:          52,
//           height:         52,
//           borderRadius:   '50%',
//           background:     'var(--brand)',
//           color:          '#fff',
//           border:         'none',
//           cursor:         'pointer',
//           display:        'flex',
//           alignItems:     'center',
//           justifyContent: 'center',
//           boxShadow:      'var(--shadow-brand)',
//           zIndex:         40,
//         }}
//         aria-label="Add task"
//       >
//         <Plus size={22} strokeWidth={2.5} />
//       </motion.button>

//       <AnimatePresence>
//         {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
//       </AnimatePresence>
//     </div>
//   )
// }