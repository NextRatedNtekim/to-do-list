// /**
//  * components/routines/RoutineModal.jsx
//  * Bottom sheet for creating and editing routines.
//  * Controlled by parent — receives open/onClose/onSave props.
//  *
//  * Props:
//  *   open      - boolean
//  *   onClose   - () => void
//  *   onSave    - (fields) => Promise<void>
//  *   initial   - Routine | null  (null = create mode)
//  */

// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// const ICONS = ['🔄','🏃','📚','✍️','🧘','💪','🎯','🌙','☀️','💧','🥗','🎵','🧹','📝','🛌','🚴','🏊','🧠','💊','🌿']
// const COLORS = [
//   { hex: '#22c55e', label: 'Green'  },
//   { hex: '#60a5fa', label: 'Blue'   },
//   { hex: '#f87171', label: 'Red'    },
//   { hex: '#fb923c', label: 'Orange' },
//   { hex: '#fbbf24', label: 'Yellow' },
//   { hex: '#a78bfa', label: 'Purple' },
//   { hex: '#34d399', label: 'Teal'   },
//   { hex: '#f472b6', label: 'Pink'   },
// ]
// const FREQUENCIES = [
//   { value: 'daily',   label: 'Every day' },
//   { value: 'weekly',  label: 'Days of week' },
//   { value: 'monthly', label: 'Monthly' },
// ]
// const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// const DEFAULT_FORM = {
//   title:        '',
//   description:  '',
//   icon:         '🔄',
//   color:        '#22c55e',
//   frequency:    'daily',
//   days_of_week: [],
//   time_of_day:  '',
// }

// export function RoutineModal({ open, onClose, onSave, initial = null }) {
//   const isEdit = !!initial
//   const [form,    setForm]    = useState(DEFAULT_FORM)
//   const [saving,  setSaving]  = useState(false)
//   const [error,   setError]   = useState(null)
//   const [section, setSection] = useState('basics') // 'basics' | 'schedule'

//   // Populate form when editing
//   useEffect(() => {
//     if (open) {
//       setForm(initial
//         ? {
//             title:        initial.title        ?? '',
//             description:  initial.description  ?? '',
//             icon:         initial.icon         ?? '🔄',
//             color:        initial.color        ?? '#22c55e',
//             frequency:    initial.frequency    ?? 'daily',
//             days_of_week: initial.days_of_week ?? [],
//             time_of_day:  initial.time_of_day  ?? '',
//           }
//         : DEFAULT_FORM
//       )
//       setError(null)
//       setSection('basics')
//     }
//   }, [open, initial])

//   function set(key, val) {
//     setForm(f => ({ ...f, [key]: val }))
//   }

//   function toggleDay(index) {
//     setForm(f => {
//       const next = f.days_of_week.includes(index)
//         ? f.days_of_week.filter(d => d !== index)
//         : [...f.days_of_week, index]
//       return { ...f, days_of_week: next }
//     })
//   }

//   async function handleSave() {
//     if (!form.title.trim()) { setError('Please add a title.'); return }
//     setSaving(true)
//     setError(null)
//     try {
//       await onSave({
//         ...form,
//         title:       form.title.trim(),
//         description: form.description.trim() || null,
//         time_of_day: form.time_of_day || null,
//       })
//       onClose()
//     } catch (err) {
//       setError(err.message ?? 'Something went wrong.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             className="fixed inset-0 z-40"
//             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           {/* Sheet */}
//           <motion.div
//             className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
//             style={{
//               background:  'var(--bg-elevated)',
//               borderTop:   '1px solid var(--glass-border)',
//               maxHeight:   '92vh',
//               overflowY:   'auto',
//             }}
//             initial={{ y: '100%' }}
//             animate={{ y: 0 }}
//             exit={{ y: '100%' }}
//             transition={{ type: 'spring', stiffness: 280, damping: 30 }}
//           >
//             {/* Handle */}
//             <div className="flex justify-center pt-3 pb-1">
//               <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
//             </div>

//             {/* Header */}
//             <div className="flex items-center justify-between px-5 py-3">
//               <button onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
//                 Cancel
//               </button>
//               <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
//                 {isEdit ? 'Edit Routine' : 'New Routine'}
//               </h2>
//               <button
//                 onClick={handleSave}
//                 disabled={saving || !form.title.trim()}
//                 className="text-sm font-bold transition-opacity"
//                 style={{
//                   color:   '#22c55e',
//                   opacity: saving || !form.title.trim() ? 0.4 : 1,
//                 }}
//               >
//                 {saving ? 'Saving…' : 'Save'}
//               </button>
//             </div>

