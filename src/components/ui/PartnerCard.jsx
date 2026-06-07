// src/components/PartnerCard.jsx
// Reusable partner card — "mini" variant for Dashboard, "full" for Accountability page.
// USAGE:
//   <PartnerCard partner={partnerProfile} variant="mini" />
//   <PartnerCard partner={partnerProfile} variant="full" onSchedule={() => {}} />

import { motion } from 'framer-motion';
import {
  Send, Calendar, BarChart3, CheckCircle2, Flame, Clock
} from 'lucide-react';
import { sendNudge } from '@/lib/supabase';
import { useState } from 'react';

export default function PartnerCard({ partner, variant = 'mini', onSchedule, onViewProgress }) {
  const [nudgeSent, setNudgeSent] = useState(false);

  if (!partner) return null;

  async function handleNudge() {
    if (nudgeSent) return;
    await sendNudge(partner.id);
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 30000); // 30s cooldown
  }

  const avatarLetters = (partner.display_name || partner.email || 'P')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const cardStyle = {
    background:     variant === 'full'
      ? 'rgba(59,130,246,0.07)'
      : 'rgba(59,130,246,0.05)',
    backdropFilter: 'blur(20px)',
    border:         '1px solid rgba(59,130,246,0.22)',
    borderRadius:   20,
  };

  // ── Mini variant (Dashboard strip) ──────────────────────────────────────────
  if (variant === 'mini') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        style={cardStyle}
        className="p-3.5 flex items-center gap-3"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            {avatarLetters}
          </div>
          {partner.is_online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
              style={{ borderColor: '#030712' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-600 text-slate-100 truncate">{partner.display_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 size={11} color="#22c55e" />
            <span className="text-xs text-slate-400">
              {partner.tasks_done_today ?? 0}/{partner.tasks_total_today ?? 0} today
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Flame size={12} color="#f59e0b" />
          <span className="text-xs font-700 text-amber-400">{partner.shared_streak ?? 0}d</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleNudge}
          disabled={nudgeSent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-700 transition-all"
          style={{
            background: nudgeSent ? 'rgba(22,163,74,0.15)' : 'rgba(59,130,246,0.15)',
            border:     nudgeSent ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.3)',
            color:      nudgeSent ? '#22c55e' : '#60a5fa',
          }}
        >
          <Send size={11} color={nudgeSent ? '#22c55e' : '#60a5fa'} />
          {nudgeSent ? 'Sent!' : 'Nudge'}
        </motion.button>
      </motion.div>
    );
  }

  // ── Full variant (Accountability page) ──────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0  }}
      style={cardStyle}
      className="p-5"
    >
      {/* Avatar + info */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            {avatarLetters}
          </div>
          {partner.is_online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 flex items-center justify-center"
              style={{ borderColor: '#030712' }}>
              <CheckCircle2 size={9} color="#fff" strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-800 text-slate-100">{partner.display_name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {partner.is_online ? 'Active now' : 'Last seen recently'} · Level {partner.level ?? 1} — {partner.level_title ?? 'Seedling'}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Flame size={11} color="#f59e0b" />
              <span className="text-xs font-700 text-amber-400">{partner.shared_streak ?? 0} shared days</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(22,163,74,0.18)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <CheckCircle2 size={11} color="#22c55e" />
              <span className="text-xs font-700 text-green-400">
                {partner.tasks_done_today ?? 0}/{partner.tasks_total_today ?? 0} today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleNudge}
          disabled={nudgeSent}
          className="flex-1 py-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all"
          style={{
            background: nudgeSent ? 'rgba(22,163,74,0.14)' : 'rgba(59,130,246,0.14)',
            border:     nudgeSent ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.3)',
          }}
        >
          <Send size={15} color={nudgeSent ? '#22c55e' : '#60a5fa'} />
          <span className="text-[10px] font-700" style={{ color: nudgeSent ? '#22c55e' : '#60a5fa' }}>
            {nudgeSent ? 'Sent!' : 'Nudge'}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onSchedule}
          className="flex-1 py-2.5 rounded-2xl flex flex-col items-center gap-1"
          style={{
            background: 'rgba(22,163,74,0.14)',
            border:     '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <Calendar size={15} color="#22c55e" />
          <span className="text-[10px] font-700 text-green-400">Schedule</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onViewProgress}
          className="flex-1 py-2.5 rounded-2xl flex flex-col items-center gap-1"
          style={{
            background: 'rgba(139,92,246,0.14)',
            border:     '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <BarChart3 size={15} color="#a78bfa" />
          <span className="text-[10px] font-700 text-purple-400">Progress</span>
        </motion.button>
      </div>
    </motion.div>
  );
}