// import { useState, useMemo, useCallback } from 'react'
// import { motion } from 'framer-motion'
// import { format, isToday, parseISO, isValid } from 'date-fns'

// import { useTaskStore }    from '@/store'
// import { useUserStore }    from '@/store'
// import { useRoutineStore } from '@/store/routineStore'
// import { useAuthStore }    from '@/store/authStore'

// import { WeeklyCarousel }   from '@/components/calendar/WeeklyCarousel'
// import { MonthlyGrid }      from '@/components/calendar/MonthlyGrid'
// import { DailyTimeline }    from '@/components/calendar/DailyTimeline'
// import { TaskRoutineModal } from '@/components/tasks/TaskRoutineModal'
// import { GlassCard }        from '@/components/ui/GlassCard'
// import { cancelAlarm }      from '@/services/alarmEngine'
// import { buildDueDateTime } from '@/services/alarmEngine'

// // ── FAB with bottom sheet ─────────────────────────────────────
// function CalendarFAB({ onCreateTask, onCreateRoutine }) {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <motion.button
//         className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-40"
//         style={{ background: '#22c55e', boxShadow: '0 8px 28px rgba(34,197,94,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
//         onClick={() => setOpen(o => !o)}
//         animate={{ rotate: open ? 45 : 0 }}
//         whileTap={{ scale: 0.92 }}
//         transition={{ type: 'spring', stiffness: 400, damping: 20 }}
//       >
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//           <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//         </svg>
//       </motion.button>

//       {open && (
//         <>
//           <motion.div
//             className="fixed inset-0 z-30"
//             style={{ background: 'rgba(0,0,0,0.4)' }}
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//             onClick={() => setOpen(false)}
//           />
//           <motion.div
//             className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl p-6"
//             style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--glass-border)' }}
//             initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//           >
//             <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.2)' }} />
//             <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add to calendar</h3>
//             <div className="space-y-3">
//               <motion.button
//                 onClick={() => { setOpen(false); onCreateTask() }}
//                 className="w-full flex items-center gap-4 p-4 rounded-2xl"
//                 style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
//                 whileTap={{ scale: 0.97 }}
//               >
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(34,197,94,0.2)' }}>✅</div>
//                 <div className="text-left">
//                   <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>New Task</p>
//                   <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>One-time to-do with deadline</p>
//                 </div>
//               </motion.button>
//               <motion.button
//                 onClick={() => { setOpen(false); onCreateRoutine() }}
//                 className="w-full flex items-center gap-4 p-4 rounded-2xl"
//                 style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
//                 whileTap={{ scale: 0.97 }}
//               >
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(96,165,250,0.18)' }}>🔄</div>
//                 <div className="text-left">
//                   <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>New Routine</p>
//                   <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Recurring daily habit</p>
//                 </div>
//               </motion.button>
//             </div>
//             <div className="h-4" />
//           </motion.div>
//         </>
//       )}
//     </>
//   )
// }

// // ── Main Page ─────────────────────────────────────────────────
// export function CalendarScreen() {
//   const [selectedDate,  setSelectedDate]  = useState(new Date())
//   const [monthExpanded, setMonthExpanded] = useState(false)
//   const [modalOpen,     setModalOpen]     = useState(false)
//   const [modalType,     setModalType]     = useState('task')

//   // ── Store connections ───────────────────────────────────
//   const tasks      = useTaskStore(s => s.tasks ?? [])
//   const toggleTask = useTaskStore(s => s.toggleTask ?? s.toggle ?? (() => {}))
//   const addTask    = useTaskStore(s => s.addTask    ?? s.add    ?? (() => {}))

//   const {
//     routines, completedToday, completions,
//     loadAll: loadRoutines, addRoutine,
//   } = useRoutineStore()

//   const profile = useUserStore(s => s.profile ?? {})
//   const user    = useAuthStore(s => s.user)

