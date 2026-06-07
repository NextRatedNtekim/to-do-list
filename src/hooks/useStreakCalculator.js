/**
 * useStreakCalculator.js
 * Computes streak statistics from an array of completion date strings.
 *
 * Input:  completedDates - string[] of ISO date strings ("2026-06-01", etc.)
 *         or Date objects
 *
 * Returns:
 *   currentStreak    - number of consecutive days ending today (or yesterday)
 *   bestStreak       - longest ever consecutive streak
 *   completionRate   - % of last 30 days completed (0-100)
 *   missedDays       - number of missed days in last 30
 *   lastCompletedDate - most recent date
 *   streakActive     - true if today has a completion
 */

import { useMemo } from 'react'
import {
  differenceInCalendarDays,
  startOfDay,
  subDays,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns'

export function useStreakCalculator(completedDates = []) {
  return useMemo(() => {
    if (!completedDates.length) {
      return {
        currentStreak:    0,
        bestStreak:       0,
        completionRate:   0,
        missedDays:       30,
        lastCompletedDate: null,
        streakActive:     false,
      }
    }

    // Normalise to midnight timestamps, deduplicate
    const days = [...new Set(
      completedDates
        .map(d => startOfDay(typeof d === 'string' ? parseISO(d) : d).getTime())
    )].sort((a, b) => b - a) // descending

    const today     = startOfDay(new Date()).getTime()
    const yesterday = startOfDay(subDays(new Date(), 1)).getTime()

    // Check if streak is still active (completed today or yesterday)
    const streakActive     = days[0] === today
    const streakStartsFrom = (days[0] === today || days[0] === yesterday)
      ? days[0]
      : null

    // Current streak
    let currentStreak = 0
    if (streakStartsFrom) {
      let cursor = streakStartsFrom
      for (const day of days) {
        if (day === cursor) {
          currentStreak++
          cursor = cursor - 86_400_000 // go back 1 day
        } else {
          break
        }
      }
    }

    // Best streak (scan all days)
    let bestStreak   = 0
    let runningBest  = 0
    let prevDay      = null

    for (const day of [...days].sort((a, b) => a - b)) {
      if (prevDay === null || differenceInCalendarDays(day, prevDay) === 1) {
        runningBest++
        bestStreak = Math.max(bestStreak, runningBest)
      } else if (differenceInCalendarDays(day, prevDay) > 1) {
        runningBest = 1
      }
      prevDay = day
    }

    // Completion rate over last 30 days
    const last30Set = new Set(days.filter(d => d >= today - 30 * 86_400_000))
    const completionRate = Math.round((last30Set.size / 30) * 100)
    const missedDays     = 30 - last30Set.size

    return {
      currentStreak,
      bestStreak,
      completionRate,
      missedDays,
      lastCompletedDate: days[0] ? new Date(days[0]) : null,
      streakActive,
    }
  }, [completedDates])
}