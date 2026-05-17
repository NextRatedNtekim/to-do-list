import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Zap, Bell, Activity, UserPlus, Check, MessageCircle } from 'lucide-react'
import { usePartnerStore, useUserStore } from '@/store'
import { formatRelative, uid } from '@/utils/constants'

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, delay: d, ease: [0.22,1,0.36,1] } })

const ACTION_STYLE = {
  completed: { bg: 'rgba(34,197,94,0.1)',  color: '#22c55e',  Icon: Check },
  streak:    { bg: 'rgba(251,146,60,0.1)', color: '#fb923c',  Icon: () => <span>🔥</span> },
  level_up:  { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6',  Icon: () => <span>⬆️</span> },
  nudge:     { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',  Icon: Bell },
}

function FeedItem({ item, index }) {
  const cfg = ACTION_STYLE[item.action] || ACTION_STYLE.completed
  const { Icon } = cfg
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,18px)', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, fontSize: 13 }}>
        <Icon size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 2 }}>
          <span style={{ color: cfg.color }}>{item.user}</span>{' '}
          {item.action === 'completed' && 'completed a task'}
          {item.action === 'streak'    && 'hit a streak milestone'}
          {item.action === 'level_up'  && 'leveled up!'}
          {item.action === 'nudge'     && 'sent you a nudge 👋'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          {formatRelative(item.ts)}
          {item.xp > 0 && <span className="badge badge-gold" style={{ fontSize: 10, padding: '1px 6px' }}>+{item.xp} XP</span>}
        </div>
      </div>
    </motion.div>
  )
}

export function PartnerPage() {
  const { partner, activityFeed, setPartner, removePartner, addFeedItem } = usePartnerStore()
  const { profile } = useUserStore()
  const [inviteInput, setInviteInput] = useState('')
  const [nudgeSent,   setNudgeSent]   = useState(false)
  const [checkin,     setCheckin]     = useState('')

  function handleConnect() {
    const name = inviteInput.trim(); if (!name) return
    setPartner({ name, avatar: null, streak: 0, xp: 0, joinedAt: Date.now() })
    setInviteInput('')
  }

  function handleNudge() {
    if (!partner || nudgeSent) return
    addFeedItem({ id: uid(), user: profile.name, action: 'nudge', text: `Nudged ${partner.name}`, xp: 0, ts: Date.now() })
    setNudgeSent(true)
    setTimeout(() => setNudgeSent(false), 6000)
  }

  function handleCheckin() {
    if (!checkin.trim()) return
    addFeedItem({ id: uid(), user: profile.name, action: 'completed', text: checkin, xp: 0, ts: Date.now() })
    setCheckin('')
  }

  return (
    <div>
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title">Accountability Partner</h1>
        <p className="page-subtitle">Stay on track — together</p>
      </motion.div>

      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        {/* Partner card */}
        <motion.div {...fadeUp(0.06)} className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} color="var(--brand)" /> Your Partner
          </div>

          <AnimatePresence mode="wait">
            {partner ? (
              <motion.div key="has-partner" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{partner.name}</div>
                    <div className="badge badge-brand" style={{ marginTop: 4 }}>Connected ✓</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleNudge} disabled={nudgeSent}
                    className="btn btn-primary btn-sm" style={{ flex: 1, opacity: nudgeSent ? 0.65 : 1 }}
                  >
                    <Bell size={13} /> {nudgeSent ? 'Nudge Sent!' : 'Nudge'}
                  </motion.button>
                  <button onClick={removePartner} className="btn btn-ghost btn-sm" style={{ color: '#f43f5e', borderColor: '#fda4af' }}>Remove</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="no-partner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Connect with a friend to keep each other accountable</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Partner's name..." value={inviteInput} onChange={e => setInviteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConnect()} className="input-base" style={{ flex: 1 }} />
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={handleConnect} className="btn btn-primary" style={{ flexShrink: 0 }}>
                    <UserPlus size={15} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Daily check-in */}
        <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={15} color="#f59e0b" /> Daily Check-in
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>Share your focus for today with your partner.</p>
          <textarea
            placeholder="Today I'm focusing on..." rows={3} value={checkin} onChange={e => setCheckin(e.target.value)}
            className="input-base" style={{ resize: 'none', marginBottom: 10 }}
          />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleCheckin} disabled={!checkin.trim()}
            className="btn btn-primary" style={{ width: '100%', opacity: checkin.trim() ? 1 : 0.5 }}
          >
            <Zap size={14} /> Share Check-in
          </motion.button>
        </motion.div>
      </div>

      {/* Activity feed */}
      <motion.div {...fadeUp(0.14)} className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(12px,2.5vw,16px) clamp(14px,3vw,20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} color="var(--brand)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Activity Feed</span>
          <span className="badge badge-brand" style={{ marginLeft: 'auto' }}>{activityFeed.length}</span>
        </div>
        <div className="scrollbar-thin" style={{ maxHeight: 'clamp(260px,40vh,400px)', overflowY: 'auto' }}>
          {activityFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              No activity yet — complete tasks to see your feed!
            </div>
          ) : activityFeed.map((item, i) => <FeedItem key={item.id} item={item} index={i} />)}
        </div>
      </motion.div>
    </div>
  )
}
