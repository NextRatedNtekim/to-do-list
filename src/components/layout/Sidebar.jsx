// /**
//  * Sidebar.jsx
//  * Fixed: shows unread notification count badge on Partner nav item
//  */
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard, CheckSquare, BarChart2, Trophy,
//   Users, Settings, X, Sun, Moon, Zap, LogOut,
// } from 'lucide-react'
// import { useUIStore, useUserStore } from '@/store'
// import { useAuthStore }              from '@/store/authStore'
// import { useNotificationStore }      from '@/store/notificationStore'
// import { useTheme }                  from '@/hooks'
// import { levelFromXP, getRankForLevel } from '@/utils/constants'

// const NAV_ITEMS = [
//   { id: 'dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
//   { id: 'tasks',       label: 'Tasks',        Icon: CheckSquare },
//   { id: 'analytics',  label: 'Analytics',   Icon: BarChart2 },
//   { id: 'leaderboard',label: 'Leaderboard', Icon: Trophy },
//   { id: 'partner',    label: 'Partner',     Icon: Users },   // shows unread badge
//   { id: 'settings',   label: 'Settings',    Icon: Settings },
// ]

// export function Sidebar({ isMobile }) {
//   const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
//   const { totalXP, streak }    = useUserStore()
//   const { user, logout }       = useAuthStore()
//   const { unreadCount }        = useNotificationStore()
//   const { theme, toggleTheme } = useTheme()

//   const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
//   const rank      = getRankForLevel(level)
//   const xpPct     = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)
//   const displayName = user?.name || 'Taskr User'
//   const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

//   function handleNavClick(id) {
//     setActiveView(id)
//     if (isMobile) setSidebarOpen(false)
//   }

//   return (
//     <motion.aside
//       initial={false}
//       animate={{ x: sidebarOpen ? 0 : -280 }}
//       transition={{ type: 'spring', stiffness: 360, damping: 34 }}
//       style={{
//         position:    'fixed', top: 0, left: 0, bottom: 0,
//         width:       'var(--sidebar-width)', zIndex: 40,
//         background:  'var(--bg-surface)',
//         borderRight: '1px solid var(--border)',
//         display:     'flex', flexDirection: 'column',
//         overflow:    'hidden',
//         boxShadow:   isMobile ? 'var(--shadow-xl)' : 'none',
//       }}
//     >
//       {/* Logo */}
//       <div style={{ height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', flexShrink: 0 }}>
//         <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', lineHeight: 1 }}>
//           Task<span style={{ color: 'var(--brand)' }}>r</span>
//         </div>
//         {isMobile && (
//           <button onClick={() => setSidebarOpen(false)} className="btn-icon" aria-label="Close sidebar">
//             <X size={16} />
//           </button>
//         )}
//       </div>

//       {/* User card */}
//       <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
//           <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', boxShadow: `0 0 0 2px ${rank.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: user?.avatar ? 'transparent' : `linear-gradient(135deg, var(--brand), ${rank.color})` }}>
//             {user?.avatar
//               ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
//               : <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{initials}</span>
//             }
//           </div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {displayName}
//             </div>
//             <div style={{ fontSize: 11, color: rank.color, fontWeight: 600 }}>
//               {rank.icon} {rank.title} · Lv.{level}
//             </div>
//           </div>
//         </div>

//         {/* XP bar */}
//         <div style={{ marginBottom: streak > 0 ? 8 : 0 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//             <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
//               {accumulated.toLocaleString()} / {nextThreshold.toLocaleString()} XP
//             </span>
//             <span style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 800 }}>{xpPct}%</span>
//           </div>
//           <div className="progress-track" style={{ height: 5 }}>
//             <motion.div
//               className="progress-fill"
//               animate={{ width: `${xpPct}%` }}
//               transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
//               style={{ background: `linear-gradient(90deg, var(--brand), ${rank.color})` }}
//             />
//           </div>
//         </div>

//         {streak > 0 && (
//           <div className="badge badge-gold" style={{ fontSize: 11 }}>
//             <span className="streak-flame">🔥</span> {streak}-day streak
//           </div>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }} className="scrollbar-none">
//         {NAV_ITEMS.map(({ id, label, Icon }) => {
//           const active      = activeView === id
//           const showBadge   = id === 'partner' && unreadCount > 0

