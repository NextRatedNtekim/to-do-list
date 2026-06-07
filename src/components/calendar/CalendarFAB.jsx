/**
 * components/calendar/CalendarFAB.jsx
 * Floating action button + bottom sheet for "Create Task" / "Create Routine".
 * Delegates actual creation to parent via callbacks.
 *
 * Props:
 *   onCreateTask    - () => void
 *   onCreateRoutine - () => void
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CalendarFAB({ onCreateTask, onCreateRoutine }) {
  const [open, setOpen] = useState(false)

  function handleTask() {
    setOpen(false)
    onCreateTask?.()
  }

  function handleRoutine() {
    setOpen(false)
    onCreateRoutine?.()
  }

  return (
    <>
      {/* FAB button */}
      <motion.button
        className="glass-fab fixed bottom-24 right-5 w-14 h-14 flex items-center justify-center z-40"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl p-6"
              style={{
                background: 'var(--bg-elevated)',
                borderTop: '1px solid var(--glass-border)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto mb-6"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />

              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                What would you like to create?
              </h3>

              <div className="space-y-3">
                {/* Create Task */}
                <motion.button
                  onClick={handleTask}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'rgba(34,197,94,0.2)' }}
                  >
                    ✅
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Create Task
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      One-time to-do with deadline
                    </p>
                  </div>
                </motion.button>

                {/* Create Routine */}
                <motion.button
                  onClick={handleRoutine}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'rgba(96,165,250,0.18)' }}
                  >
                    🔄
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Create Routine
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Recurring habit to track
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* Safe area padding */}
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}