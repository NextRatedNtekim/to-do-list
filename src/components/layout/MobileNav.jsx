// /**
//  * MobileNav.jsx
//  * Fixed: shows unread notification badge on the bell tab
//  */
// import { motion, AnimatePresence } from 'framer-motion'
// import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Settings, Bell } from 'lucide-react'
// import { useUIStore } from '@/store'
// import { useNotificationStore } from '@/store/notificationStore'

// const NAV = [
//   { id: 'dashboard',   label: 'Home',   Icon: LayoutDashboard },
//   { id: 'tasks',       label: 'Tasks',  Icon: CheckSquare },
//   { id: 'analytics',  label: 'Stats',  Icon: BarChart2 },
//   { id: 'leaderboard',label: 'Ranks',  Icon: Trophy },
//   { id: 'partner',    label: 'Partner', Icon: Bell },        // Bell shows unread badge
//   { id: 'settings',   label: 'More',   Icon: Settings },
// ]

// export function MobileNav() {
//   const { activeView, setActiveView } = useUIStore()
//   const { unreadCount }               = useNotificationStore()

//   return (
//     <nav
//       style={{
//         display:        'flex',
//         alignItems:     'center',
//         justifyContent: 'space-around',
//         position:       'fixed',
//         bottom:         0, left: 0, right: 0,
//         zIndex:         50,
//         background:     'var(--bg-surface)',
//         borderTop:      '1px solid var(--border)',
//         padding:        '6px 0 calc(6px + env(safe-area-inset-bottom))',
//         boxShadow:      '0 -4px 24px rgba(0,0,0,0.1)',
//       }}
//     >
//       {NAV.map(({ id, label, Icon }) => {
//         const active     = activeView === id
//         const showBadge  = id === 'partner' && unreadCount > 0

//         return (
//           <motion.button
//             key={id}
//             whileTap={{ scale: 0.85 }}
//             onClick={() => setActiveView(id)}
//             style={{
//               flex:          1,
//               display:       'flex',
//               flexDirection: 'column',
//               alignItems:    'center',
//               gap:           3,
//               padding:       '6px 2px',
//               background:    'none',
//               border:        'none',
//               cursor:        'pointer',
//               color:         active ? 'var(--brand)' : 'var(--text-muted)',
//               transition:    'color 0.15s',
//               position:      'relative',
//             }}
//             aria-label={label}
//           >
//             {/* Active indicator bar */}
//             {active && (
//               <motion.div
//                 layoutId="mobile-nav-dot"
//                 style={{
//                   position:     'absolute',
//                   top:          2,
//                   left:         '50%',
//                   transform:    'translateX(-50%)',
//                   width:        20,
//                   height:       3,
//                   borderRadius: 99,
//                   background:   'var(--brand)',
//                 }}
//               />
//             )}

//             {/* Icon + unread badge */}
//             <div style={{ position: 'relative', display: 'flex' }}>
//               <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />

//               <AnimatePresence>
//                 {showBadge && (
//                   <motion.span
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     exit={{ scale: 0 }}
//                     style={{
//                       position:       'absolute',
//                       top:            -4,
//                       right:          -5,
//                       minWidth:       14,
//                       height:         14,
//                       borderRadius:   99,
//                       background:     '#f43f5e',
//                       color:          '#fff',
//                       fontSize:       8,
//                       fontWeight:     800,
//                       display:        'flex',
//                       alignItems:     'center',
//                       justifyContent: 'center',
//                       padding:        '0 3px',
//                       border:         '1.5px solid var(--bg-surface)',
//                       fontFamily:     'var(--font-body)',
//                     }}
//                   >
//                     {unreadCount > 9 ? '9+' : unreadCount}
//                   </motion.span>
//                 )}
//               </AnimatePresence>
//             </div>

//             <span style={{
//               fontSize:   10,
//               fontWeight: active ? 700 : 500,
//               fontFamily: 'var(--font-body)',
//               letterSpacing: '0.02em',
//             }}>
//               {label}
//             </span>
//           </motion.button>
//         )
//       })}
//     </nav>
//   )
// }


