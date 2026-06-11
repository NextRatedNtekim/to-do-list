import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client ────────────────────────────────────────────────────────────
// Replace with your env vars (or import from your existing supabase.js client)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── 5 demo / seed users shown when real user count is low ──────────────────────
const DEMO_USERS = [
  { id: 'demo-1', name: 'Precious Ntekim', avatar: null, xp: 750, streak: 23, weekly_xp: 300, isDemo: true },
  { id: 'demo-2', name: 'Prince Richard',  avatar: null, xp: 735, streak: 15, weekly_xp: 290, isDemo: true },
  { id: 'demo-3', name: 'Munachi Eze',     avatar: null, xp: 720, streak: 31, weekly_xp: 285, isDemo: true },
  { id: 'demo-4', name: 'Odudu Etim',      avatar: null, xp: 715, streak: 8,  weekly_xp: 280, isDemo: true },
  { id: 'demo-5', name: 'Joe Igwe',        avatar: null, xp: 685, streak: 5,  weekly_xp: 250, isDemo: true },
]

// ── Store ──────────────────────────────────────────────────────────────────────
export const useLeaderboardStore = create((set, get) => ({
  /** Ranked entries shown in the UI (real users + demo fill) */
  entries: [],
  /** The currently logged-in user's row (null if not signed in / not found) */
  currentUserEntry: null,
  loading: false,
  error: null,

  /**
   * Fetch the leaderboard view from Supabase, merge with demo users when
   * real user count < 5, sort by XP, assign rank positions, then separate
   * the current user's row for special highlighting.
   *
   * Call this on page mount:  useEffect(() => { fetchLeaderboard() }, [])
   */
  fetchLeaderboard: async () => {
    set({ loading: true, error: null })

    try {
      // 1. Get the current session so we know which row is "me"
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id ?? null

      // 2. Fetch the leaderboard view (already ordered by xp DESC, LIMIT 100)
      const { data: realUsers, error } = await supabase
        .from('leaderboard')
        .select('id, name, xp, weekly_xp, streak')

      if (error) throw error

      // 3. Merge: real users take priority; pad with demo users if fewer than 5 real ones
      const realIds = new Set(realUsers.map(u => u.id))
      const demoPadding = DEMO_USERS.filter((_, i) => i >= realUsers.length)

      const merged = [
        ...realUsers.map(u => ({ ...u, isDemo: false })),
        ...demoPadding,
      ]

      // 4. Sort by XP descending and assign sequential rank
      const sorted = merged
        .sort((a, b) => b.xp - a.xp)
        .map((entry, i) => ({ ...entry, rank: i + 1 }))

      // 5. Find current user's full entry (rank preserved even if outside top 10)
      const currentUserEntry = currentUserId
        ? sorted.find(e => e.id === currentUserId) ?? null
        : null

      // 6. Only show top 10 in the main list
      const top10 = sorted.slice(0, 10)

      set({ entries: top10, currentUserEntry, loading: false })
    } catch (err) {
      console.error('[LeaderboardStore] fetch error:', err)
      set({ error: err.message ?? 'Failed to load leaderboard', loading: false })
    }
  },
}))