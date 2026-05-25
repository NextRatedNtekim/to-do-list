import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, X, Zap, Users, Flame, Trophy, MessageCircle } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore }         from '@/store/authStore'
import { formatRelative }       from '@/utils/constants'

// Icon + color per notification type
const TYPE_CONFIG = {
  nudge:              { Icon: Bell,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  partner_joined:     { Icon: Users,         color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  partner_completed:  { Icon: Check,         color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  streak_milestone:   { Icon: Flame,         color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  level_up:           { Icon: Zap,           color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  checkin:            { Icon: MessageCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef        = useRef(null)
  const btnRef          = useRef(null)

  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotificationStore()
  const { user } = useAuthStore()

  // Close panel when clicking outside
  useEffect(() => {
    function handle(e) {
      if (
        panelRef.current  && !panelRef.current.contains(e.target) &&
        btnRef.current    && !btnRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function handleMarkAllRead() {
    if (user?.id) markAllRead(user.id)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <motion.button
        ref={btnRef}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen(v => !v)}
        className="btn-icon"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          border:     '1px solid var(--border)',
          background: open ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
          borderRadius: 10,
          position:   'relative',
          width:      36,
          height:     36,
        }}
      >
        <Bell size={15} />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position:     'absolute',
                top:          -3,
                right:        -3,
                minWidth:     16,
                height:       16,
                borderRadius: 99,
                background:   '#f43f5e',
                color:        '#fff',
                fontSize:     9,
                fontWeight:   800,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                padding:      '0 4px',
                border:       '1.5px solid var(--bg-surface)',
                fontFamily:   'var(--font-body)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -6,  scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position:     'absolute',
              top:          'calc(100% + 10px)',
              right:        0,
              width:        'clamp(300px, 90vw, 360px)',
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow:    'var(--shadow-xl)',
              zIndex:       200,
              overflow:     'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding:      '14px 16px',
              borderBottom: '1px solid var(--border)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   14,
                  fontWeight: 800,
                  color:      'var(--text-primary)',
                }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="badge badge-red" style={{ fontSize: 10 }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        4,
                      fontSize:   11,
                      fontWeight: 600,
                      color:      'var(--brand)',
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      fontFamily: 'var(--font-body)',
                      padding:    '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    <CheckCheck size={12} /> All read
                  </motion.button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div
              className="scrollbar-thin"
              style={{ maxHeight: 'clamp(240px, 50vh, 400px)', overflowY: 'auto' }}
            >
              {loading ? (
                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto' }} />
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif, i) => (
                    <NotifRow
                      key={notif.id}
                      notif={notif}
                      index={i}
                      onRead={() => {
                        if (!notif.read) markRead(notif.id)
                      }}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NotifRow({ notif, index, onRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.nudge
  const { Icon } = cfg

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onRead}
      style={{
        display:      'flex',
        alignItems:   'flex-start',
        gap:          12,
        padding:      '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor:       notif.read ? 'default' : 'pointer',
        background:   notif.read ? 'transparent' : `${cfg.color}06`,
        transition:   'background 0.15s',
        position:     'relative',
      }}
      onMouseEnter={e => { if (!notif.read) e.currentTarget.style.background = `${cfg.color}10` }}
      onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : `${cfg.color}06`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div style={{
          position:     'absolute',
          left:         6,
          top:          '50%',
          transform:    'translateY(-50%)',
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   cfg.color,
          flexShrink:   0,
        }} />
      )}

      {/* Icon */}
      <div style={{
        width:          34,
        height:         34,
        borderRadius:   '50%',
        flexShrink:     0,
        background:     cfg.bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        marginLeft:     notif.read ? 0 : 4,
      }}>
        <Icon size={15} color={cfg.color} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:   13,
          fontWeight: notif.read ? 500 : 700,
          color:      'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: 2,
        }}>
          {notif.title}
        </div>
        {notif.body && (
          <div style={{
            fontSize:     12,
            color:        'var(--text-muted)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {notif.body}
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>
          {formatRelative(notif.createdAt)}
        </div>
      </div>
    </motion.div>
  )
}