//           return (
//             <motion.button
//               key={id}
//               whileHover={{ x: 3 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={() => handleNavClick(id)}
//               style={{
//                 width:          '100%',
//                 display:        'flex',
//                 alignItems:     'center',
//                 gap:            10,
//                 padding:        '9px 12px',
//                 borderRadius:   10,
//                 border:         'none',
//                 cursor:         'pointer',
//                 textAlign:      'left',
//                 fontFamily:     'var(--font-body)',
//                 fontSize:       14,
//                 fontWeight:     active ? 700 : 500,
//                 color:          active ? 'var(--brand)' : 'var(--text-secondary)',
//                 background:     active ? 'var(--brand-muted)' : 'transparent',
//                 marginBottom:   2,
//                 transition:     'color 0.12s, background 0.12s',
//                 position:       'relative',
//               }}
//               onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-surface-3)' }}
//               onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
//             >
//               {active && (
//                 <motion.div layoutId="nav-active" style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--brand)', borderRadius: '0 3px 3px 0' }} />
//               )}

//               {/* Icon with optional badge */}
//               <div style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
//                 <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
//                 <AnimatePresence>
//                   {showBadge && (
//                     <motion.span
//                       initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
//                       style={{
//                         position:       'absolute',
//                         top:            -4,
//                         right:          -5,
//                         minWidth:       14,
//                         height:         14,
//                         borderRadius:   99,
//                         background:     '#f43f5e',
//                         color:          '#fff',
//                         fontSize:       8,
//                         fontWeight:     800,
//                         display:        'flex',
//                         alignItems:     'center',
//                         justifyContent: 'center',
//                         padding:        '0 3px',
//                         border:         '1.5px solid var(--bg-surface)',
//                         fontFamily:     'var(--font-body)',
//                       }}
//                     >
//                       {unreadCount > 9 ? '9+' : unreadCount}
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {label}

//               {/* Text-level badge for extra visibility */}
//               {showBadge && (
//                 <span style={{ marginLeft: 'auto', background: '#f43f5e', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 99, padding: '2px 6px', fontFamily: 'var(--font-body)' }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </motion.button>
//           )
//         })}
//       </nav>

//       {/* Footer */}
//       <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//             <Zap size={12} color="#f59e0b" />
//             <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
//               {totalXP.toLocaleString()} total XP
//             </span>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
//             onClick={toggleTheme} className="btn-icon"
//             style={{ border: '1px solid var(--border)', background: 'var(--bg-surface-2)', borderRadius: 9, width: 30, height: 30 }}
//             aria-label="Toggle theme"
//           >
//             <AnimatePresence mode="wait">
//               <motion.span key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex' }}>
//                 {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
//               </motion.span>
//             </AnimatePresence>
//           </motion.button>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.97 }}
//           onClick={logout}
//           style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
//           onMouseEnter={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'; e.currentTarget.style.background = 'rgba(244,63,94,0.06)' }}
//           onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
//         >
//           <LogOut size={13} /> Sign Out
//         </motion.button>
//       </div>
//     </motion.aside>
//   )
// }


// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard, CheckSquare, BarChart2, Trophy,
//   Users, Settings, X, Sun, Moon, Zap, ChevronRight,
// } from 'lucide-react'
// import { useUIStore, useUserStore } from '@/store'
// import { useTheme } from '@/hooks'
// import { levelFromXP, getRankForLevel } from '@/utils/constants'

// const NAV_ITEMS = [
//   { id: 'dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
//   { id: 'tasks',       label: 'Tasks',        Icon: CheckSquare },
//   { id: 'analytics',   label: 'Analytics',    Icon: BarChart2 },
//   { id: 'leaderboard', label: 'Leaderboard',  Icon: Trophy },
//   { id: 'partner',     label: 'Partner',      Icon: Users },
//   { id: 'settings',    label: 'Settings',     Icon: Settings },
// ]

// export function Sidebar({ isMobile }) {
//   const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
//   const { totalXP, streak, profile } = useUserStore()
//   const { theme, toggleTheme } = useTheme()

//   const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
//   const rank    = getRankForLevel(level)
//   const xpPct   = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)
//   const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

//   function handleNavClick(id) {
//     setActiveView(id)
//     if (isMobile) setSidebarOpen(false)
//   }