//   const userName = profile.name ?? profile.username ?? user?.email?.split('@')[0] ?? 'Samuel'

//   // ── Date sets for calendar dots ─────────────────────────
//   const taskDateSet = useMemo(() => {
//     const s = new Set()
//     tasks.forEach(t => { if (t.due_date) s.add(t.due_date.slice(0, 10)) })
//     return s
//   }, [tasks])

//   const routineDateSet = useMemo(() => {
//     const s = new Set()
//     completions.forEach(c => s.add(c.completed_on))
//     return s
//   }, [completions])

//   // ── Timeline items for selected date ─────────────────────
//   const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

//   const timelineItems = useMemo(() => {
//     // Tasks due on selected date
//     const taskItems = tasks
//       .filter(t => t.due_date?.slice(0, 10) === selectedDateStr)
//       .map(t => ({
//         id:          t.id,
//         title:       t.title,
//         type:        'task',
//         time:        t.due_time ?? null,
//         completed:   t.completed ?? false,
//         priority:    t.priority ?? 'low',
//         description: t.description ?? null,
//         icon:        t.icon ?? null,
//         _raw:        t,
//       }))

//     // Routines for selected date
//     const dayOfWeek   = (selectedDate.getDay() + 6) % 7
//     const completedIds = new Set(
//       completions.filter(c => c.completed_on === selectedDateStr).map(c => c.routine_id)
//     )
//     const routineItems = routines
//       .filter(r => {
//         if (!r.is_active) return false
//         if (r.frequency === 'weekly') return !r.days_of_week?.length || r.days_of_week.includes(dayOfWeek)
//         return true
//       })
//       .map(r => ({
//         id:          r.id,
//         title:       r.title,
//         type:        'routine',
//         time:        r.time_of_day ?? null,
//         completed:   completedIds.has(r.id),
//         icon:        r.icon ?? '🔄',
//         description: r.description ?? null,
//         _raw:        r,
//       }))

//     return [...taskItems, ...routineItems]
//   }, [tasks, routines, completions, selectedDateStr, selectedDate])

//   // ── Stats for selected date ───────────────────────────────
//   const doneCount  = timelineItems.filter(i => i.completed).length
//   const totalCount = timelineItems.length

//   // ── Handlers ─────────────────────────────────────────────
//   function handleToggleTask(taskId) {
//     toggleTask(taskId)
//     cancelAlarm(taskId)
//   }

//   async function handleSaveTask(fields) {
//     return await addTask({
//       ...fields,
//       due_date:  fields.due_date || selectedDateStr,
//       completed: false,
//     })
//   }

//   async function handleSaveRoutine(fields) {
//     return await addRoutine(fields)
//   }

//   function openCreate(type = 'task') {
//     setModalType(type)
//     setModalOpen(true)
//   }

//   // ── Render ───────────────────────────────────────────────
//   return (
//     <div className="min-h-screen taskr-bg taskr-scroll overflow-y-auto pb-28" style={{ color: 'var(--text-primary)' }}>
//       <div className="px-4 pt-6">

//         {/* Header with user name */}
//         <motion.div
//           className="flex items-center justify-between mb-5"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div>
//             <h1 className="text-2xl font-bold">Calendar</h1>
//             <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
//               {format(new Date(), 'EEEE, MMMM d, yyyy')}
//             </p>
//           </div>
//           {/* User avatar */}
//           <div
//             className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
//             style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)', color: 'white' }}
//           >
//             {userName[0]?.toUpperCase() ?? 'S'}
//           </div>
//         </motion.div>

