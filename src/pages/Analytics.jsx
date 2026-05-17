import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Trophy, Flame, BarChart3, Target } from 'lucide-react'
import { useTaskStore, useUserStore } from '@/store'
import { useAnalytics } from '@/hooks'
import { WeeklyChart, XPChart, PriorityChart, ActivityHeatmap } from '@/components/analytics/Charts'
import { AnimatedNum } from '@/components/gamification/XPDisplay'
import { levelFromXP } from '@/utils/constants'

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, delay: d, ease: [0.22,1,0.36,1] } })

function SummaryCard({ label, value, Icon, color, suffix = '', index = 0 }) {
  return (
    <motion.div {...fadeUp(index * 0.06)} className="card card-hover" style={{ padding: 'clamp(14px,2.5vw,18px)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}20` }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3.5vw,24px)', fontWeight: 800, letterSpacing: '-0.5px', color: color || 'var(--text-primary)' }}>
          <AnimatedNum value={value} />{suffix}
        </div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>{label}</div>
      </div>
    </motion.div>
  )
}

export function AnalyticsPage() {
  const { tasks } = useTaskStore()
  const { totalXP, streak, longestStreak, weeklyXP } = useUserStore()
  const { getCompletionRate, getLast7Days } = useAnalytics()

  const completionRate = useMemo(() => getCompletionRate(), [getCompletionRate])
  const weekData       = useMemo(() => getLast7Days(), [getLast7Days])
  const weekCompleted  = weekData.reduce((s, d) => s + d.completed, 0)
  const { level }      = levelFromXP(totalXP)
  const maxDay         = Math.max(...weekData.map(d => d.completed), 1)

  return (
    <div>
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Your productivity insights over time</p>
      </motion.div>

      <div className="adaptive-grid-4" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <SummaryCard label="Completion"  value={completionRate} Icon={Target}    color="var(--brand)" suffix="%" index={0} />
        <SummaryCard label="This Week"   value={weekCompleted}  Icon={TrendingUp} color="#3b82f6"      index={1} />
        <SummaryCard label="Total XP"    value={totalXP}        Icon={Zap}        color="#f59e0b"      index={2} />
        <SummaryCard label="Best Streak" value={longestStreak}  Icon={Flame}      color="#fb923c" suffix="d" index={3} />
      </div>

      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <motion.div {...fadeUp(0.12)}><WeeklyChart /></motion.div>
        <motion.div {...fadeUp(0.16)}><XPChart /></motion.div>
      </div>

      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <motion.div {...fadeUp(0.2)}><PriorityChart /></motion.div>

        {/* Weekly breakdown bar */}
        <motion.div {...fadeUp(0.24)} className="card" style={{ padding: 'clamp(16px,3vw,20px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <BarChart3 size={15} color="var(--brand)" /> Daily Breakdown
          </div>
          {weekData.map((day, i) => (
            <div key={day.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 30, flexShrink: 0, fontWeight: 600 }}>{day.label}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(day.completed / maxDay) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.4,0,0.2,1] }}
                  style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, var(--brand), #4ade80)` }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: day.completed ? 'var(--brand)' : 'var(--text-faint)', width: 18, textAlign: 'right', flexShrink: 0 }}>{day.completed}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.28)}><ActivityHeatmap /></motion.div>
    </div>
  )
}
