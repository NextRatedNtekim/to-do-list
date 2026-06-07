// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Zap, TrendingUp, Flame } from 'lucide-react'
// import { useLeaderboardStore, useUserStore } from '@/store'
// import { getRankForLevel, levelFromXP } from '@/utils/constants'

// const TABS = [
//   { id: 'xp',     label: 'XP',     Icon: Zap },
//   { id: 'streak', label: 'Streak', Icon: Flame },
//   { id: 'weekly', label: 'Weekly', Icon: TrendingUp },
// ]

// const MEDALS = ['🥇','🥈','🥉']
// const PODIUM_HEIGHTS = [100, 76, 60]
// const PODIUM_COLORS  = ['#f59e0b','#94a3b8','#cd7c2f']

// export function Leaderboard() {
//   const [tab, setTab] = useState('xp')
//   const { entries }   = useLeaderboardStore()
//   const { totalXP, streak, weeklyXP, profile } = useUserStore()

//   const myEntry = { id: 'me', name: profile.name, xp: totalXP, streak, weeklyXP, isMe: true }
//   const all     = [...entries, myEntry]

//   const sorted = [...all].sort((a, b) =>
//     tab === 'xp' ? b.xp - a.xp : tab === 'streak' ? b.streak - a.streak : b.weeklyXP - a.weeklyXP
//   )

//   const top3 = sorted.slice(0, 3)
//   const rest = sorted.slice(3)

//   function statVal(e) {
//     if (tab === 'xp')     return `${(e.xp || 0).toLocaleString()} XP`
//     if (tab === 'streak') return `${e.streak || 0} 🔥`
//     return `${(e.weeklyXP || 0).toLocaleString()} XP`
//   }

//   return (
//     <div>
//       {/* Tab bar */}
//       <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-surface-2)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
//         {TABS.map(({ id, label, Icon }) => (
//           <button key={id} onClick={() => setTab(id)}
//             style={{
//               flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
//               background: tab === id ? 'var(--bg-surface)' : 'transparent',
//               color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
//               fontSize: 13, fontWeight: tab === id ? 700 : 500,
//               cursor: 'pointer', fontFamily: 'var(--font-body)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
//               boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
//               transition: 'all .15s',
//             }}
//           >
//             <Icon size={13} /> {label}
//           </button>
//         ))}
//       </div>

//       {/* Podium — top 3 */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 10, marginBottom: 24, alignItems: 'flex-end' }}>
//         {[top3[1], top3[0], top3[2]].map((entry, i) => {
//           if (!entry) return <div key={i} />
//           const pos   = [2, 1, 3][i]
//           const color = PODIUM_COLORS[[1,0,2][i]]
//           const { level } = levelFromXP(entry.xp || 0)
//           const rank  = getRankForLevel(level)

//           return (
//             <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
//               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
//             >
//               <div style={{ fontSize: 22, marginBottom: 6 }}>{MEDALS[[1,0,2][i]]}</div>

//               {/* Avatar */}
//               <div style={{
//                 width: 44, height: 44, borderRadius: '50%', marginBottom: 7,
//                 background: `linear-gradient(135deg, ${color}80, ${color})`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 16, fontWeight: 800, color: '#fff',
//                 fontFamily: 'var(--font-display)', flexShrink: 0,
//                 border: entry.isMe ? '2.5px solid var(--brand)' : `2px solid ${color}40`,
//                 boxShadow: entry.isMe ? '0 0 0 3px var(--brand-glow)' : 'none',
//               }}>
//                 {entry.name.charAt(0).toUpperCase()}
//               </div>

//               <div style={{ fontSize: 11, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', marginBottom: 2, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 {entry.name.replace(' (You)', '')}{entry.isMe ? ' ✨' : ''}
//               </div>
//               <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{statVal(entry)}</div>

//               {/* Bar */}
//               <motion.div
//                 initial={{ height: 0 }} animate={{ height: PODIUM_HEIGHTS[i] }}
//                 transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.4,0,0.2,1] }}
//                 style={{
//                   width: '100%', background: `${color}22`,
//                   borderRadius: '8px 8px 0 0',
//                   border: `1px solid ${color}40`, borderBottom: 'none',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 18, fontWeight: 800, color,
//                   fontFamily: 'var(--font-display)',
//                 }}
//               >
//                 #{pos}
//               </motion.div>
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* Rest of list */}
//       <div className="card" style={{ overflow: 'hidden' }}>
//         <AnimatePresence mode="popLayout">
//           {rest.map((entry, idx) => {
//             const rank   = idx + 4
//             const { level } = levelFromXP(entry.xp || 0)
//             const rankData  = getRankForLevel(level)

