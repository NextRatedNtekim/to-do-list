/**
 * useProfileSync
 * --------------
 * Thin hook that wraps profile-mutating store actions with automatic
 * Supabase persistence. Import this instead of calling store actions directly
 * when you need writes to survive a page refresh.
 */
import { useCallback } from 'react'
import { useUserStore } from '@/store'
import { useAuthStore }  from '@/store/authStore'
import { patchProfile }  from '@/services/profileService'

export function useProfileSync() {
  const store  = useUserStore()
  const { user } = useAuthStore()

  /** Patch an arbitrary subset of profile fields → store + Supabase. */
  const syncPatch = useCallback((updates) => {
    if (user?.id) {
      patchProfile(user.id, updates)
        .catch(err => console.error('[Taskr] Profile sync error:', err))
    }
  }, [user])

  /** Add a streak freeze and persist. */
  const addStreakFreeze = useCallback(() => {
    store.addStreakFreeze()
    const newCount = Math.min((store.streakFreezes || 0) + 1, 3)
    syncPatch({ streakFreezes: newCount })
  }, [store, syncPatch])

  /** Update display name and persist. */
  const updateName = useCallback((name) => {
    store.updateProfile({ name })
    syncPatch({ name })
  }, [store, syncPatch])

  return { addStreakFreeze, updateName, syncPatch }
}
