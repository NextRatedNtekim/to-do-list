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
