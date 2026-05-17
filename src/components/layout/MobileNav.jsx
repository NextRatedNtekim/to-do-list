import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Users, Settings } from 'lucide-react'
import { useUIStore } from '@/store'

const NAV = [
  { id: 'dashboard',   label: 'Home',    Icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',   Icon: CheckSquare },
  { id: 'analytics',  label: 'Stats',   Icon: BarChart2 },
  { id: 'leaderboard',label: 'Ranks',   Icon: Trophy },
  { id: 'settings',   label: 'Settings',Icon: Settings },
]

export function MobileNav() {
  const { activeView, setActiveView } = useUIStore()

  return (
    <nav
      className="mobile-nav"
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-around',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
      }}
    >
      {NAV.map(({ id, label, Icon }) => {
        const active = activeView === id
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.88 }}
            onClick={() => setActiveView(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, padding: '6px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--brand)' : 'var(--text-muted)',
              transition: 'color 0.15s',
              position: 'relative',
            }}
            aria-label={label}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-dot"
                style={{
                  position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 3, borderRadius: 99,
                  background: 'var(--brand)',
                }}
              />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: 'var(--font-body)', letterSpacing: '0.02em' }}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
