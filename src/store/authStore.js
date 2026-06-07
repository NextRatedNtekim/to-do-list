import { create } from 'zustand'
import {
  signUpEmail,
  signInEmail,
  signInGoogle,
  signOut,
  onAuthChange,
  sessionToUser,
} from '@/services/authService'

/**
 * useAuthStore
 * ------------
 * Single source of truth for authentication state.
 *
 * user:    { id, email, name, avatar, provider } | null
 * loading: true while the initial session check is in progress
 * error:   string | null — last auth error message
 *
 * Call init() once at app startup (in App.jsx useEffect).
 * It subscribes to Supabase's auth state listener and cleans up on unmount.
 */
export const useAuthStore = create((set, get) => ({
  user:    null,
  loading: true,   // starts true until we hear from Supabase
  error:   null,

  /**
   * Start the auth listener.
   * Supabase fires immediately with the current session (or null),
   * then on every subsequent sign-in / sign-out / token refresh.
   * Returns a cleanup fn for useEffect.
   */
  init: () => {
    const unsubscribe = onAuthChange((session) => {
      set({
        user:    sessionToUser(session),
        loading: false,
        error:   null,
      })
    })
    return unsubscribe
  },
  

  /** Register with email + password. */
  register: async (email, password, name) => {
    set({ error: null, loading: true })
    try {
      await signUpEmail(email, password, name)
      // Supabase sends a confirmation email by default.
      // The onAuthChange listener will update user when they confirm.
      // If email confirmation is disabled in your Supabase project, the
      // listener fires immediately and user is set automatically.
    } catch (err) {
      set({ error: friendlyError(err.message), loading: false })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  /** Login with email + password. */
  login: async (email, password) => {
    set({ error: null, loading: true })
    try {
      await signInEmail(email, password)
      // onAuthChange listener sets user automatically
    } catch (err) {
      set({ error: friendlyError(err.message), loading: false })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  /** OAuth: opens Google popup / redirect. */
  loginGoogle: async () => {
    set({ error: null, loading: true })
    try {
      await signInGoogle()
      // Page redirects to Google; session handled by onAuthChange after return
    } catch (err) {
      set({ error: friendlyError(err.message), loading: false })
      throw err
    }
  },

  /** Sign out and clear all local state. */
  logout: async () => {
    set({ error: null })
    try {
      await signOut()
      // onAuthChange listener sets user → null automatically
    } catch (err) {
      set({ error: friendlyError(err.message) })
    }
  },

  clearError: () => set({ error: null }),
}))

// ── Helpers ───────────────────────────────────────────────────────

/** Turn Supabase error messages into readable strings. */
function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('Invalid login credentials'))
    return 'Incorrect email or password.'
  if (msg.includes('Email not confirmed'))
    return 'Please confirm your email before signing in.'
  if (msg.includes('User already registered'))
    return 'An account with this email already exists.'
  if (msg.includes('Password should be at least'))
    return 'Password must be at least 6 characters.'
  if (msg.includes('Unable to validate email'))
    return 'Please enter a valid email address.'
  return msg
}
