// import { useEffect, useState, useRef } from 'react'

// import { BrowserRouter, Routes, Route, Navigate,
//          useParams, useNavigate }                        from 'react-router-dom';
// // import AppShell                                          from '@/components/AppShell';
// import OnboardingFlow                                    from '@/pages/OnboardingFlow';
// import AlarmsScreen                                      from '@/pages/AlarmsScreen';
// import FocusMode                                         from '@/pages/FocusMode';
// // import AccountabilityPage                                from '@/pages/AccountabilityPage';
// import { registerSW }                                    from '@/lib/push';
// import { initAlarmListener }                             from '@/stores/alarmStore';
// import { supabase, checkOnboardingComplete }             from '@/lib/supabase';

// import { useUIStore, useTaskStore, useUserStore } from '@/store'
// import { _registerUIStore }              from '@/store/notificationStore'
// import { useAuthStore }                  from '@/store/authStore'
// import { usePartnerStore }               from '@/store/partnerStore'
// import { useNotificationStore }          from '@/store/notificationStore'
// import { useTheme }                      from '@/hooks'

// import { AppShell }                      from '@/components/layout/AppShell'
// import { AuthPage }                      from '@/pages/AuthPage'
// import { Preloader }                     from '@/components/ui/Preloader'
// import { ToastContainer }                from '@/components/ui/Toast'
// import { XPFloatLayer, LevelUpOverlay }  from '@/components/ui/XPEffects'

// import { DashboardPage }                 from '@/pages/Dashboard'
// import { TasksPage }                     from '@/pages/Tasks'
// import { AnalyticsPage }                 from '@/pages/Analytics'
// import { LeaderboardPage }               from '@/pages/LeaderboardPage'
// import { PartnerPage }                   from '@/pages/Partner'
// import { SettingsPage }                  from '@/pages/Settings'

// import { LandingPage }                   from '@/pages/Landingpage'
// import { PrivacyPage }                   from '@/pages/PrivacyPage'
// import { CountdownPage, LAUNCH_DATE }    from '@/pages/Countdown'

// import { fetchTasks }                    from '@/services/taskService'
// import { fetchProfile, upsertProfile }   from '@/services/profileService'

// _registerUIStore(() => useUIStore.getState())

// const PAGE_MAP = {
//   dashboard:   DashboardPage,
//   tasks:       TasksPage,
//   analytics:   AnalyticsPage,
//   leaderboard: LeaderboardPage,
//   partner:     PartnerPage,
//   settings:    SettingsPage,
// }

// function shouldShowCountdown() {
//   if (Date.now() >= LAUNCH_DATE.getTime()) return false
//   if (localStorage.getItem('taskr_launched') === 'true') return false
//   return true
// }

// // Read the current URL path once on load to decide the initial public view
// function getInitialPublicView() {
//   const path = window.location.pathname
//   if (path === '/privacy') return 'privacy'
//   if (path === '/')        return 'landing'
//   return null  // not a public route — go to app flow
// }

// // export default function App() {
// //   const [appReady, setAppReady]         = useState(false)
// //   const [showCountdown, setShowCountdown] = useState(false)
// //   // null = not on a public page, 'landing' = /, 'privacy' = /privacy
// //   const [publicView, setPublicView]     = useState(getInitialPublicView)

// //   const { activeView }                                   = useUIStore()
// //   const { setTheme }                                     = useTheme()
// //   const { user, loading: authLoading, init: initAuth }   = useAuthStore()
// //   const { syncFromSupabase }                             = useTaskStore()
// //   const { loadProfile }                                  = useUserStore()
// //   const { init: initPartner, teardown: teardownPartner } = usePartnerStore()
// //   const { init: initNotifs,  teardown: teardownNotifs  } = useNotificationStore()

// //   const dataLoadedFor = useRef(null)

// //   // 1. Theme + preloader
// //   useEffect(() => {
// //     const saved = localStorage.getItem('taskr_theme') || 'dark'
// //     setTheme(saved)
// //     const t = setTimeout(() => setAppReady(true), 2200)
// //     return () => clearTimeout(t)
// //   }, [])

// //   // 2. Auth listener
// //   useEffect(() => {
// //     const unsub = initAuth()
// //     return unsub
// //   }, [])

