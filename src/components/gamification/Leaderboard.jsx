import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Flame } from 'lucide-react'
import { useLeaderboardStore, useUserStore } from '@/store'
import { getRankForLevel, levelFromXP } from '@/utils/constants'

const TABS = [
  { id: 'xp',     label: 'XP',     Icon: Zap },
  { id: 'streak', label: 'Streak', Icon: Flame },
  { id: 'weekly', label: 'Weekly', Icon: TrendingUp },
]

const MEDALS = ['🥇','🥈','🥉']
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
  const rest = sorted.slice(3)

  function statVal(e) {
    if (tab === 'xp')     return `${(e.xp || 0).toLocaleString()} XP`
    if (tab === 'streak') return `${e.streak || 0} 🔥`
    return `${(e.weeklyXP || 0).toLocaleString()} XP`
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-surface-2)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
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
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Podium — top 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 10, marginBottom: 24, alignItems: 'flex-end' }}>
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          if (!entry) return <div key={i} />
          const pos   = [2, 1, 3][i]
          const color = PODIUM_COLORS[[1,0,2][i]]
          const { level } = levelFromXP(entry.xp || 0)
          const rank  = getRankForLevel(level)

          return (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{MEDALS[[1,0,2][i]]}</div>

              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', marginBottom: 7,
                background: `linear-gradient(135deg, ${color}80, ${color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: '#fff',
                fontFamily: 'var(--font-display)', flexShrink: 0,
                border: entry.isMe ? '2.5px solid var(--brand)' : `2px solid ${color}40`,
                boxShadow: entry.isMe ? '0 0 0 3px var(--brand-glow)' : 'none',
              }}>
                {entry.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ fontSize: 11, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', marginBottom: 2, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.name.replace(' (You)', '')}{entry.isMe ? ' ✨' : ''}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{statVal(entry)}</div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }} animate={{ height: PODIUM_HEIGHTS[i] }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.4,0,0.2,1] }}
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

      {/* Rest of list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {rest.map((entry, idx) => {
            const rank   = idx + 4
            const { level } = levelFromXP(entry.xp || 0)
            const rankData  = getRankForLevel(level)

            return (
              <motion.div key={entry.id} layout
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,18px)',
                  borderBottom: idx < rest.length - 1 ? '1px solid var(--border)' : 'none',
                  background: entry.isMe ? 'var(--brand-muted)' : 'transparent',
                  borderLeft: entry.isMe ? '3px solid var(--brand)' : '3px solid transparent',
                  transition: 'background .14s',
                }}
                onMouseEnter={e => { if (!entry.isMe) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
                onMouseLeave={e => e.currentTarget.style.background = entry.isMe ? 'var(--brand-muted)' : 'transparent'}
              >
                <div style={{ width: 26, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textAlign: 'center', flexShrink: 0 }}>
                  #{rank}
                </div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${rankData.color}50, ${rankData.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name.replace(' (You)', '')}{entry.isMe && ' ✨'}
                  </div>
                  <div style={{ fontSize: 11, color: rankData.color, fontWeight: 600 }}>{rankData.icon} {rankData.title}</div>
                </div>
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
