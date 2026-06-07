/**
 * components/dashboard/DashboardEnhancement.jsx
 *
 * This is a WRAPPER — it sits ABOVE the existing DashboardPage content.
 * It does NOT replace any existing logic or components.
 *
 * HOW TO USE:
 *   In your existing pages/Dashboard.jsx, add this at the top of the JSX:
 *
 *   import { DashboardEnhancement } from '@/components/dashboard/DashboardEnhancement'
 *
 *   Then inside your return, ABOVE existing content:
 *   <DashboardEnhancement />
 *   ... (existing Dashboard JSX unchanged) ...
 *
 * The component reads from the SAME stores the Dashboard already uses.
 * It never modifies store state — only reads.
 *
 * ─────────────────────────────────────────────────────────────
 * INTEGRATION CHECKLIST (edit Dashboard.jsx):
 *
 * 1. Import this component
 * 2. Import glass.css once in main.jsx or index.css: @import './styles/glass.css';
 * 3. Add <DashboardEnhancement /> at the TOP of your Dashboard return
 * 4. Wrap Dashboard's outermost div with className="taskr-bg"
 *    (or add the class — it's additive, won't break anything)
 * 5. Add AICharacter at bottom of App.jsx (inside the AppShell, after <ActivePage />)
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { isToday, isTomorrow, parseISO, isAfter } from 'date-fns'

// New components
import { GreetingHeader }          from './GreetingHeader'
import { ProgressRing }            from './ProgressRing'
import { StatsCards }              from './StatsCards'
import { TodaySection }            from './TodaySection'
import { UpcomingSection }         from './UpcomingSection'
import { RecommendationsSection }  from './RecommendationsSection'
import { GlassCard }               from '@/components/ui/GlassCard'

// ── Read from existing stores ────────────────────────────────
// These are the same stores the existing Dashboard already uses.
// Adjust selector keys if your store shape differs slightly.
import { useTaskStore }  from '@/store'
import { useUserStore }  from '@/store'

export function DashboardEnhancement() {
  // ── Store reads (non-breaking) ─────────────────────────────
  const tasks   = useTaskStore(s => s.tasks   ?? [])
  const profile = useUserStore(s => s.profile ?? {})

  const userName   = profile.name ?? profile.username ?? profile.email ?? 'Samuel'
  const xp         = profile.xp    ?? profile.total_xp ?? 0
  const level      = profile.level ?? 1
  const streak     = profile.streak ?? profile.current_streak ?? 0

  // ── Derived data ──────────────────────────────────────────
  const todayTasks = useMemo(() =>
    tasks.filter(t => {
      if (!t.due_date) return false
      try { return isToday(typeof t.due_date === 'string' ? parseISO(t.due_date) : t.due_date) }
      catch { return false }
    }), [tasks]
  )

  const upcomingTasks = useMemo(() =>
    tasks
      .filter(t => {
        if (!t.due_date || t.completed) return false
        try {
          const d = typeof t.due_date === 'string' ? parseISO(t.due_date) : t.due_date
          return isTomorrow(d) || isAfter(d, new Date())
        } catch { return false }
      })
      .slice(0, 8)
      .map(t => ({ ...t, type: 'task' })),
    [tasks]
  )

  const completedToday   = todayTasks.filter(t => t.completed).length
  const tasksTotal       = todayTasks.length
  const productivityScore = tasksTotal > 0
    ? Math.round((completedToday / tasksTotal) * 100)
    : 0

  const isEmpty = todayTasks.length === 0

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="px-4 pt-2 pb-4" style={{ color: 'var(--text-primary)' }}>
      {/* Greeting */}
      <GreetingHeader
        userName={userName}
        avatarLetter={userName?.[0]?.toUpperCase() ?? 'S'}
      />

      {/* Progress ring + message card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
        className="mb-5"
      >
        <GlassCard variant="accent" padding="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {completedToday === tasksTotal && tasksTotal > 0
                  ? '🎉 All done today!'
                  : tasksTotal === 0
                  ? 'Ready to go?'
                  : 'Keep it up!'
                }
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {tasksTotal === 0
                  ? 'No tasks scheduled today'
                  : `${completedToday} of ${tasksTotal} tasks completed`
                }
              </p>
              {streak > 0 && (
                <p className="text-xs mt-1.5 font-semibold" style={{ color: '#fbbf24' }}>
                  🔥 {streak}-day streak
                </p>
              )}
            </div>
            <ProgressRing
              tasksCompleted={completedToday}
              tasksTotal={tasksTotal}
              size={100}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick stats */}
      <StatsCards
        tasksCompleted={completedToday}
        routinesCompleted={0}        // wire in when routine store available
        streak={streak}
        productivityScore={productivityScore}
      />

      {/* Today's content */}
      {isEmpty ? (
        <RecommendationsSection userId={profile.id} />
      ) : (
        <>
          <TodaySection
            tasks={todayTasks}
            routines={[]}              // wire in when routine store available
            onToggleTask={null}        // pass your existing toggle handler here
          />
          <UpcomingSection items={upcomingTasks} />
        </>
      )}
    </div>
  )
}