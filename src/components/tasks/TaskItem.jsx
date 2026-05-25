import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit2, Trash2, MoreVertical, Calendar, Tag, ChevronDown, ChevronUp, GripVertical, Check, Clock, Repeat, Save, X, Flag } from 'lucide-react'
import { PRIORITY_COLOR, PRIORITY_LABEL, PRIORITY_XP, formatDate, isOverdue } from '@/utils/constants'

export function TaskItem({ task, onToggle, onDelete, onUpdate, editingId, onStartEdit, onSaveEdit, onCancelEdit }) {
  const isEditing = editingId === task.id
  const editRef   = useRef(null)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [subtasksOpen, setSubtasksOpen] = useState(false)
  const menuRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const overdue   = isOverdue(task.dueDate) && !task.done
  const pColor    = PRIORITY_COLOR[task.priority] || '#22c55e'
  const xp        = PRIORITY_XP[task.priority] || 10
  const totalSubs = task.subtasks?.length || 0
  const doneSubs  = task.subtasks?.filter(s => s.done).length || 0

  function handleKeyDown(e) {
    if (e.key === 'Enter')  onSaveEdit(task.id, editRef.current?.value)
    if (e.key === 'Escape') onCancelEdit()
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 999 : 'auto' }}
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: 'clamp(11px,2vw,14px) clamp(14px,3vw,20px)',
          borderBottom: '1px solid var(--border)',
          background: task.done ? 'transparent' : 'var(--bg-surface)',
          position: 'relative', transition: 'background 0.12s',
          opacity: task.done ? 0.6 : 1,
        }}
        onMouseEnter={e => { if (!task.done) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
        onMouseLeave={e => e.currentTarget.style.background = task.done ? 'transparent' : 'var(--bg-surface)'}
      >
        {/* Priority stripe */}
        {!task.done && (
          <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: '0 3px 3px 0', background: pColor }} />
        )}

        {/* Drag handle */}
        <button {...attributes} {...listeners} style={{ background: 'none', border: 'none', cursor: 'grab', color: 'var(--text-faint)', padding: '2px 0', flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 2, touchAction: 'none' }} aria-label="Drag">
          <GripVertical size={14} />
        </button>

        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.72 }} whileHover={{ scale: 1.12 }}
          onClick={e => onToggle(task.id, e)} aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
          style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: '50%', marginTop: 1,
            border: task.done ? 'none' : `2px solid var(--border-muted)`,
            background: task.done ? 'var(--brand)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', outline: 'none', transition: 'all 0.18s',
          }}
        >
          <AnimatePresence>
            {task.done && (
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <Check size={12} color="white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input ref={editRef} defaultValue={task.text} onKeyDown={handleKeyDown} autoFocus
              style={{ width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1.5px solid var(--brand)', background: 'var(--brand-glow)', padding: '6px 10px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)' }}
            />
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: task.done ? 400 : 600, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.text}
              </p>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: pColor, background: `${pColor}14`, borderRadius: 6, padding: '2px 6px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: pColor }} />{PRIORITY_LABEL[task.priority]}
                </span>
                {!task.done && <span className="badge badge-gold" style={{ fontSize: 10, padding: '2px 6px' }}>+{xp} XP</span>}
                {task.dueDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)', fontWeight: overdue ? 700 : 400 }}>
                    <Calendar size={10} />{overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                  </span>
                )}
                {task.recurring && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#3b82f6' }}><Repeat size={10} />{task.recurring}</span>}
                {task.tags?.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-surface-3)', borderRadius: 6, padding: '2px 6px' }}>
                    <Tag size={8} />{tag}
                  </span>
                ))}
                {totalSubs > 0 && (
                  <button onClick={() => setSubtasksOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', padding: 0 }}>
                    <Check size={10} />{doneSubs}/{totalSubs}{subtasksOpen ? <ChevronUp size={9}/> : <ChevronDown size={9}/>}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {subtasksOpen && totalSubs > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', marginTop: 8 }}>
                    {task.subtasks.map(sub => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13, color: sub.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: sub.done ? 'line-through' : 'none' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: sub.done ? 'none' : '1.5px solid var(--border-muted)', background: sub.done ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {sub.done && <Check size={8} color="white" />}
                        </div>
                        {sub.text}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {isEditing ? (
            <>
              <ActionBtn title="Save"   Icon={Save}  color="var(--brand)"      onClick={() => onSaveEdit(task.id, editRef.current?.value)} />
              <ActionBtn title="Cancel" Icon={X}     color="var(--text-muted)" onClick={onCancelEdit} />
            </>
          ) : (
            <>
              <ActionBtn title="Edit" Icon={Edit2} color="var(--brand)" onClick={() => onStartEdit(task.id)} />
              <div ref={menuRef} style={{ position: 'relative' }}>
                <ActionBtn title="More" Icon={MoreVertical} color="var(--text-muted)" onClick={() => setMenuOpen(o => !o)} />
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: -4 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                      onMouseLeave={() => setMenuOpen(false)}
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}
                    >
                      {[
                        { label: 'Edit task',   Icon: Edit2,  color: 'var(--text-primary)', action: () => { onStartEdit(task.id); setMenuOpen(false) } },
                        { label: 'Delete task', Icon: Trash2, color: '#f43f5e',             action: () => { onDelete(task.id);    setMenuOpen(false) } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action}
                          style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: 13, color: item.color, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, transition: 'background .1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <item.Icon size={12} /> {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ActionBtn({ title, Icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.12, background: 'var(--bg-surface-3)' }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick} title={title}
      style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', transition: 'background 0.12s, color 0.12s' }}
    >
      <Icon size={13} />
    </motion.button>
  )
}
