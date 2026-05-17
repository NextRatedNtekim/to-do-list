import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Users, Settings, X, Sun, Moon, Zap } from 'lucide-react'
import { useUIStore, useUserStore } from '@/store'
import { useTheme } from '@/hooks'
import { levelFromXP, getRankForLevel, xpForLevel } from '@/utils/constants'

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',       Icon: CheckSquare },
  { id: 'analytics',  label: 'Analytics',  Icon: BarChart2 },
  { id: 'leaderboard',label: 'Leaderboard',Icon: Trophy },
  { id: 'partner',    label: 'Partner',    Icon: Users },
  { id: 'settings',   label: 'Settings',   Icon: Settings },
]

export function Sidebar({ isMobile }) {
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView } = useUIStore()
  const { totalXP, streak, profile } = useUserStore()
  const { theme, toggleTheme } = useTheme()

  const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
  const rank    = getRankForLevel(level)
  const xpPct   = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

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
        position:   'fixed', top: 0, left: 0, bottom: 0,
        width:      'var(--sidebar-width)',
        zIndex:     40,
        background: 'var(--bg-surface)',
        borderRight:'1px solid var(--border)',
        display:    'flex', flexDirection: 'column',
        overflow:   'hidden',
        boxShadow:  isMobile ? 'var(--shadow-xl)' : 'none',
      }}
    >
      {/* Logo row */}
      <div style={{
        height: 'var(--topbar-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px', flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', lineHeight: 1 }}>
          Task<span style={{ color: 'var(--brand)' }}>r</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="btn-icon" aria-label="Close sidebar">
            <X size={16} />
          </button>
        )}
      </div>

      {/* User card */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, var(--brand), ${rank.color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)',
            boxShadow: '0 2px 8px var(--brand-glow)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11, color: rank.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              {rank.icon} {rank.title} · Lv.{level}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
              {accumulated.toLocaleString()} / {nextThreshold.toLocaleString()} XP
            </span>
            <span style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 800 }}>{xpPct}%</span>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <motion.div
              className="progress-fill"
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: `linear-gradient(90deg, var(--brand), ${rank.color})` }}
            />
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="badge badge-gold" style={{ marginTop: 10, fontSize: 12 }}>
            <span className="streak-flame">🔥</span> {streak}-day streak
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }} className="scrollbar-none">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeView === id
          return (
            <motion.button
              key={id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNavClick(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--brand)' : 'var(--text-secondary)',
                background: active ? 'var(--brand-muted)' : 'transparent',
                marginBottom: 2, transition: 'color 0.12s, background 0.12s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-surface-3)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {active && (
                <motion.div layoutId="nav-active" style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, background: 'var(--brand)', borderRadius: '0 3px 3px 0',
                }} />
              )}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Zap size={13} color="#f59e0b" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalXP.toLocaleString()} XP
          </span>
        </div>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
          onClick={toggleTheme} className="btn-icon"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface-2)', borderRadius: 9, width: 32, height: 32 }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            <motion.span key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex' }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