//             {/* Segment tabs */}
//             <div className="px-5 mb-4">
//               <div
//                 className="flex gap-1 p-1 rounded-xl"
//                 style={{ background: 'rgba(255,255,255,0.06)' }}
//               >
//                 {[['basics','Details'],['schedule','Schedule']].map(([key, label]) => (
//                   <button
//                     key={key}
//                     onClick={() => setSection(key)}
//                     className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
//                     style={{
//                       background: section === key ? '#22c55e' : 'transparent',
//                       color:      section === key ? 'white' : 'var(--text-secondary)',
//                     }}
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="px-5 pb-10">

//               {/* ── BASICS TAB ─────────────────────────────────── */}
//               {section === 'basics' && (
//                 <div className="space-y-5">
//                   {/* Icon + Title row */}
//                   <div className="flex gap-3 items-start">
//                     {/* Icon picker */}
//                     <div>
//                       <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                         ICON
//                       </label>
//                       <div
//                         className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl cursor-pointer"
//                         style={{
//                           background: `${form.color}22`,
//                           border: `2px solid ${form.color}44`,
//                         }}
//                         onClick={() => {
//                           const idx  = ICONS.indexOf(form.icon)
//                           const next = ICONS[(idx + 1) % ICONS.length]
//                           set('icon', next)
//                         }}
//                         title="Tap to cycle icons"
//                       >
//                         {form.icon}
//                       </div>
//                     </div>

//                     {/* Title */}
//                     <div className="flex-1">
//                       <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                         TITLE *
//                       </label>
//                       <input
//                         type="text"
//                         value={form.title}
//                         onChange={e => set('title', e.target.value)}
//                         placeholder="e.g. Morning Exercise"
//                         maxLength={60}
//                         className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
//                         style={{
//                           background:   'rgba(255,255,255,0.07)',
//                           border:       '1px solid rgba(255,255,255,0.1)',
//                           color:        'var(--text-primary)',
//                           caretColor:   '#22c55e',
//                         }}
//                         onFocus={e => e.target.style.borderColor = '#22c55e44'}
//                         onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
//                       />
//                     </div>
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                       DESCRIPTION
//                     </label>
//                     <textarea
//                       value={form.description}
//                       onChange={e => set('description', e.target.value)}
//                       placeholder="Optional note about this routine…"
//                       rows={2}
//                       maxLength={200}
//                       className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
//                       style={{
//                         background: 'rgba(255,255,255,0.07)',
//                         border:     '1px solid rgba(255,255,255,0.1)',
//                         color:      'var(--text-primary)',
//                         caretColor: '#22c55e',
//                       }}
//                       onFocus={e => e.target.style.borderColor = '#22c55e44'}
//                       onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
//                     />
//                   </div>