//         {/* Summary card for selected date */}
//         {totalCount > 0 && (
//           <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             <GlassCard variant="accent" padding="p-3">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
//                   {isToday(selectedDate) ? "Today" : format(selectedDate, 'MMMM d')} · {totalCount} item{totalCount !== 1 ? 's' : ''}
//                 </p>
//                 <span className="text-sm font-bold" style={{ color: '#22c55e' }}>
//                   {doneCount}/{totalCount}
//                 </span>
//               </div>
//               <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
//                 <motion.div
//                   className="h-full rounded-full"
//                   style={{ background: 'linear-gradient(90deg,#22c55e,#4ade80)' }}
//                   initial={{ width: 0 }}
//                   animate={{ width: totalCount > 0 ? `${Math.round(doneCount/totalCount*100)}%` : '0%' }}
//                   transition={{ duration: 0.7, ease: [0.19,1,0.22,1] }}
//                 />
//               </div>
//             </GlassCard>
//           </motion.div>
//         )}

//         {/* Weekly carousel */}
//         <WeeklyCarousel
//           selectedDate={selectedDate}
//           onSelectDate={setSelectedDate}
//           taskDates={taskDateSet}
//           routineDates={routineDateSet}
//         />

//         {/* Expandable monthly grid */}
//         <MonthlyGrid
//           isExpanded={monthExpanded}
//           onToggle={() => setMonthExpanded(e => !e)}
//           selectedDate={selectedDate}
//           onSelectDate={d => { setSelectedDate(d); setMonthExpanded(false) }}
//           taskDates={taskDateSet}
//           routineDates={routineDateSet}
//         />

//         {/* Daily timeline — tasks + routines */}
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.15 }}
//         >
//           <DailyTimeline items={timelineItems} date={selectedDate} />
//         </motion.div>
//       </div>

//       {/* FAB */}
//       <CalendarFAB
//         onCreateTask={() => openCreate('task')}
//         onCreateRoutine={() => openCreate('routine')}
//       />

//       {/* Unified modal */}
//       <TaskRoutineModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onSaveTask={handleSaveTask}
//         onSaveRoutine={handleSaveRoutine}
//         initialType={modalType}
//       />
//     </div>
//   )
// }