//             return (
//               <motion.div key={entry.id} layout
//                 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
//                 transition={{ delay: idx * 0.04 }}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 12,
//                   padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,18px)',
//                   borderBottom: idx < rest.length - 1 ? '1px solid var(--border)' : 'none',
//                   background: entry.isMe ? 'var(--brand-muted)' : 'transparent',
//                   borderLeft: entry.isMe ? '3px solid var(--brand)' : '3px solid transparent',
//                   transition: 'background .14s',
//                 }}
//                 onMouseEnter={e => { if (!entry.isMe) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
//                 onMouseLeave={e => e.currentTarget.style.background = entry.isMe ? 'var(--brand-muted)' : 'transparent'}
//               >
//                 <div style={{ width: 26, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textAlign: 'center', flexShrink: 0 }}>
//                   #{rank}
//                 </div>
//                 <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${rankData.color}50, ${rankData.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
//                   {entry.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontSize: 13, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                     {entry.name.replace(' (You)', '')}{entry.isMe && ' ✨'}
//                   </div>
//                   <div style={{ fontSize: 11, color: rankData.color, fontWeight: 600 }}>{rankData.icon} {rankData.title}</div>
//                 </div>
//                 <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
//                   {statVal(entry)}
//                 </div>
//               </motion.div>
//             )
//           })}
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }






import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Flame, Crown, Medal, Award, ChevronUp, ChevronDown, Minus, Star } from 'lucide-react'
import { useLeaderboardStore, useUserStore } from '@/store'
import { getRankForLevel, levelFromXP } from '@/utils/constants'

const TABS = [
  { id: 'xp',     label: 'XP',     Icon: Zap },
  { id: 'streak', label: 'Streak', Icon: Flame },
  { id: 'weekly', label: 'Weekly', Icon: TrendingUp },
]

const MEDAL_ICONS   = [Crown, Medal, Award]
const PODIUM_HEIGHTS = [100, 76, 60]
const PODIUM_COLORS  = ['#f59e0b','#94a3b8','#cd7c2f']