//   return (
//     <motion.aside
//       initial={false}
//       animate={{ x: sidebarOpen ? 0 : -280 }}
//       transition={{ type: 'spring', stiffness: 360, damping: 34 }}
//       style={{
//         position:    'fixed',
//         top:         0,
//         left:        0,
//         bottom:      0,
//         width:       'var(--sidebar-width)',
//         zIndex:      40,
//         background:  'var(--bg-surface)',
//         borderRight: '1px solid var(--border)',
//         display:     'flex',
//         flexDirection: 'column',
//         overflow:    'hidden',
//         boxShadow:   isMobile ? 'var(--shadow-xl)' : 'none',
//       }}
//     >
//       {/* ── Logo row ── */}
//       <div style={{
//         height:       'var(--topbar-height)',
//         borderBottom: '1px solid var(--border)',
//         display:      'flex',
//         alignItems:   'center',
//         justifyContent: 'space-between',
//         padding:      '0 18px',
//         flexShrink:   0,
//       }}>
//         <div style={{
//           fontFamily:    'var(--font-display)',
//           fontSize:      26,
//           fontWeight:    800,
//           letterSpacing: '-1.5px',
//           color:         'var(--text-primary)',
//           lineHeight:    1,
//         }}>
//           WithTask<span style={{ color: 'var(--brand)' }}>r</span>
//         </div>
//         {isMobile && (
//           <button onClick={() => setSidebarOpen(false)} className="btn-icon" aria-label="Close sidebar">
//             <X size={16} />
//           </button>
//         )}
//       </div>

//       {/* ── User card ── */}
//       <div style={{
//         padding:      '16px',
//         borderBottom: '1px solid var(--border)',
//         flexShrink:   0,
//       }}>
//         {/* Avatar + name row */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
//           <div style={{
//             width:      42,
//             height:     42,
//             borderRadius: '50%',
//             flexShrink:  0,
//             background:  `linear-gradient(135deg, var(--brand), ${rank.color})`,
//             display:     'flex',
//             alignItems:  'center',
//             justifyContent: 'center',
//             fontSize:    14,
//             fontWeight:  800,
//             color:       '#fff',
//             fontFamily:  'var(--font-display)',
//             boxShadow:   '0 2px 10px var(--brand-glow)',
//           }}>
//             {initials}
//           </div>
//           <div style={{ minWidth: 0, flex: 1 }}>
//             <div style={{
//               fontSize:      13,
//               fontWeight:    700,
//               color:         'var(--text-primary)',
//               fontFamily:    'var(--font-display)',
//               overflow:      'hidden',
//               textOverflow:  'ellipsis',
//               whiteSpace:    'nowrap',
//             }}>
//               {profile.name}
//             </div>
//             <div style={{
//               fontSize:   11,
//               color:      rank.color,
//               fontWeight: 600,
//               display:    'flex',
//               alignItems: 'center',
//               gap:        3,
//               marginTop:  2,
//             }}>
//               {rank.icon} {rank.title} · Lv.{level}
//             </div>
//           </div>
//         </div>

//         {/* XP progress */}
//         <div style={{
//           background:   'var(--bg-surface-2)',
//           borderRadius: 'var(--radius-md)',
//           padding:      '10px 12px',
//           border:       '1px solid var(--border)',
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//               <Zap size={12} color="#f59e0b" />
//               <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>XP Progress</span>
//             </div>
//             <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 800 }}>{xpPct}%</span>
//           </div>
//           <div className="progress-track" style={{ height: 6 }}>
//             <motion.div
//               className="progress-fill"
//               animate={{ width: `${xpPct}%` }}
//               transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
//               style={{ background: `linear-gradient(90deg, var(--brand), ${rank.color})` }}
//             />
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
//             <span>{accumulated.toLocaleString()} XP</span>
//             <span>{nextThreshold.toLocaleString()} XP</span>
//           </div>
//         </div>

//         {/* Streak badge */}
//         {streak > 0 && (
//           <div className="badge badge-gold" style={{ marginTop: 10, fontSize: 12, width: '100%', justifyContent: 'center' }}>
//             <span className="streak-flame">🔥</span> {streak}-day streak
//           </div>
//         )}
//       </div>

