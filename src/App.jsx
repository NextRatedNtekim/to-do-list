// /**
//  * App.jsx
//  * -------
//  * Adds to previous version:
//  *  - Initialises usePartnerStore.init(userId) on login
//  *  - Initialises useNotificationStore.init(userId) on login
//  *  - Calls teardown() on both stores on logout
//  *  - Everything else identical
//  */

// import { useEffect, useState, useRef } from 'react'
// import { useUIStore, useTaskStore, useUserStore } from '@/store'
// import { _registerUIStore } from '@/store/notificationStore'
// import { useAuthStore }          from '@/store/authStore'
// import { usePartnerStore }       from '@/store/partnerStore'
// import { useNotificationStore }  from '@/store/notificationStore'
// import { useTheme }              from '@/hooks'

// import { AppShell }       from '@/components/layout/AppShell'
// import { AuthPage }       from '@/pages/AuthPage'
// import { Preloader }      from '@/components/ui/Preloader'
// import { ToastContainer } from '@/components/ui/Toast'
// import { XPFloatLayer, LevelUpOverlay } from '@/components/ui/XPEffects'

// import { DashboardPage }   from '@/pages/Dashboard'
// import { TasksPage }       from '@/pages/Tasks'
// import { AnalyticsPage }   from '@/pages/Analytics'
// import { LeaderboardPage } from '@/pages/LeaderboardPage'
// import { PartnerPage }     from '@/pages/Partner'
// import { SettingsPage }    from '@/pages/Settings'

// import { fetchTasks }              from '@/services/taskService'
// import { fetchProfile, upsertProfile } from '@/services/profileService'

// // Register UIStore getter so notificationStore can show toasts without circular imports
// _registerUIStore(() => useUIStore.getState())

// const PAGE_MAP = {
//   dashboard:   DashboardPage,
//   tasks:       TasksPage,
//   analytics:   AnalyticsPage,
//   leaderboard: LeaderboardPage,
//   partner:     PartnerPage,
//   settings:    SettingsPage,
// }

// export default function App() {
//   const [appReady, setAppReady] = useState(false)

//   const { activeView }                             = useUIStore()
//   const { setTheme }                               = useTheme()
//   const { user, loading: authLoading, init: initAuth } = useAuthStore()
//   const { syncFromSupabase }                       = useTaskStore()
//   const { loadProfile }                            = useUserStore()
//   const { init: initPartner, teardown: teardownPartner } = usePartnerStore()
//   const { init: initNotifs,  teardown: teardownNotifs  } = useNotificationStore()

//   const dataLoadedFor = useRef(null)

//   // 1. Theme + preloader
//   useEffect(() => {
//     const saved = localStorage.getItem('taskr_theme') || 'dark'
//     setTheme(saved)
//     const t = setTimeout(() => setAppReady(true), 2200)
//     return () => clearTimeout(t)
//   }, [])

//   // 2. Auth listener
//   useEffect(() => {
//     const unsub = initAuth()
//     return unsub
//   }, [])

//   // 3. Load all user data when authenticated
//   useEffect(() => {
//     if (!user || dataLoadedFor.current === user.id) return
//     dataLoadedFor.current = user.id

//     async function loadUserData() {
//       try {
//         // Tasks
//         const tasks = await fetchTasks()
//         syncFromSupabase(tasks)

//         // Profile
//         let profile = await fetchProfile(user.id)
//         if (!profile) profile = await upsertProfile(user.id, { name: user.name })
//         loadProfile(profile)
//       } catch (err) {
//         console.error('[Taskr] Failed to load user data:', err)
//       }

//       // Partner feed + Realtime subscription
//       initPartner(user.id)

//       // Notifications + Realtime subscription
//       initNotifs(user.id)
//     }

//     loadUserData()
//   }, [user])

//   // 4. Cleanup on logout
//   useEffect(() => {
//     if (!user) {
//       dataLoadedFor.current = null
//       syncFromSupabase([])
//       teardownPartner()
//       teardownNotifs()
//     }
//   }, [user])

//   const ActivePage     = PAGE_MAP[activeView] || DashboardPage
//   const showPreloader  = !appReady || authLoading

//   return (
//     <>
//       <Preloader visible={showPreloader} />

//       {appReady && !authLoading && (
//         user ? (
//           <AppShell>
//             <ActivePage />
//           </AppShell>
//         ) : (
//           <AuthPage />
//         )
//       )}

//       <ToastContainer />
//       <XPFloatLayer />
//       <LevelUpOverlay />
//     </>
//   )
// }


/**
 * App.jsx
 * -------
 * No React Router — uses simple state-based page switching.
 * Public pages (landing, privacy) shown via `publicView` state.
 * After login, countdown is shown, then the main app.
 */

import { useEffect, useState, useRef } from 'react'

