// // import { create } from 'zustand'
// // import {
// //   fetchNotifications,
// //   markRead,
// //   markAllRead,
// //   subscribeToNotifications,
// // } from '@/services/notificationService'

// // // Lazy getter — avoids circular dep at module init time while still
// // // allowing us to call showToast from within the store.
// // // useUIStore is only accessed at runtime (inside a callback), never at import time.
// // let _getUIStore = null
// // export function _registerUIStore(getter) { _getUIStore = getter }

// // /**
// //  * useNotificationStore
// //  * --------------------
// //  * Call init(userId) once authenticated — fetches history + starts Realtime.
// //  * Call teardown() on logout.
// //  *
// //  * The onNew callback shows a toast via UIStore. We import useUIStore here
// //  * at module level (safe in Zustand — no circular dep issue since stores
// //  * are singletons initialised before any component renders).
// //  */
// // export const useNotificationStore = create((set, get) => ({
// //   notifications: [],
// //   unreadCount:   0,
// //   loading:       false,
// //   _unsubscribe:  null,

// //   init: async (userId) => {
// //     set({ loading: true })

// //     try {
// //       const notifications = await fetchNotifications(userId)
// //       set({
// //         notifications,
// //         unreadCount: notifications.filter(n => !n.read).length,
// //         loading:     false,
// //       })
// //     } catch (err) {
// //       console.error('[Taskr] Notification fetch error:', err)
// //       set({ loading: false })
// //     }

// //     // Realtime: new notifications arrive here instantly
// //     const unsubscribe = subscribeToNotifications(userId, (newNotif) => {
// //       set(s => ({
// //         notifications: [newNotif, ...s.notifications].slice(0, 40),
// //         unreadCount:   s.unreadCount + (newNotif.read ? 0 : 1),
// //       }))

// //       // Show a toast via UIStore (registered at boot time in App.jsx)
// //       if (_getUIStore) {
// //         const type = ['streak_milestone', 'level_up', 'partner_joined'].includes(newNotif.type)
// //           ? 'milestone'
// //           : 'info'
// //         _getUIStore().showToast(newNotif.title, type, 4500)
// //       }
// //     })

// //     set({ _unsubscribe: unsubscribe })
// //   },

// //   teardown: () => {
// //     const { _unsubscribe } = get()
// //     if (_unsubscribe) _unsubscribe()
// //     set({ notifications: [], unreadCount: 0, _unsubscribe: null })
// //   },

// //   markRead: async (id) => {
// //     set(s => ({
// //       notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
// //       unreadCount:   Math.max(0, s.unreadCount - 1),
// //     }))
// //     await markRead(id)
// //   },

// //   markAllRead: async (userId) => {
// //     set(s => ({
// //       notifications: s.notifications.map(n => ({ ...n, read: true })),
// //       unreadCount:   0,
// //     }))
// //     await markAllRead(userId)
// //   },
// // }))


// // src/stores/notificationStore.js
// import { create } from 'zustand';

// /**
//  * In-app notification store.
//  * Separate from push notifications — this drives the bell icon badge
//  * and the in-app notification center panel.
//  *
//  * Populated by:
//  *  - Supabase Realtime events (activity_feed, notifications tables)
//  *  - Local alarm triggers (withtaskr:task-missed custom events)
//  */
// export const useNotificationStore = create((set, get) => ({
//   notifications: [],
//   unreadCount:   0,
//   panelOpen:     false,

//   // ─── Add a notification ─────────────────────────────────────────────────
//   addNotification: (notif) =>
//     set((s) => ({
//       notifications: [
//         {
//           id:        Date.now(),
//           read:      false,
//           createdAt: new Date().toISOString(),
//           ...notif,
//           // notif shape: { type, title, body, url, icon?, color?, action? }
//         },
//         ...s.notifications,
//       ].slice(0, 50), // cap at 50
//       unreadCount: s.unreadCount + 1,
//     })),

