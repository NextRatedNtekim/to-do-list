// import { useMemo } from 'react'
// import { motion } from 'framer-motion'
// import {
//   Bell, MoreHorizontal, ArrowRight, CheckCircle2,
//   Clock, Flame, Briefcase, User, BookOpen, TrendingUp,
//   Plus, ChevronRight,
// } from 'lucide-react'
// import { useTaskStore, useUserStore, useUIStore } from '@/store'
// import { useAuthStore } from '@/store/authStore'
// import { levelFromXP } from '@/utils/constants'
// import { DashboardEnhancement } from '@/components/dashboard/DashboardEnhancement'

// /* ─── tiny helpers ─────────────────────────────────────────── */
// const fadeUp = (delay = 0) => ({
//   initial:    { opacity: 0, y: 16 },
//   animate:    { opacity: 1, y: 0 },
//   transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
// })

// const GROUP_ICONS = [Briefcase, User, BookOpen, TrendingUp, Flame]
// const GROUP_COLORS = ['#22c55e', '#f59e0b', '#60a5fa', '#f43f5e', '#a78bfa']

// /* ─── Circular progress ─────────────────────────────────────── */
// function CircleProgress({ pct = 0, size = 80, stroke = 7, color = '#22c55e' }) {
//   const r   = (size - stroke) / 2
//   const circ = 2 * Math.PI * r
//   const off  = circ - (pct / 100) * circ
//   return (
//     <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
//       <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={color} strokeWidth={stroke}
//         strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: off }}
//         transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
//       />
//     </svg>
//   )
// }

// /* ─── Small donut for task groups ──────────────────────────── */
// function MiniDonut({ pct = 0, color = '#22c55e', size = 48 }) {
//   const stroke = 5
//   const r      = (size - stroke) / 2
//   const circ   = 2 * Math.PI * r
//   const off    = circ - (pct / 100) * circ
//   return (
//     <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke="var(--bg-surface-3)" strokeWidth={stroke} />
//       <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={color} strokeWidth={stroke} strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: off }}
//         transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
//       />
//     </svg>
//   )
// }

// /* ─── In-progress project card ──────────────────────────────── */
// function ProjectCard({ label, title, pct, color, index }) {
//   return (
//     <motion.div {...fadeUp(0.1 + index * 0.06)}
//       whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
//       className="card"
//       style={{ padding: '14px 16px', minWidth: 170, flex: '1 1 170px', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
//         <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
//         <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <Briefcase size={14} color={color} />
//         </div>
//       </div>
//       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.35, fontFamily: 'var(--font-display)' }}>{title}</p>
//       <div className="progress-track" style={{ height: 5 }}>
//         <motion.div className="progress-fill"
//           style={{ background: color }}
//           animate={{ width: `${pct}%` }}
//           transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
//         />
//       </div>
//     </motion.div>
//   )
// }

// /* ─── Task group row ────────────────────────────────────────── */
// function GroupRow({ icon: Icon, label, count, pct, color, index }) {
//   return (
//     <motion.div {...fadeUp(0.22 + index * 0.05)}
//       whileHover={{ x: 3 }}
//       style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0',
//         borderBottom: '1px solid var(--border)', cursor: 'pointer',
//         transition: 'transform .15s' }}
//     >
//       <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//         <Icon size={18} color={color} />
//       </div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{label}</p>
//         <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{count} Tasks</p>
//       </div>
//       <MiniDonut pct={pct} color={color} size={44} />
//       <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
//     </motion.div>
//   )
// }

// /* ─── Dashboard ─────────────────────────────────────────────── */
// export function DashboardPage() {
//   const { tasks }         = useTaskStore()
//   const { totalXP }       = useUserStore()
//   const { setActiveView } = useUIStore()
//   const { user }          = useAuthStore()

//   const total     = tasks.length
//   const done      = tasks.filter(t => t.done).length
//   const remaining = total - done
//   const pct       = total ? Math.round((done / total) * 100) : 0
//   const { level } = levelFromXP(totalXP)

//   const inProgress = useMemo(() => tasks.filter(t => !t.done).slice(0, 4), [tasks])

