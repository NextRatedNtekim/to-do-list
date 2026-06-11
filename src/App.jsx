import { useEffect, useState, useRef } from 'react'
import { registerSW }                   from '@/lib/push'
import { initAlarmListener }            from '@/store/alarmStore'
import { useUIStore, useTaskStore, useUserStore } from '@/store'
import { useAuthStore }                 from '@/store/authStore'
import { usePartnerStore }              from '@/store/partnerStore'
import { useNotificationStore }         from '@/store/notificationStore'
import { useRoutineStore }              from '@/store/routineStore'
import { useTheme }                     from '@/hooks'
import { AppShell }                     from '@/components/layout/AppShell'
import { AuthPage }                     from '@/pages/AuthPage'
import { Preloader }                    from '@/components/ui/Preloader'
import { ToastContainer }               from '@/components/ui/Toast'
import { XPFloatLayer, LevelUpOverlay } from '@/components/ui/XPEffects'
import { CompletionBurstLayer }         from '@/components/ui/CompletionEffect'
import { DashboardPage }                from '@/pages/Dashboard'
import { TasksPage }                    from '@/pages/TasksPage'
import { AnalyticsPage }                from '@/pages/Analytics'
import { LeaderboardPage }              from '@/pages/LeaderboardPage'
import  { PartnerPage  }                from '@/pages/Partner'
import { SettingsPage }                 from '@/pages/Settings'
import { LandingPage }                  from '@/pages/Landingpage'
import { PrivacyPage }                  from '@/pages/PrivacyPage'
import { CountdownPage, LAUNCH_DATE }   from '@/pages/Countdown'
import { CalendarScreen }               from '@/pages/CalendarScreen'
import { RoutinesPage }                 from '@/pages/RoutinesPage'
import { fetchTasks }                   from '@/services/taskService'
import { fetchProfile, upsertProfile }  from '@/services/profileService'
import { AICharacter }                  from '@/components/ai/AICharacter'

const PAGE_MAP = {
  dashboard:   DashboardPage,
  tasks:       TasksPage,
  analytics:   AnalyticsPage,
  leaderboard: LeaderboardPage,
  partner:     PartnerPage,
  settings:    SettingsPage,
  calendar:    CalendarScreen,
  routines:    RoutinesPage,
}

// Pages on which the AI character should appear
const AI_CHARACTER_VIEWS = new Set(['tasks', 'routines'])

function shouldShowCountdown() {
  if (Date.now() >= LAUNCH_DATE.getTime()) return false
  if (localStorage.getItem('taskr_launched') === 'true') return false
  return true
}

function getInitialPublicView() {
  const path = window.location.pathname
  if (path === '/privacy') return 'privacy'
  // Only show landing for unauthenticated users — resolved below after auth check
  if (path === '/')        return 'landing'
  return null
}

export default function App() {
  const [appReady,      setAppReady]      = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [publicView,    setPublicView]    = useState(getInitialPublicView)

  const { activeView, setActiveView }                    = useUIStore()
  const { setTheme }                                     = useTheme()
  const { user, loading: authLoading, init: initAuth }   = useAuthStore()
  const { syncFromSupabase }                             = useTaskStore()
  const { loadProfile }                                  = useUserStore()
  const { init: initPartner, teardown: teardownPartner } = usePartnerStore()
  const { init: initNotifs,  teardown: teardownNotifs  } = useNotificationStore()

  const dataLoadedFor = useRef(null)

  // 1. Theme + service worker + alarm listener
  useEffect(() => {
    const saved = localStorage.getItem('taskr_theme') || 'dark'
    setTheme(saved)
    registerSW()
    initAlarmListener()
    const t = setTimeout(() => setAppReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  // 2. Auth listener
  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  // 3. Once auth resolves — skip landing if already signed in, reset to dashboard
  useEffect(() => {
    if (authLoading) return
    if (user) {
      // Signed-in: never show landing, always start at dashboard
      if (publicView === 'landing') setPublicView(null)
      setActiveView('dashboard')
    }
    // Not signed in: leave publicView as-is (landing or privacy)
  }, [user, authLoading])

  // 4. Countdown gate
  useEffect(() => {
    if (user) setShowCountdown(shouldShowCountdown())
    else      setShowCountdown(false)
  }, [user])

  // 5. Load user data
  useEffect(() => {
    if (!user || dataLoadedFor.current === user.id) return
    dataLoadedFor.current = user.id

    async function loadUserData() {
      try {
        const tasks = await fetchTasks()
        syncFromSupabase(tasks)
        let profile = await fetchProfile(user.id)
        if (!profile) profile = await upsertProfile(user.id, { name: user.name })
        loadProfile(profile)
      } catch (err) {
        console.error('[Taskr] Failed to load user data:', err)
      }
      initPartner(user.id)
      initNotifs(user.id)
      useRoutineStore.getState().loadAll()
    }
    loadUserData()
  }, [user])

  // 6. Cleanup on logout
  useEffect(() => {
    if (!user) {
      dataLoadedFor.current = null
      syncFromSupabase([])
      teardownPartner()
      teardownNotifs()
      useRoutineStore.setState({
        routines:       [],
        completions:    [],
        completedToday: new Set(),
        loading:        false,
        error:          null,
      })
    }
  }, [user])

  function handleLaunch()  { localStorage.setItem('taskr_launched','true'); setShowCountdown(false) }
  function goToAuth()      { setPublicView(null) }
  function goToPrivacy()   { setPublicView('privacy') }
  function goToLanding()   { setPublicView('landing') }

  // ── Public pages (only reachable when not signed in) ───────
  if (publicView === 'landing') {
    return <LandingPage onGetStarted={goToAuth} onPrivacy={goToPrivacy} />
  }
  if (publicView === 'privacy') {
    return <PrivacyPage onBack={goToLanding} />
  }

  // ── App shell ──────────────────────────────────────────────
  const ActivePage    = PAGE_MAP[activeView] || DashboardPage
  const showPreloader = !appReady || authLoading

  return (
    <>
      <Preloader visible={showPreloader} />

      {appReady && !authLoading && (
        user ? (
          showCountdown ? (
            <CountdownPage
              onLaunch={handleLaunch}
              userName={user.name || user.email}
            />
          ) : (
            <AppShell>
              <ActivePage />
              {AI_CHARACTER_VIEWS.has(activeView) && <AICharacter />}
            </AppShell>
          )
        ) : (
          <AuthPage onGoHome={goToLanding} />
        )
      )}

      <ToastContainer />
      <XPFloatLayer />
      <LevelUpOverlay />
      <CompletionBurstLayer />
    </>
  )
}