//                   {/* Color */}
//                   <div>
//                     <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                       COLOR
//                     </label>
//                     <div className="flex gap-2 flex-wrap">
//                       {COLORS.map(c => (
//                         <button
//                           key={c.hex}
//                           onClick={() => set('color', c.hex)}
//                           className="w-8 h-8 rounded-full transition-all"
//                           style={{
//                             background: c.hex,
//                             outline:    form.color === c.hex ? `3px solid ${c.hex}` : 'none',
//                             outlineOffset: '2px',
//                             transform:  form.color === c.hex ? 'scale(1.15)' : 'scale(1)',
//                           }}
//                           title={c.label}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   {/* Icon grid */}
//                   <div>
//                     <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                       ICON
//                     </label>
//                     <div className="flex flex-wrap gap-2">
//                       {ICONS.map(ic => (
//                         <button
//                           key={ic}
//                           onClick={() => set('icon', ic)}
//                           className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
//                           style={{
//                             background: form.icon === ic ? `${form.color}22` : 'rgba(255,255,255,0.05)',
//                             border:     form.icon === ic ? `2px solid ${form.color}66` : '1px solid rgba(255,255,255,0.07)',
//                             transform:  form.icon === ic ? 'scale(1.1)' : 'scale(1)',
//                           }}
//                         >
//                           {ic}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* ── SCHEDULE TAB ───────────────────────────────── */}
//               {section === 'schedule' && (
//                 <div className="space-y-5">
//                   {/* Frequency */}
//                   <div>
//                     <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                       FREQUENCY
//                     </label>
//                     <div className="space-y-2">
//                       {FREQUENCIES.map(f => (
//                         <button
//                           key={f.value}
//                           onClick={() => set('frequency', f.value)}
//                           className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
//                           style={{
//                             background: form.frequency === f.value
//                               ? `${form.color}18`
//                               : 'rgba(255,255,255,0.05)',
//                             border: form.frequency === f.value
//                               ? `1px solid ${form.color}40`
//                               : '1px solid rgba(255,255,255,0.08)',
//                           }}
//                         >
//                           {/* Radio dot */}
//                           <div
//                             className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
//                             style={{
//                               borderColor: form.frequency === f.value ? form.color : 'rgba(255,255,255,0.2)',
//                             }}
//                           >
//                             {form.frequency === f.value && (
//                               <div className="w-2 h-2 rounded-full" style={{ background: form.color }} />
//                             )}
//                           </div>
//                           <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
//                             {f.label}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Days of week (weekly only) */}
//                   {form.frequency === 'weekly' && (
//                     <div>
//                       <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                         DAYS
//                       </label>
//                       <div className="flex gap-1.5">
//                         {DAY_LABELS.map((day, i) => (
//                           <button
//                             key={i}
//                             onClick={() => toggleDay(i)}
//                             className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
//                             style={{
//                               background: form.days_of_week.includes(i)
//                                 ? form.color
//                                 : 'rgba(255,255,255,0.06)',
//                               color: form.days_of_week.includes(i)
//                                 ? 'white'
//                                 : 'var(--text-secondary)',
//                               boxShadow: form.days_of_week.includes(i)
//                                 ? `0 4px 12px ${form.color}44`
//                                 : 'none',
//                             }}
//                           >
//                             {day}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Time of day */}
//                   <div>
//                     <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
//                       TIME (OPTIONAL)
//                     </label>
//                     <input
//                       type="time"
//                       value={form.time_of_day}
//                       onChange={e => set('time_of_day', e.target.value)}
//                       className="rounded-xl px-3 py-2.5 text-sm outline-none"
//                       style={{
//                         background:   'rgba(255,255,255,0.07)',
//                         border:       '1px solid rgba(255,255,255,0.1)',
//                         color:        'var(--text-primary)',
//                         colorScheme:  'dark',
//                       }}
//                     />
//                     {form.time_of_day && (
//                       <button
//                         onClick={() => set('time_of_day', '')}
//                         className="ml-2 text-xs"
//                         style={{ color: 'var(--text-tertiary)' }}
//                       >
//                         Clear
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Error */}
//               {error && (
//                 <p className="mt-4 text-xs font-medium" style={{ color: '#f87171' }}>
//                   ⚠️ {error}
//                 </p>
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   )
// }