//   /* Derive fake "groups" from priority labels for display */
//   const groups = useMemo(() => {
//     const urgent = tasks.filter(t => t.priority === 'urgent')
//     const high   = tasks.filter(t => t.priority === 'high')
//     const medium = tasks.filter(t => t.priority === 'medium')
//     const low    = tasks.filter(t => t.priority === 'low')
//     return [
//       { label: 'Urgent',  count: urgent.length, pct: urgent.length ? Math.round(urgent.filter(t => t.done).length / urgent.length * 100) : 0 },
//       { label: 'High',    count: high.length,   pct: high.length   ? Math.round(high.filter(t => t.done).length   / high.length   * 100) : 0 },
//       { label: 'Medium',  count: medium.length, pct: medium.length ? Math.round(medium.filter(t => t.done).length / medium.length * 100) : 0 },
//       { label: 'Low',     count: low.length,    pct: low.length    ? Math.round(low.filter(t => t.done).length    / low.length    * 100) : 0 },
//     ].filter(g => g.count > 0).slice(0, 4)
//   }, [tasks])

//   const hour      = new Date().getHours()
//   const timeLabel = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
//   const firstName = (user?.name || 'there').split(' ')[0]

//   /* Avatar initials */
//   const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

//   return (
//     <div style={{ maxWidth: 680, margin: '0 auto' }}>

//       {/* ── Top bar ── */}
//       <motion.div {...fadeUp()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
//             {initials}
//           </div>
//           <div>
//             <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{timeLabel}!</p>
//             <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>{firstName}</h1>
//           </div>
//         </div>
//         <button className="btn-icon" aria-label="Notifications">
//           <Bell size={20} />
//         </button>
//       </motion.div>

//       {/* ── Hero progress card ── */}
//       <motion.div {...fadeUp(0.04)}
//         style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}
//       >
//         {/* Decorative blob */}
//         <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
//           <div style={{ flex: 1 }}>
//             <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
//               {pct >= 80 ? "Your today's task almost done!" : pct >= 40 ? "Keep up the great work!" : "Let's get started today!"}
//             </p>
//             <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
//               {done} of {total} tasks completed
//             </p>
//             <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
//               onClick={() => setActiveView('tasks')}
//               style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 'var(--radius-md)', padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
//             >
//               View Task <ArrowRight size={14} />
//             </motion.button>
//           </div>
//           <div style={{ position: 'relative', flexShrink: 0 }}>
//             <CircleProgress pct={pct} size={86} stroke={7} color="rgba(255,255,255,0.9)" />
//             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
//               <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{pct}%</span>
//             </div>
//             <button style={{ position: 'absolute', top: -4, right: -4, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
//               <MoreHorizontal size={12} />
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       {/* ── In Progress ── */}
//       {/* {inProgress.length > 0 && (
//         <motion.div {...fadeUp(0.1)} style={{ marginBottom: 24 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//             <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
//               In Progress
//               <span style={{ background: 'var(--brand-muted)', color: 'var(--brand)', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
//                 {inProgress.length}
//               </span>
//             </h2>
//             <button onClick={() => setActiveView('tasks')}
//               style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
//               See all <ChevronRight size={14} />
//             </button>
//           </div>
//           <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-none">
//             {inProgress.map((task, i) => {
//               const color = GROUP_COLORS[i % GROUP_COLORS.length]
//               const pctVal = task.done ? 100 : Math.floor(Math.random() * 60 + 20) // placeholder visual
//               return (
//                 <ProjectCard key={task.id} index={i}
//                   label={task.priority?.toUpperCase() || 'TASK'}
//                   title={task.text}
//                   pct={pctVal}
//                   color={color}
//                 />
//               )
//             })}
//           </div>
//         </motion.div>
//       )} */}
//       {/* ── Quick stats row ── */}
//       <motion.div {...fadeUp(0.26)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
//         {[
//           { label: 'Total', value: total, Icon: CheckCircle2, color: '#22c55e' },
//           { label: 'Pending', value: remaining, Icon: Clock, color: '#60a5fa' },
//           { label: 'Level', value: level, Icon: TrendingUp, color: '#f59e0b' },
//         ].map(({ label, value, Icon, color }) => (
//           <div key={label} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
//             <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
//               <Icon size={16} color={color} />
//             </div>
//             <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
//           </div>
//         ))}
//       </motion.div>

//       {/* ── Task Groups ── */}
//       <motion.div {...fadeUp(0.18)} className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
//           <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
//             Task Groups
//             <span style={{ background: 'var(--brand-muted)', color: 'var(--brand)', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
//               {groups.length}
//             </span>
//           </h2>
//         </div>