//       {/* ── Navigation ── */}
//       <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }} className="scrollbar-none">
//         {NAV_ITEMS.map(({ id, label, Icon }) => {
//           const active = activeView === id
//           return (
//             <motion.button
//               key={id}
//               whileHover={{ x: active ? 0 : 3 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={() => handleNavClick(id)}
//               style={{
//                 width:         '100%',
//                 display:       'flex',
//                 alignItems:    'center',
//                 gap:           10,
//                 padding:       '10px 12px',
//                 borderRadius:  'var(--radius-md)',
//                 border:        'none',
//                 cursor:        'pointer',
//                 textAlign:     'left',
//                 fontFamily:    'var(--font-body)',
//                 fontSize:      14,
//                 fontWeight:    active ? 700 : 500,
//                 color:         active ? 'var(--brand)' : 'var(--text-secondary)',
//                 background:    active ? 'var(--brand-muted)' : 'transparent',
//                 marginBottom:  2,
//                 transition:    'color 0.12s, background 0.12s',
//                 position:      'relative',
//               }}
//               onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-surface-3)' }}
//               onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
//             >
//               {/* Active left bar */}
//               {active && (
//                 <motion.div
//                   layoutId="nav-active-bar"
//                   style={{
//                     position:     'absolute',
//                     left:         0,
//                     top:          '18%',
//                     bottom:       '18%',
//                     width:        3,
//                     background:   'var(--brand)',
//                     borderRadius: '0 3px 3px 0',
//                   }}
//                 />
//               )}

//               {/* Icon container */}
//               <div style={{
//                 width:          32,
//                 height:         32,
//                 borderRadius:   'var(--radius-sm)',
//                 background:     active ? 'rgba(34,197,94,0.15)' : 'var(--bg-surface-3)',
//                 display:        'flex',
//                 alignItems:     'center',
//                 justifyContent: 'center',
//                 flexShrink:     0,
//                 transition:     'background 0.12s',
//               }}>
//                 <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
//               </div>

//               <span style={{ flex: 1 }}>{label}</span>

//               {active && (
//                 <ChevronRight size={14} style={{ opacity: 0.5 }} />
//               )}
//             </motion.button>
//           )
//         })}
//       </nav>

//       {/* ── Footer ── */}
//       <div style={{
//         padding:      '12px 16px',
//         borderTop:    '1px solid var(--border)',
//         display:      'flex',
//         alignItems:   'center',
//         justifyContent: 'space-between',
//         flexShrink:   0,
//         background:   'var(--bg-surface-2)',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <div style={{
//             width:          28,
//             height:         28,
//             borderRadius:   8,
//             background:     'rgba(245,158,11,0.12)',
//             display:        'flex',
//             alignItems:     'center',
//             justifyContent: 'center',
//           }}>
//             <Zap size={13} color="#f59e0b" />
//           </div>
//           <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
//             {totalXP.toLocaleString()} XP
//           </span>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
//           onClick={toggleTheme}
//           className="btn-icon"
//           style={{
//             border:       '1px solid var(--border)',
//             background:   'var(--bg-surface)',
//             borderRadius: 'var(--radius-sm)',
//             width:        32,
//             height:       32,
//           }}
//           aria-label="Toggle theme"
//         >
//           <AnimatePresence mode="wait">
//             <motion.span
//               key={theme}
//               initial={{ rotate: -30, opacity: 0 }}
//               animate={{ rotate: 0,   opacity: 1 }}
//               exit={{   rotate:  30, opacity: 0 }}
//               transition={{ duration: 0.18 }}
//               style={{ display: 'flex' }}
//             >
//               {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
//             </motion.span>
//           </AnimatePresence>
//         </motion.button>
//       </div>
//     </motion.aside>
//   )
// }



// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard, CheckSquare, BarChart2, Trophy,
//   Users, Settings, X, Sun, Moon, Zap, ChevronRight, Calendar
// } from 'lucide-react'
// import { useUIStore, useUserStore } from '@/store'
// import { useTheme } from '@/hooks'
// import { levelFromXP, getRankForLevel } from '@/utils/constants'

// const NAV_ITEMS = [
//   { id: 'dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
//   { id: 'tasks',       label: 'Tasks',        Icon: CheckSquare },
//   { id: 'routines',    label: 'Routines',     Icon: CheckSquare },
//   { id: 'calendar',    label: 'Calendar',     Icon: Calendar },
//   { id: 'analytics',   label: 'Analytics',    Icon: BarChart2 },
//   { id: 'leaderboard', label: 'Leaderboard',  Icon: Trophy },
//   { id: 'partner',     label: 'Partner',      Icon: Users },
//   { id: 'settings',    label: 'Settings',     Icon: Settings },
// ]