// //   // 3. Countdown gate
// //   useEffect(() => {
// //     if (user) setShowCountdown(shouldShowCountdown())
// //     else      setShowCountdown(false)
// //   }, [user])

// //   // 4. Load user data
// //   useEffect(() => {
// //     if (!user || dataLoadedFor.current === user.id) return
// //     dataLoadedFor.current = user.id

// //     async function loadUserData() {
// //       try {
// //         const tasks = await fetchTasks()
// //         syncFromSupabase(tasks)
// //         let profile = await fetchProfile(user.id)
// //         if (!profile) profile = await upsertProfile(user.id, { name: user.name })
// //         loadProfile(profile)
// //       } catch (err) {
// //         console.error('[Taskr] Failed to load user data:', err)
// //       }
// //       initPartner(user.id)
// //       initNotifs(user.id)
// //     }
// //     loadUserData()
// //   }, [user])

// //   // 5. Cleanup on logout
// //   useEffect(() => {
// //     if (!user) {
// //       dataLoadedFor.current = null
// //       syncFromSupabase([])
// //       teardownPartner()
// //       teardownNotifs()
// //     }
// //   }, [user])

// //   function handleLaunch() {
// //     localStorage.setItem('taskr_launched', 'true')
// //     setShowCountdown(false)
// //   }

// //   // ── Public page navigation helpers (passed as props to landing/privacy) ──
// //   function goToAuth()    { setPublicView(null) }
// //   function goToPrivacy() { setPublicView('privacy') }
// //   function goToLanding() { setPublicView('landing') }

// //   // ── Render public pages first — no auth needed ───────────────────────────
// //   if (publicView === 'landing') {
// //     return <LandingPage onGetStarted={goToAuth} onPrivacy={goToPrivacy} />
// //   }
// //   if (publicView === 'privacy') {
// //     return <PrivacyPage onBack={goToLanding} />
// //   }

// //   // ── App flow ─────────────────────────────────────────────────────────────
// //   const ActivePage    = PAGE_MAP[activeView] || DashboardPage
// //   const showPreloader = !appReady || authLoading

// //   return (
// //     <>
// //       <Preloader visible={showPreloader} />

// //       {appReady && !authLoading && (
// //          user ? ( 
// //            showCountdown ? ( 
// //              <CountdownPage
// //                onLaunch={handleLaunch} 
// //                userName={user.name || user.email}
// //              />
// //            ) : (
// //             <AppShell>
// //               <ActivePage />
// //             </AppShell>
// //               ) 
// //          ) : ( 
          
// //           <AuthPage onGoHome={goToLanding} /> 
// //          )
// //        )}  

// //       <ToastContainer />
// //       <XPFloatLayer />
// //       <LevelUpOverlay />
// //     </>
// //   )
// // }

// export default function App() {
//   const [user,       setUser]       = useState(null);
//   const [onboarded,  setOnboarded]  = useState(null);   // null = loading
//   const [authReady,  setAuthReady]  = useState(false);
 
//   // ── Auth listener ────────────────────────────────────────────────────────
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setAuthReady(true);
//     });
 
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });
 
//     return () => subscription.unsubscribe();
//   }, []);
 
//   // ── Register Service Worker + alarm listener ──────────────────────────────
//   useEffect(() => {
//     registerSW();          // Web Push registration
//     initAlarmListener();   // Missed-task event listener
//   }, []);
 
//   // ── Check onboarding status ───────────────────────────────────────────────
//   useEffect(() => {
//     if (!user) return;
//     checkOnboardingComplete(user.id).then(setOnboarded);
//   }, [user]);
 
//   // ── Loading state ─────────────────────────────────────────────────────────
//   if (!authReady || (user && onboarded === null)) {
//     return (
//       <div style={{
//         minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         background: 'linear-gradient(135deg,#030712 0%,#0a0f1a 40%,#050d0a 100%)',
//       }}>
//         <div style={{
//           width: 40, height: 40, borderRadius: 12,
//           background: 'linear-gradient(135deg,#16a34a,#22c55e)',
//           animation: 'pulse 1.5s ease infinite',
//         }} />
//       </div>
//     );
//   }
 
//   // ── Not logged in — show your existing auth screen ────────────────────────
//   if (!user) {
//     return (
//       <BrowserRouter>
//         <Routes>
//           {/* Replace YourAuthPage with your existing auth component */}
//           <Route path="*" element={<YourAuthPage />} />
//         </Routes>
//       </BrowserRouter>
//     );
//   }
 
