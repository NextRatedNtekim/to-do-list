/**
 * store/partnerStore.js
 * ---------------------
 * Replaces the old localStorage-persisted usePartnerStore in store/index.js.
 * Now backed by Supabase with Realtime subscription on activity_feed.
 *
 * Shape is kept 100% identical to what Partner.jsx expects:
 *   { partner, activityFeed, setPartner, removePartner, addFeedItem }
 *
 * New additions (additive only):
 *   inviteCode, inviteLoading, inviteError
 *   init(userId), teardown()
 */

import { create } from 'zustand'
import {
  fetchPartner,
  fetchActivityFeed,
  removePartner    as dbRemovePartner,
  subscribeToActivityFeed,
  sendNudge        as dbSendNudge,
  sendCheckin      as dbSendCheckin,
  createInvite,
  acceptInvite,
} from '@/services/partnerService'

export const usePartnerStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────
  partner:       null,   // { id, name, connectedAt } | null
  activityFeed:  [],     // same shape as before: [{ id, user, action, text, xp, ts }]
  inviteCode:    null,   // generated code the user shares
  inviteLoading: false,
  inviteError:   null,
  feedLoading:   false,
  _unsubscribe:  null,   // Realtime cleanup fn

  // ── Boot / teardown ──────────────────────────────────────────────

  /**
   * Called from App.jsx once the user is authenticated.
   * 1. Fetches partner + activity history
   * 2. Starts Realtime subscription for live partner events
   */
  init: async (userId) => {
    set({ feedLoading: true, inviteError: null })

    try {
      // Fetch partner connection
      const partner = await fetchPartner(userId)
      set({ partner })

      // Fetch existing feed
      const activityFeed = await fetchActivityFeed(userId)
      set({ activityFeed, feedLoading: false })
    } catch (err) {
      console.error('[Taskr] Partner init error:', err)
      set({ feedLoading: false })
    }

    // Start live subscription — new partner events arrive here in real time
    const unsubscribe = subscribeToActivityFeed(userId, (newItem) => {
      set(s => ({
        activityFeed: [newItem, ...s.activityFeed].slice(0, 50),
      }))
    })

    set({ _unsubscribe: unsubscribe })
  },

  /** Clean up on logout. */
  teardown: () => {
    const { _unsubscribe } = get()
    if (_unsubscribe) { _unsubscribe(); }
    set({ partner: null, activityFeed: [], inviteCode: null, _unsubscribe: null })
  },

  // ── Invite flow ──────────────────────────────────────────────────

  /** Generate an invite code and store it in state for display. */
  generateInvite: async (userId, userName) => {
    set({ inviteLoading: true, inviteError: null })
    try {
      const code = await createInvite(userId, userName)
      set({ inviteCode: code, inviteLoading: false })
      return code
    } catch (err) {
      set({ inviteError: err.message, inviteLoading: false })
      return null
    }
  },

  /** Accept a partner's invite code. Sets partner in state on success. */
  acceptInvite: async (code, acceptorId, acceptorName) => {
    set({ inviteLoading: true, inviteError: null })
    try {
      const { partnerId, partnerName } = await acceptInvite(code, acceptorId, acceptorName)
      set({
        partner:       { id: partnerId, name: partnerName, connectedAt: Date.now() },
        inviteCode:    null,
        inviteLoading: false,
      })
      return true
    } catch (err) {
      set({ inviteError: err.message, inviteLoading: false })
      return false
    }
  },

  clearInviteCode: () => set({ inviteCode: null }),
  clearInviteError: () => set({ inviteError: null }),

  // ── Partner actions ──────────────────────────────────────────────

  /** Remove current partner (both directions in DB). */
  removePartner: async (userId) => {
    const { partner } = get()
    if (!partner) return
    set({ partner: null })
    await dbRemovePartner(userId, partner.id).catch(console.error)
  },

  /** Send a nudge — broadcasts to partner via Supabase + creates notification. */
  sendNudge: async (userId, actorName) => {
    const { partner } = get()
    if (!partner) return
    await dbSendNudge({ userId, partnerId: partner.id, actorName }).catch(console.error)
  },

  /** Share a daily check-in with partner. */
  sendCheckin: async (userId, actorName, text) => {
    const { partner } = get()
    if (!partner) return
    // Add optimistically to local feed
    set(s => ({
      activityFeed: [
        { id: `local-${Date.now()}`, user: actorName, action: 'checkin', text, xp: 0, ts: Date.now() },
        ...s.activityFeed,
      ].slice(0, 50),
    }))
    await dbSendCheckin({ userId, partnerId: partner.id, actorName, text }).catch(console.error)
  },

  // ── Legacy-compatible actions (used by hooks/index.js) ────────────

  /** Kept for backward compatibility — hooks still call addFeedItem locally. */
  addFeedItem: (item) =>
    set(s => ({ activityFeed: [item, ...s.activityFeed].slice(0, 50) })),

  /** Direct partner set — kept for legacy calls. */
  setPartner: (p) => set({ partner: p }),
}))