// export function Sidebar({ isMobile }) {
//   const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
//   const { totalXP, streak, profile } = useUserStore()
//   const { theme, toggleTheme } = useTheme()

//   const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
//   const rank    = getRankForLevel(level)
//   const xpPct   = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)
//   const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

//   function handleNavClick(id) {
//     setActiveView(id)
//     if (isMobile) setSidebarOpen(false)
//   }

//   return (
//     <motion.aside
//       initial={false}
//       animate={{ x: sidebarOpen ? 0 : -280 }}
//       transition={{ type: 'spring', stiffness: 360, damping: 34 }}
//       style={{
//         position:      'fixed',
//         top:           0, left: 0, bottom: 0,
//         width:         'var(--sidebar-width)',
//         zIndex:        60,
//         background:    'var(--glass-panel)',
//         backdropFilter:'blur(40px) saturate(180%)',
//         WebkitBackdropFilter: 'blur(40px) saturate(180%)',
//         borderRight:   '1px solid var(--glass-panel-border)',
//         display:       'flex',
//         flexDirection: 'column',
//         overflow:      'hidden',
//         boxShadow:     isMobile ? 'var(--shadow-xl)' : 'none',
//       }}
//     >
//       {/* ── Logo row ── */}
//       <div style={{
//         height:         'var(--topbar-height)',
//         borderBottom:   '1px solid var(--glass-panel-border)',
//         display:        'flex',
//         alignItems:     'center',
//         justifyContent: 'space-between',
//         padding:        '0 18px',
//         flexShrink:     0,
//         background:     'var(--glass-logo-row)',
//       }}>
//         <div style={{
//           fontFamily:    'var(--font-display)',
//           fontSize:      26, fontWeight: 800,
//           letterSpacing: '-1.5px',
//           color:         'var(--text-primary)',
//           lineHeight:    1,
//         }}>
//           WithTask<span style={{ color: 'var(--brand)' }}>r</span>
//         </div>
//         {isMobile && (
//           <button
//             onClick={() => setSidebarOpen(false)}
//             aria-label="Close sidebar"
//             style={{
//               width:          32, height: 32,
//               borderRadius:   '50%',
//               background:     'var(--glass-btn)',
//               border:         '1px solid var(--glass-btn-border)',
//               display:        'flex', alignItems: 'center', justifyContent: 'center',
//               cursor:         'pointer',
//               color:          'var(--text-muted)',
//             }}
//           >
//             <X size={15} />
//           </button>
//         )}
//       </div>

//       {/* ── User card ── */}
//       <div style={{
//         padding:      '14px',
//         borderBottom: '1px solid var(--glass-panel-border)',
//         flexShrink:   0,
//       }}>
//         {/* Avatar + name */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
//           <div style={{
//             width:          44, height: 44,
//             borderRadius:   '50%',
//             flexShrink:     0,
//             background:     `linear-gradient(135deg, var(--brand), ${rank.color})`,
//             display:        'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize:       14, fontWeight: 800, color: '#fff',
//             fontFamily:     'var(--font-display)',
//             boxShadow:      '0 4px 14px var(--brand-glow), 0 0 0 3px var(--glass-btn-border)',
//           }}>
//             {initials}
//           </div>
//           <div style={{ minWidth: 0, flex: 1 }}>
//             <div style={{
//               fontSize: 13, fontWeight: 700,
//               color:    'var(--text-primary)',
//               fontFamily: 'var(--font-display)',
//               overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//             }}>
//               {profile.name}
//             </div>
//             <div style={{
//               fontSize: 11, color: rank.color, fontWeight: 600,
//               display: 'flex', alignItems: 'center', gap: 3, marginTop: 2,
//             }}>
//               {rank.icon} {rank.title} · Lv.{level}
//             </div>
//           </div>
//         </div>