//   // ── First-time user — show onboarding ────────────────────────────────────
//   if (onboarded === false) {
//     return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
//   }
 
//   // ── Main app ──────────────────────────────────────────────────────────────
//   return (
//     <BrowserRouter>
//       <AppShell>
//         <Routes>
//           {/* Keep your existing Dashboard route */}
//           <Route path="/"               element={<Dashboard />}         />
 
//           {/* REPLACE your existing accountability route with the new one */}
//           <Route path="/accountability" element={<AccountabilityPage />} />
 
//           {/* REPLACE or add focus route */}
//           <Route path="/focus"          element={<FocusMode />}          />
 
//           {/* NEW alarms route */}
//           <Route path="/alarms"         element={<AlarmsScreen />}       />
 
//           {/* Keep your existing profile route */}
//           <Route path="/profile"        element={<ProfilePage />}        />
 
//           {/* Invite deep link — optional */}
//           <Route path="/invite/:code"   element={<InviteDeepLink />}     />
 
//           {/* Fallback */}
//           <Route path="*"              element={<Navigate to="/" />}    />
//         </Routes>
//       </AppShell>
//     </BrowserRouter>
//   );
// }
 
// // ── Invite deep link handler (optional but nice) ──────────────────────────────
// function InviteDeepLink() {
//   const { code }   = useParams();   // from react-router-dom
//   const navigate   = useNavigate();
//   const [done, setDone] = useState(false);
 
//   useEffect(() => {
//     // Pre-fill the code in localStorage so InviteModal picks it up
//     if (code) {
//       localStorage.setItem('withtaskr_pending_invite', code);
//       navigate('/accountability');
//     }
//   }, [code]);
 
//   return null;
// }


import { useEffect, useState, useRef } from 'react'
import { registerSW } from '@/lib/push'
import { initAlarmListener } from '@/store/alarmStore'
import { useUIStore, useTaskStore, useUserStore }from '@/store'
import { useAuthStore } from '@/store/authStore'
import { usePartnerStore } from '@/store/partnerStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useTheme } from '@/hooks'
import {AppShell }                                       from '@/components/layout/AppShell'
import { AuthPage }                                    from '@/pages/AuthPage'
import { Preloader }                                   from '@/components/ui/Preloader'
import { ToastContainer }                              from '@/components/ui/Toast'
import { XPFloatLayer, LevelUpOverlay }                from '@/components/ui/XPEffects'
import { DashboardPage }                               from '@/pages/Dashboard'
import { TasksPage }                                   from '@/pages/Tasks'
import { AnalyticsPage }                               from '@/pages/Analytics'
import { LeaderboardPage }                             from '@/pages/LeaderboardPage'
import  PartnerPage                                  from '@/pages/Partner'
import { SettingsPage }                                from '@/pages/Settings'
import { LandingPage }                                 from '@/pages/Landingpage'
import { PrivacyPage }                                 from '@/pages/PrivacyPage'
import { CountdownPage, LAUNCH_DATE }                  from '@/pages/Countdown'
import { fetchTasks }                                  from '@/services/taskService'
import { fetchProfile, upsertProfile }                 from '@/services/profileService'
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

function getInitialPublicView() {
  const path = window.location.pathname
  if (path === '/privacy') return 'privacy'
  if (path === '/')        return 'landing'
  return null
}

export default function App() {
  const [appReady, setAppReady]           = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [publicView, setPublicView]       = useState(getInitialPublicView)

  const { activeView }                                   = useUIStore()
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

  function goToAuth()    { setPublicView(null)      }
  function goToPrivacy() { setPublicView('privacy')  }
  function goToLanding() { setPublicView('landing')  }

  // ── Public pages ──────────────────────────────────────────────────────────
  if (publicView === 'landing') {
    return <LandingPage onGetStarted={goToAuth} onPrivacy={goToPrivacy} />
  }
  if (publicView === 'privacy') {
    return <PrivacyPage onBack={goToLanding} />
  }

  // ── App shell ─────────────────────────────────────────────────────────────
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
          ) 
          : (
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
      <LevelUpOverlay />
    </>
  )
}