export function Leaderboard() {
  const [tab, setTab] = useState('xp')
  const { entries }   = useLeaderboardStore()
  const { totalXP, streak, weeklyXP, profile } = useUserStore()

  const myEntry = { id: 'me', name: profile.name, xp: totalXP, streak, weeklyXP, isMe: true }
  const all     = [...entries, myEntry]

  const sorted = [...all].sort((a, b) =>
    tab === 'xp' ? b.xp - a.xp : tab === 'streak' ? b.streak - a.streak : b.weeklyXP - a.weeklyXP
  )

  const top3 = sorted.slice(0, 3)
  const rest  = sorted.slice(3)

  function statVal(e) {
    if (tab === 'xp')     return `${(e.xp || 0).toLocaleString()} XP`
    if (tab === 'streak') return `${e.streak || 0} days`
    return `${(e.weeklyXP || 0).toLocaleString()} XP`
  }

  // stable fake delta per entry index
  const DELTAS = [-1, 0, 0, 1, 1, -1, 0, 1, 0, -1]

  return (
    <div>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        background: 'var(--bg-surface-2)',
        borderRadius: 12, padding: 4,
        border: '1px solid var(--border)',
      }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
              background: tab === id ? 'var(--bg-surface)' : 'transparent',
              color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: tab === id ? 700 : 500,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
              transition: 'all .15s',
            }}
          >
            <Icon size={13} strokeWidth={2.2} /> {label}
          </button>
        ))}
      </div>

      {/* ── Podium — top 3 ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr',
        gap: 10, marginBottom: 24, alignItems: 'flex-end',
      }}>
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          if (!entry) return <div key={i} />
          const pos        = [2, 1, 3][i]
          const colorIdx   = [1, 0, 2][i]
          const color      = PODIUM_COLORS[colorIdx]
          const MedalIcon  = MEDAL_ICONS[colorIdx]
          const isCenter   = i === 1
          const { level }  = levelFromXP(entry.xp || 0)
          const rankData   = getRankForLevel(level)

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', damping: 22, stiffness: 280 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              {/* Medal icon (replaces emoji) */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', damping: 14, stiffness: 300 }}
                style={{ marginBottom: 6, color }}
              >
                <MedalIcon
                  size={isCenter ? 24 : 18}
                  strokeWidth={1.8}
                  fill={`${color}30`}
                />
              </motion.div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                style={{
                  width: isCenter ? 50 : 42, height: isCenter ? 50 : 42,
                  borderRadius: '50%', marginBottom: 7,
                  background: `linear-gradient(135deg, ${color}80, ${color})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isCenter ? 18 : 15, fontWeight: 800, color: '#fff',
                  fontFamily: 'var(--font-display)', flexShrink: 0,
                  border: entry.isMe ? '2.5px solid var(--brand)' : `2px solid ${color}40`,
                  boxShadow: entry.isMe
                    ? '0 0 0 3px var(--brand-glow)'
                    : isCenter ? `0 6px 18px ${color}50` : 'none',
                }}
              >
                {entry.name.charAt(0).toUpperCase()}
              </motion.div>

              {/* Name */}
              <div style={{
                fontSize: 11, fontWeight: entry.isMe ? 800 : 600,
                color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)',
                marginBottom: 2, maxWidth: 72,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.name.replace(' (You)', '')}{entry.isMe ? ' ✦' : ''}
              </div>

              {/* Stat */}
              <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>
                {statVal(entry)}
              </div>

              {/* Rank label from gamification system */}
              <div style={{
                fontSize: 9, fontWeight: 600, color: rankData.color,
                marginBottom: 6, opacity: 0.85,
              }}>
                {rankData.icon} {rankData.title}
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: PODIUM_HEIGHTS[i] }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  width: '100%', background: `${color}22`,
                  borderRadius: '8px 8px 0 0',
                  border: `1px solid ${color}40`, borderBottom: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color,
                  fontFamily: 'var(--font-display)',
                }}
              >
                #{pos}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Rest of list ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {rest.map((entry, idx) => {
            const rank          = idx + 4
            const { level }     = levelFromXP(entry.xp || 0)
            const rankData      = getRankForLevel(level)
            const delta         = entry.isMe ? 0 : DELTAS[idx % DELTAS.length]

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.04, type: 'spring', damping: 24, stiffness: 300 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,18px)',
                  borderBottom: idx < rest.length - 1 ? '1px solid var(--border)' : 'none',
                  background: entry.isMe ? 'var(--brand-muted)' : 'transparent',
                  borderLeft: entry.isMe ? '3px solid var(--brand)' : '3px solid transparent',
                  transition: 'background .14s',
                }}
                onMouseEnter={e => { if (!entry.isMe) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = entry.isMe ? 'var(--brand-muted)' : 'transparent' }}
              >
                {/* Rank number */}
                <div style={{
                  width: 26, fontSize: 12, fontWeight: 800,
                  color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                  textAlign: 'center', flexShrink: 0,
                }}>
                  #{rank}
                </div>

                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${rankData.color}50, ${rankData.color})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff',
                    fontFamily: 'var(--font-display)',
                    border: entry.isMe ? '2px solid var(--brand)' : '2px solid transparent',
                    boxShadow: entry.isMe ? '0 0 0 2px var(--brand-glow)' : 'none',
                  }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </motion.div>

                {/* Name + rank title + delta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: entry.isMe ? 800 : 600,
                    color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {entry.name.replace(' (You)', '')}{entry.isMe && ' ✦'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: rankData.color, fontWeight: 600 }}>
                      {rankData.icon} {rankData.title}
                    </span>
                    {/* Delta chip */}
                    {!entry.isMe && delta > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        fontSize: 9, fontWeight: 700, padding: '1px 5px',
                        borderRadius: 999, background: 'rgba(34,197,94,0.12)', color: 'var(--brand)',
                      }}>
                        <ChevronUp size={9} strokeWidth={3} />{delta}
                      </span>
                    )}
                    {!entry.isMe && delta < 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        fontSize: 9, fontWeight: 700, padding: '1px 5px',
                        borderRadius: 999, background: 'rgba(239,68,68,0.10)', color: '#ef4444',
                      }}>
                        <ChevronDown size={9} strokeWidth={3} />{Math.abs(delta)}
                      </span>
                    )}
                    {!entry.isMe && delta === 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        fontSize: 9, fontWeight: 700, padding: '1px 5px',
                        borderRadius: 999, background: 'var(--bg-surface-3)', color: 'var(--text-muted)',
                      }}>
                        <Minus size={9} strokeWidth={3} />
                      </span>
                    )}
                    {entry.isMe && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        fontSize: 9, fontWeight: 700, padding: '1px 5px',
                        borderRadius: 999, background: 'var(--brand-muted)', color: 'var(--brand)',
                      }}>
                        <Star size={8} strokeWidth={3} fill="currentColor" /> You
                      </span>
                    )}
                  </div>
                </div>

                {/* Stat */}
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {statVal(entry)}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}