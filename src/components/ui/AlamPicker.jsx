// src/components/AlarmPicker.jsx
// Time picker + reminder offset checkboxes for task alarm configuration.
// USAGE inside your existing task create/edit modal:
//   <AlarmPicker
//     alarmTime={task.alarm_time}
//     offsets={task.reminder_offsets}
//     onChange={({ alarmTime, offsets }) => updateTask({ alarm_time: alarmTime, reminder_offsets: offsets })}
//   />

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlarmClock, Bell, X } from 'lucide-react';

const OFFSET_OPTIONS = [
  { value: 60,  label: '1 hour before'  },
  { value: 30,  label: '30 min before'  },
  { value: 10,  label: '10 min before'  },
];

export default function AlarmPicker({ alarmTime, offsets = [60, 30, 10], onChange }) {
  const [time,        setTime]        = useState(alarmTime ? toTimeString(alarmTime) : '');
  const [selectedOff, setSelectedOff] = useState(offsets);
  const [enabled,     setEnabled]     = useState(!!alarmTime);

  function toTimeString(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function buildIso(timeStr) {
    const today = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    today.setHours(h, m, 0, 0);
    // If time is in the past today, schedule for tomorrow
    if (today < new Date()) today.setDate(today.getDate() + 1);
    return today.toISOString();
  }

  function handleTimeChange(e) {
    const val = e.target.value;
    setTime(val);
    if (val && enabled) {
      onChange?.({ alarmTime: buildIso(val), offsets: selectedOff });
    }
  }

  function toggleOffset(val) {
    const next = selectedOff.includes(val)
      ? selectedOff.filter((o) => o !== val)
      : [...selectedOff, val].sort((a, b) => b - a);
    setSelectedOff(next);
    if (time && enabled) {
      onChange?.({ alarmTime: buildIso(time), offsets: next });
    }
  }

  function handleEnable(e) {
    const on = e.target.checked;
    setEnabled(on);
    if (!on) {
      onChange?.({ alarmTime: null, offsets: [] });
    } else if (time) {
      onChange?.({ alarmTime: buildIso(time), offsets: selectedOff });
    }
  }

  const glassStyle = {
    background:     'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border:         '1px solid rgba(255,255,255,0.08)',
    borderRadius:   14,
  };

  return (
    <div style={glassStyle} className="p-4 space-y-3">

      {/* Header toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(22,163,74,0.15)' }}>
            <AlarmClock size={15} color="#22c55e" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Set alarm</span>
        </div>
        {/* Toggle switch */}
        <div
          onClick={() => handleEnable({ target: { checked: !enabled } })}
          className="w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200"
          style={{ background: enabled ? 'linear-gradient(to right,#16a34a,#22c55e)' : 'rgba(255,255,255,0.1)' }}
        >
          <motion.div
            animate={{ left: enabled ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
            style={{ position: 'absolute' }}
          />
        </div>
      </div>

      {/* Time input */}
      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{    opacity: 0, height: 0      }}
          transition={{ duration: 0.2 }}
          className="space-y-3 overflow-hidden"
        >
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Alarm time</label>
            <input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200
                focus:outline-none focus:ring-1 focus:ring-brand"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border:     '1px solid rgba(255,255,255,0.1)',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Reminder offsets */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Bell size={12} color="#64748b" />
              <label className="text-xs text-slate-400">Pre-task reminders</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {OFFSET_OPTIONS.map((opt) => {
                const on = selectedOff.includes(opt.value);
                return (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleOffset(opt.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all duration-150"
                    style={{
                      background: on ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)',
                      border:     on ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color:      on ? '#22c55e' : '#64748b',
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {time && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
              <AlarmClock size={11} color="#64748b" />
              Alarm at {time}
              {selectedOff.length > 0 && ` · ${selectedOff.length} reminder${selectedOff.length > 1 ? 's' : ''}`}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}