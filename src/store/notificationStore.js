import { create } from 'zustand'
import {
  fetchNotifications,
  markRead,
  markAllRead,
  subscribeToNotifications,
} from '@/services/notificationService'

// Lazy getter — avoids circular dep at module init time while still
// allowing us to call showToast from within the store.
// useUIStore is only accessed at runtime (inside a callback), never at import time.
let _getUIStore = null
export function _registerUIStore(getter) { _getUIStore = getter }

/**
 * useNotificationStore
 * --------------------
 * Call init(userId) once authenticated — fetches history + starts Realtime.
 * Call teardown() on logout.
 *
 * The onNew callback shows a toast via UIStore. We import useUIStore here
 * at module level (safe in Zustand — no circular dep issue since stores
 * are singletons initialised before any component renders).
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,
  _unsubscribe:  null,

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

    // Realtime: new notifications arrive here instantly
    const unsubscribe = subscribeToNotifications(userId, (newNotif) => {
      set(s => ({
        notifications: [newNotif, ...s.notifications].slice(0, 40),
        unreadCount:   s.unreadCount + (newNotif.read ? 0 : 1),
      }))

      // Show a toast via UIStore (registered at boot time in App.jsx)
      if (_getUIStore) {
        const type = ['streak_milestone', 'level_up', 'partner_joined'].includes(newNotif.type)
          ? 'milestone'
          : 'info'
        _getUIStore().showToast(newNotif.title, type, 4500)
      }
    })

    set({ _unsubscribe: unsubscribe })
  },

  teardown: () => {
    const { _unsubscribe } = get()
    if (_unsubscribe) _unsubscribe()
    set({ notifications: [], unreadCount: 0, _unsubscribe: null })
  },

  markRead: async (id) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount:   Math.max(0, s.unreadCount - 1),
    }))
    await markRead(id)
  },

  markAllRead: async (userId) => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount:   0,
    }))
    await markAllRead(userId)
  },
}))
