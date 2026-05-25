import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { useAnalytics } from '@/hooks'
import { useUserStore } from '@/store'
import { PRIORITY_COLOR } from '@/utils/constants'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  )
}

const CHART_STYLE = {
  cardStyle: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(14px,3vw,20px)' },
  titleStyle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)' },
  axisProps: { tick: { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-body)' }, axisLine: false, tickLine: false },
}

export function WeeklyChart() {
  const { getLast7Days } = useAnalytics()
  const data = useMemo(() => getLast7Days(), [getLast7Days])
  return (
    <div style={CHART_STYLE.cardStyle}>
      <div style={CHART_STYLE.titleStyle}>7-Day Activity</div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" {...CHART_STYLE.axisProps} />
          <YAxis {...CHART_STYLE.axisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="completed" name="Tasks" stroke="#22c55e" strokeWidth={2} fill="url(#areaG)" dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5, fill: '#22c55e' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function XPChart() {
  const { getLast7Days } = useAnalytics()
  const data = useMemo(() => getLast7Days(), [getLast7Days])
  return (
    <div style={CHART_STYLE.cardStyle}>
      <div style={CHART_STYLE.titleStyle}>XP Earned per Day</div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" {...CHART_STYLE.axisProps} />
          <YAxis {...CHART_STYLE.axisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="xp" name="XP" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PriorityChart() {
  const { getByPriority } = useAnalytics()
  const data = useMemo(() => getByPriority().filter(d => d.value > 0), [getByPriority])
  const COLORS = [PRIORITY_COLOR.urgent, PRIORITY_COLOR.high, PRIORITY_COLOR.medium, PRIORITY_COLOR.low]
  if (!data.length) return (
    <div style={{ ...CHART_STYLE.cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>No task data yet
      </div>
    </div>
  )
  return (
    <div style={CHART_STYLE.cardStyle}>
      <div style={CHART_STYLE.titleStyle}>Tasks by Priority</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, textTransform: 'capitalize' }}>{d.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ActivityHeatmap() {
  const { dailyActivity } = useUserStore()
  const WEEKS = 16
  const cells = useMemo(() => {
    const arr = [], today = new Date()
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      arr.push({ key, count: dailyActivity[key]?.completed || 0 })
    }
    return arr
  }, [dailyActivity])

  function getColor(n) {
    if (!n) return 'var(--bg-surface-3)'
    if (n < 2) return '#bbf7d0'
    if (n < 4) return '#4ade80'
    if (n < 7) return '#22c55e'
    return '#15803d'
  }

  return (
    <div style={CHART_STYLE.cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={CHART_STYLE.titleStyle}>Activity Heatmap</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
          Less {[0,1,3,5,8].map(n => <span key={n} style={{ width: 10, height: 10, borderRadius: 3, background: getColor(n), display: 'inline-block' }} />)} More
        </div>
      </div>
      <div style={{ overflowX: 'auto' }} className="scrollbar-none">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 1fr)`, gridTemplateRows: 'repeat(7, 1fr)', gap: 3, gridAutoFlow: 'column', minWidth: WEEKS * 14 + (WEEKS - 1) * 3 }}>
          {cells.map(cell => (
            <div key={cell.key} title={`${cell.key}: ${cell.count} tasks`}
              style={{ width: 14, height: 14, borderRadius: 3, background: getColor(cell.count), cursor: cell.count > 0 ? 'pointer' : 'default', transition: 'transform 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.35)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
