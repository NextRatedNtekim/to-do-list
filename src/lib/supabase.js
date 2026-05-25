import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Taskr] Missing Supabase env vars.\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'See .env.example for reference.'
  )
}

/**
 * Single shared Supabase client.
 * Import this everywhere you need Supabase — never call createClient() again.
 *
 * Auth session is automatically persisted to localStorage by the SDK.
 * detectSessionInUrl: true  handles the OAuth redirect automatically.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
    storage:           window.localStorage,
  },
})