// import { motion, AnimatePresence } from 'framer-motion'
// import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Settings, Bell } from 'lucide-react'
// import { useUIStore } from '@/store'
// import { useNotificationStore } from '@/store/notificationStore'

// const NAV = [
  
//   { id: 'tasks',        label: 'Tasks',   Icon: CheckSquare },
//   { id: 'analytics',   label: 'Stats',   Icon: BarChart2 },
//   { id: 'dashboard',    label: 'Home',    Icon: LayoutDashboard },
//   // { id: 'leaderboard', label: 'Ranks',   Icon: Trophy },
//   { id: 'partner',     label: 'Partner', Icon: Bell },
//   { id: 'settings',    label: 'More',    Icon: Settings },
// ]

// export function MobileNav() {
//   const { activeView, setActiveView } = useUIStore()
//   const { unreadCount }               = useNotificationStore()

//   return (
//     /* ── Outer wrapper: frosted glass container floating above page ── */
//     <div
//       style={{
//         position: 'fixed',
//         bottom:   'calc(12px + env(safe-area-inset-bottom))',
//         left:     '50%',
//         transform:'translateX(-50%)',
//         zIndex:   50,
//         /* Limit width so it feels like a centered iOS pill bar */
//         width:    'calc(100% - 32px)',
//         maxWidth: 480,
//       }}
//     >
//       <nav
//         style={{
//           display:        'flex',
//           alignItems:     'center',
//           justifyContent: 'space-around',
//           /* iOS frosted glass panel */
//           background:     'rgba(255,255,255,0.78)',
//           backdropFilter: 'blur(28px) saturate(180%)',
//           WebkitBackdropFilter: 'blur(28px) saturate(180%)',
//           border:         '1px solid rgba(255,255,255,0.9)',
//           borderRadius:   9999,
//           boxShadow:      '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
//           padding:        '6px 8px',
//         }}
//       >
//         {NAV.map(({ id, label, Icon }) => {
//           const active    = activeView === id
//           const showBadge = id === 'partner' && unreadCount > 0

//           return (
//             <motion.button
//               key={id}
//               whileTap={{ scale: 0.82 }}
//               onClick={() => setActiveView(id)}
//               style={{
//                 flex:          1,
//                 display:       'flex',
//                 flexDirection: 'column',
//                 alignItems:    'center',
//                 gap:           2,
//                 padding:       '4px 2px',
//                 background:    'none',
//                 border:        'none',
//                 cursor:        'pointer',
//                 color:         active ? 'var(--brand)' : 'var(--text-muted)',
//                 transition:    'color 0.15s',
//                 position:      'relative',
//                 borderRadius:  9999,
//                 minWidth:      0,
//               }}
//               aria-label={label}
//             >
//               {/* ── Active pill capsule (dark, iOS-style) ── */}
//               {active && (
//                 <motion.div
//                   layoutId="ios-nav-active"
//                   transition={{ type: 'spring', stiffness: 380, damping: 32 }}
//                   style={{
//                     position:     'absolute',
//                     inset:        0,
//                     borderRadius: 9999,
//                     background:   '#16a34a',   /* dark capsule like reference */
//                     zIndex:       0,
//                   }}
//                 />
//               )}

//               {/* ── Icon + unread badge ── */}
//               <div style={{ position: 'relative', display: 'flex', zIndex: 1 }}>
//                 <Icon
//                   size={19}
//                   strokeWidth={active ? 2.4 : 1.7}
//                   color={active ? '#ffffff' : undefined}
//                 />

