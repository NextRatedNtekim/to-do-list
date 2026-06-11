import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Zap, Bell, Activity, UserPlus,
  Check, MessageCircle, Copy, RefreshCw,
  Link, UserCheck, Wifi, WifiOff,
} from 'lucide-react'
import { usePartnerStore }  from '@/store/partnerStore'
import { useUserStore }     from '@/store'
import { useAuthStore }     from '@/store/authStore'
import { formatRelative }   from '@/utils/constants'

const fadeUp = (d = 0) => ({
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay: d, ease: [0.22, 1, 0.36, 1] },
})

const ACTION_STYLE = {
  completed: { bg: 'rgba(34,197,94,0.1)',  color: '#22c55e', Icon: Check },
  streak:    { bg: 'rgba(251,146,60,0.1)', color: '#fb923c', Icon: () => <span>🔥</span> },
  level_up:  { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', Icon: () => <span>⬆️</span> },
  nudge:     { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', Icon: Bell },
  checkin:   { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', Icon: MessageCircle },
}

function FeedItem({ item, index }) {
  const cfg = ACTION_STYLE[item.action] || ACTION_STYLE.completed
  const { Icon } = cfg

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
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
          {item.action === 'nudge'     && 'sent a nudge 👋'}
          {item.action === 'checkin'   && 'shared a check-in'}
        </div>
        {item.text && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.text}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          {formatRelative(item.ts)}
          {item.xp > 0 && <span className="badge badge-gold" style={{ fontSize: 10, padding: '1px 6px' }}>+{item.xp} XP</span>}
        </div>
      </div>
    </motion.div>
  )
}

// ── Invite panel — two tabs: Generate / Enter ─────────────────────
function InvitePanel() {
  const [tab, setTab] = useState('generate')  // 'generate' | 'enter'
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const { user }                                            = useAuthStore()
  const { profile }                                         = useUserStore()
  const { inviteCode, inviteLoading, inviteError,
          generateInvite, acceptInvite, clearInviteError }  = usePartnerStore()

  async function handleGenerate() {
    const name = profile.name || user?.name || 'Someone'
    await generateInvite(user.id, name)
  }

  async function handleAccept() {
    if (!code.trim()) return
    const name = profile.name || user?.name || 'Someone'
    await acceptInvite(code.trim(), user.id, name)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-2)', borderRadius: 10, padding: 3, border: '1px solid var(--border)', marginBottom: 18 }}>
        {[
          { id: 'generate', label: 'Create Invite', Icon: Link },
          { id: 'enter',    label: 'Enter Code',    Icon: UserCheck },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => { setTab(id); clearInviteError() }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 8, border: 'none', background: tab === id ? 'var(--bg-surface)' : 'transparent', color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: tab === id ? 'var(--shadow-sm)' : 'none', transition: 'all .14s' }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'generate' ? (
          <motion.div key="generate" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
              Generate a 6-character code and share it with your partner. Valid for 24 hours.
            </p>

            {inviteCode ? (
              <div>
                {/* Code display */}
                <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Share this code</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, letterSpacing: '0.3em', color: 'var(--brand)' }}>
                    {inviteCode}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCopy}
                    className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <Copy size={13} /> {copied ? 'Copied!' : 'Copy Code'}
                  </motion.button>
                  <button onClick={handleGenerate} className="btn btn-secondary btn-sm" disabled={inviteLoading} title="Generate new code">
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={inviteLoading}
                className="btn btn-primary" style={{ width: '100%', opacity: inviteLoading ? 0.7 : 1 }}
              >
                {inviteLoading
                  ? <><Spinner /> Generating...</>
                  : <><Link size={14} /> Generate Invite Code</>
                }
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div key="enter" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
              Enter the 6-character code your partner shared with you.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. XK9M2A"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleAccept()}
                className="input-base"
                style={{ flex: 1, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}
                maxLength={6}
              />
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={handleAccept}
                disabled={inviteLoading || code.length < 6}
                className="btn btn-primary"
                style={{ flexShrink: 0, opacity: code.length < 6 ? 0.5 : 1 }}
              >
                {inviteLoading ? <Spinner /> : <UserPlus size={15} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {inviteError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#f43f5e' }}
          >
            {inviteError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Connected partner card ────────────────────────────────────────
function ConnectedPartner({ partner }) {
  const { user }               = useAuthStore()
  const { profile }            = useUserStore()
  const { sendNudge, removePartner, feedLoading } = usePartnerStore()
  const [nudgeSent, setNudgeSent] = useState(false)

  async function handleNudge() {
    if (nudgeSent || !user?.id) return
    const name = profile.name || user.name || 'Someone'
    await sendNudge(user.id, name)
    setNudgeSent(true)
    setTimeout(() => setNudgeSent(false), 6000)
  }

  async function handleRemove() {
    if (!window.confirm(`Remove ${partner.name} as your partner?`)) return
    await removePartner(user.id)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Avatar */}
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', flexShrink: 0, boxShadow: '0 0 0 3px var(--brand-glow)' }}>
          {partner.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{partner.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>Live • Connected</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleNudge}
          disabled={nudgeSent}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, opacity: nudgeSent ? 0.65 : 1 }}
        >
          <Bell size={13} /> {nudgeSent ? 'Nudge Sent! 👋' : 'Nudge Partner'}
        </motion.button>
        <button onClick={handleRemove} className="btn btn-ghost btn-sm" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}>
          Remove
        </button>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export function PartnerPage() {
  const { partner, activityFeed, sendCheckin, feedLoading } = usePartnerStore()
  const { profile } = useUserStore()
  const { user }    = useAuthStore()
  const [checkin, setCheckin] = useState('')

  async function handleCheckin() {
    if (!checkin.trim() || !user?.id) return
    const name = profile.name || user.name || 'Someone'
    await sendCheckin(user.id, name, checkin.trim())
    setCheckin('')
  }

  return (
    <div>
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title">Accountability Partner</h1>
        <p className="page-subtitle">
          Stay on track together — updates are live in real time
          {' '}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            {partner
              ? <><Wifi size={11} color="#22c55e" /> <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Connected</span></>
              : <><WifiOff size={11} color="var(--text-muted)" /> <span style={{ color: 'var(--text-muted)' }}>No partner yet</span></>
            }
          </span>
        </p>
      </motion.div>

      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        {/* Partner card */}
        <motion.div {...fadeUp(0.06)} className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} color="var(--brand)" />
            {partner ? 'Your Partner' : 'Connect a Partner'}
          </div>

          <AnimatePresence mode="wait">
            {partner ? (
              <ConnectedPartner key="connected" partner={partner} />
            ) : (
              <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InvitePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Daily check-in */}
        <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={15} color="#f59e0b" /> Daily Check-in
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
            {partner
              ? `Share your focus for today — ${partner.name} will see it instantly.`
              : 'Connect a partner to share check-ins with them.'}
          </p>
          <textarea
            placeholder="Today I'm focusing on..."
            rows={3}
            value={checkin}
            onChange={e => setCheckin(e.target.value)}
            disabled={!partner}
            className="input-base"
            style={{ resize: 'none', marginBottom: 10, opacity: partner ? 1 : 0.5 }}
          />
          <motion.button
            whileHover={{ scale: partner && checkin.trim() ? 1.02 : 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCheckin}
            disabled={!partner || !checkin.trim()}
            className="btn btn-primary"
            style={{ width: '100%', opacity: partner && checkin.trim() ? 1 : 0.5 }}
          >
            <Zap size={14} /> Share Check-in
          </motion.button>
        </motion.div>
      </div>

      {/* Real-time activity feed */}
      <motion.div {...fadeUp(0.14)} className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(12px,2.5vw,16px) clamp(14px,3vw,20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} color="var(--brand)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Live Activity Feed
          </span>
          {/* Live indicator */}
          {partner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}
              />
              <span style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
            </div>
          )}
          <span className="badge badge-brand" style={{ marginLeft: 'auto' }}>
            {activityFeed.length}
          </span>
        </div>

        <div className="scrollbar-thin" style={{ maxHeight: 'clamp(260px,40vh,420px)', overflowY: 'auto' }}>
          {feedLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : activityFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {partner
                  ? 'No activity yet — complete tasks to populate the feed!'
                  : 'Connect a partner to start seeing shared activity here.'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {activityFeed.map((item, i) => (
                <FeedItem key={item.id} item={item} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin-slow 0.7s linear infinite', flexShrink: 0 }} />
  )
}



// src/pages/AccountabilityPage.jsx
// REPLACE the body of your existing AccountabilityPage with this.
// Reads from your existing: partner_connections, activity_feed, partner_invites tables.
// NEW: scheduled_sessions table (add via supabase-additions.sql first).

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   HeartHandshake, UserPlus, Calendar, AlarmClock,
//   ChevronRight, Users, Flame, CheckCircle2, Clock
// } from 'lucide-react';
// import PartnerCard  from '@/components/ui/PartnerCard';
// import ActivityFeed from '@/components/ui/ActivityFeed';
// import InviteModal  from '@/components/ui/InviteModal';
// import { supabase, getUpcomingSessions, scheduleSession } from '../lib/supabase';

// const glass = (extra = {}) => ({
//   background:     'rgba(255,255,255,0.04)',
//   backdropFilter: 'blur(20px)',
//   border:         '1px solid rgba(255,255,255,0.08)',
//   borderRadius:   20,
//   ...extra,
// });

// export default function AccountabilityPage() {
//   const [user,       setUser]       = useState(null);
//   const [partner,    setPartner]    = useState(null);  // partner profile object
//   const [sessions,   setSessions]   = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [schedOpen,  setSchedOpen]  = useState(false);

//   useEffect(() => {
//     async function load() {
//       const { data: { user: u } } = await supabase.auth.getUser();
//       setUser(u);

//       // Fetch active partner connection
//       const { data: conn } = await supabase
//         .from('partner_connections')
//         .select('partner_id')
//         .eq('user_id', u.id)
//         .eq('status', 'active')
//         .single();

//       if (conn?.partner_id) {
//         // Fetch partner profile
//         const { data: profile } = await supabase
//           .from('user_profiles')
//           .select('user_id, display_name, total_xp, streak, longest_streak')
//           .eq('user_id', conn.partner_id)
//           .single();

//         // Fetch partner's today task stats
//         const today = new Date().toISOString().split('T')[0];
//         const { data: tasks } = await supabase
//           .from('tasks')
//           .select('id, completed_at')
//           .eq('user_id', conn.partner_id)
//           .gte('created_at', today);

//         const done  = (tasks || []).filter((t) => t.completed_at).length;
//         const total = (tasks || []).length;

//         setPartner({
//           id:               conn.partner_id,
//           display_name:     profile?.display_name || 'Your partner',
//           level:            Math.floor((profile?.total_xp ?? 0) / 500) + 1,
//           level_title:      'Achiever',
//           shared_streak:    profile?.streak ?? 0,
//           tasks_done_today: done,
//           tasks_total_today: total,
//           is_online:        true, // simplified — replace with presence channel later
//         });

//         // Upcoming sessions
//         const { data: sess } = await getUpcomingSessions(u.id);
//         setSessions(sess || []);
//       }

//       setLoading(false);
//     }
//     load();
//   }, []);

//   function handlePartnerConnected(partnerId) {
//     setInviteOpen(false);
//     // Reload page data
//     window.location.reload();
//   }

//   if (loading) {
//     return (
//       <div className="px-4 pt-16">
//         <div className="h-6 bg-white/5 rounded w-40 mb-2 animate-pulse" />
//         <div className="h-4 bg-white/5 rounded w-56 mb-6 animate-pulse" />
//         <div style={{ ...glass(), height: 160 }} className="animate-pulse" />
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 pt-16 pb-4">
//       <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>

//         <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1">Accountability</h1>
//         <p className="text-sm text-slate-500 mb-5">Your partners keep you on track</p>

//         {/* ── No partner state ── */}
//         {!partner && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.97 }}
//             animate={{ opacity: 1, scale: 1 }}
//             style={{ ...glass({ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.12)' }), padding: '28px 20px', textAlign: 'center', marginBottom: 16 }}
//           >
//             <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
//               <Users size={26} color="#3b82f6" />
//             </div>
//             <h3 className="text-base font-bold text-slate-100 mb-2">No accountability partner yet</h3>
//             <p className="text-sm text-slate-500 mb-5">
//               People with partners are <span className="text-green-400 font-bold">65% more likely</span> to follow through.
//             </p>
//             <motion.button
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setInviteOpen(true)}
//               style={{ padding: '13px 28px', borderRadius: 16, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(22,163,74,0.4)' }}
//             >
//               <UserPlus size={16} color="#fff" />
//               Invite a partner
//             </motion.button>
//           </motion.div>
//         )}

//         {/* ── Partner exists ── */}
//         {partner && (
//           <>
//             {/* Full partner card */}
//             <div className="mb-3">
//               <PartnerCard
//                 partner={partner}
//                 variant="full"
//                 onSchedule={() => setSchedOpen(true)}
//                 onViewProgress={() => {}}
//               />
//             </div>

//             {/* Upcoming session banner */}
//             {sessions.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//                 style={{ ...glass({ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.2)' }), padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}
//               >
//                 <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(22,163,74,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <AlarmClock size={17} color="#22c55e" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-bold text-slate-100">
//                     {sessions[0].notes || 'Session scheduled'}
//                   </p>
//                   <p className="text-xs text-slate-400">
//                     {new Date(sessions[0].scheduled_for).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
//                     {' · '}
//                     {new Date(sessions[0].scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </p>
//                 </div>
//                 <ChevronRight size={14} color="#64748b" />
//               </motion.div>
//             )}

//             {/* Shared stats strip */}
//             <motion.div
//               initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
//               style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}
//             >
//               {[
//                 { icon: Flame,        color: '#f59e0b', val: partner.shared_streak ?? 0, label: 'Shared streak' },
//                 { icon: CheckCircle2, color: '#22c55e', val: `${partner.tasks_done_today}/${partner.tasks_total_today}`, label: 'Their tasks' },
//                 { icon: Clock,        color: '#3b82f6', val: sessions.length,            label: 'Sessions'     },
//               ].map((s) => (
//                 <div key={s.label} style={{ ...glass(), padding: '12px 10px', textAlign: 'center' }}>
//                   <s.icon size={16} color={s.color} style={{ margin: '0 auto 5px', display: 'block' }} />
//                   <div className="text-lg font-extrabold text-slate-100">{s.val}</div>
//                   <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
//                 </div>
//               ))}
//             </motion.div>

//             {/* Activity feed */}
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <h2 className="text-sm font-bold text-slate-100 mb-3">Live activity feed</h2>
//               <ActivityFeed partnerId={partner.id} currentUserId={user?.id} />
//             </motion.div>
//           </>
//         )}

//         {/* Invite modal */}
//         <InviteModal
//           open={inviteOpen}
//           onClose={() => setInviteOpen(false)}
//           onSuccess={handlePartnerConnected}
//         />

//         {/* Schedule session sheet (simple) */}
//         <AnimatePresence>
//           {schedOpen && (
//             <ScheduleSessionSheet
//               partnerId={partner?.id}
//               userId={user?.id}
//               onClose={() => setSchedOpen(false)}
//               onSaved={(sess) => { setSessions((p) => [sess, ...p]); setSchedOpen(false); }}
//             />
//           )}
//         </AnimatePresence>

//       </motion.div>
//     </div>
//   );
// }

// // ── Inline schedule session sheet ────────────────────────────────────────────
// function ScheduleSessionSheet({ partnerId, userId, onClose, onSaved }) {
//   const [date,  setDate]  = useState('');
//   const [time,  setTime]  = useState('');
//   const [notes, setNotes] = useState('');
//   const [saving, setSaving] = useState(false);
//   // scheduleSession is imported at the top of the file

//   async function save() {
//     if (!date || !time) return;
//     setSaving(true);
//     const scheduledFor = new Date(`${date}T${time}`).toISOString();
//     const { data } = await scheduleSession({ partnerId, taskId: null, scheduledFor, notes });
//     setSaving(false);
//     onSaved?.(data?.[0]);
//   }

//   const overlay = { position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' };
//   const sheet   = { width: '100%', background: 'rgba(10,15,26,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' };
//   const inp     = { width: '100%', padding: '11px 13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', colorScheme: 'dark', marginBottom: 12 };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 35 }} style={sheet}>
//         <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 18px' }} />
//         <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>Schedule a session</h3>
//         <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Date</label>
//         <input type="date" style={inp} value={date} onChange={(e) => setDate(e.target.value)} />
//         <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Time</label>
//         <input type="time" style={inp} value={time} onChange={(e) => setTime(e.target.value)} />
//         <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
//         <input type="text" style={inp} placeholder="e.g. React Native deep work" value={notes} onChange={(e) => setNotes(e.target.value)} />
//         <motion.button whileTap={{ scale: 0.96 }} onClick={save} disabled={!date || !time || saving}
//           style={{ width: '100%', padding: '14px 0', borderRadius: 16, background: date && time ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'rgba(255,255,255,0.05)', border: 'none', cursor: date && time ? 'pointer' : 'default', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: date && time ? '0 4px 20px rgba(22,163,74,0.4)' : 'none' }}>
//           {saving ? 'Scheduling...' : 'Confirm session'}
//         </motion.button>
//       </motion.div>
//     </motion.div>
//   );
// }