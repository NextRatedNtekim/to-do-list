import { supabase } from '@/lib/supabase'

/**
 * authService
 * -----------
 * Thin wrapper around Supabase Auth.
 * All components/stores import from here — never call supabase.auth directly.
 */

/** Sign up with email + password. Creates a Supabase user. */
export async function signUpEmail(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }, // stored in auth.users.raw_user_meta_data
    },
  })
  if (error) throw error
  return data
}

/** Sign in with email + password. */
export async function signInEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Google OAuth sign-in.
 * Redirects to Google, then back to window.location.origin.
 * The SDK picks up the session automatically via detectSessionInUrl.
 */
export async function signInGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return { data, error };
}
/** Sign out the current user. Clears the session from localStorage. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Get the currently active session (null if not signed in). */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc).
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 */
export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  )
  return () => subscription.unsubscribe()
}

/** Extract a clean user profile object from a Supabase session. */
export function sessionToUser(session) {
  if (!session?.user) return null
  const u = session.user
  return {
    id:          u.id,
    email:       u.email,
    name:        u.user_metadata?.display_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Taskr User',
    avatar:      u.user_metadata?.avatar_url || null,
    provider:    u.app_metadata?.provider || 'email',
  }
}