//                 <AnimatePresence>
//                   {showBadge && (
//                     <motion.span
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       exit={{ scale: 0 }}
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
//                         border:         '1.5px solid rgba(255,255,255,0.9)',
//                         fontFamily:     'var(--font-body)',
//                       }}
//                     >
//                       {unreadCount > 9 ? '9+' : unreadCount}
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* ── Label ── */}
//               <span
//                 style={{
//                   fontSize:      9.5,
//                   fontWeight:    active ? 700 : 500,
//                   fontFamily:    'var(--font-body)',
//                   letterSpacing: '0.02em',
//                   color:         active ? '#ffffff' : 'var(--text-muted)',
//                   zIndex:        1,
//                   position:      'relative',
//                 }}
//               >
//                 {label}
//               </span>
//             </motion.button>
//           )
//         })}
//       </nav>
//     </div>
//   )
// }

// import { motion, AnimatePresence } from 'framer-motion'
// import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Settings, Bell } from 'lucide-react'
// import { useUIStore } from '@/store'
// import { useNotificationStore } from '@/store/notificationStore'

// const NAV = [
//   { id: 'dashboard',    label: 'Home',    Icon: LayoutDashboard },
//   { id: 'tasks',        label: 'Tasks',   Icon: CheckSquare },
//   { id: 'analytics',   label: 'Stats',   Icon: BarChart2 },
//   { id: 'leaderboard', label: 'Ranks',   Icon: Trophy },
//   { id: 'partner',     label: 'Partner', Icon: Bell },
//   { id: 'settings',    label: 'More',    Icon: Settings },
// ]

// export function MobileNav() {
//   const { activeView, setActiveView } = useUIStore()
//   const { unreadCount }               = useNotificationStore()

//   return (
//     <div style={{
//       position:  'fixed',
//       bottom:    'calc(12px + env(safe-area-inset-bottom))',
//       left:      '50%',
//       transform: 'translateX(-50%)',
//       zIndex:    50,
//       width:     'calc(100% - 32px)',
//       maxWidth:  480,
//     }}>
//       <nav style={{
//         display:             'flex',
//         alignItems:          'center',
//         justifyContent:      'space-around',
//         background:          'var(--glass-panel)',
//         backdropFilter:      'blur(32px) saturate(180%)',
//         WebkitBackdropFilter:'blur(32px) saturate(180%)',
//         border:              '1px solid var(--glass-panel-border)',
//         borderRadius:        9999,
//         boxShadow:           'var(--shadow-float)',
//         padding:             '6px 8px',
//       }}>
//         {NAV.map(({ id, label, Icon }) => {
//           const active    = activeView === id
//           const showBadge = id === 'partner' && unreadCount > 0

//           return (
//             <motion.button
//               key={id}
//               whileTap={{ scale: 0.82 }}
//               onClick={() => setActiveView(id)}
//               style={{
//                 flex:          1,
//                 display:       'flex', flexDirection: 'column',
//                 alignItems:    'center', gap: 2,
//                 padding:       '4px 2px',
//                 background:    'none', border: 'none',
//                 cursor:        'pointer',
//                 color:         active ? 'var(--brand)' : 'var(--text-muted)',
//                 transition:    'color 0.15s',
//                 position:      'relative',
//                 borderRadius:  9999, minWidth: 0,
//               }}
//               aria-label={label}
//             >
//               {/* Active dark capsule */}
//               {active && (
//                 <motion.div
//                   layoutId="ios-nav-active"
//                   transition={{ type: 'spring', stiffness: 380, damping: 32 }}
//                   style={{
//                     position:     'absolute', inset: 0,
//                     borderRadius: 9999,
//                     background: 'var(--brand)',
//                     zIndex:       0,
//                   }}
//                 />
//               )}

//               <div style={{ position: 'relative', display: 'flex', zIndex: 1 }}>
//                 <Icon
//                   size={19}
//                   strokeWidth={active ? 2.4 : 1.7}
//                   color={active ? '#ffffff' : undefined}
//                 />
//                 <AnimatePresence>
//                   {showBadge && (
//                     <motion.span
//                       initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
//                       style={{
//                         position:       'absolute', top: -4, right: -5,
//                         minWidth:       14, height: 14,
//                         borderRadius:   99, background: '#f43f5e', color: '#fff',
//                         fontSize:       8, fontWeight: 800,
//                         display:        'flex', alignItems: 'center', justifyContent: 'center',
//                         padding:        '0 3px',
//                         border:         '1.5px solid var(--glass-panel-border)',
//                         fontFamily:     'var(--font-body)',
//                       }}
//                     >
//                       {unreadCount > 9 ? '9+' : unreadCount}
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//               </div>

