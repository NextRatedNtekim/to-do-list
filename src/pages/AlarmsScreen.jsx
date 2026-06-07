// src/pages/AlarmsScreen.jsx
// Full alarms management screen — new route at /alarms
// Shows: missed recovery card, alarm cascade preview, upcoming alarms list

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlarmClock, BellRing, AlertCircle, X,
  Zap, Moon, Calendar, Clock
} from 'lucide-react';
import { useAlarmStore }                               from '@/stores/alarmStore';
import { supabase, getTasksWithAlarms, setMissedTask } from '@/lib/supabase';

const PRIORITY_COLOR = { urgent: '#ef4444', high: '#f59e0b', medium: '#22c55e', low: '#3b82f6' };
const PRIORITY_BG    = { urgent: 'rgba(239,68,68,0.14)', high: 'rgba(245,158,11,0.14)', medium: 'rgba(22,163,74,0.14)', low: 'rgba(59,130,246,0.14)' };

const glass = (extra = {}) => ({
  background:     'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  border:         '1px solid rgba(255,255,255,0.08)',
  borderRadius:   18,
  ...extra,
});

export default function AlarmsScreen() {
  const [alarms,   setAlarms]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const missedTasks  = useAlarmStore((s) => s.missedTasks);
  const recoverMissed = useAlarmStore((s) => s.recoverMissed);
  const toggleAlarmEnabled = async (alarm) => {
    // Toggle by clearing or re-setting alarm_time
    const updated = !alarm.enabled;
    await supabase.from('tasks').update({ alarm_time: updated ? alarm.alarm_time : null }).eq('id', alarm.id);
    setAlarms((prev) => prev.map((a) => a.id === alarm.id ? { ...a, enabled: updated } : a));
  };

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await getTasksWithAlarms(user.id);
      setAlarms((data || []).map((t) => ({ ...t, enabled: true })));
      setLoading(false);
    }
    load();
  }, []);

  async function handleRecovery(taskId, action) {
    await setMissedTask(taskId, action);
    recoverMissed(taskId);
  }

  const cascadeSteps = [
    { label: '1 hour before',  color: '#94a3b8', done: true,  desc: 'Gentle prep reminder'            },
    { label: '30 min before',  color: '#f59e0b', done: true,  desc: 'Clear your space — starting soon' },
    { label: '10 min before',  color: '#f97316', done: false, desc: 'Almost time — wrap up'            },
    { label: 'Start alarm',    color: '#ef4444', done: false, desc: 'Open focus mode now'             },
  ];

  return (
    <div className="px-4 pt-16 pb-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>

        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1">Smart alarms</h1>
        <p className="text-sm text-slate-500 mb-5">Intelligent reminders that adapt to you</p>

        {/* ── Missed task recovery cards ── */}
        <AnimatePresence>
          {missedTasks.map((missed) => (
            <motion.div
              key={missed.taskId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0      }}
              style={{ ...glass({ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)' }), padding: '14px 16px', marginBottom: 12, overflow: 'hidden' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} color="#ef4444" />
                <span className="text-sm font-bold text-slate-100 flex-1 truncate">Missed: {missed.title}</span>
                <button onClick={() => recoverMissed(missed.taskId)} className="p-0.5">
                  <X size={14} color="#64748b" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">That's okay — recover it and keep your streak.</p>
              <div className="flex gap-2">
                {[
                  { action: 'do_now',       icon: Zap,      label: 'Do it now', primary: true },
                  { action: 'move_tonight', icon: Moon,     label: 'Tonight'                  },
                  { action: 'tomorrow',     icon: Calendar, label: 'Tomorrow'                  },
                ].map((btn) => (
                  <motion.button key={btn.action} whileTap={{ scale: 0.9 }}
                    onClick={() => handleRecovery(missed.taskId, btn.action)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 12, cursor: 'pointer',
                      background: btn.primary ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'rgba(255,255,255,0.05)',
                      border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      boxShadow: btn.primary ? '0 4px 16px rgba(22,163,74,0.3)' : 'none',
                    }}
                  >
                    <btn.icon size={14} color={btn.primary ? '#fff' : '#94a3b8'} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: btn.primary ? '#fff' : '#94a3b8' }}>{btn.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Alarm cascade preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ ...glass(), padding: '14px 16px', marginBottom: 14 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BellRing size={14} color="#22c55e" />
            <span className="text-xs font-bold text-slate-100">How alarms cascade — example</span>
          </div>
          {cascadeSteps.map((s, i) => (
            <div key={s.label} className="flex gap-3" style={{ paddingBottom: i < 3 ? 12 : 0 }}>
              <div className="flex flex-col items-center w-5">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.done ? s.color : 'transparent', border: s.done ? 'none' : `2px solid ${s.color}`, flexShrink: 0, marginTop: 2 }} />
                {i < 3 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', marginTop: 3 }} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? '#f1f5f9' : '#94a3b8' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 11, color: '#64748b' }}>{s.desc}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Upcoming alarms list ── */}
        <h2 className="text-sm font-bold text-slate-100 mb-3">Your alarms</h2>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => (
              <div key={i} style={{ ...glass(), padding: '12px 14px' }} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : alarms.length === 0 ? (
          <div style={{ ...glass(), padding: '24px 16px', textAlign: 'center' }}>
            <AlarmClock size={28} color="#334155" style={{ margin: '0 auto 8px' }} />
            <p className="text-sm text-slate-500">No alarms set yet.</p>
            <p className="text-xs text-slate-600 mt-1">Open a task and tap "Set alarm" to add one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alarms.map((alarm, i) => {
              const c = PRIORITY_COLOR[alarm.priority] ?? '#94a3b8';
              return (
                <motion.div
                  key={alarm.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: i * 0.05 }}
                  style={{ ...glass(), padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: PRIORITY_BG[alarm.priority], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlarmClock size={16} color={c} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-500 text-slate-100 truncate">{alarm.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} color="#64748b" />
                      <span className="text-xs text-slate-500">
                        {alarm.alarm_time
                          ? new Date(alarm.alarm_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-[10px] text-slate-500">
                        {(alarm.reminder_offsets ?? []).length} reminders
                      </span>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div
                    onClick={() => toggleAlarmEnabled(alarm)}
                    style={{ width: 36, height: 20, borderRadius: 10, background: alarm.enabled ? 'linear-gradient(to right,#16a34a,#22c55e)' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <motion.div
                      animate={{ left: alarm.enabled ? 18 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </motion.div>
    </div>
  );
}