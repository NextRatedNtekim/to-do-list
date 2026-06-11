import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Settings, Bell, Calendar, RefreshCw, Trophy } from 'lucide-react'
import { useUIStore } from '@/store'
import { useNotificationStore } from '@/store/notificationStore'

const NAV = [
  { id: 'dashboard', label: 'Home',     Icon: LayoutDashboard },
  { id: 'leaderboard', label: 'Leaderboard',  Icon: Trophy          },
  // { id: 'routines',  label: 'Routines', Icon: RefreshCw       },: LeaderboardPage,
  { id: 'tasks',     label: 'Tasks',    Icon: CheckSquare, center: true },
  { id: 'calendar',  label: 'Calendar', Icon: Calendar        },
  { id: 'partner',   label: 'Partner',  Icon: Bell            },
]

export function MobileNav() {
  const { activeView, setActiveView } = useUIStore()
  const { unreadCount }               = useNotificationStore()

  return (
    <div style={{
      position:'fixed',
      bottom:'calc(12px + env(safe-area-inset-bottom))',
      left:'50%',transform:'translateX(-50%)',
      zIndex:50,width:'calc(100% - 32px)',maxWidth:480,
    }}>
      <nav style={{
        display:'flex',alignItems:'center',justifyContent:'space-around',
        background:'var(--glass-panel)',
        backdropFilter:'blur(32px) saturate(180%)',
        WebkitBackdropFilter:'blur(32px) saturate(180%)',
        border:'1px solid var(--glass-panel-border)',
        borderRadius:9999,
        boxShadow:'var(--shadow-float)',
        padding:'6px 8px',
      }}>
        {NAV.map(({ id, label, Icon, center }) => {
          const active    = activeView === id
          const showBadge = id === 'partner' && unreadCount > 0
          
          /* Centre FAB — Tasks */
          if (center) {
            return (
              <div key={id} style={{ flex:1,display:'flex',justifyContent:'center',position:'relative' }}>
                <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:62,height:62,borderRadius:'50%',background:'var(--brand-glow)',filter:'blur(12px)',pointerEvents:'none' }} />
                <motion.button
                  whileTap={{ scale:0.88 }} whileHover={{ scale:1.06 }}
                  onClick={() => setActiveView(id)}
                  aria-label={label}
                  style={{
                    position:'relative',width:54,height:54,borderRadius:'50%',
                    border:'none',cursor:'pointer',marginTop:-42,flexShrink:0,padding:0,overflow:'hidden',
                    boxShadow: active
                      ? '0 0 0 3px var(--brand),0 8px 24px rgba(34,197,94,0.55)'
                      : '0 0 0 2.5px rgba(34,197,94,0.35),0 8px 24px rgba(34,197,94,0.30)',
                    background:'linear-gradient(145deg,#4ade80,#22c55e 45%,#16a34a)',
                  }}
                >
                  {active && (
                                  <motion.div layoutId="nav-active-bar"
                                    style={{ position:'absolute',left:0,top:'18%',bottom:'18%',width:3,background:'var(--brand)',borderRadius:'0 3px 3px 0' }} />
                                )}
                  <div style={{ position:'absolute',top:6,left:6,width:22,height:22,borderRadius:'50%',background:'rgba(255,255,255,0.55)',backdropFilter:'blur(4px)' }} />
                  <div style={{ position:'absolute',bottom:8,right:8,width:14,height:14,borderRadius:'50%',background:'rgba(255,255,255,0.30)' }} />
                  <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <Icon size={22} strokeWidth={2.2} color="#fff" />
                  </div>
                </motion.button>
                <span style={{ position:'absolute',bottom:-20,left:'50%',transform:'translateX(-50%)',fontSize:9.5,fontWeight:active?700:500,fontFamily:'var(--font-body)',color:active?'var(--brand)':'var(--text-muted)',whiteSpace:'nowrap' }}>
                  {label}
                </span>
              </div>
            )
          }

          /* Regular item */
          return (
            <motion.button
              key={id}
              whileTap={{ scale:0.82 }}
              onClick={() => setActiveView(id)}
              style={{
                flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                padding:'2px',background:'none',border:'none',cursor:'pointer',
                color:active?'var(--brand)':'var(--text-muted)',
                transition:'color 0.15s',position:'relative',
                borderRadius:9999,minWidth:0,
              }}
              aria-label={label}
            >
              <div style={{
                position:'relative',zIndex:1,
                width:34,height:34,borderRadius:10,
                display:'flex',alignItems:'center',justifyContent:'center',
                background:      active ? 'transparent' : 'var(--glass-btn)',
                backdropFilter:  active ? 'none' : 'blur(8px)',
                WebkitBackdropFilter: active ? 'none' : 'blur(8px)',
                border:          active ? 'none' : '1px solid var(--glass-btn-border)',
                transition:      'background 0.15s,border-color 0.15s',
              }}>
                <Icon size={17} strokeWidth={active?2.4:1.7} color={active?'#ffffff':undefined} />
                <AnimatePresence>
                  {showBadge && (
                    <motion.span
                      initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                      style={{ position:'absolute',top:-4,right:-5,minWidth:14,height:14,borderRadius:99,background:'#f43f5e',color:'#fff',fontSize:8,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px',border:'1.5px solid var(--glass-panel-border)',fontFamily:'var(--font-body)' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span style={{ fontSize:9.5,fontWeight:active?700:500,fontFamily:'var(--font-body)',letterSpacing:'0.02em',color:active?'#ffffff':'var(--text-muted)',zIndex:1,position:'relative' }}>
                {label}
              </span>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}