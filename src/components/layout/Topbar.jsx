import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Sun, Moon, Plus, Bell } from 'lucide-react'
import { useUIStore, useUserStore } from '@/store'
import { useTheme } from '@/hooks'
import { levelFromXP, getRankForLevel } from '@/utils/constants'

export function Topbar({ isMobile }) {
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
  const { totalXP, streak, profile } = useUserStore()
  const { theme, toggleTheme } = useTheme()

  const { level } = levelFromXP(totalXP)
  const rank      = getRankForLevel(level)
  const initials  = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const PAGE_TITLES = {
    dashboard:   'Dashboard',
    tasks:       'Tasks',
    analytics:   'Analytics',
    leaderboard: 'Leaderboard',
    partner:     'Partner',
    settings:    'Settings',
  }

  return (
    <header style={{
      position:   'sticky', top: 0, zIndex: 30,
      height:     'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display:    'flex', alignItems: 'center',
      padding:    '0 clamp(12px, 3vw, 24px)',
      gap:        12,
      boxShadow:  'var(--shadow-xs)',
    }}>
      {/* Sidebar toggle */}
      <motion.button
        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="btn-icon"
        aria-label="Toggle sidebar"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-surface-2)', width: 36, height: 36, borderRadius: 10 }}
      >
        <Menu size={16} />
      </motion.button>

      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeView}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              margin: 0, fontFamily: 'var(--font-display)',
              fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 800,
              letterSpacing: '-0.5px', color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {PAGE_TITLES[activeView] || 'Taskr'}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Streak pill — hide on very small */}
        {streak > 0 && (
          <div className="badge badge-gold" style={{ display: isMobile && window.innerWidth < 400 ? 'none' : 'inline-flex' }}>
            <span className="streak-flame">🔥</span>
            {streak}
          </div>
        )}

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.88 }}
          onClick={toggleTheme}
          className="btn-icon"
          aria-label="Toggle theme"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface-2)', borderRadius: 10 }}
        >
          <AnimatePresence mode="wait">
            <motion.span key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex' }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Avatar */}
        <button
          onClick={() => setActiveView('settings')}
          aria-label="Settings"
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, var(--brand), ${rank.color})`,
            border: '2px solid var(--bg-surface)',
            boxShadow: '0 0 0 1.5px var(--brand-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