import { useUIStore, useTaskStore, useUserStore } from '@/store'
import { _registerUIStore }              from '@/store/notificationStore'
import { useAuthStore }                  from '@/store/authStore'
import { usePartnerStore }               from '@/store/partnerStore'
import { useNotificationStore }          from '@/store/notificationStore'
import { useTheme }                      from '@/hooks'

import { AppShell }                      from '@/components/layout/AppShell'
import { AuthPage }                      from '@/pages/AuthPage'
import { Preloader }                     from '@/components/ui/Preloader'
import { ToastContainer }                from '@/components/ui/Toast'
import { XPFloatLayer, LevelUpOverlay }  from '@/components/ui/XPEffects'

import { DashboardPage }                 from '@/pages/Dashboard'
import { TasksPage }                     from '@/pages/Tasks'
import { AnalyticsPage }                 from '@/pages/Analytics'
import { LeaderboardPage }               from '@/pages/LeaderboardPage'
import { PartnerPage }                   from '@/pages/Partner'
import { SettingsPage }                  from '@/pages/Settings'

import { LandingPage }                   from '@/pages/Landingpage'
import { PrivacyPage }                   from '@/pages/PrivacyPage'
import { CountdownPage, LAUNCH_DATE }    from '@/pages/Countdown'

import { fetchTasks }                    from '@/services/taskService'
import { fetchProfile, upsertProfile }   from '@/services/profileService'

_registerUIStore(() => useUIStore.getState())

const PAGE_MAP = {
  dashboard:   DashboardPage,
  tasks:       TasksPage,
  analytics:   AnalyticsPage,
  leaderboard: LeaderboardPage,
  partner:     PartnerPage,
  settings:    SettingsPage,
}

function shouldShowCountdown() {
  if (Date.now() >= LAUNCH_DATE.getTime()) return false
  if (localStorage.getItem('taskr_launched') === 'true') return false
  return true
}

// Read the current URL path once on load to decide the initial public view
function getInitialPublicView() {
  const path = window.location.pathname
  if (path === '/privacy') return 'privacy'
  if (path === '/')        return 'landing'
  return null  // not a public route — go to app flow
}

export default function App() {
  const [appReady, setAppReady]         = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  // null = not on a public page, 'landing' = /, 'privacy' = /privacy
  const [publicView, setPublicView]     = useState(getInitialPublicView)

  const { activeView }                                   = useUIStore()
  const { setTheme }                                     = useTheme()
  const { user, loading: authLoading, init: initAuth }   = useAuthStore()
  const { syncFromSupabase }                             = useTaskStore()
  const { loadProfile }                                  = useUserStore()
  const { init: initPartner, teardown: teardownPartner } = usePartnerStore()
  const { init: initNotifs,  teardown: teardownNotifs  } = useNotificationStore()

  const dataLoadedFor = useRef(null)

  // 1. Theme + preloader
  useEffect(() => {
    const saved = localStorage.getItem('taskr_theme') || 'dark'
    setTheme(saved)
    const t = setTimeout(() => setAppReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  // 2. Auth listener
  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  // 3. Countdown gate
  useEffect(() => {
    if (user) setShowCountdown(shouldShowCountdown())
    else      setShowCountdown(false)
  }, [user])

  // 4. Load user data
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
    }
    loadUserData()
  }, [user])

  // 5. Cleanup on logout
  useEffect(() => {
    if (!user) {
      dataLoadedFor.current = null
      syncFromSupabase([])
      teardownPartner()
      teardownNotifs()
    }
  }, [user])

  function handleLaunch() {
    localStorage.setItem('taskr_launched', 'true')
    setShowCountdown(false)
  }

  // ── Public page navigation helpers (passed as props to landing/privacy) ──
  function goToAuth()    { setPublicView(null) }
  function goToPrivacy() { setPublicView('privacy') }
  function goToLanding() { setPublicView('landing') }

  // ── Render public pages first — no auth needed ───────────────────────────
  if (publicView === 'landing') {
    return <LandingPage onGetStarted={goToAuth} onPrivacy={goToPrivacy} />
  }
  if (publicView === 'privacy') {
    return <PrivacyPage onBack={goToLanding} />
  }

  // ── App flow ─────────────────────────────────────────────────────────────
  const ActivePage    = PAGE_MAP[activeView] || DashboardPage
  const showPreloader = !appReady || authLoading

  return (
    <>
      {/* <Preloader visible={showPreloader} />

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
            </AppShell>
              ) 
         ) : ( 
          
          <AuthPage onGoHome={goToLanding} /> 
         )
       )}  

      <ToastContainer />
      <XPFloatLayer />
      <LevelUpOverlay /> */}
             <Preloader visible={showPreloader} />

       {appReady && !authLoading && (
        user ? (
          <AppShell>
            <ActivePage />
          </AppShell>
        ) : (
          <AuthPage />
        )
      )}

      <ToastContainer />
      <XPFloatLayer />
      <LevelUpOverlay />

    </>
  )
}
