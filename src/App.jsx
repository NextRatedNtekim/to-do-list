import { useEffect, useState } from 'react'
import { useUIStore } from '@/store'
import { useTheme } from '@/hooks'
import { AppShell } from '@/components/layout/AppShell'
import { Preloader } from '@/components/ui/Preloader'
import { ToastContainer } from '@/components/ui/Toast'
import { XPFloatLayer, LevelUpOverlay } from '@/components/ui/XPEffects'

import { DashboardPage }   from '@/pages/Dashboard'
import { TasksPage }       from '@/pages/Tasks'
import { AnalyticsPage }   from '@/pages/Analytics'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { PartnerPage }     from '@/pages/Partner'
import { SettingsPage }    from '@/pages/Settings'

const PAGE_MAP = {
  dashboard:   DashboardPage,
  tasks:       TasksPage,
  analytics:   AnalyticsPage,
  leaderboard: LeaderboardPage,
  partner:     PartnerPage,
  settings:    SettingsPage,
}

export default function App() {
  const [ready, setReady]   = useState(false)
  const { activeView }      = useUIStore()
  const { setTheme }        = useTheme()

  useEffect(() => {
    const saved = localStorage.getItem('taskr_theme') || 'dark'
    setTheme(saved)
    const t = setTimeout(() => setReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  const ActivePage = PAGE_MAP[activeView] || DashboardPage

  return (
    <>
      <Preloader visible={!ready} />
      {ready && (
        <AppShell>
          <ActivePage />
        </AppShell>
      )}
      <ToastContainer />
      <XPFloatLayer />
      <LevelUpOverlay />
    </>
  )
}
