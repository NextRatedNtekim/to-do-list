import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Search, X, ChevronDown, Download, Trash2 } from 'lucide-react'
import { useTaskStore } from '@/store'
import { useTaskActions, useFilteredTasks } from '@/hooks'
import { TaskItem } from '@/components/tasks/TaskItem'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { EmptyState } from '@/components/ui/EmptyState'

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
  const { completeTask, addTask, deleteTask, updateTask }  = useTaskActions()
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

  function exportTasks() {
    if (!tasks.length) return
    const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }))
    a.download = 'taskr-export.txt'; a.click(); URL.revokeObjectURL(a.href)
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

      {/* Filter chips — horizontal scroll on mobile */}
      <div style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }} className="scrollbar-none">
        <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <motion.button
                key={f.key}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
                onClick={() => setFilter(f.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 13px', borderRadius: 'var(--radius-full)',
                  fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand)' : 'var(--bg-surface)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all .14s', whiteSpace: 'nowrap',
                }}
              >
                {f.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : f.dot }} />}
                {f.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Search + sort row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Search tasks, tags..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-base" style={{ paddingLeft: 36, paddingRight: search ? 36 : 14 }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface-3)', border: 'none', cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
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
          { label: 'Clear completed', Icon: Trash2, action: clearCompleted, danger: false },
          { label: 'Export',          Icon: Download, action: exportTasks,    danger: false },
          { label: 'Clear all',       Icon: Trash2, action: () => { if (window.confirm('Delete all tasks?')) clearAll() }, danger: true },
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
