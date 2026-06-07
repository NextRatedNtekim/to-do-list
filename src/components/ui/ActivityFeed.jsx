// src/components/ActivityFeed.jsx
// Real-time partner activity feed using Supabase Realtime.
// Connects to your existing activity_feed table — no new schema needed.
// USAGE:
//   <ActivityFeed partnerId={partner.id} currentUserId={user.id} />

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Flame, Zap, Send, HeartHandshake,
  AlarmClock, RefreshCw, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ACTION_META = {
  completed:      { icon: CheckCircle2,  color: '#22c55e', label: 'completed a task'      },
  streak:         { icon: Flame,         color: '#f59e0b', label: 'hit a streak milestone' },
  level_up:       { icon: Zap,           color: '#8b5cf6', label: 'levelled up'            },
  nudge:          { icon: Send,          color: '#3b82f6', label: 'sent you a nudge'       },
  checkin:        { icon: CheckCircle2,  color: '#22c55e', label: 'checked in'             },
  partner_joined: { icon: HeartHandshake,color: '#3b82f6', label: 'joined as your partner' },
  alarm:          { icon: AlarmClock,    color: '#f59e0b', label: 'set an alarm'           },
  recovery:       { icon: RefreshCw,     color: '#22c55e', label: 'recovered a missed task'},
  achievement:    { icon: Star,          color: '#fbbf24', label: 'earned an achievement'  },
};

const glassCard = {
  background:     'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  border:         '1px solid rgba(255,255,255,0.07)',
  borderRadius:   14,
};

export default function ActivityFeed({ partnerId, currentUserId }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;

    // ── Initial fetch ───────────────────────────────────────────────────
    supabase
      .from('activity_feed')
      .select('*')
      .or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });

    // ── Realtime subscription ───────────────────────────────────────────
    const channel = supabase
      .channel(`feed-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'activity_feed',
          filter: `partner_id=eq.${currentUserId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [partnerId, currentUserId]);

  function formatTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ ...glassCard, padding: '11px 14px' }}
            className="flex gap-3 items-center animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
              <div className="h-2 bg-white/5 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ ...glassCard, padding: '20px 16px', textAlign: 'center' }}>
        <HeartHandshake size={28} color="#334155" style={{ margin: '0 auto 8px' }} />
        <p className="text-sm text-slate-500">No activity yet.</p>
        <p className="text-xs text-slate-600 mt-1">
          Complete tasks to share progress with your partner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {events.map((event, i) => {
          const meta = ACTION_META[event.action] ?? ACTION_META.completed;
          const isFromPartner = event.user_id === partnerId;

          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, x: isFromPartner ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{    opacity: 0,  x: 8  }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              style={glassCard}
              className="flex gap-3 items-start p-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${meta.color}20` }}
              >
                <meta.icon size={15} color={meta.color} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 leading-snug">
                  <span className="font-600">
                    {isFromPartner ? 'Your partner' : 'You'}
                  </span>{' '}
                  {meta.label}
                  {event.metadata?.message && (
                    <span className="text-slate-400"> — "{event.metadata.message}"</span>
                  )}
                </p>
                {event.metadata?.task_title && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {event.metadata.task_title}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-slate-600">
                  {formatTime(event.created_at)}
                </span>
                {event.metadata?.xp && (
                  <div className="text-[11px] font-700 text-purple-400 mt-0.5">
                    +{event.metadata.xp}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}