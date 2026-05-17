import { motion } from 'framer-motion'
import { CheckSquare, Clock, TrendingUp, Zap, ArrowRight, Target } from 'lucide-react'
import { useTaskStore, useUserStore, useUIStore } from '@/store'
import { XPCard, StreakCard, AnimatedNum } from '@/components/gamification/XPDisplay'
import { WeeklyChart, XPChart } from '@/components/analytics/Charts'
import { levelFromXP } from '@/utils/constants'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
})

function StatCard({ label, value, Icon, color, sub, index = 0 }) {
  return (
    <motion.div
      {...fadeUp(index * 0.06)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="card card-hover"
      style={{ padding: 'clamp(14px,2.5vw,18px)', display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}28`,
      }}>
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3.5vw,26px)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: 'var(--text-primary)' }}>
          <AnimatedNum value={value} />
        </div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const { tasks }   = useTaskStore()
  const { totalXP } = useUserStore()
  const { setActiveView } = useUIStore()

  const total     = tasks.length
  const done      = tasks.filter(t => t.done).length
  const remaining = total - done
  const pct       = total ? Math.round((done / total) * 100) : 0
  const { level } = levelFromXP(totalXP)
  const todayDone = tasks.filter(t => {
    if (!t.completedAt) return false
    const now = new Date(), d = new Date(t.completedAt)
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <div>
      {/* Header */}
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your productivity at a glance</p>
      </motion.div>

      {/* Stats */}
      <div className="adaptive-grid-4" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <StatCard label="Total"     value={total}     Icon={CheckSquare}  color="#22c55e" index={0} />
        <StatCard label="Completed" value={done}      Icon={TrendingUp}   color="#22c55e" sub={`${pct}% done`} index={1} />
        <StatCard label="Remaining" value={remaining} Icon={Clock}        color="#60a5fa" index={2} />
        <StatCard label="Today"     value={todayDone} Icon={Zap}          color="#f59e0b" sub="completed" index={3} />
      </div>

      {/* Progress */}
      {total > 0 && (
        <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 'clamp(14px,2.5vw,20px)', marginBottom: 'clamp(12px,2vw,18px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} color="var(--brand)" /> Overall Progress
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand)' }}>{pct}%</span>
          </div>
          <div className="progress-track" style={{ height: 10 }}>
            <motion.div
              className="progress-fill"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>{done} tasks done</span>
            <span>{remaining} remaining</span>
          </div>
        </motion.div>
      )}

      {/* XP + Streak */}
      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <motion.div {...fadeUp(0.14)}><XPCard /></motion.div>
        <motion.div {...fadeUp(0.18)}><StreakCard /></motion.div>
      </div>

      {/* Charts */}
      <div className="adaptive-grid-2" style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
        <motion.div {...fadeUp(0.22)}><WeeklyChart /></motion.div>
        <motion.div {...fadeUp(0.26)}><XPChart /></motion.div>
      </div>

      {/* CTA */}
      <motion.div
        {...fadeUp(0.3)}
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 'var(--radius-lg)', padding: 'clamp(16px,3vw,22px) clamp(16px,3vw,24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
            Ready to be productive?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {remaining > 0 ? `${remaining} task${remaining !== 1 ? 's' : ''} waiting for you.` : "All done! Keep the streak alive — add more tasks."}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setActiveView('tasks')}
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
        >
          Go to Tasks <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </div>
  )
}