//   // ─── Mark all read ──────────────────────────────────────────────────────
//   markAllRead: () =>
//     set((s) => ({
//       notifications: s.notifications.map((n) => ({ ...n, read: true })),
//       unreadCount:   0,
//     })),

//   // ─── Mark single read ───────────────────────────────────────────────────
//   markRead: (id) =>
//     set((s) => ({
//       notifications: s.notifications.map((n) =>
//         n.id === id ? { ...n, read: true } : n
//       ),
//       unreadCount: Math.max(0, s.unreadCount - 1),
//     })),

//   // ─── Dismiss ────────────────────────────────────────────────────────────
//   dismiss: (id) =>
//     set((s) => {
//       const notif = s.notifications.find((n) => n.id === id);
//       return {
//         notifications: s.notifications.filter((n) => n.id !== id),
//         unreadCount:   notif && !notif.read
//           ? Math.max(0, s.unreadCount - 1)
//           : s.unreadCount,
//       };
//     }),

//   dismissAll: () => set({ notifications: [], unreadCount: 0 }),

//   // ─── Panel ──────────────────────────────────────────────────────────────
//   openPanel:  () => set({ panelOpen: true  }),
//   closePanel: () => set({ panelOpen: false }),
//   togglePanel: () =>
//     set((s) => {
//       if (!s.panelOpen) {
//         // Auto-mark all read when opening
//         return {
//           panelOpen:     true,
//           notifications: s.notifications.map((n) => ({ ...n, read: true })),
//           unreadCount:   0,
//         };
//       }
//       return { panelOpen: false };
//     }),
// }));

// // ─── Notification type helpers ────────────────────────────────────────────────
// export const NotifType = {
//   PARTNER_COMPLETED: 'partner_completed',
//   PARTNER_NUDGE:     'partner_nudge',
//   PARTNER_JOINED:    'partner_joined',
//   ALARM_PRE:         'alarm_pre',
//   ALARM_START:       'alarm_start',
//   TASK_MISSED:       'task_missed',
//   STREAK_MILESTONE:  'streak_milestone',
//   LEVEL_UP:          'level_up',
//   SHARED_STREAK:     'shared_streak',
// };

// export const notifMeta = {
//   [NotifType.PARTNER_COMPLETED]: { color: '#22c55e', icon: 'CheckCircle2' },
//   [NotifType.PARTNER_NUDGE]:     { color: '#3b82f6', icon: 'Send'         },
//   [NotifType.PARTNER_JOINED]:    { color: '#3b82f6', icon: 'HeartHandshake'},
//   [NotifType.ALARM_PRE]:         { color: '#f59e0b', icon: 'AlarmClock'   },
//   [NotifType.ALARM_START]:       { color: '#22c55e', icon: 'BellRing'     },
//   [NotifType.TASK_MISSED]:       { color: '#ef4444', icon: 'AlertCircle'  },
//   [NotifType.STREAK_MILESTONE]:  { color: '#f59e0b', icon: 'Flame'        },
//   [NotifType.LEVEL_UP]:          { color: '#8b5cf6', icon: 'Zap'          },
//   [NotifType.SHARED_STREAK]:     { color: '#f59e0b', icon: 'Flame'        },
// };

import { create } from 'zustand'
import {
  fetchNotifications,
  markRead       as markReadService,
  markAllRead    as markAllReadService,
  subscribeToNotifications,
} from '@/services/notificationService'

// ─── UIStore bridge ───────────────────────────────────────────────────────────
// Avoids a circular import — App.jsx registers the getter at boot time,
// and the store uses it at runtime inside callbacks only.
let _getUIStore = null
export function _registerUIStore(getter) { _getUIStore = getter }

// ─── Notification type constants ──────────────────────────────────────────────
export const NotifType = {
  PARTNER_COMPLETED: 'partner_completed',
  PARTNER_NUDGE:     'partner_nudge',
  PARTNER_JOINED:    'partner_joined',
  ALARM_PRE:         'alarm_pre',
  ALARM_START:       'alarm_start',
  TASK_MISSED:       'task_missed',
  STREAK_MILESTONE:  'streak_milestone',
  LEVEL_UP:          'level_up',
  SHARED_STREAK:     'shared_streak',
}