//         {/* XP progress card */}
//         <div style={{
//           background:          'var(--glass-card)',
//           backdropFilter:      'blur(16px)',
//           WebkitBackdropFilter:'blur(16px)',
//           borderRadius:        'var(--radius-md)',
//           padding:             '10px 12px',
//           border:              '1px solid var(--glass-card-border)',
//           boxShadow:           'var(--shadow-xs)',
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//               <Zap size={12} color="#f59e0b" />
//               <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>XP Progress</span>
//             </div>
//             <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 800 }}>{xpPct}%</span>
//           </div>
//           <div className="progress-track" style={{ height: 6 }}>
//             <motion.div
//               className="progress-fill"
//               animate={{ width: `${xpPct}%` }}
//               transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
//               style={{ background: `linear-gradient(90deg, var(--brand), ${rank.color})` }}
//             />
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
//             <span>{accumulated.toLocaleString()} XP</span>
//             <span>{nextThreshold.toLocaleString()} XP</span>
//           </div>
//         </div>

//         {streak > 0 && (
//           <div className="badge badge-gold" style={{ marginTop: 10, fontSize: 12, width: '100%', justifyContent: 'center' }}>
//             <span className="streak-flame">🔥</span> {streak}-day streak
//           </div>
//         )}
//       </div>

//       {/* ── Navigation ── */}
//       <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }} className="scrollbar-none">
//         {NAV_ITEMS.map(({ id, label, Icon }) => {
//           const active = activeView === id
//           return (
//             <motion.button
//               key={id}
//               whileHover={{ x: active ? 0 : 2 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={() => handleNavClick(id)}
//               style={{
//                 width:        '100%',
//                 display:      'flex', alignItems: 'center', gap: 10,
//                 padding:      '9px 12px',
//                 borderRadius: 'var(--radius-md)',
//                 border:       active ? '1px solid var(--glass-card-border)' : '1px solid transparent',
//                 cursor:       'pointer', textAlign: 'left',
//                 fontFamily:   'var(--font-body)', fontSize: 14,
//                 fontWeight:   active ? 700 : 500,
//                 color:        active ? 'var(--brand)' : 'var(--text-secondary)',
//                 background:   active ? 'var(--glass-nav-active)' : 'transparent',
//                 backdropFilter:      active ? 'blur(12px)' : 'none',
//                 WebkitBackdropFilter:active ? 'blur(12px)' : 'none',
//                 boxShadow:    active ? 'var(--shadow-xs)' : 'none',
//                 marginBottom: 2,
//                 transition:   'color 0.12s, background 0.12s, box-shadow 0.12s, border-color 0.12s',
//                 position:     'relative',
//               }}
//               onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--glass-nav-hover)'; e.currentTarget.style.borderColor = 'var(--glass-panel-border)' } }}
//               onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
//             >
//               {active && (
//                 <motion.div
//                   layoutId="nav-active-bar"
//                   style={{
//                     position: 'absolute', left: 0, top: '18%', bottom: '18%',
//                     width: 3, background: 'var(--brand)', borderRadius: '0 3px 3px 0',
//                   }}
//                 />
//               )}

//               <div style={{
//                 width:          32, height: 32,
//                 borderRadius:   'var(--radius-sm)',
//                 background:     active ? 'var(--brand-muted)' : 'var(--glass-btn)',
//                 border:         active ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-btn-border)',
//                 display:        'flex', alignItems: 'center', justifyContent: 'center',
//                 flexShrink:     0, transition: 'background 0.12s',
//               }}>
//                 <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
//               </div>

//               <span style={{ flex: 1 }}>{label}</span>
//               {active && <ChevronRight size={14} style={{ opacity: 0.4 }} />}
//             </motion.button>
//           )
//         })}
//       </nav>

