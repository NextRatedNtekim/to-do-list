import { motion } from 'framer-motion'
import { useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { Zap, Shield, Flame, Trophy } from 'lucide-react'
import { useUserStore } from '@/store'
import { levelFromXP, getRankForLevel, STREAK_MILESTONES } from '@/utils/constants'

export function AnimatedNum({ value, style }) {
  const spring  = useSpring(value, { stiffness: 160, damping: 22 })
  const display = useTransform(spring, v => Math.round(v).toLocaleString())
  useEffect(() => { spring.set(value) }, [value, spring])
  return <motion.span style={style}>{display}</motion.span>
}

export function XPCard() {
  const { totalXP, weeklyXP } = useUserStore()
  const { level, accumulated, nextThreshold } = levelFromXP(totalXP)
  const rank   = getRankForLevel(level)
  const xpPct  = Math.min(Math.round((accumulated / nextThreshold) * 100), 100)

  return (
    <div className="card" style={{ padding: 'clamp(16px,3vw,22px)', position: 'relative', overflow: 'hidden' }}>
      {/* Bg decoration */}
      <div style={{ position: 'absolute', right: -16, top: -16, fontSize: 80, opacity: 0.05, pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>{rank.icon}</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Level</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,7vw,48px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, background: `linear-gradient(135deg, ${rank.color}, var(--brand))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {level}
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${rank.color}18`, borderRadius: 10, padding: '7px 11px', border: `1px solid ${rank.color}28` }}>
          <span style={{ fontSize: 18 }}>{rank.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: rank.color, fontFamily: 'var(--font-display)' }}>{rank.title}</span>
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}><AnimatedNum value={accumulated} /> / {nextThreshold.toLocaleString()} XP</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)' }}>{xpPct}%</span>
        </div>
        <div className="progress-track" style={{ height: 8 }}>
          <motion.div className="progress-fill" animate={{ width: `${xpPct}%` }} transition={{ duration: 0.9, ease: [0.4,0,0.2,1] }}
            style={{ background: `linear-gradient(90deg, var(--brand), ${rank.color})` }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <XPStat label="Total XP"   value={totalXP}  Icon={Zap}    color="var(--brand)" />
        <XPStat label="This Week"  value={weeklyXP} Icon={Trophy} color="#f59e0b" />
      </div>
    </div>
  )
}

function XPStat({ label, value, Icon, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon size={10} color={color} />{label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, letterSpacing: '-0.5px', color }}>
        <AnimatedNum value={value} />
      </div>
    </div>
  )
}

export function StreakCard() {
  const { streak, longestStreak, streakFreezes } = useUserStore()
  const next = STREAK_MILESTONES.find(m => m > streak)
  const pct  = next ? Math.round((streak / next) * 100) : 100

  return (
    <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Daily Streak</div>
        {streakFreezes > 0 && (
          <div className="badge badge-blue" style={{ fontSize: 11 }}>
            <Shield size={10} /> {streakFreezes} freeze{streakFreezes !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <motion.div animate={{ scale: streak > 0 ? [1, 1.1, 1] : 1 }} transition={{ duration: 2.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 4 }}
          style={{ fontSize: 'clamp(44px,9vw,56px)', lineHeight: 1 }} className={streak > 0 ? 'streak-flame' : ''}>
          {streak > 0 ? '🔥' : '💤'}
        </motion.div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,8vw,52px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: streak > 0 ? '#fb923c' : 'var(--text-muted)' }}>
            {streak}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>day{streak !== 1 ? 's' : ''} in a row</div>
        </div>
      </div>

      {next && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Next: {next} days</span>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>{streak}/{next}</span>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <motion.div className="progress-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.4,0,0.2,1] }}
              style={{ background: 'linear-gradient(90deg, #fb923c, #f59e0b)' }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Best Streak', value: longestStreak, suffix: 'd', color: 'var(--text-primary)' },
          { label: 'Freezes',     value: streakFreezes, suffix: '',  color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}{s.suffix}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