//         {groups.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
//             Add some tasks to see groups here
//           </div>
//         ) : (
//           <div>
//             {groups.map((g, i) => {
//               const Icon  = GROUP_ICONS[i % GROUP_ICONS.length]
//               const color = GROUP_COLORS[i % GROUP_COLORS.length]
//               return (
//                 <div key={g.label} style={{ borderBottom: i < groups.length - 1 ? '1px solid var(--border)' : 'none' }}>
//                   <GroupRow icon={Icon} label={g.label} count={g.count} pct={g.pct} color={color} index={i} />
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
//           onClick={() => setActiveView('tasks')}
//           style={{ width: '100%', marginTop: 14, background: 'var(--bg-surface-2)', border: '1.5px dashed var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
//         >
//           <Plus size={14} /> Add Task
//         </motion.button>
//       </motion.div>

      

//     </div>
//   )
// }




// import { useMemo, useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import {
//   Bell, MoreHorizontal, ArrowRight, CheckCircle2,
//   Clock, Flame, Briefcase, User, BookOpen, TrendingUp,
//   Plus, ChevronRight,
// } from 'lucide-react'
// import { useTaskStore, useUserStore, useUIStore } from '@/store'
// import { useAuthStore } from '@/store/authStore'
// import { levelFromXP } from '@/utils/constants'
// import { DashboardEnhancement } from '@/components/dashboard/DashboardEnhancement'
// // Add className="taskr-bg" to outermost div
// import {
//   DashboardHeader,
//   TodaysMission,
//   DashboardStats,
//   NextAlarmChip,
//   DashboardPartnerCard,
// } from "@/pages/Dashboard-add"

// import MissedTaskRecovery from '@/components/ui/MissedTaskRecovery'
// import XPToast            from '@/components/ui/XPToast'

// import { useAlarmStore, initAlarmListener } from '@/store/alarmStore'

// /* ─── tiny helpers ─────────────────────────────────────────── */
// const fadeUp = (delay = 0) => ({
//   initial:    { opacity: 0, y: 16 },
//   animate:    { opacity: 1, y: 0 },
//   transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
// })

// const GROUP_ICONS  = [Briefcase, User, BookOpen, TrendingUp, Flame]
// const GROUP_COLORS = ['#22c55e', '#f59e0b', '#60a5fa', '#f43f5e', '#a78bfa']

// /* ─── Circular progress ─────────────────────────────────────── */
// function CircleProgress({ pct = 0, size = 80, stroke = 7, color = '#22c55e' }) {
//   const r    = (size - stroke) / 2
//   const circ = 2 * Math.PI * r
//   const off  = circ - (pct / 100) * circ
//   return (
//     <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
//       <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={color} strokeWidth={stroke}
//         strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: off }}
//         transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
//       />
//     </svg>
//   )
// }

// /* ─── Small donut for task groups ──────────────────────────── */
// function MiniDonut({ pct = 0, color = '#22c55e', size = 48 }) {
//   const stroke = 5
//   const r      = (size - stroke) / 2
//   const circ   = 2 * Math.PI * r
//   const off    = circ - (pct / 100) * circ
//   return (
//     <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke="var(--bg-surface-3)" strokeWidth={stroke} />
//       <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={color} strokeWidth={stroke} strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: off }}
//         transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
//       />
//     </svg>
//   )
// }

// /* ─── In-progress project card ──────────────────────────────── */
// function ProjectCard({ label, title, pct, color, index }) {
//   return (
//     <motion.div {...fadeUp(0.1 + index * 0.06)}
//       whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
//       className="card"
//       style={{ padding: '14px 16px', minWidth: 170, flex: '1 1 170px', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
//         <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
//         <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <Briefcase size={14} color={color} />
//         </div>
//       </div>
//       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.35, fontFamily: 'var(--font-display)' }}>{title}</p>
//       <div className="progress-track" style={{ height: 5 }}>
//         <motion.div className="progress-fill"
//           style={{ background: color }}
//           animate={{ width: `${pct}%` }}
//           transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
//         />
//       </div>
//     </motion.div>
//   )
// }