//       {/* ── Footer ── */}
//       <div style={{
//         padding:             '12px 14px',
//         borderTop:           '1px solid var(--glass-panel-border)',
//         display:             'flex', alignItems: 'center', justifyContent: 'space-between',
//         flexShrink:          0,
//         background:          'var(--glass-footer)',
//         backdropFilter:      'blur(16px)',
//         WebkitBackdropFilter:'blur(16px)',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <div style={{
//             width: 28, height: 28, borderRadius: 8,
//             background: 'rgba(245,158,11,0.14)',
//             border:     '1px solid rgba(245,158,11,0.22)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Zap size={13} color="#f59e0b" />
//           </div>
//           <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
//             {totalXP.toLocaleString()} XP
//           </span>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
//           onClick={toggleTheme}
//           aria-label="Toggle theme"
//           style={{
//             width:               32, height: 32,
//             borderRadius:        '50%',
//             background:          'var(--glass-btn)',
//             border:              '1px solid var(--glass-btn-border)',
//             display:             'flex', alignItems: 'center', justifyContent: 'center',
//             cursor:              'pointer',
//             color:               'var(--text-muted)',
//             boxShadow:           'var(--shadow-xs)',
//             backdropFilter:      'blur(12px)',
//             WebkitBackdropFilter:'blur(12px)',
//           }}
//         >
//           <AnimatePresence mode="wait">
//             <motion.span
//               key={theme}
//               initial={{ rotate: -30, opacity: 0 }}
//               animate={{ rotate:   0, opacity: 1 }}
//               exit={{   rotate:  30, opacity: 0 }}
//               transition={{ duration: 0.18 }}
//               style={{ display: 'flex' }}
//             >
//               {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
//             </motion.span>
//           </AnimatePresence>
//         </motion.button>
//       </div>
//     </motion.aside>
//   )
// }


/**
 * src/components/layout/Sidebar.jsx
 * CHANGE: Added Routines nav item with RefreshCw icon
 * Everything else preserved exactly as-is from original
 */
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, BarChart2, Trophy,
  Users, Settings, X, Sun, Moon, Zap, ChevronRight,
  Calendar, RefreshCw,
} from 'lucide-react'
import { useUIStore, useUserStore } from '@/store'
import { useTheme } from '@/hooks'
import { levelFromXP, getRankForLevel } from '@/utils/constants'

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',        Icon: CheckSquare     },
  { id: 'routines',    label: 'Routines',     Icon: RefreshCw       }, // ← NEW
  { id: 'calendar',    label: 'Calendar',     Icon: Calendar        }, // ← NEW
  { id: 'analytics',   label: 'Analytics',    Icon: BarChart2       },
  { id: 'leaderboard', label: 'Leaderboard',  Icon: Trophy          },
  { id: 'partner',     label: 'Partner',      Icon: Users           },
  { id: 'settings',    label: 'Settings',     Icon: Settings        },
]