/**
 * src/pages/CalendarScreen.jsx
 * Fixed: CSS vars from globals.css only, Lucide icons, theme-aware,
 * connected to real useTaskStore + useRoutineStore + useUserStore
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isValid, parseISO } from 'date-fns'
import { Plus, Calendar as CalIcon, CheckSquare, RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { useTaskStore, useUIStore, useUserStore } from '@/store'
import { useAuthStore }                           from '@/store/authStore'
import { useRoutineStore }                        from '@/store/routineStore'
import { useTaskActions }                         from '@/hooks'

import { WeeklyCarousel } from '@/components/calendar/WeeklyCarousel'
import { RoutineModal }   from '@/components/routines/RoutineModal'

// ── Monthly grid ──────────────────────────────────────────────────
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths,
} from 'date-fns'

function MonthlyGrid({ isExpanded, onToggle, selectedDate, onSelectDate, taskDates, routineDates }) {
  const [viewMonth, setViewMonth] = useState(new Date())
  const WEEK_START = { weekStartsOn: 1 }
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), WEEK_START),
    end:   endOfWeek(endOfMonth(viewMonth), WEEK_START),
  })

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={onToggle}
        style={{
          width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          padding:'7px',borderRadius:'var(--radius-sm)',
          background:'var(--bg-surface-2)',border:'1px solid var(--border)',
          cursor:'pointer',fontFamily:'var(--font-body)',fontSize:12,fontWeight:600,
          color:'var(--text-muted)',
        }}
      >
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration:0.2 }}>
          <ChevronDown size={13} />
        </motion.div>
        {isExpanded ? 'Collapse' : 'Show full month'}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }}
            exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}
            style={{ overflow:'hidden' }}
          >
            <div className="card-sm" style={{ padding:'12px',marginTop:8 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                <button onClick={() => setViewMonth(m => subMonths(m,1))} className="btn-icon" style={{ width:26,height:26 }}>
                  <ChevronLeft size={13} />
                </button>
                <span style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)',fontFamily:'var(--font-display)' }}>
                  {format(viewMonth,'MMMM yyyy')}
                </span>
                <button onClick={() => setViewMonth(m => addMonths(m,1))} className="btn-icon" style={{ width:26,height:26 }}>
                  <ChevronRight size={13} />
                </button>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4 }}>
                {['M','T','W','T','F','S','S'].map((d,i) => (
                  <div key={i} style={{ textAlign:'center',fontSize:10,fontWeight:700,color:'var(--text-muted)' }}>{d}</div>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px 0' }}>
                {days.map(day => {
                  const key        = format(day,'yyyy-MM-dd')
                  const isSelected = isSameDay(day,selectedDate)
                  const isNow      = isToday(day)
                  const inMonth    = isSameMonth(day,viewMonth)
                  return (
                    <button key={key} onClick={() => { onSelectDate(day); onToggle() }}
                      style={{
                        display:'flex',flexDirection:'column',alignItems:'center',padding:'4px 2px',
                        borderRadius:'var(--radius-sm)',border:'none',cursor:'pointer',
                        background: isSelected ? 'var(--brand)' : isNow ? 'var(--brand-muted)' : 'transparent',
                        opacity: inMonth ? 1 : 0.28,
                      }}
                    >
                      <span style={{ fontSize:11,fontWeight:700,color: isSelected ? '#fff' : isNow ? 'var(--brand)' : 'var(--text-primary)' }}>
                        {format(day,'d')}
                      </span>
                      <div style={{ display:'flex',gap:2,height:4 }}>
                        {taskDates.has(key)    && <div style={{ width:3,height:3,borderRadius:'50%',background:isSelected?'rgba(255,255,255,0.7)':'var(--brand)' }} />}
                        {routineDates.has(key) && <div style={{ width:3,height:3,borderRadius:'50%',background:isSelected?'rgba(255,255,255,0.7)':'var(--priority-medium)' }} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Timeline item ──────────────────────────────────────────────────
function TimelineItem({ item, index }) {
  const typeColor = item.type === 'routine' ? 'var(--priority-low)' : 'var(--brand)'
  return (
    <motion.div
      initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
      transition={{ delay:index*0.05,duration:0.25 }}
      style={{ display:'flex',gap:12,marginBottom:10 }}
    >
      <div style={{ width:44,flexShrink:0,paddingTop:10,textAlign:'right' }}>
        <span style={{ fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-body)' }}>
          {item.time ?? ''}
        </span>
      </div>
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0 }}>
        <div style={{ width:10,height:10,borderRadius:'50%',marginTop:8,background:item.completed?'var(--brand)':typeColor }} />
        <div style={{ flex:1,width:1,background:'var(--border)',marginTop:3,minHeight:16 }} />
      </div>
      <div style={{ flex:1,paddingBottom:2 }}>
        <div className="card-sm" style={{
          padding:'8px 10px',
          borderLeft:`3px solid ${item.type==='routine'?'var(--priority-low)':'var(--brand)'}`,
          borderRadius:'var(--radius-md)',
          opacity: item.completed ? 0.55 : 1,
        }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
            <p style={{ margin:0,fontSize:13,fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-body)',textDecoration:item.completed?'line-through':'none' }}>
              {item.icon && <span style={{ marginRight:5 }}>{item.icon}</span>}
              {item.title}
            </p>
            <span style={{
              fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:'var(--radius-full)',flexShrink:0,
              background: item.type==='routine' ? 'rgba(34,197,94,0.1)' : 'var(--brand-muted)',
              color:      item.type==='routine' ? 'var(--brand)' : 'var(--brand)',
              fontFamily:'var(--font-body)',
            }}>
              {item.type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty timeline ────────────────────────────────────────────────
function EmptyTimeline({ date }) {
  return (
    <div style={{ textAlign:'center',padding:'40px 20px' }}>
      <div style={{ fontSize:40,marginBottom:12 }}>📅</div>
      <p style={{ fontFamily:'var(--font-display)',fontSize:15,fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px' }}>
        Nothing scheduled {isToday(date) ? 'today' : format(date,'MMMM d')}
      </p>
      <p style={{ fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-body)' }}>
        Tap + to add a task or routine
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export function CalendarScreen() {
  const [selectedDate,  setSelectedDate]  = useState(new Date())
  const [monthExpanded, setMonthExpanded] = useState(false)
  const [fabOpen,       setFabOpen]       = useState(false)
  const [routineModal,  setRoutineModal]  = useState(false)

  const tasks      = useTaskStore(s => s.tasks ?? [])
  const { routines, completions, addRoutine } = useRoutineStore()
  const profile    = useUserStore(s => s.profile ?? {})
  const user       = useAuthStore(s => s.user)
  const { showToast } = useUIStore()
  const { addTask, setActiveView } = useTaskActions ? useTaskActions() : {}

  const userName = profile.name ?? user?.email?.split('@')[0] ?? 'Samuel'

  // Date sets
  const taskDateSet = useMemo(() => {
    const s = new Set()
    tasks.forEach(t => { if (t.dueDate) s.add(format(new Date(t.dueDate),'yyyy-MM-dd')) })
    return s
  }, [tasks])

  const routineDateSet = useMemo(() => {
    const s = new Set()
    completions.forEach(c => s.add(c.completed_on))
    return s
  }, [completions])

  // Timeline items
  const selectedDateStr = format(selectedDate,'yyyy-MM-dd')
  const timelineItems = useMemo(() => {
    const taskItems = tasks
      .filter(t => {
        if (!t.dueDate) return isToday(selectedDate)
        const d = new Date(t.dueDate)
        return isValid(d) && format(d,'yyyy-MM-dd') === selectedDateStr
      })
      .map(t => ({ id:t.id,title:t.text,type:'task',time:null,completed:t.done,priority:t.priority,icon:null,_raw:t }))

    const dow = (selectedDate.getDay()+6)%7
    const completedIds = new Set(completions.filter(c=>c.completed_on===selectedDateStr).map(c=>c.routine_id))
    const routineItems = routines
      .filter(r => {
        if (!r.is_active) return false
        if (r.frequency==='weekly') return !r.days_of_week?.length || r.days_of_week.includes(dow)
        return true
      })
      .map(r => ({ id:r.id,title:r.title,type:'routine',time:r.time_of_day??null,completed:completedIds.has(r.id),icon:r.icon??'🔄' }))

    return [...taskItems,...routineItems].sort((a,b) => {
      if (!a.time) return 1; if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
  }, [tasks,routines,completions,selectedDateStr,selectedDate])

  const doneCount  = timelineItems.filter(i=>i.completed).length
  const totalCount = timelineItems.length

  async function handleSaveRoutine(fields) {
    try {
      await addRoutine(fields)
      showToast?.('Routine created!','success')
      setRoutineModal(false)
    } catch(err) {
      showToast?.('Failed: '+err.message,'error')
      throw err
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10 }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">{format(new Date(),'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand),var(--brand-hover))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',fontFamily:'var(--font-display)',boxShadow:'var(--shadow-brand)' }}>
            {userName[0]?.toUpperCase()??'S'}
          </div>
          <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={()=>setFabOpen(o=>!o)} className="btn btn-primary">
            <Plus size={15} strokeWidth={2.5} /> Add
          </motion.button>
        </div>
      </div>

      {/* Summary */}
      {totalCount > 0 && (
        <div className="card-sm" style={{ padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-body)' }}>
            {isToday(selectedDate)?'Today':''}  · {totalCount} item{totalCount!==1?'s':''}
          </span>
          <span style={{ fontSize:13,fontWeight:800,color:'var(--brand)',fontFamily:'var(--font-display)' }}>
            {doneCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Weekly carousel */}
      <div style={{ marginBottom:14 }}>
        <WeeklyCarousel selectedDate={selectedDate} onSelectDate={setSelectedDate} taskDates={taskDateSet} routineDates={routineDateSet} />
      </div>

      {/* Monthly grid */}
      <MonthlyGrid isExpanded={monthExpanded} onToggle={()=>setMonthExpanded(e=>!e)} selectedDate={selectedDate} onSelectDate={d=>{setSelectedDate(d);setMonthExpanded(false)}} taskDates={taskDateSet} routineDates={routineDateSet} />

      {/* Timeline */}
      <div style={{ marginBottom:6,display:'flex',alignItems:'center',gap:8 }}>
        <span className="section-label">{isToday(selectedDate)?'TODAY':format(selectedDate,'MMM d').toUpperCase()}</span>
        {totalCount>0 && (
          <span style={{ fontSize:10,padding:'2px 8px',borderRadius:'var(--radius-full)',background:'var(--brand-muted)',color:'var(--brand)',fontWeight:700,fontFamily:'var(--font-body)' }}>
            {totalCount}
          </span>
        )}
      </div>

      {timelineItems.length===0
        ? <EmptyTimeline date={selectedDate} />
        : <div style={{ position:'relative' }}>
            {timelineItems.map((item,i) => <TimelineItem key={item.id} item={item} index={i} />)}
          </div>
      }

      {/* FAB sheet */}
      <AnimatePresence>
        {fabOpen && (
          <>
            <motion.div style={{ position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(4px)' }}
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setFabOpen(false)} />
            <motion.div
              style={{ position:'fixed',bottom:0,left:0,right:0,zIndex:401,borderRadius:'var(--radius-2xl) var(--radius-2xl) 0 0',background:'var(--bg-surface)',border:'1px solid var(--border)',padding:'20px 20px 32px',boxShadow:'var(--shadow-xl)' }}
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:300,damping:30}}
            >
              <div style={{ width:40,height:4,borderRadius:99,background:'var(--border-strong)',margin:'0 auto 20px' }} />
              <h3 style={{ margin:'0 0 16px',fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,color:'var(--text-primary)' }}>Add to calendar</h3>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <motion.button whileTap={{scale:0.97}}
                  onClick={()=>{setFabOpen(false);useUIStore.getState().setActiveView('tasks')}}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'14px',borderRadius:'var(--radius-lg)',border:'1.5px solid var(--border)',background:'var(--bg-surface-2)',cursor:'pointer',textAlign:'left' }}
                >
                  <div style={{ width:40,height:40,borderRadius:'var(--radius-md)',background:'var(--brand-muted)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <CheckSquare size={20} color="var(--brand)" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ margin:0,fontSize:14,fontWeight:700,color:'var(--text-primary)',fontFamily:'var(--font-display)' }}>New Task</p>
                    <p style={{ margin:0,fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-body)' }}>One-time to-do with deadline</p>
                  </div>
                </motion.button>
                <motion.button whileTap={{scale:0.97}}
                  onClick={()=>{setFabOpen(false);setRoutineModal(true)}}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'14px',borderRadius:'var(--radius-lg)',border:'1.5px solid var(--border)',background:'var(--bg-surface-2)',cursor:'pointer',textAlign:'left' }}
                >
                  <div style={{ width:40,height:40,borderRadius:'var(--radius-md)',background:'rgba(96,165,250,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <RefreshCw size={20} color="#60a5fa" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ margin:0,fontSize:14,fontWeight:700,color:'var(--text-primary)',fontFamily:'var(--font-display)' }}>New Routine</p>
                    <p style={{ margin:0,fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-body)' }}>Recurring daily habit</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Routine modal */}
      <RoutineModal open={routineModal} onClose={()=>setRoutineModal(false)} onSave={handleSaveRoutine} />
    </div>
  )
}