// /* ─── Task group row ────────────────────────────────────────── */
// function GroupRow({ icon: Icon, label, count, pct, color, index }) {
//   return (
//     <motion.div {...fadeUp(0.22 + index * 0.05)}
//       whileHover={{ x: 3 }}
//       style={{
//         display: 'flex', alignItems: 'center', gap: 14,
//         padding: '11px 0',
//         borderBottom: '1px solid var(--border)',
//         cursor: 'pointer',
//         transition: 'transform .15s',
//       }}
//     >
//       <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//         <Icon size={18} color={color} />
//       </div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{label}</p>
//         <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{count} Tasks</p>
//       </div>
//       <MiniDonut pct={pct} color={color} size={44} />
//       <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
//     </motion.div>
//   )
// }

// /* ─── Dashboard ─────────────────────────────────────────────── */
// export function DashboardPage() {
//   const { tasks }         = useTaskStore()
//   const { totalXP }       = useUserStore()
//   const { setActiveView } = useUIStore()
//   const { user }          = useAuthStore()

//   const total     = tasks.length
//   const done      = tasks.filter(t => t.done).length
//   const remaining = total - done
//   const pct       = total ? Math.round((done / total) * 100) : 0
//   const { level } = levelFromXP(totalXP)
//   const profile = {
//     display_name: user?.name ?? 'there',
//     streak:       user?.streak ?? 0,
//     total_xp:     totalXP ?? 0,
//   }
//   const partner = null  // swap with: usePartnerStore()?.partner or similar
//   useEffect(() => {
//     initAlarmListener()
//     useAlarmStore.getState().loadAlarms(tasks)
//   }, [tasks])
//   const [xpToast, setXpToast] = useState(false)
//   const [toastXp, setToastXp] = useState(0)

  

//   const inProgress = useMemo(() => tasks.filter(t => !t.done).slice(0, 4), [tasks])

//   /* Derive "groups" from priority labels for display */
//   const groups = useMemo(() => {
//     const urgent = tasks.filter(t => t.priority === 'urgent')
//     const high   = tasks.filter(t => t.priority === 'high')
//     const medium = tasks.filter(t => t.priority === 'medium')
//     const low    = tasks.filter(t => t.priority === 'low')
//     return [
//       { label: 'Urgent', count: urgent.length, pct: urgent.length ? Math.round(urgent.filter(t => t.done).length / urgent.length * 100) : 0 },
//       { label: 'High',   count: high.length,   pct: high.length   ? Math.round(high.filter(t => t.done).length   / high.length   * 100) : 0 },
//       { label: 'Medium', count: medium.length, pct: medium.length ? Math.round(medium.filter(t => t.done).length / medium.length * 100) : 0 },
//       { label: 'Low',    count: low.length,    pct: low.length    ? Math.round(low.filter(t => t.done).length    / low.length    * 100) : 0 },
//     ].filter(g => g.count > 0).slice(0, 4)
//   }, [tasks])

//   const hour      = new Date().getHours()
//   const timeLabel = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
//   const firstName = (user?.name || 'there').split(' ')[0]
//   const initials  = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

//   return (
//     <div className="px-4 pt-16 pb-4 taskr-bg">
//       <XPToast xp={toastXp} visible={xpToast} />
//       <MissedTaskRecovery />
//       <DashboardHeader
//         displayName={profile.display_name}
//         streak={profile.streak}
//       />
//       <TodaysMission tasks={tasks} />
//       <DashboardStats
//         streak={profile.streak}
//         totalXp={profile.total_xp}
//         tasksLeft={tasks.filter(t => !t.completed_at && !t.done).length}
//       />
//       <NextAlarmChip />
//       <DashboardPartnerCard partner={partner} />

//       {/* ── Quick stats row (from your original dashboard) ── */}
//       <motion.div {...fadeUp(0.26)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
//         {[
//           { label: 'Total',   value: total,     Icon: CheckCircle2, color: '#22c55e' },
//           { label: 'Pending', value: remaining, Icon: Clock,        color: '#60a5fa' },
//           { label: 'Level',   value: level,     Icon: TrendingUp,   color: '#f59e0b' },
//         ].map(({ label, value, Icon, color }) => (
//           <div key={label} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
//             <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
//               <Icon size={16} color={color} />
//             </div>
//             <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
//           </div>
//         ))}
//       </motion.div>

//       {/* ── Task Groups ── */}
//       <motion.div {...fadeUp(0.18)} className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
//           <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
//             Task Groups
//             <span style={{ background: 'var(--brand-muted)', color: 'var(--brand)', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
//               {groups.length}
//             </span>
//           </h2>
//         </div>