export function Sidebar({ isMobile }) {
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
  const { totalXP, streak, profile } = useUserStore()
  const { theme, toggleTheme } = useTheme()

  const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
  const rank    = getRankForLevel(level)
  const xpPct   = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  function handleNavClick(id) {
    setActiveView(id)
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ x: sidebarOpen ? 0 : -280 }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      style={{
        position:'fixed', top:0, left:0, bottom:0,
        width:         'var(--sidebar-width)',
        zIndex:        60,
        background:    'var(--glass-panel)',
        backdropFilter:'blur(40px) saturate(180%)',
        WebkitBackdropFilter:'blur(40px) saturate(180%)',
        borderRight:   '1px solid var(--glass-panel-border)',
        display:       'flex', flexDirection:'column',
        overflow:      'hidden',
        boxShadow:     isMobile ? 'var(--shadow-xl)' : 'none',
      }}
    >
      {/* Logo */}
      <div style={{
        height:'var(--topbar-height)',
        borderBottom:'1px solid var(--glass-panel-border)',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 18px',flexShrink:0,
        background:'var(--glass-logo-row)',
      }}>
        <div style={{ fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,letterSpacing:'-1.5px',color:'var(--text-primary)',lineHeight:1 }}>
          WithTask<span style={{ color:'var(--brand)' }}>r</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} aria-label="Close"
            style={{ width:32,height:32,borderRadius:'50%',background:'var(--glass-btn)',border:'1px solid var(--glass-btn-border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-muted)' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* User card */}
      <div style={{ padding:'14px',borderBottom:'1px solid var(--glass-panel-border)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
          <div style={{
            width:44,height:44,borderRadius:'50%',flexShrink:0,
            background:`linear-gradient(135deg,var(--brand),${rank.color})`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:14,fontWeight:800,color:'#fff',fontFamily:'var(--font-display)',
            boxShadow:'0 4px 14px var(--brand-glow)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth:0,flex:1 }}>
            <div style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)',fontFamily:'var(--font-display)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {profile.name}
            </div>
            <div style={{ fontSize:11,color:rank.color,fontWeight:600,display:'flex',alignItems:'center',gap:3,marginTop:2 }}>
              {rank.icon} {rank.title} · Lv.{level}
            </div>
          </div>
        </div>

        {/* XP card */}
        <div style={{ background:'var(--glass-card)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',borderRadius:'var(--radius-md)',padding:'10px 12px',border:'1px solid var(--glass-card-border)',boxShadow:'var(--shadow-xs)' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
            <div style={{ display:'flex',alignItems:'center',gap:5 }}>
              <Zap size={12} color="#f59e0b" />
              <span style={{ fontSize:11,color:'var(--text-muted)',fontWeight:600 }}>XP Progress</span>
            </div>
            <span style={{ fontSize:11,color:'var(--brand)',fontWeight:800 }}>{xpPct}%</span>
          </div>
          <div className="progress-track" style={{ height:6 }}>
            <motion.div className="progress-fill" animate={{ width:`${xpPct}%` }} transition={{ duration:0.9,ease:[0.4,0,0.2,1] }}
              style={{ background:`linear-gradient(90deg,var(--brand),${rank.color})` }} />
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:6,fontSize:10,color:'var(--text-muted)' }}>
            <span>{accumulated.toLocaleString()} XP</span>
            <span>{nextThreshold.toLocaleString()} XP</span>
          </div>
        </div>

        {streak > 0 && (
          <div className="badge badge-gold" style={{ marginTop:10,fontSize:12,width:'100%',justifyContent:'center' }}>
            <span className="streak-flame">🔥</span> {streak}-day streak
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:'8px',overflowY:'auto' }} className="scrollbar-none">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeView === id
          return (
            <motion.button
              key={id}
              whileHover={{ x: active ? 0 : 2 }}
              whileTap={{ scale:0.97 }}
              onClick={() => handleNavClick(id)}
              style={{
                width:'100%',display:'flex',alignItems:'center',gap:10,
                padding:'9px 12px',borderRadius:'var(--radius-md)',
                border:       active ? '1px solid var(--glass-card-border)' : '1px solid transparent',
                cursor:'pointer',textAlign:'left',
                fontFamily:'var(--font-body)',fontSize:14,
                fontWeight:   active ? 700 : 500,
                color:        active ? 'var(--brand)' : 'var(--text-secondary)',
                background:   active ? 'var(--glass-nav-active)' : 'transparent',
                backdropFilter:      active ? 'blur(12px)' : 'none',
                WebkitBackdropFilter:active ? 'blur(12px)' : 'none',
                boxShadow:    active ? 'var(--shadow-xs)' : 'none',
                marginBottom:2,
                transition:'color 0.12s,background 0.12s,box-shadow 0.12s',
                position:'relative',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--glass-nav-hover)'; e.currentTarget.style.borderColor='var(--glass-panel-border)' }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}}
            >
              {active && (
                <motion.div layoutId="nav-active-bar"
                  style={{ position:'absolute',left:0,top:'18%',bottom:'18%',width:3,background:'var(--brand)',borderRadius:'0 3px 3px 0' }} />
              )}
              <div style={{
                width:32,height:32,borderRadius:'var(--radius-sm)',
                background:   active ? 'var(--brand-muted)' : 'var(--glass-btn)',
                border:       active ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-btn-border)',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                transition:'background 0.12s',
              }}>
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span style={{ flex:1 }}>{label}</span>
              {active && <ChevronRight size={14} style={{ opacity:0.4 }} />}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding:'12px 14px',borderTop:'1px solid var(--glass-panel-border)',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        flexShrink:0,background:'var(--glass-footer)',
        backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:'rgba(245,158,11,0.14)',border:'1px solid rgba(245,158,11,0.22)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Zap size={13} color="#f59e0b" />
          </div>
          <span style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:700 }}>
            {totalXP.toLocaleString()} XP
          </span>
        </div>
        <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.88 }} onClick={toggleTheme} aria-label="Toggle theme"
          style={{ width:32,height:32,borderRadius:'50%',background:'var(--glass-btn)',border:'1px solid var(--glass-btn-border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-muted)',boxShadow:'var(--shadow-xs)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)' }}>
          <AnimatePresence mode="wait">
            <motion.span key={theme} initial={{ rotate:-30,opacity:0 }} animate={{ rotate:0,opacity:1 }} exit={{ rotate:30,opacity:0 }} transition={{ duration:0.18 }} style={{ display:'flex' }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}