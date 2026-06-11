/**
 * hooks/useAlarm.js
 * React hook that wraps alarmEngine for use inside components.
 *
 * Usage:
 *   const { schedule, cancel, permissionStatus, requestPerm } = useAlarm()
 *   schedule({ id, title, type, dueDateTime })
 */

import { useState, useEffect, useCallback } from 'react'
import {
  scheduleAlarm,
  cancelAlarm,
  requestPermission,
  getPermissionStatus,
  hasPendingAlarm,
  buildDueDateTime,
} from '@/services/alarmEngine'

export function useAlarm() {
  const [permissionStatus, setPermissionStatus] = useState(getPermissionStatus)

  // Listen for in-tab alarm fires
  useEffect(() => {
    function handleAlarm(e) {
      // You can hook into this to show an in-app toast/banner
      console.log('[useAlarm] Alarm fired:', e.detail)
    }
    window.addEventListener('taskr:alarm', handleAlarm)
    return () => window.removeEventListener('taskr:alarm', handleAlarm)
  }, [])

  const requestPerm = useCallback(async () => {
    const result = await requestPermission()
    setPermissionStatus(result)
    return result
  }, [])

  const schedule = useCallback(async (alarmData) => {
    // Auto-request permission if not yet granted
    if (getPermissionStatus() === 'default') {
      await requestPermission()
      setPermissionStatus(getPermissionStatus())
    }
    scheduleAlarm(alarmData)
  }, [])

  const cancel = useCallback((id) => {
    cancelAlarm(id)
  }, [])

  const isPending = useCallback((id) => {
    return hasPendingAlarm(id)
  }, [])

  const buildDateTime = useCallback((dateStr, timeStr) => {
    return buildDueDateTime(dateStr, timeStr)
  }, [])

  return {
    permissionStatus,
    requestPerm,
    schedule,
    cancel,
    isPending,
    buildDateTime,
  }
}