// Reusable skeleton loader shapes

export function SkeletonLine({ width = '100%', height = 16, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  )
}

export function SkeletonCard({ lines = 3, style = {} }) {
  return (
    <div
      style={{
        padding:      '16px 20px',
        borderBottom: '1px solid var(--border)',
        display:      'flex',
        gap:          14,
        ...style,
      }}
    >
      <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonLine width="70%" height={14} />
        {lines > 1 && <SkeletonLine width="40%" height={11} />}
        {lines > 2 && <SkeletonLine width="55%" height={11} />}
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div
      style={{
        flex:         1,
        padding:      '14px 16px',
        borderRadius: 16,
        border:       '1px solid var(--border)',
        background:   'var(--bg-surface)',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
      }}
    >
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonLine width="60%" height={22} />
        <SkeletonLine width="80%" height={10} />
      </div>
    </div>
  )
}

export function TaskListSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </>
  )
}
