/**
 * App.jsx
 * -------
 * Adds to previous version:
 *  - Initialises usePartnerStore.init(userId) on login
 *  - Initialises useNotificationStore.init(userId) on login
 *  - Calls teardown() on both stores on logout
 *  - Everything else identical
 */

import { useEffect, useState, useRef } from 'react'
import { useUIStore, useTaskStore, useUserStore } from '@/store'
import { _registerUIStore } from '@/store/notificationStore'
import { useAuthStore }          from '@/store/authStore'
import { usePartnerStore }       from '@/store/partnerStore'
import { useNotificationStore }  from '@/store/notificationStore'
import { useTheme }              from '@/hooks'

import { AppShell }       from '@/components/layout/AppShell'
import { AuthPage }       from '@/pages/AuthPage'
import { Preloader }      from '@/components/ui/Preloader'
import { ToastContainer } from '@/components/ui/Toast'
import { XPFloatLayer, LevelUpOverlay } from '@/components/ui/XPEffects'

import { DashboardPage }   from '@/pages/Dashboard'
import { TasksPage }       from '@/pages/Tasks'
import { AnalyticsPage }   from '@/pages/Analytics'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { PartnerPage }     from '@/pages/Partner'
import { SettingsPage }    from '@/pages/Settings'

import { fetchTasks }              from '@/services/taskService'
import { fetchProfile, upsertProfile } from '@/services/profileService'

// Register UIStore getter so notificationStore can show toasts without circular imports
_registerUIStore(() => useUIStore.getState())

const PAGE_MAP = {
  dashboard:   DashboardPage,
  tasks:       TasksPage,
  analytics:   AnalyticsPage,
  leaderboard: LeaderboardPage,
  partner:     PartnerPage,
  settings:    SettingsPage,
}

export default function App() {
  const [appReady, setAppReady] = useState(false)

  const { activeView }                             = useUIStore()
  const { setTheme }                               = useTheme()
  const { user, loading: authLoading, init: initAuth } = useAuthStore()
  const { syncFromSupabase }                       = useTaskStore()
  const { loadProfile }                            = useUserStore()
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

  // 3. Load all user data when authenticated
  useEffect(() => {
    if (!user || dataLoadedFor.current === user.id) return
    dataLoadedFor.current = user.id

    async function loadUserData() {
      try {
        // Tasks
        const tasks = await fetchTasks()
        syncFromSupabase(tasks)

        // Profile
        let profile = await fetchProfile(user.id)
        if (!profile) profile = await upsertProfile(user.id, { name: user.name })
        loadProfile(profile)
      } catch (err) {
        console.error('[Taskr] Failed to load user data:', err)
      }

      // Partner feed + Realtime subscription
      initPartner(user.id)

      // Notifications + Realtime subscription
      initNotifs(user.id)
    }

    loadUserData()
  }, [user])

  // 4. Cleanup on logout
  useEffect(() => {
    if (!user) {
      dataLoadedFor.current = null
      syncFromSupabase([])
      teardownPartner()
      teardownNotifs()
    }
  }, [user])

  const ActivePage     = PAGE_MAP[activeView] || DashboardPage
  const showPreloader  = !appReady || authLoading

  return (
    <>
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


/**
 * App.jsx
 * -------
 * After login/signup, shows CountdownPage until LAUNCH_DATE (June 7, 2026).
 * Once the countdown hits zero, the main app is revealed and the preference
 * is persisted to localStorage so refreshing doesn't reset the user back to
 * the countdown screen after launch day.
 */

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

// import { CountdownPage, LAUNCH_DATE } from '@/pages/Countdown'

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

// /**
//  * Returns true if the app should still show the countdown.
//  * Once LAUNCH_DATE has passed, or the user has already seen the launch
//  * transition (stored in localStorage), skip the countdown.
//  */
// function shouldShowCountdown() {
//   if (Date.now() >= LAUNCH_DATE.getTime()) return false
//   if (localStorage.getItem('taskr_launched') === 'true') return false
//   return true
// }

// export default function App() {
//   const [appReady, setAppReady]         = useState(false)
//   const [showCountdown, setShowCountdown] = useState(false) // resolved after user is known

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

//   // 3. Decide whether to show the countdown whenever auth resolves
//   useEffect(() => {
//     if (user) {
//       setShowCountdown(shouldShowCountdown())
//     } else {
//       // Logged out — reset so next login re-evaluates
//       setShowCountdown(false)
//     }
//   }, [user])

//   // 4. Load all user data when authenticated
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

//   // 5. Cleanup on logout
//   useEffect(() => {
//     if (!user) {
//       dataLoadedFor.current = null
//       syncFromSupabase([])
//       teardownPartner()
//       teardownNotifs()
//     }
//   }, [user])

//   // Called by CountdownPage when the timer hits zero
//   function handleLaunch() {
//     localStorage.setItem('taskr_launched', 'true')
//     setShowCountdown(false)
//   }

//   const ActivePage    = PAGE_MAP[activeView] || DashboardPage
//   const showPreloader = !appReady || authLoading

//   return (
//     <>
//       <Preloader visible={showPreloader} />

//       {appReady && !authLoading && (
//         user ? (
//           showCountdown ? (
//             <CountdownPage
//               onLaunch={handleLaunch}
//               userName={user.name || user.email}
//             />
//           ) : (
//             <AppShell>
//               <ActivePage />
//             </AppShell>
//           )
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