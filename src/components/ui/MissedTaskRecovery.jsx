// src/components/MissedTaskRecovery.jsx
// Bottom sheet that appears when the user has missed tasks.
// Driven by useAlarmStore().missedTasks — no props needed.
// USAGE: Mount once near the root of Dashboard.jsx or AppShell.jsx:
//   <MissedTaskRecovery />

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Moon, Calendar, X } from 'lucide-react';
import { useAlarmStore } from '@/store/alarmStore';
import { setMissedTask, clearMissedTask } from '@/lib/supabase';

const ACTIONS = [
  {
    key:   'do_now',
    icon:  Zap,
    label: 'Do it now',
    desc:  '+15 XP recovery bonus',
    style: {
      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
      border:     'none',
      color:      '#fff',
      shadow:     '0 4px 16px rgba(22,163,74,0.35)',
    },
  },
  {
    key:   'move_tonight',
    icon:  Moon,
    label: 'Move to tonight',
    desc:  'Reschedule for this evening',
    style: {
      background: 'rgba(255,255,255,0.05)',
      border:     '1px solid rgba(255,255,255,0.1)',
      color:      '#cbd5e1',
    },
  },
  {
    key:   'tomorrow',
    icon:  Calendar,
    label: 'Tomorrow',
    desc:  'Reschedule for tomorrow',
    style: {
      background: 'rgba(255,255,255,0.05)',
      border:     '1px solid rgba(255,255,255,0.1)',
      color:      '#cbd5e1',
    },
  },
];

export default function MissedTaskRecovery() {
  const missedTasks   = useAlarmStore((s) => s.missedTasks);
  const recoverMissed = useAlarmStore((s) => s.recoverMissed);

  // Show the first missed task
  const current = missedTasks[0] ?? null;

  async function handleAction(action) {
    if (!current) return;
    await setMissedTask(current.taskId, action);
    recoverMissed(current.taskId);
  }

  function handleDismiss() {
    if (!current) return;
    recoverMissed(current.taskId);
  }

  return (
    <AnimatePresence>
      {current && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-[150]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0,      opacity: 1 }}
            exit={{    y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-[160] rounded-t-3xl p-6 pb-10"
            style={{
              background:     'rgba(10,15,26,0.97)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(239,68,68,0.2)',
              borderBottom:   'none',
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <AlertCircle size={20} color="#ef4444" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-100">
                  Missed: {current.title}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  That's okay — recover it and keep your streak alive.
                </p>
              </div>
              <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-white/5">
                <X size={16} color="#64748b" />
              </button>
            </div>

            {/* Remaining missed count */}
            {missedTasks.length > 1 && (
              <div className="text-xs text-slate-500 mb-4 pl-13">
                +{missedTasks.length - 1} more missed task{missedTasks.length > 2 ? 's' : ''}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              {ACTIONS.map((action) => (
                <motion.button
                  key={action.key}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleAction(action.key)}
                  className="flex-1 py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                  style={{
                    ...action.style,
                    boxShadow: action.style.shadow,
                  }}
                >
                  <action.icon size={18} color={action.style.color} />
                  <span className="text-xs font-700" style={{ color: action.style.color, fontWeight: 700 }}>
                    {action.label}
                  </span>
                  <span className="text-[10px]" style={{ color: action.key === 'do_now' ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                    {action.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}