export const notifMeta = {
  [NotifType.PARTNER_COMPLETED]: { color: '#22c55e', icon: 'CheckCircle2'   },
  [NotifType.PARTNER_NUDGE]:     { color: '#3b82f6', icon: 'Send'            },
  [NotifType.PARTNER_JOINED]:    { color: '#3b82f6', icon: 'HeartHandshake'  },
  [NotifType.ALARM_PRE]:         { color: '#f59e0b', icon: 'AlarmClock'      },
  [NotifType.ALARM_START]:       { color: '#22c55e', icon: 'BellRing'        },
  [NotifType.TASK_MISSED]:       { color: '#ef4444', icon: 'AlertCircle'     },
  [NotifType.STREAK_MILESTONE]:  { color: '#f59e0b', icon: 'Flame'           },
  [NotifType.LEVEL_UP]:          { color: '#8b5cf6', icon: 'Zap'             },
  [NotifType.SHARED_STREAK]:     { color: '#f59e0b', icon: 'Flame'           },
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  panelOpen:     false,
  loading:       false,
  _unsubscribe:  null,

  // ── Init: fetch history + start Realtime ────────────────────────────────
  init: async (userId) => {
    set({ loading: true })

    try {
      const notifications = await fetchNotifications(userId)
      set({
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        loading:     false,
      })
    } catch (err) {
      console.error('[Taskr] Notification fetch error:', err)
      set({ loading: false })
    }

    const unsubscribe = subscribeToNotifications(userId, (newNotif) => {
      set(s => ({
        notifications: [newNotif, ...s.notifications].slice(0, 50),
        unreadCount:   s.unreadCount + (newNotif.read ? 0 : 1),
      }))

      // Show a toast via UIStore if registered
      if (_getUIStore) {
        const type = [
          NotifType.STREAK_MILESTONE,
          NotifType.LEVEL_UP,
          NotifType.PARTNER_JOINED,
        ].includes(newNotif.type) ? 'milestone' : 'info'

        _getUIStore().showToast(newNotif.title, type, 4500)
      }
    })

    set({ _unsubscribe: unsubscribe })
  },

  // ── Teardown: called on logout ───────────────────────────────────────────
  teardown: () => {
    const { _unsubscribe } = get()
    if (_unsubscribe) _unsubscribe()
    set({ notifications: [], unreadCount: 0, panelOpen: false, _unsubscribe: null })
  },

  // ── Add a local notification (alarms, missed tasks, etc.) ───────────────
  addNotification: (notif) =>
    set(s => ({
      notifications: [
        {
          id:        Date.now(),
          read:      false,
          createdAt: new Date().toISOString(),
          ...notif,
        },
        ...s.notifications,
      ].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),

  // ── Mark single read ─────────────────────────────────────────────────────
  markRead: async (id) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount:   Math.max(0, s.unreadCount - 1),
    }))
    await markReadService(id)
  },

  // ── Mark all read ────────────────────────────────────────────────────────
  markAllRead: async (userId) => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount:   0,
    }))
    await markAllReadService(userId)
  },

  // ── Dismiss single ───────────────────────────────────────────────────────
  dismiss: (id) =>
    set(s => {
      const notif = s.notifications.find(n => n.id === id)
      return {
        notifications: s.notifications.filter(n => n.id !== id),
        unreadCount:   notif && !notif.read
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }
    }),

  dismissAll: () => set({ notifications: [], unreadCount: 0 }),

  // ── Panel ────────────────────────────────────────────────────────────────
  openPanel:  () => set({ panelOpen: true  }),
  closePanel: () => set({ panelOpen: false }),
  togglePanel: () =>
    set(s => {
      if (!s.panelOpen) {
        return {
          panelOpen:     true,
          notifications: s.notifications.map(n => ({ ...n, read: true })),
          unreadCount:   0,
        }
      }
      return { panelOpen: false }
    }),
}))