//         {groups.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
//             Add some tasks to see groups here
//           </div>
//         ) : (
//           <div>
//             {groups.map((g, i) => {
//               const Icon  = GROUP_ICONS[i % GROUP_ICONS.length]
//               const color = GROUP_COLORS[i % GROUP_COLORS.length]
//               return (
//                 <div key={g.label} style={{ borderBottom: i < groups.length - 1 ? '1px solid var(--border)' : 'none' }}>
//                   <GroupRow icon={Icon} label={g.label} count={g.count} pct={g.pct} color={color} index={i} />
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.97 }}
//           onClick={() => setActiveView('tasks')}
//           style={{ width: '100%', marginTop: 14, background: 'var(--bg-surface-2)', border: '1.5px dashed var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
//         >
//           <Plus size={14} /> Add Task
//         </motion.button>
//       </motion.div>

//     </div>
//   )
// }



/**
 * src/pages/Dashboard.jsx
 * ─────────────────────────────────────────────────────────────────
 * Changes from original:
 *  1. Removed unused DashboardEnhancement import
 *  2. Added RecommendationsSection — renders ONLY when tasks.length === 0
 *  3. When tasks exist, shows normal dashboard content as before
 *  4. No other logic changed
 * ─────────────────────────────────────────────────────────────────
 */
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, MoreHorizontal, ArrowRight, CheckCircle2,
  Clock, Flame, Briefcase, User, BookOpen, TrendingUp,
  Plus, ChevronRight,
} from 'lucide-react'
import { useTaskStore, useUserStore, useUIStore } from '@/store'
import { useAuthStore }                           from '@/store/authStore'
import { levelFromXP }                            from '@/utils/constants'
import { RecommendationsSection }                 from '@/components/dashboard/RecommendationsSection'

/* ─── animation helper ──────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
})

const GROUP_ICONS  = [Briefcase, User, BookOpen, TrendingUp, Flame]
const GROUP_COLORS = ['#22c55e', '#f59e0b', '#60a5fa', '#f43f5e', '#a78bfa']

/* ─── Circular progress ─────────────────────────────────────── */
function CircleProgress({ pct = 0, size = 80, stroke = 7, color = '#22c55e' }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off  = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  )
}

/* ─── Small donut for task groups ──────────────────────────── */
function MiniDonut({ pct = 0, color = '#22c55e', size = 48 }) {
  const stroke = 5
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const off    = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--bg-surface-3)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  )
}

/* ─── Task group row ────────────────────────────────────────── */
function GroupRow({ icon: Icon, label, count, pct, color, index }) {
  return (
    <motion.div {...fadeUp(0.22 + index * 0.05)}
      whileHover={{ x: 3 }}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        padding:      '11px 0',
        borderBottom: '1px solid var(--border)',
        cursor:       'pointer',
        transition:   'transform .15s',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background:     `${color}18`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {label}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          {count} Tasks
        </p>
      </div>
      <MiniDonut pct={pct} color={color} size={44} />
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>
        {pct}%
      </span>
    </motion.div>
  )
}

