/**
 * components/ui/AlarmBanner.jsx
 * In-app alarm banner shown when a task/routine time is reached.
 * Works even if the user denied browser notifications.
 *
 * Place <AlarmBanner /> once inside AppShell (after <ActivePage />).
 * It listens for 'taskr:alarm' DOM events from alarmEngine.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function AlarmBanner() {
  const [alarms, setAlarms] = useState([])

  useEffect(() => {
    function handleAlarm(e) {
      const alarm = e.detail
      const id = alarm.id + '_' + Date.now()
      setAlarms(prev => [...prev, { ...alarm, _bannerId: id }])

      // Auto-dismiss after 10s
      setTimeout(() => {
        setAlarms(prev => prev.filter(a => a._bannerId !== id))
      }, 10000)
    }

    window.addEventListener('taskr:alarm', handleAlarm)
    return () => window.removeEventListener('taskr:alarm', handleAlarm)
  }, [])

  function dismiss(bannerId) {
    setAlarms(prev => prev.filter(a => a._bannerId !== bannerId))
  }

  return (
    <div className="fixed top-4 left-0 right-0 z-[9998] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {alarms.map(alarm => (
          <motion.div
            key={alarm._bannerId}
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1   }}
            exit={{   opacity: 0, y: -40,  scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-sm pointer-events-auto"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid rgba(34,197,94,0.3)',
                boxShadow:    '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.15)',
              }}
            >
              {/* Animated bell */}
              <motion.div
                className="text-2xl flex-shrink-0"
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {alarm.icon ?? (alarm.type === 'routine' ? '🔄' : '⏰')}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {alarm.type === 'routine' ? 'Routine time!' : "Task due now!"}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {alarm.title}
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(alarm._bannerId)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-tertiary)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}