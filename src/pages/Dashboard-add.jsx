import { useEffect, useState } from 'react';
import { motion }              from 'framer-motion';
import {
  Target, Flame, Zap, Trophy, AlarmClock, Clock
} from 'lucide-react';
import PartnerCard         from '@/components/ui/PartnerCard';
import MissedTaskRecovery  from '@/components/ui/MissedTaskRecovery';
import XPToast             from '@/components/ui/XPToast';
import { useAlarmStore }   from '@/store/alarmStore';
import { supabase }        from '@/lib/supabase';
import { getLevel }        from '@/lib/xp';
 
// ── Shared glass style helper ─────────────────────────────────────────────────
const glass = (extra = {}) => ({
  background:           'rgba(255,255,255,0.04)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         20,
  ...extra,
});
 
// ── 1. Dashboard header ───────────────────────────────────────────────────────
// ADD this at the very top of your Dashboard render, replacing your existing greeting
export function DashboardHeader({ displayName, streak }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.28 }}
      style={{ marginBottom: 6 }}
    >
      <h1 style={{ fontSize: 23, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
        {greeting}, {displayName} 👋
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, color: '#64748b' }}>
        <Clock size={13} color="#475569" />
        <span>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#475569' }} />
        <Flame size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{streak} day streak</span>
      </div>
    </motion.div>
  );
}
 
// ── 2. Today's mission card ───────────────────────────────────────────────────
// ADD this below the header, above the task list
export function TodaysMission({ tasks }) {
  const done  = tasks.filter((t) => t.completed_at || t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: 0.07 }}
      style={{
        ...glass({
          background: 'rgba(22,163,74,0.1)',
          border:     '1px solid rgba(34,197,94,0.22)',
        }),
        padding: '16px 18px', marginBottom: 12, marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Target size={15} color="#22c55e" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today's mission
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{done}/{total}</span>
      </div>
 
      <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
        Complete {total} task{total !== 1 ? 's' : ''} today
      </p>
 
      {/* Progress bar */}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', background: 'linear-gradient(to right,#16a34a,#4ade80)', borderRadius: 6 }}
        />
      </div>
      <p style={{ fontSize: 11, color: 'rgba(134,239,172,0.65)', marginTop: 5 }}>{pct}% complete</p>
    </motion.div>
  );
}
 
// ── 3. Stats row ──────────────────────────────────────────────────────────────
// ADD this below TodaysMission
export function DashboardStats({ streak, totalXp, tasksLeft }) {
  const levelData = getLevel(totalXp);
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}
    >
      {[
        { icon: Flame,  color: '#f59e0b', val: streak,   sub: 'day streak'      },
        { icon: Zap,    color: '#8b5cf6', val: totalXp.toLocaleString(), sub: 'total XP' },
        { icon: Trophy, color: '#22c55e', val: levelData.level, sub: levelData.title },
      ].map((s, i) => (
        <motion.div
          key={s.sub}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1,  scale: 1    }}
          transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 420, damping: 28 }}
          style={{ ...glass(), padding: '12px 10px', textAlign: 'center' }}
        >
          <s.icon size={17} color={s.color} style={{ margin: '0 auto 5px', display: 'block' }} />
          <div style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{s.val}</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{s.sub}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
 
// ── 4. Next alarm chip ────────────────────────────────────────────────────────
// ADD this below the stats row
export function NextAlarmChip() {
  const alarms = useAlarmStore((s) => s.alarms);
  const next   = alarms
    .filter((a) => new Date(a.alarmTime) > new Date())
    .sort((a, b) => new Date(a.alarmTime) - new Date(b.alarmTime))[0];
 
  if (!next) return null;
 
  const diff  = new Date(next.alarmTime) - Date.now();
  const mins  = Math.floor(diff / 60000);
  const label = mins < 60
    ? `In ${mins} min`
    : `In ${Math.floor(mins / 60)}h ${mins % 60}m`;
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      style={{ ...glass(), padding: '9px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <AlarmClock size={15} color="#f59e0b" />
      <span style={{ fontSize: 13, color: '#f1f5f9', flex: 1, fontWeight: 500 }}>
        {next.title}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{label}</span>
    </motion.div>
  );
}
 
// ── 5. Partner mini-card wrapper ──────────────────────────────────────────────
// ADD this below NextAlarmChip, above the task list
export function DashboardPartnerCard({ partner }) {
  if (!partner) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      style={{ marginBottom: 12 }}
    >
      <PartnerCard partner={partner} variant="mini" />
    </motion.div>
  );
}