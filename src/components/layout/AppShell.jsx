import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Topbar } from './Topbar'
import { useUIStore } from '@/store'

export function AppShell({ children }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', fn)
    fn()
    return () => window.removeEventListener('resize', fn)
  }, [setSidebarOpen])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>

      {/* Sidebar */}
      <Sidebar isMobile={isMobile} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* Main area */}
      <motion.div
        animate={{ marginLeft: !isMobile && sidebarOpen ? 'var(--sidebar-width)' : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Topbar isMobile={isMobile} />

        {/* Page scroll container */}
        <main
          className="scrollbar-thin"
          style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            paddingBottom: isMobile ? 80 : 40,
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 28px)' }}>
            <motion.div
              key="page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </motion.div>

      {/* Mobile bottom nav */}
      {isMobile && <MobileNav />}
    </div>
  )
}




// src/components/AppShell.jsx
// Persistent layout shell with glassmorphism bottom tab navigation.
// USAGE in App.jsx:
//   <AppShell>
//     <Routes>...</Routes>
//   </AppShell>

// import { useLocation, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Home, HeartHandshake, Timer, BellRing, User
// } from 'lucide-react';
// import { useNotificationStore } from '@/store/notificationStore';

// const TABS = [
//   { path: '/',               icon: Home,           label: 'Home'     },
//   { path: '/accountability', icon: HeartHandshake, label: 'Partners' },
//   { path: '/focus',          icon: Timer,          label: 'Focus'    },
//   { path: '/alarms',         icon: BellRing,       label: 'Alarms'   },
//   { path: '/profile',        icon: User,           label: 'Profile'  },
// ];

// export default function AppShell({ children }) {
//   const { pathname } = useLocation();
//   const navigate     = useNavigate();
//   const unreadCount  = useNotificationStore((s) => s.unreadCount);

//   return (
//     <div className="relative min-h-screen bg-[#030712] overflow-x-hidden">

//       {/* Ambient background orbs */}
//       <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
//         <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full"
//           style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.13) 0%, transparent 70%)' }} />
//         <div className="absolute bottom-20 -right-24 w-80 h-80 rounded-full"
//           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
//         <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full -translate-x-1/2"
//           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
//       </div>

//       {/* Page content */}
//       <div className="relative z-10 pb-28">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={pathname}
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0  }}
//             exit={{    opacity: 0, y: -10 }}
//             transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
//           >
//             {children}
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Bottom navigation */}
//       <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4">
//         <nav
//           className="flex justify-around items-center px-2 py-2.5 rounded-3xl"
//           style={{
//             background:     'rgba(255,255,255,0.05)',
//             backdropFilter: 'blur(20px)',
//             WebkitBackdropFilter: 'blur(20px)',
//             border:         '1px solid rgba(255,255,255,0.08)',
//             boxShadow:      '0 -1px 0 rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.4)',
//           }}
//         >
//           {TABS.map((tab) => {
//             const active = pathname === tab.path;
//             return (
//               <motion.button
//                 key={tab.path}
//                 whileTap={{ scale: 0.82 }}
//                 onClick={() => navigate(tab.path)}
//                 className="flex flex-col items-center gap-1 flex-1 relative"
//               >
//                 <div
//                   className="w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
//                   style={{
//                     background: active
//                       ? 'linear-gradient(135deg, #16a34a, #22c55e)'
//                       : 'transparent',
//                   }}
//                 >
//                   <tab.icon
//                     size={18}
//                     color={active ? '#fff' : '#64748b'}
//                   />
//                   {/* Badge for Alarms tab */}
//                   {tab.path === '/alarms' && unreadCount > 0 && (
//                     <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 flex items-center justify-center px-1">
//                       <span className="text-[9px] font-bold text-white">
//                         {unreadCount > 9 ? '9+' : unreadCount}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <span
//                   className="text-[10px] tracking-wide transition-all duration-200"
//                   style={{
//                     fontWeight: active ? 700 : 500,
//                     color:      active ? '#22c55e' : '#64748b',
//                   }}
//                 >
//                   {tab.label}
//                 </span>
//               </motion.button>
//             );
//           })}
//         </nav>
//       </div>
//     </div>
//   );
// }