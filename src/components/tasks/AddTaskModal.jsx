import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, Tag, ChevronDown, Repeat, Flag } from 'lucide-react'
import { PRIORITY_COLOR, PRIORITY_LABEL, PRIORITY_XP, DEFAULT_CATEGORIES } from '@/utils/constants'

const PRIORITIES  = ['urgent','high','medium','low']
const RECURRENCES = [
  { value: null,     label: 'No repeat' },
  { value: 'daily',  label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly',label: 'Monthly' },
]

export function AddTaskModal({ onAdd, onClose }) {
  const [text,      setText]      = useState('')
  const [priority,  setPriority]  = useState('medium')
  const [dueDate,   setDueDate]   = useState('')
  const [category,  setCategory]  = useState(null)
  const [tags,      setTags]      = useState([])
  const [tagInput,  setTagInput]  = useState('')
  const [recurring, setRecurring] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])

  function handleAdd() {
    const t = text.trim(); if (!t) return
    onAdd({ text: t, priority, dueDate: dueDate ? new Date(dueDate).getTime() : null, category, tags, recurring })
    onClose()
  }

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().replace(',', '')
      if (!tags.includes(tag)) setTags(p => [...p, tag])
      setTagInput('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', padding: 'clamp(18px,4vw,28px)', width: '100%', maxWidth: 520, boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}
        className="scrollbar-thin"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>New Task</h2>
          <button onClick={onClose} className="btn-icon" aria-label="Close"><X size={18} /></button>
        </div>

        {/* Text */}
        <textarea
          ref={inputRef} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
          placeholder="What needs to be done?" rows={2}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'none', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface-2)', padding: '12px 14px', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)', marginBottom: 18, transition: 'border-color .18s' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Priority */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Priority</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
            {PRIORITIES.map(p => (
              <motion.button key={p} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPriority(p)}
                style={{ padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${priority === p ? PRIORITY_COLOR[p] : 'var(--border)'}`, background: priority === p ? `${PRIORITY_COLOR[p]}15` : 'transparent', color: priority === p ? PRIORITY_COLOR[p] : 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3, transition: 'all .14s' }}
              >
                <Flag size={11} />
                {PRIORITY_LABEL[p]}
                {priority === p && <span style={{ fontSize: 9, opacity: 0.8 }}>+{PRIORITY_XP[p]}XP</span>}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Due + Repeat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Due Date</div>
            <div style={{ position: 'relative' }}>
              <Calendar size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-base" style={{ paddingLeft: 30 }} />
            </div>
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Repeat</div>
            <div style={{ position: 'relative' }}>
              <Repeat size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select value={recurring || ''} onChange={e => setRecurring(e.target.value || null)} className="input-base" style={{ paddingLeft: 30, appearance: 'none' }}>
                {RECURRENCES.map(r => <option key={r.value ?? ''} value={r.value ?? ''}>{r.label}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Category</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setCategory(null)} style={{ padding: '5px 11px', borderRadius: 8, border: `1.5px solid ${!category ? 'var(--brand)' : 'var(--border)'}`, background: !category ? 'var(--brand-muted)' : 'transparent', color: !category ? 'var(--brand)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .14s' }}>
              None
            </button>
            {DEFAULT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{ padding: '5px 11px', borderRadius: 8, border: `1.5px solid ${category === cat.id ? cat.color : 'var(--border)'}`, background: category === cat.id ? `${cat.color}18` : 'transparent', color: category === cat.id ? cat.color : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .14s', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 22 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>Tags <span style={{ textTransform: 'none', fontSize: 10, fontWeight: 400, color: 'var(--text-faint)' }}>(Enter or comma)</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg-surface-2)', minHeight: 40, alignItems: 'center', transition: 'border-color .18s' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {tags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-surface-3)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
                <Tag size={9} />{tag}
                <button onClick={() => setTags(t => t.filter(x => x !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}><X size={10} /></button>
              </span>
            ))}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
              placeholder={tags.length ? '' : 'add tag...'}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', minWidth: 80, flex: 1 }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleAdd} disabled={!text.trim()} className="btn btn-primary"
            style={{ flex: 2, opacity: text.trim() ? 1 : 0.5 }}
          >
            <Plus size={16} strokeWidth={2.5} /> Add Task
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
