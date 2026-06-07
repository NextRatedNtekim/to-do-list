/**
 * useGreeting.js
 * Returns a time-appropriate greeting string.
 * Updates once per minute.
 *
 * Returns: { greeting, period }
 *   greeting - "Good Morning" | "Good Afternoon" | "Good Evening"
 *   period   - "morning" | "afternoon" | "evening"
 */

import { useState, useEffect } from 'react'

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return { greeting: 'Good Morning',   period: 'morning' }
  if (hour >= 12 && hour < 17) return { greeting: 'Good Afternoon', period: 'afternoon' }
  if (hour >= 17 && hour < 21) return { greeting: 'Good Evening',   period: 'evening' }
  return { greeting: 'Good Night', period: 'night' }
}

export function useGreeting() {
  const [state, setState] = useState(() => getGreeting(new Date().getHours()))

  useEffect(() => {
    // Update at the top of each minute
    function update() {
      setState(getGreeting(new Date().getHours()))
    }

    const now     = new Date()
    const msToNext = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const firstTimeout = setTimeout(() => {
      update()
      const interval = setInterval(update, 60_000)
      return () => clearInterval(interval)
    }, msToNext)

    return () => clearTimeout(firstTimeout)
  }, [])

  return state
}