/* ─── Dashboard ─────────────────────────────────────────────── */
export function DashboardPage() {
  const { tasks }         = useTaskStore()
  const { totalXP }       = useUserStore()
  const { setActiveView } = useUIStore()
  const { user }          = useAuthStore()

  const total     = tasks.length
  const done      = tasks.filter(t => t.done).length
  const remaining = total - done
  const pct       = total ? Math.round((done / total) * 100) : 0
  const { level } = levelFromXP(totalXP)

  /* Derive groups from priority */
  const groups = useMemo(() => {
    const urgent = tasks.filter(t => t.priority === 'urgent')
    const high   = tasks.filter(t => t.priority === 'high')
    const medium = tasks.filter(t => t.priority === 'medium')
    const low    = tasks.filter(t => t.priority === 'low')
    return [
      { label: 'Urgent', count: urgent.length, pct: urgent.length ? Math.round(urgent.filter(t => t.done).length / urgent.length * 100) : 0 },
      { label: 'High',   count: high.length,   pct: high.length   ? Math.round(high.filter(t => t.done).length   / high.length   * 100) : 0 },
      { label: 'Medium', count: medium.length, pct: medium.length ? Math.round(medium.filter(t => t.done).length / medium.length * 100) : 0 },
      { label: 'Low',    count: low.length,    pct: low.length    ? Math.round(low.filter(t => t.done).length    / low.length    * 100) : 0 },
    ].filter(g => g.count > 0).slice(0, 4)
  }, [tasks])

  const hour      = new Date().getHours()
  const timeLabel = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = (user?.name || 'there').split(' ')[0]
  const initials  = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Top bar ── */}
      <motion.div {...fadeUp()}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background:     'linear-gradient(135deg, #22c55e, #16a34a)',
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            fontSize:       15, fontWeight: 800, color: '#fff',
            fontFamily:     'var(--font-display)', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {timeLabel}!
            </p>
            <h1 style={{
              margin: 0, fontSize: 18, fontWeight: 800,
              color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
              letterSpacing: '-0.5px',
            }}>
              {firstName}
            </h1>
          </div>
        </div>
        <button className="btn-icon" aria-label="Notifications">
          <Bell size={20} />
        </button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          EMPTY STATE — show recommendations when no tasks
          ══════════════════════════════════════════════════════ */}
      {total === 0 && (
        <RecommendationsSection />
      )}

      {/* ══════════════════════════════════════════════════════
          NORMAL CONTENT — shown when tasks exist
          ══════════════════════════════════════════════════════ */}
      {total > 0 && (
        <>
          {/* ── Hero progress card ── */}
          <motion.div {...fadeUp(0.04)}
            style={{
              background:    'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
              borderRadius:  'var(--radius-xl)',
              padding:       '20px 22px',
              marginBottom:  24,
              position:      'relative',
              overflow:      'hidden',
            }}
          >
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {pct >= 80 ? "Almost done for today!" : pct >= 40 ? "Keep up the great work!" : "Let's get started today!"}
                </p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  {done} of {total} tasks completed
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveView('tasks')}
                  style={{
                    background:     'rgba(255,255,255,0.22)',
                    border:         '1px solid rgba(255,255,255,0.35)',
                    borderRadius:   'var(--radius-md)',
                    padding:        '9px 18px',
                    color:          '#fff',
                    fontSize:       13,
                    fontWeight:     700,
                    cursor:         'pointer',
                    backdropFilter: 'blur(8px)',
                    fontFamily:     'var(--font-body)',
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            6,
                  }}
                >
                  View Tasks <ArrowRight size={14} />
                </motion.button>
              </div>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CircleProgress pct={pct} size={86} stroke={7} color="rgba(255,255,255,0.9)" />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                    {pct}%
                  </span>
                </div>
                <button style={{ position: 'absolute', top: -4, right: -4, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <MoreHorizontal size={12} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Quick stats ── */}
          <motion.div {...fadeUp(0.26)}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}
          >
            {[
              { label: 'Total',   value: total,     Icon: CheckCircle2, color: '#22c55e' },
              { label: 'Pending', value: remaining,  Icon: Clock,        color: '#60a5fa' },
              { label: 'Level',   value: level,      Icon: TrendingUp,   color: '#f59e0b' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Task Groups ── */}
          <motion.div {...fadeUp(0.18)} className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 800,
                color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                Task Groups
                <span style={{ background: 'var(--brand-muted)', color: 'var(--brand)', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                  {groups.length}
                </span>
              </h2>
            </div>

            {groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Add some tasks to see groups here
              </div>
            ) : (
              <div>
                {groups.map((g, i) => {
                  const Icon  = GROUP_ICONS[i % GROUP_ICONS.length]
                  const color = GROUP_COLORS[i % GROUP_COLORS.length]
                  return (
                    <div key={g.label} style={{ borderBottom: i < groups.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <GroupRow icon={Icon} label={g.label} count={g.count} pct={g.pct} color={color} index={i} />
                    </div>
                  )
                })}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView('tasks')}
              style={{
                width:          '100%',
                marginTop:      14,
                background:     'var(--bg-surface-2)',
                border:         '1.5px dashed var(--border-muted)',
                borderRadius:   'var(--radius-md)',
                padding:        '10px',
                color:          'var(--text-muted)',
                fontSize:       13,
                fontWeight:     600,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            6,
              }}
            >
              <Plus size={14} /> Add Task
            </motion.button>
          </motion.div>
        </>
      )}

    </div>
  )
}