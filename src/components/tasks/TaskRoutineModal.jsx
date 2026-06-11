/**
 * components/tasks/TaskRoutineModal.jsx
 * ══════════════════════════════════════════════════════════════
 * Unified create / edit bottom-sheet for Tasks AND Routines.
 * User picks type via tab toggle at top.
 * Includes due-date, due-time, alarm toggle, priority, icon.
 *
 * Props:
 *   open         - boolean
 *   onClose      - () => void
 *   onSaveTask   - (fields) => Promise<void>
 *   onSaveRoutine- (fields) => Promise<void>
 *   initialTask  - Task object (edit mode) | null
 *   initialType  - 'task' | 'routine'  (for pre-selecting tab)
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays } from 'date-fns'
import { useAlarm } from '@/hooks/useAlarm'
import { buildDueDateTime } from '@/services/alarmEngine'

// ── Config ───────────────────────────────────────────────────
const PRIORITIES = [
  { value: 'high',   label: 'High',   color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  { value: 'medium', label: 'Medium', color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  { value: 'low',    label: 'Low',    color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
]

const ICONS = ['📌','🎯','💼','📚','🏃','✍️','🧘','💪','🌙','☀️','💧','🎵','🧠','💊','🛒','📞','🔧','🎨','📊','🏠']
const COLORS = ['#22c55e','#60a5fa','#f87171','#fb923c','#fbbf24','#a78bfa','#34d399','#f472b6']

const QUICK_DATES = [
  { label: 'Today',     getValue: () => format(new Date(), 'yyyy-MM-dd') },
  { label: 'Tomorrow',  getValue: () => format(addDays(new Date(), 1), 'yyyy-MM-dd') },
  { label: 'In 3 days', getValue: () => format(addDays(new Date(), 3), 'yyyy-MM-dd') },
  { label: 'Next week', getValue: () => format(addDays(new Date(), 7), 'yyyy-MM-dd') },
]

const FREQUENCIES = [
  { value: 'daily',   label: 'Daily'       },
  { value: 'weekly',  label: 'Days of week' },
  { value: 'monthly', label: 'Monthly'      },
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ── Default forms ─────────────────────────────────────────────
const DEFAULT_TASK = {
  title: '', description: '', priority: 'medium',
  due_date: '', due_time: '', alarm_enabled: false,
  icon: '📌',
}
const DEFAULT_ROUTINE = {
  title: '', description: '', icon: '🔄', color: '#22c55e',
  frequency: 'daily', days_of_week: [], time_of_day: '',
  alarm_enabled: false,
}

// ── Small sub-components ─────────────────────────────────────
function Label({ children }) {
  return (
    <p className="text-xs font-semibold mb-2 tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
      {children}
    </p>
  )
}

function TextInput({ value, onChange, placeholder, maxLength = 80 }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
      style={{
        background:  'rgba(255,255,255,0.07)',
        border:      '1px solid rgba(255,255,255,0.1)',
        color:       'var(--text-primary)',
        caretColor:  '#22c55e',
      }}
      onFocus={e  => (e.target.style.borderColor = 'rgba(34,197,94,0.5)')}
      onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  )
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      maxLength={300}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
      style={{
        background:  'rgba(255,255,255,0.07)',
        border:      '1px solid rgba(255,255,255,0.1)',
        color:       'var(--text-primary)',
        caretColor:  '#22c55e',
      }}
      onFocus={e  => (e.target.style.borderColor = 'rgba(34,197,94,0.5)')}
      onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  )
}

function Toggle({ value, onChange, label, sublabel }) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: value ? '#22c55e' : 'rgba(255,255,255,0.12)' }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: value ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

// ── Task form ─────────────────────────────────────────────────
function TaskForm({ form, setField }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label>TITLE *</Label>
        <TextInput value={form.title} onChange={v => setField('title', v)} placeholder="What needs to be done?" />
      </div>

      {/* Description */}
      <div>
        <Label>NOTES</Label>
        <TextArea value={form.description} onChange={v => setField('description', v)} placeholder="Add details…" />
      </div>

      {/* Priority */}
      <div>
        <Label>PRIORITY</Label>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => setField('priority', p.value)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background:  form.priority === p.value ? p.bg    : 'rgba(255,255,255,0.05)',
                border:      `1px solid ${form.priority === p.value ? p.color + '60' : 'rgba(255,255,255,0.08)'}`,
                color:       form.priority === p.value ? p.color : 'var(--text-tertiary)',
                transform:   form.priority === p.value ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick date */}
      <div>
        <Label>DUE DATE</Label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {QUICK_DATES.map(q => {
            const val = q.getValue()
            return (
              <button
                key={q.label}
                onClick={() => setField('due_date', form.due_date === val ? '' : val)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: form.due_date === val ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                  border:     `1px solid ${form.due_date === val ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color:      form.due_date === val ? '#22c55e' : 'var(--text-secondary)',
                }}
              >
                {q.label}
              </button>
            )
          })}
        </div>
        <input
          type="date"
          value={form.due_date}
          onChange={e => setField('due_date', e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border:     '1px solid rgba(255,255,255,0.1)',
            color:      'var(--text-primary)',
            colorScheme:'dark',
          }}
        />
      </div>

      {/* Due time */}
      <div>
        <Label>DUE TIME</Label>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={form.due_time}
            onChange={e => setField('due_time', e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background:  'rgba(255,255,255,0.07)',
              border:      '1px solid rgba(255,255,255,0.1)',
              color:       'var(--text-primary)',
              colorScheme: 'dark',
            }}
          />
          {form.due_time && (
            <button onClick={() => setField('due_time', '')} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alarm toggle — only show if time is set */}
      {form.due_time && form.due_date && (
        <Toggle
          value={form.alarm_enabled}
          onChange={v => setField('alarm_enabled', v)}
          label="⏰ Set Alarm"
          sublabel={`Notify me at ${form.due_time} on ${form.due_date}`}
        />
      )}

      {/* Icon */}
      <div>
        <Label>ICON</Label>
        <div className="flex flex-wrap gap-2">
          {ICONS.slice(0, 12).map(ic => (
            <button
              key={ic}
              onClick={() => setField('icon', ic)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
              style={{
                background: form.icon === ic ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                border:     `${form.icon === ic ? '2px' : '1px'} solid ${form.icon === ic ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.07)'}`,
                transform:  form.icon === ic ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Routine form ──────────────────────────────────────────────
function RoutineForm({ form, setField }) {
  function toggleDay(i) {
    const next = form.days_of_week.includes(i)
      ? form.days_of_week.filter(d => d !== i)
      : [...form.days_of_week, i]
    setField('days_of_week', next)
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label>TITLE *</Label>
        <TextInput value={form.title} onChange={v => setField('title', v)} placeholder="Name your routine…" />
      </div>

      {/* Description */}
      <div>
        <Label>NOTES</Label>
        <TextArea value={form.description} onChange={v => setField('description', v)} placeholder="Optional description…" />
      </div>

      {/* Icon + Color row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>ICON</Label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.slice(0, 10).map(ic => (
              <button
                key={ic}
                onClick={() => setField('icon', ic)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all"
                style={{
                  background: form.icon === ic ? `${form.color}22` : 'rgba(255,255,255,0.05)',
                  border:     `${form.icon === ic ? '2px' : '1px'} solid ${form.icon === ic ? form.color + '55' : 'rgba(255,255,255,0.07)'}`,
                  transform:  form.icon === ic ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>COLOR</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setField('color', c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background:    c,
                  outline:       form.color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                  transform:     form.color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Frequency */}
      <div>
        <Label>FREQUENCY</Label>
        <div className="flex gap-2">
          {FREQUENCIES.map(f => (
            <button
              key={f.value}
              onClick={() => setField('frequency', f.value)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: form.frequency === f.value ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                border:     `1px solid ${form.frequency === f.value ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color:      form.frequency === f.value ? '#22c55e' : 'var(--text-tertiary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days (weekly) */}
      {form.frequency === 'weekly' && (
        <div>
          <Label>DAYS</Label>
          <div className="flex gap-1">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: form.days_of_week.includes(i) ? form.color : 'rgba(255,255,255,0.06)',
                  border:     '1px solid transparent',
                  color:      form.days_of_week.includes(i) ? 'white' : 'var(--text-tertiary)',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time */}
      <div>
        <Label>TIME (OPTIONAL)</Label>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={form.time_of_day}
            onChange={e => setField('time_of_day', e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', colorScheme: 'dark' }}
          />
          {form.time_of_day && (
            <button onClick={() => setField('time_of_day', '')} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alarm toggle */}
      {form.time_of_day && (
        <Toggle
          value={form.alarm_enabled}
          onChange={v => setField('alarm_enabled', v)}
          label="⏰ Daily Alarm"
          sublabel={`Remind me at ${form.time_of_day} each day`}
        />
      )}
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────
export function TaskRoutineModal({ open, onClose, onSaveTask, onSaveRoutine, initialTask = null, initialType = 'task' }) {
  const isEdit     = !!initialTask
  const [type,     setType]    = useState(initialType)
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK)
  const [routeForm,setRouteForm]= useState(DEFAULT_ROUTINE)
  const [saving,   setSaving]  = useState(false)
  const [error,    setError]   = useState(null)
  const { schedule, cancel, permissionStatus, requestPerm } = useAlarm()

  // Populate on open
  useEffect(() => {
    if (!open) return
    setError(null)
    setType(initialType)
    if (initialTask) {
      setTaskForm({
        title:         initialTask.title         ?? '',
        description:   initialTask.description   ?? '',
        priority:      initialTask.priority      ?? 'medium',
        due_date:      initialTask.due_date?.slice(0,10) ?? '',
        due_time:      initialTask.due_time       ?? '',
        alarm_enabled: initialTask.alarm_enabled  ?? false,
        icon:          initialTask.icon           ?? '📌',
      })
    } else {
      setTaskForm(DEFAULT_TASK)
      setRouteForm(DEFAULT_ROUTINE)
    }
  }, [open, initialTask, initialType])

  function setTaskField(k, v) { setTaskForm(f => ({ ...f, [k]: v })) }
  function setRouteField(k, v){ setRouteForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    const form = type === 'task' ? taskForm : routeForm
    if (!form.title.trim()) { setError('Please add a title.'); return }
    setSaving(true)
    setError(null)

    try {
      if (type === 'task') {
        const payload = {
          ...taskForm,
          title:       taskForm.title.trim(),
          description: taskForm.description.trim() || null,
        }
        const saved = await onSaveTask(payload)

        // Schedule alarm if enabled
        if (taskForm.alarm_enabled && taskForm.due_date && taskForm.due_time) {
          if (permissionStatus !== 'granted') await requestPerm()
          await schedule({
            id:          saved?.id ?? payload.title,
            title:       payload.title,
            description: payload.description,
            icon:        payload.icon,
            type:        'task',
            dueDateTime: buildDueDateTime(taskForm.due_date, taskForm.due_time),
          })
        } else if (isEdit && saved?.id) {
          cancel(saved.id)
        }
      } else {
        const payload = {
          ...routeForm,
          title:       routeForm.title.trim(),
          description: routeForm.description.trim() || null,
          time_of_day: routeForm.time_of_day || null,
        }
        const saved = await onSaveRoutine(payload)

        // Schedule daily alarm for routine if enabled
        if (routeForm.alarm_enabled && routeForm.time_of_day) {
          if (permissionStatus !== 'granted') await requestPerm()
          const todayDate = format(new Date(), 'yyyy-MM-dd')
          await schedule({
            id:          saved?.id ?? payload.title,
            title:       payload.title,
            description: payload.description,
            icon:        payload.icon,
            type:        'routine',
            dueDateTime: buildDueDateTime(todayDate, routeForm.time_of_day),
          })
        }
      }
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
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{
              background: 'var(--bg-elevated)',
              borderTop:  '1px solid var(--glass-border)',
              maxHeight:  '93vh',
              overflowY:  'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10" style={{ background: 'var(--bg-elevated)' }}>
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2 sticky top-5 z-10" style={{ background: 'var(--bg-elevated)' }}>
              <button onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Cancel
              </button>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {isEdit ? `Edit ${type === 'task' ? 'Task' : 'Routine'}` : 'Create New'}
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || !(type === 'task' ? taskForm : routeForm).title.trim()}
                className="text-sm font-bold transition-opacity"
                style={{ color: '#22c55e', opacity: saving || !(type === 'task' ? taskForm : routeForm).title.trim() ? 0.4 : 1 }}
              >
                {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
              </button>
            </div>

            {/* Type toggle — hide in edit mode */}
            {!isEdit && (
              <div className="px-5 pt-1 pb-3">
                <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => setType('task')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                      background: type === 'task' ? '#22c55e' : 'transparent',
                      color:      type === 'task' ? 'white' : 'var(--text-tertiary)',
                      boxShadow:  type === 'task' ? '0 4px 12px rgba(34,197,94,0.3)' : 'none',
                    }}
                  >
                    ✅ Task
                  </button>
                  <button
                    onClick={() => setType('routine')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                      background: type === 'routine' ? '#60a5fa' : 'transparent',
                      color:      type === 'routine' ? 'white' : 'var(--text-tertiary)',
                      boxShadow:  type === 'routine' ? '0 4px 12px rgba(96,165,250,0.3)' : 'none',
                    }}
                  >
                    🔄 Routine
                  </button>
                </div>
              </div>
            )}

            {/* Form body */}
            <div className="px-5 pb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: type === 'task' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{   opacity: 0, x: type === 'task' ? 20 : -20 }}
                  transition={{ duration: 0.18 }}
                >
                  {type === 'task'
                    ? <TaskForm    form={taskForm}  setField={setTaskField}  />
                    : <RoutineForm form={routeForm} setField={setRouteField} />
                  }
                </motion.div>
              </AnimatePresence>

              {/* Notification permission warning */}
              {permissionStatus === 'denied' && (
                <div
                  className="mt-4 flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
                >
                  <span>⚠️</span>
                  <p className="text-xs" style={{ color: '#fb923c' }}>
                    Browser notifications are blocked. Alarms will appear as in-app banners only. Enable notifications in your browser settings for full alarm support.
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-4 text-xs font-medium" style={{ color: '#f87171' }}>⚠️ {error}</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}