/**
 * src/components/routines/RoutineModal.jsx
 * Fixed: CSS vars from globals.css, Lucide icons, theme-aware light+dark
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar, RefreshCw } from 'lucide-react'

const ICONS = ['🔄','🏃','📚','✍️','🧘','💪','🎯','🌙','☀️','💧','🥗','🎵','🧹','📝','🛌','🚴','🏊','🧠','💊','🌿']
const COLORS = [
  { hex: '#22c55e', label: 'Green'  },
  { hex: '#60a5fa', label: 'Blue'   },
  { hex: '#f87171', label: 'Red'    },
  { hex: '#fb923c', label: 'Orange' },
  { hex: '#f59e0b', label: 'Yellow' },
  { hex: '#a78bfa', label: 'Purple' },
  { hex: '#34d399', label: 'Teal'   },
  { hex: '#f472b6', label: 'Pink'   },
]
const FREQUENCIES = [
  { value: 'daily',   label: 'Every day'    },
  { value: 'weekly',  label: 'Days of week' },
  { value: 'monthly', label: 'Monthly'      },
]
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const DEFAULT_FORM = {
  title: '', description: '', icon: '🔄',
  color: '#22c55e', frequency: 'daily',
  days_of_week: [], time_of_day: '',
}

export function RoutineModal({ open, onClose, onSave, initial = null }) {
  const isEdit = !!initial
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)
  const [section, setSection] = useState('basics')

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        title:        initial.title        ?? '',
        description:  initial.description  ?? '',
        icon:         initial.icon         ?? '🔄',
        color:        initial.color        ?? '#22c55e',
        frequency:    initial.frequency    ?? 'daily',
        days_of_week: initial.days_of_week ?? [],
        time_of_day:  initial.time_of_day  ?? '',
      } : DEFAULT_FORM)
      setError(null)
      setSection('basics')
    }
  }, [open, initial])

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleDay(i) {
    setForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(i)
        ? f.days_of_week.filter(d => d !== i)
        : [...f.days_of_week, i],
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Please add a title.'); return }
    setSaving(true); setError(null)
    try {
      await onSave({
        ...form,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        time_of_day: form.time_of_day || null,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{ position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            style={{
              position:    'fixed', bottom:0, left:0, right:0,
              zIndex:      401,
              borderRadius:'var(--radius-2xl) var(--radius-2xl) 0 0',
              background:  'var(--bg-surface)',
              border:      '1px solid var(--border)',
              borderBottom:'none',
              maxHeight:   '92vh',
              overflowY:   'auto',
              boxShadow:   'var(--shadow-xl)',
            }}
            className="scrollbar-thin"
            initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
            transition={{ type:'spring', stiffness:280, damping:30 }}
          >
            {/* Handle */}
            <div style={{ display:'flex',justifyContent:'center',paddingTop:12,paddingBottom:4 }}>
              <div style={{ width:40,height:4,borderRadius:99,background:'var(--border-strong)' }} />
            </div>

            {/* Header */}
            <div style={{
              display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'8px 20px 12px',
              position:'sticky',top:0,zIndex:10,
              background:'var(--bg-surface)',
              borderBottom:'1px solid var(--border)',
            }}>
              <button
                onClick={onClose}
                style={{ fontSize:13,fontWeight:600,color:'var(--text-muted)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)' }}
              >
                Cancel
              </button>
              <h2 style={{ margin:0,fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,color:'var(--text-primary)' }}>
                {isEdit ? 'Edit Routine' : 'New Routine'}
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                style={{
                  fontSize:13,fontWeight:700,color:'var(--brand)',background:'none',border:'none',
                  cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
                  opacity: saving || !form.title.trim() ? 0.4 : 1,
                  fontFamily:'var(--font-body)',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>

            {/* Segment tabs */}
            <div style={{ padding:'14px 20px 0' }}>
              <div style={{ display:'flex',gap:4,padding:4,background:'var(--bg-surface-3)',borderRadius:'var(--radius-full)' }}>
                {[['basics','Details'],['schedule','Schedule']].map(([key,label]) => (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    style={{
                      flex:1, padding:'7px 12px',
                      borderRadius:'var(--radius-full)', border:'none', cursor:'pointer',
                      fontFamily:'var(--font-body)', fontSize:13, fontWeight:600,
                      transition:'all 0.18s',
                      background: section===key ? 'var(--brand)' : 'transparent',
                      color:      section===key ? '#fff' : 'var(--text-muted)',
                      boxShadow:  section===key ? 'var(--shadow-brand)' : 'none',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>

            <div style={{ padding:'18px 20px 40px' }}>

              {/* ── BASICS ── */}
              {section === 'basics' && (
                <div style={{ display:'flex',flexDirection:'column',gap:18 }}>

                  {/* Icon + Title */}
                  <div style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
                    <div>
                      <p className="section-label" style={{ marginBottom:6 }}>ICON</p>
                      <div
                        onClick={() => {
                          const idx = ICONS.indexOf(form.icon)
                          setField('icon', ICONS[(idx+1) % ICONS.length])
                        }}
                        style={{
                          width:48,height:48,
                          borderRadius:'var(--radius-md)',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:24,cursor:'pointer',
                          background:`${form.color}18`,
                          border:`2px solid ${form.color}44`,
                        }}
                        title="Tap to cycle"
                      >{form.icon}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <p className="section-label" style={{ marginBottom:6 }}>TITLE *</p>
                      <input
                        type="text"
                        value={form.title}
                        onChange={e => setField('title', e.target.value)}
                        placeholder="e.g. Morning Exercise"
                        maxLength={60}
                        className="input-base"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="section-label" style={{ marginBottom:6 }}>DESCRIPTION</p>
                    <textarea
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="Optional note…"
                      rows={2}
                      maxLength={200}
                      className="input-base"
                      style={{ resize:'none' }}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <p className="section-label" style={{ marginBottom:8 }}>COLOR</p>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                      {COLORS.map(c => (
                        <button
                          key={c.hex}
                          onClick={() => setField('color', c.hex)}
                          title={c.label}
                          style={{
                            width:30,height:30,borderRadius:'50%',
                            background:c.hex,border:'none',cursor:'pointer',
                            outline:    form.color===c.hex ? `3px solid ${c.hex}` : 'none',
                            outlineOffset:'2px',
                            transform:  form.color===c.hex ? 'scale(1.18)' : 'scale(1)',
                            transition: 'transform 0.15s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon grid */}
                  <div>
                    <p className="section-label" style={{ marginBottom:8 }}>ICON</p>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                      {ICONS.map(ic => (
                        <button
                          key={ic}
                          onClick={() => setField('icon', ic)}
                          style={{
                            width:38,height:38,borderRadius:'var(--radius-sm)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:18,cursor:'pointer',
                            background: form.icon===ic ? `${form.color}18` : 'var(--bg-surface-2)',
                            border:     form.icon===ic ? `2px solid ${form.color}55` : '1px solid var(--border)',
                            transform:  form.icon===ic ? 'scale(1.12)' : 'scale(1)',
                            transition: 'transform 0.15s',
                          }}
                        >{ic}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SCHEDULE ── */}
              {section === 'schedule' && (
                <div style={{ display:'flex',flexDirection:'column',gap:18 }}>

                  {/* Frequency */}
                  <div>
                    <p className="section-label" style={{ marginBottom:8 }}>FREQUENCY</p>
                    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                      {FREQUENCIES.map(f => (
                        <button
                          key={f.value}
                          onClick={() => setField('frequency', f.value)}
                          style={{
                            display:'flex',alignItems:'center',gap:12,
                            padding:'11px 14px',borderRadius:'var(--radius-md)',
                            border:`1.5px solid ${form.frequency===f.value ? form.color : 'var(--border)'}`,
                            background: form.frequency===f.value ? `${form.color}10` : 'var(--bg-surface-2)',
                            cursor:'pointer',textAlign:'left',
                            fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,
                            color:'var(--text-primary)',
                            transition:'all 0.15s',
                          }}
                        >
                          <div style={{
                            width:16,height:16,borderRadius:'50%',flexShrink:0,
                            border:`2px solid ${form.frequency===f.value ? form.color : 'var(--border-strong)'}`,
                            display:'flex',alignItems:'center',justifyContent:'center',
                          }}>
                            {form.frequency===f.value && (
                              <div style={{ width:8,height:8,borderRadius:'50%',background:form.color }} />
                            )}
                          </div>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Days (weekly) */}
                  {form.frequency === 'weekly' && (
                    <div>
                      <p className="section-label" style={{ marginBottom:8 }}>DAYS</p>
                      <div style={{ display:'flex',gap:6 }}>
                        {DAY_LABELS.map((day,i) => (
                          <button
                            key={i}
                            onClick={() => toggleDay(i)}
                            style={{
                              flex:1,padding:'8px 2px',
                              borderRadius:'var(--radius-sm)',border:'none',cursor:'pointer',
                              fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,
                              background: form.days_of_week.includes(i) ? form.color : 'var(--bg-surface-2)',
                              color:      form.days_of_week.includes(i) ? '#fff' : 'var(--text-muted)',
                              boxShadow:  form.days_of_week.includes(i) ? 'var(--shadow-brand)' : 'none',
                              transition: 'all 0.15s',
                            }}
                          >{day}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  <div>
                    <p className="section-label" style={{ marginBottom:8, display:'flex',alignItems:'center',gap:5 }}>
                      <Clock size={11} /> TIME (OPTIONAL)
                    </p>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <input
                        type="time"
                        value={form.time_of_day}
                        onChange={e => setField('time_of_day', e.target.value)}
                        className="input-base"
                        style={{ width:'auto',colorScheme:'light dark' }}
                      />
                      {form.time_of_day && (
                        <button
                          onClick={() => setField('time_of_day', '')}
                          className="btn btn-ghost btn-sm"
                        >Clear</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p style={{ marginTop:14,fontSize:12,fontWeight:600,color:'var(--priority-urgent)',fontFamily:'var(--font-body)' }}>
                  ⚠️ {error}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}