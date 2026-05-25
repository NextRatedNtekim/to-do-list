/**
 * MobileNav.jsx
 * Fixed: shows unread notification badge on the bell tab
 */
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, Settings, Bell } from 'lucide-react'
import { useUIStore } from '@/store'
import { useNotificationStore } from '@/store/notificationStore'

const NAV = [
  { id: 'dashboard',   label: 'Home',   Icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',  Icon: CheckSquare },
  { id: 'analytics',  label: 'Stats',  Icon: BarChart2 },
  { id: 'leaderboard',label: 'Ranks',  Icon: Trophy },
  { id: 'partner',    label: 'Partner', Icon: Bell },        // Bell shows unread badge
  { id: 'settings',   label: 'More',   Icon: Settings },
]

export function MobileNav() {
  const { activeView, setActiveView } = useUIStore()
  const { unreadCount }               = useNotificationStore()

  return (
    <nav
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-around',
        position:       'fixed',
        bottom:         0, left: 0, right: 0,
        zIndex:         50,
        background:     'var(--bg-surface)',
        borderTop:      '1px solid var(--border)',
        padding:        '6px 0 calc(6px + env(safe-area-inset-bottom))',
        boxShadow:      '0 -4px 24px rgba(0,0,0,0.1)',
      }}
    >
      {NAV.map(({ id, label, Icon }) => {
        const active     = activeView === id
        const showBadge  = id === 'partner' && unreadCount > 0

        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.85 }}
            onClick={() => setActiveView(id)}
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           3,
              padding:       '6px 2px',
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              color:         active ? 'var(--brand)' : 'var(--text-muted)',
              transition:    'color 0.15s',
              position:      'relative',
            }}
            aria-label={label}
          >
            {/* Active indicator bar */}
            {active && (
              <motion.div
                layoutId="mobile-nav-dot"
                style={{
                  position:     'absolute',
                  top:          2,
                  left:         '50%',
                  transform:    'translateX(-50%)',
                  width:        20,
                  height:       3,
                  borderRadius: 99,
                  background:   'var(--brand)',
                }}
              />
            )}

            {/* Icon + unread badge */}
            <div style={{ position: 'relative', display: 'flex' }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />

              <AnimatePresence>
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position:       'absolute',
                      top:            -4,
                      right:          -5,
                      minWidth:       14,
                      height:         14,
                      borderRadius:   99,
                      background:     '#f43f5e',
                      color:          '#fff',
                      fontSize:       8,
                      fontWeight:     800,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      padding:        '0 3px',
                      border:         '1.5px solid var(--bg-surface)',
                      fontFamily:     'var(--font-body)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <span style={{
              fontSize:   10,
              fontWeight: active ? 700 : 500,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.02em',
            }}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