//               <span style={{
//                 fontSize:      9.5,
//                 fontWeight:    active ? 700 : 500,
//                 fontFamily:    'var(--font-body)',
//                 letterSpacing: '0.02em',
//                 color:         active ? '#ffffff' : 'var(--text-muted)',
//                 zIndex:        1, position: 'relative',
//               }}>
//                 {label}
//               </span>
//             </motion.button>
//           )
//         })}
//       </nav>
//     </div>
//   )
// }


import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Settings, Bell, Calendar } from 'lucide-react'
import { useUIStore } from '@/store'
import { useNotificationStore } from '@/store/notificationStore'

const NAV = [
  { id: 'dashboard',    label: 'Home',    Icon: LayoutDashboard },
  
  { id: 'calendar',    label: 'Calendar',     Icon: Calendar },
  { id: 'tasks',        label: 'Tasks',   Icon: CheckSquare, center: true },
  // { id: 'leaderboard', label: 'Ranks',   Icon: Trophy },
  { id: 'partner',     label: 'Partner', Icon: Bell },
  { id: 'settings',    label: 'More',    Icon: Settings },
]

export function MobileNav() {
  const { activeView, setActiveView } = useUIStore()
  const { unreadCount }               = useNotificationStore()

  return (
    <div style={{
      position:  'fixed',
      bottom:    'calc(12px + env(safe-area-inset-bottom))',
      left:      '50%',
      transform: 'translateX(-50%)',
      zIndex:    50,
      width:     'calc(100% - 32px)',
      maxWidth:  480,
    }}>
      <nav style={{
        display:             'flex',
        alignItems:          'center',
        justifyContent:      'space-around',
        background:          'var(--glass-panel)',
        backdropFilter:      'blur(32px) saturate(180%)',
        WebkitBackdropFilter:'blur(32px) saturate(180%)',
        border:              '1px solid var(--glass-panel-border)',
        borderRadius:        9999,
        boxShadow:           'var(--shadow-float)',
        padding:             '6px 8px',
      }}>
        {NAV.map(({ id, label, Icon, center }) => {
          const active    = activeView === id
          const showBadge = id === 'partner' && unreadCount > 0

          /* ── Centre FAB button (Stats / BarChart2) ── */
          if (center) {
            const fabActive = active
            return (
              <div key={id} style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                {/* Notch cutout illusion — subtle glow behind the FAB */}
                <div style={{
                  position: 'absolute',
                  top:      '50%',
                  left:     '50%',
                  transform:'translate(-50%, -50%)',
                  width:    62,
                  height:   62,
                  borderRadius: '50%',
                  background: 'var(--brand-glow)',
                  filter:   'blur(12px)',
                  pointerEvents: 'none',
                }} />

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => setActiveView(id)}
                  aria-label={label}
                  style={{
                    position:   'relative',
                    width:      54,
                    height:     54,
                    borderRadius: '50%',
                    border:     'none',
                    cursor:     'pointer',
                    marginTop:  -42,   /* lifts it above the bar */
                    flexShrink: 0,
                    padding:    0,
                    overflow:   'hidden',
                    /* Outer ring */
                    boxShadow: fabActive
                      ? `0 0 0 3px var(--brand), 0 8px 24px rgba(34,197,94,0.55)`
                      : `0 0 0 2.5px rgba(34,197,94,0.35), 0 8px 24px rgba(34,197,94,0.30)`,
                    /* Brand gradient fill */
                    background: 'linear-gradient(145deg, #4ade80, #22c55e 45%, #16a34a)',
                  }}
                >
                  {/* Inner glass blob — top-left lighter circle (like the reference) */}
                  <div style={{
                    position:     'absolute',
                    top:          6,
                    left:         6,
                    width:        22,
                    height:       22,
                    borderRadius: '50%',
                    background:   'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(4px)',
                  }} />
                  {/* Inner glass blob — bottom-right smaller circle */}
                  <div style={{
                    position:     'absolute',
                    bottom:       8,
                    right:        8,
                    width:        14,
                    height:       14,
                    borderRadius: '50%',
                    background:   'rgba(255,255,255,0.30)',
                  }} />
                  {/* Icon on top */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} strokeWidth={2.2} color="#fff" />
                  </div>
                </motion.button>

                {/* Label below */}
                <span style={{
                  position:   'absolute',
                  bottom:     -20,
                  left:       '50%',
                  transform:  'translateX(-50%)',
                  fontSize:   9.5,
                  fontWeight: fabActive ? 700 : 500,
                  fontFamily: 'var(--font-body)',
                  color:      fabActive ? 'var(--brand)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
            )
          }

          /* ── Regular nav item ── */
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.82 }}
              onClick={() => setActiveView(id)}
              style={{
                flex:          1,
                display:       'flex', flexDirection: 'column',
                alignItems:    'center', gap: 2,
                padding:       '2px',
                background:    'none', border: 'none',
                cursor:        'pointer',
                color:         active ? 'var(--brand)' : 'var(--text-muted)',
                transition:    'color 0.15s',
                position:      'relative',
                borderRadius:  9999, minWidth: 0,
              }}
              aria-label={label}
            >
              {/* Active brand capsule
              {active && (
                <motion.div
                  layoutId="ios-nav-active"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{
                    position:     'absolute', inset: 0,
                    borderRadius: 9999,
                    width: "60%",
                    height: "50%",
                    background:   'var(--brand)',
                    zIndex:       0,
                  }}
                />
              )} */}

              {/* Icon box — iOS rounded square */}
              <div style={{
                position:      'relative',
                zIndex:        1,
                width:         34,
                height:        34,
                borderRadius:  10,   /* iOS icon corner radius */
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                background:    active
                  ? 'transparent'                         /* capsule already fills bg */
                  : 'var(--glass-btn)',
                backdropFilter: active ? 'none' : 'blur(8px)',
                WebkitBackdropFilter: active ? 'none' : 'blur(8px)',
                border:        active
                  ? 'none'
                  : '1px solid var(--glass-btn-border)',
                transition:    'background 0.15s, border-color 0.15s',
              }}>
                <Icon
                  size={17}
                  strokeWidth={active ? 2.4 : 1.7}
                  color={active ? '#ffffff' : undefined}
                />

                {/* Unread badge */}
                <AnimatePresence>
                  {showBadge && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      style={{
                        position:       'absolute', top: -4, right: -5,
                        minWidth:       14, height: 14,
                        borderRadius:   99, background: '#f43f5e', color: '#fff',
                        fontSize:       8, fontWeight: 800,
                        display:        'flex', alignItems: 'center', justifyContent: 'center',
                        padding:        '0 3px',
                        border:         '1.5px solid var(--glass-panel-border)',
                        fontFamily:     'var(--font-body)',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <span style={{
                fontSize:      9.5,
                fontWeight:    active ? 700 : 500,
                fontFamily:    'var(--font-body)',
                letterSpacing: '0.02em',
                color:         active ? '#ffffff' : 'var(--text-muted)',
                zIndex:        1, position: 'relative',
              }}>
                {label}
              </span>

              {/* Active green underline dot (like reference image) */}
              {/* {active && (
                <motion.div
                  layoutId="nav-dot"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{
                    position:     'absolute',
                    bottom:       -2,
                    left:         '50%',
                    transform:    'translateX(-50%)',
                    // width:        18,
                    height:       3,
                    borderRadius: 999,
                    background:   'var(--brand)',
                    zIndex:       1,
                  }}
                />
              )} */}
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}