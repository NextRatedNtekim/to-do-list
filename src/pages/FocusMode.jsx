// // src/pages/FocusMode.jsx
// // REPLACE your existing FocusMode/focus page with this.
// // Route: /focus
// // Features: Pomodoro timer, phase switcher, partner presence, mid-task check-in, XP on complete

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence }      from 'framer-motion';
// import {
//   Play, Pause, SkipForward, RefreshCw,
//   Layers, HeartHandshake, Zap
// } from 'lucide-react';
// import XPToast   from '../components/XPToast';
// import { supabase } from '../lib/supabase';
// import { XP }       from '../lib/xp';

// // ── Phase config ──────────────────────────────────────────────────────────────
// const PHASES = [
//   { id: 'focus',     label: 'Focus',     mins: 25, xp: XP.focus_session },
//   { id: 'break',     label: 'Short break', mins: 5,  xp: 0 },
//   { id: 'deep',      label: 'Deep work', mins: 50, xp: XP.focus_session * 2 },
// ];

// const glass = (extra = {}) => ({
//   background:           'rgba(255,255,255,0.04)',
//   backdropFilter:       'blur(20px)',
//   WebkitBackdropFilter: 'blur(20px)',
//   border:               '1px solid rgba(255,255,255,0.08)',
//   borderRadius:         18,
//   ...extra,
// });

// export default function FocusMode() {
//   const [phase,    setPhase]    = useState(0);
//   const [secs,     setSecs]     = useState(PHASES[0].mins * 60);
//   const [running,  setRunning]  = useState(false);
//   const [sessions, setSessions] = useState(0);        // completed pomodoros today
//   const [xpToast,  setXpToast]  = useState(false);
//   const [toastXp,  setToastXp]  = useState(0);
//   const [checkIn,  setCheckIn]  = useState(false);    // mid-task check-in prompt
//   const [activeTask, setActiveTask] = useState(null); // task being focused on
//   const [partnerActive, setPartnerActive] = useState(false);
//   const intervalRef  = useRef(null);
//   const checkInFired = useRef(false);

//   // Load today's first incomplete task
//   useEffect(() => {
//     async function loadTask() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;
//       const { data } = await supabase
//         .from('tasks')
//         .select('id, title, priority, xp_reward')
//         .eq('user_id', user.id)
//         .is('completed_at', null)
//         .order('created_at', { ascending: true })
//         .limit(1)
//         .single();
//       if (data) setActiveTask(data);
//     }
//     loadTask();

//     // Simulate partner presence (replace with real Supabase presence channel later)
//     setTimeout(() => setPartnerActive(true), 2000);
//   }, []);

//   // ── Timer tick ─────────────────────────────────────────────────────────────
//   // Store phase in a ref so the interval callback always reads the latest value
//   const phaseRef = useRef(phase);
//   useEffect(() => { phaseRef.current = phase; }, [phase]);

//   useEffect(() => {
//     if (running) {
//       intervalRef.current = setInterval(() => {
//         setSecs((s) => {
//           const currentPhase = phaseRef.current;
//           const totalSecs    = PHASES[currentPhase].mins * 60;

//           // Mid-task check-in at 25-minute mark
//           if (!checkInFired.current && totalSecs - s >= 25 * 60 - 1) {
//             checkInFired.current = true;
//             setCheckIn(true);
//           }

//           if (s <= 1) {
//             // Use setTimeout to call side-effects outside the setState callback
//             setTimeout(() => {
//               clearInterval(intervalRef.current);
//               setRunning(false);
//               const earned = PHASES[currentPhase].xp;
//               if (earned > 0) {
//                 awardXP(earned, currentPhase);
//                 setSessions((prev) => prev + 1);
//               }
//               checkInFired.current = false;
//             }, 0);
//             return 0;
//           }
//           return s - 1;
//         });
//       }, 1000);
//     } else {
//       clearInterval(intervalRef.current);
//     }
//     return () => clearInterval(intervalRef.current);
//   }, [running]);

//   async function awardXP(amount, phaseIndex) {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return;
//     // Increment XP in user_profiles (your existing column)
//     await supabase.rpc('increment_xp', { user_id_input: user.id, xp_amount: amount });
//     // Log to activity_feed
//     await supabase.from('activity_feed').insert({
//       user_id: user.id, action: 'focus_session',
//       metadata: { xp: amount, phase: PHASES[phaseIndex ?? phase].label }
//     });
//     setToastXp(amount);
//     setXpToast(true);
//     setTimeout(() => setXpToast(false), 2200);
//   }

//   function switchPhase(i) {
//     clearInterval(intervalRef.current);
//     setRunning(false);
//     setPhase(i);
//     setSecs(PHASES[i].mins * 60);
//     checkInFired.current = false;
//     setCheckIn(false);
//   }

//   function toggleTimer() { setRunning((r) => !r); }

//   function resetTimer() {
//     clearInterval(intervalRef.current);
//     setRunning(false);
//     setSecs(PHASES[phase].mins * 60);
//     checkInFired.current = false;
//     setCheckIn(false);
//   }

//   function skipPhase() { switchPhase((phase + 1) % PHASES.length); }

//   // ── Display ────────────────────────────────────────────────────────────────
//   const mins  = String(Math.floor(secs / 60)).padStart(2, '0');
//   const ss    = String(secs % 60).padStart(2, '0');
//   const total = PHASES[phase].mins * 60;
//   const prog  = 1 - secs / total;
//   const R     = 90;
//   const CIRC  = 2 * Math.PI * R;

//   return (
//     <div className="px-4 pt-16 pb-4 relative">
//       <XPToast xp={toastXp} visible={xpToast} />

//       {/* Mid-task check-in */}
//       <AnimatePresence>
//         {checkIn && (
//           <motion.div
//             initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
//             style={{ ...glass({ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(34,197,94,0.25)' }), padding: '14px 16px', marginBottom: 16 }}
//           >
//             <p className="text-sm font-bold text-slate-100 mb-1">Still focused? 👀</p>
//             <p className="text-xs text-slate-400 mb-3">25 minutes in — great work. Keep going or take a break.</p>
//             <div className="flex gap-2">
//               <motion.button whileTap={{ scale: 0.92 }} onClick={() => setCheckIn(false)}
//                 style={{ flex: 1, padding: '8px 0', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
//                 Keep going 💪
//               </motion.button>
//               <motion.button whileTap={{ scale: 0.92 }} onClick={() => { setCheckIn(false); switchPhase(1); }}
//                 style={{ flex: 1, padding: '8px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
//                 Take a break
//               </motion.button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1">Focus mode</h1>
//       <p className="text-sm text-slate-500 mb-5">Deep work, no distractions</p>

//       {/* Phase selector */}
//       <div style={{ ...glass(), padding: 4, display: 'flex', gap: 4, marginBottom: 28, borderRadius: 16 }}>
//         {PHASES.map((p, i) => (
//           <motion.button
//             key={p.id}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => switchPhase(i)}
//             style={{
//               flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
//               background: phase === i ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'transparent',
//               color:      phase === i ? '#fff' : '#64748b',
//               fontSize:   12,
//               fontWeight: phase === i ? 700 : 500,
//               transition: 'all 0.2s',
//             }}
//           >
//             {p.label}
//           </motion.button>
//         ))}
//       </div>

//       {/* Timer ring */}
//       <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 28px' }}>
//         <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
//           {/* Glow filter */}
//           <defs>
//             <filter id="glow">
//               <feGaussianBlur stdDeviation="4" result="coloredBlur" />
//               <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
//             </filter>
//             <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%"   stopColor="#16a34a" />
//               <stop offset="100%" stopColor="#4ade80" />
//             </linearGradient>
//           </defs>
//           {/* Track */}
//           <circle cx="110" cy="110" r={R} fill="none"
//             stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
//           {/* Progress arc */}
//           <circle cx="110" cy="110" r={R} fill="none"
//             stroke="url(#arcGrad)" strokeWidth="8" strokeLinecap="round"
//             filter="url(#glow)"
//             strokeDasharray={CIRC}
//             strokeDashoffset={CIRC * (1 - prog)}
//             style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
//           />
//         </svg>

//         {/* Timer text */}
//         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//           <motion.div
//             animate={running ? { scale: [1, 1.015, 1] } : {}}
//             transition={{ repeat: Infinity, duration: 2 }}
//             style={{ fontSize: 48, fontWeight: 300, color: '#f1f5f9', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
//           >
//             {mins}:{ss}
//           </motion.div>
//           <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{PHASES[phase].label}</span>
//           {sessions > 0 && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
//               {Array.from({ length: Math.min(sessions, 4) }).map((_, i) => (
//                 <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
//               ))}
//               {sessions > 4 && <span style={{ fontSize: 10, color: '#64748b' }}>+{sessions - 4}</span>}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Active task label */}
//       <div style={{ ...glass(), padding: '11px 16px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
//         <motion.div
//           animate={{ background: running ? '#22c55e' : '#334155' }}
//           transition={{ duration: 0.3 }}
//           style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0 }}
//         />
//         <span style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9', flex: 1 }}>
//           {activeTask?.title ?? 'No task selected'}
//         </span>
//         <Layers size={14} color="#475569" />
//       </div>

//       {/* Controls */}
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 22 }}>
//         <motion.button whileTap={{ scale: 0.88 }} onClick={resetTimer}
//           style={{ width: 52, height: 52, borderRadius: 16, ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
//           <RefreshCw size={19} color="#64748b" />
//         </motion.button>

//         <motion.button whileTap={{ scale: 0.88 }} onClick={toggleTimer}
//           style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(22,163,74,0.45)' }}>
//           <AnimatePresence mode="wait">
//             {running
//               ? <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
//                   <Pause size={26} color="#fff" fill="#fff" />
//                 </motion.div>
//               : <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
//                   <Play size={26} color="#fff" fill="#fff" />
//                 </motion.div>
//             }
//           </AnimatePresence>
//         </motion.button>

//         <motion.button whileTap={{ scale: 0.88 }} onClick={skipPhase}
//           style={{ width: 52, height: 52, borderRadius: 16, ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
//           <SkipForward size={19} color="#64748b" />
//         </motion.button>
//       </div>

//       {/* XP reward preview */}
//       {PHASES[phase].xp > 0 && (
//         <div style={{ textAlign: 'center', marginBottom: 16 }}>
//           <span style={{ fontSize: 12, color: '#475569' }}>Complete this session → </span>
//           <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>+{PHASES[phase].xp} XP</span>
//         </div>
//       )}

//       {/* Partner presence */}
//       <AnimatePresence>
//         {partnerActive && (
//           <motion.div
//             initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//             style={{ ...glass({ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }), padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
//           >
//             <motion.div
//               animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
//               transition={{ repeat: Infinity, duration: 2 }}
//               style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
//             />
//             <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>
//               Your partner is also in a focus session right now
//             </span>
//             <HeartHandshake size={14} color="#3b82f6" />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// src/pages/FocusMode.jsx
// REPLACE your existing FocusMode/focus page with this.
// Route: /focus
// Features: Pomodoro timer, phase switcher, partner presence, mid-task check-in, XP on complete

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import {
  Play, Pause, SkipForward, RefreshCw,
  Layers, HeartHandshake, Zap
} from 'lucide-react';
import {XPToast }  from '@/components/XPToast';
import { supabase } from '@/lib/supabase';
import { XP }       from '@/lib/xp';

// ── Phase config ──────────────────────────────────────────────────────────────
const PHASES = [
  { id: 'focus',     label: 'Focus',     mins: 25, xp: XP.focus_session },
  { id: 'break',     label: 'Short break', mins: 5,  xp: 0 },
  { id: 'deep',      label: 'Deep work', mins: 50, xp: XP.focus_session * 2 },
];

const glass = (extra = {}) => ({
  background:           'rgba(255,255,255,0.04)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         18,
  ...extra,
});

export default function FocusMode() {
  const [phase,    setPhase]    = useState(0);
  const [secs,     setSecs]     = useState(PHASES[0].mins * 60);
  const [running,  setRunning]  = useState(false);
  const [sessions, setSessions] = useState(0);        // completed pomodoros today
  const [xpToast,  setXpToast]  = useState(false);
  const [toastXp,  setToastXp]  = useState(0);
  const [checkIn,  setCheckIn]  = useState(false);    // mid-task check-in prompt
  const [activeTask, setActiveTask] = useState(null); // task being focused on
  const [partnerActive, setPartnerActive] = useState(false);
  const intervalRef  = useRef(null);
  const checkInFired = useRef(false);

  // Load today's first incomplete task
  useEffect(() => {
    async function loadTask() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('tasks')
        .select('id, title, priority, xp_reward')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (data) setActiveTask(data);
    }
    loadTask();

    // Simulate partner presence (replace with real Supabase presence channel later)
    setTimeout(() => setPartnerActive(true), 2000);
  }, []);

  // ── Timer tick ─────────────────────────────────────────────────────────────
  // Store phase in a ref so the interval callback always reads the latest value
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs((s) => {
          const currentPhase = phaseRef.current;
          const totalSecs    = PHASES[currentPhase].mins * 60;

          // Mid-task check-in at 25-minute mark
          if (!checkInFired.current && totalSecs - s >= 25 * 60 - 1) {
            checkInFired.current = true;
            setCheckIn(true);
          }

          if (s <= 1) {
            // Use setTimeout to call side-effects outside the setState callback
            setTimeout(() => {
              clearInterval(intervalRef.current);
              setRunning(false);
              const earned = PHASES[currentPhase].xp;
              if (earned > 0) {
                awardXP(earned, currentPhase);
                setSessions((prev) => prev + 1);
              }
              checkInFired.current = false;
            }, 0);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  async function awardXP(amount, phaseIndex) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Increment XP in user_profiles (your existing column)
    await supabase.rpc('increment_xp', { user_id_input: user.id, xp_amount: amount });
    // Log to activity_feed
    await supabase.from('activity_feed').insert({
      user_id: user.id, action: 'focus_session',
      metadata: { xp: amount, phase: PHASES[phaseIndex ?? phase].label }
    });
    setToastXp(amount);
    setXpToast(true);
    setTimeout(() => setXpToast(false), 2200);
  }

  function switchPhase(i) {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPhase(i);
    setSecs(PHASES[i].mins * 60);
    checkInFired.current = false;
    setCheckIn(false);
  }

  function toggleTimer() { setRunning((r) => !r); }

  function resetTimer() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecs(PHASES[phase].mins * 60);
    checkInFired.current = false;
    setCheckIn(false);
  }

  function skipPhase() { switchPhase((phase + 1) % PHASES.length); }

  // ── Display ────────────────────────────────────────────────────────────────
  const mins  = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss    = String(secs % 60).padStart(2, '0');
  const total = PHASES[phase].mins * 60;
  const prog  = 1 - secs / total;
  const R     = 90;
  const CIRC  = 2 * Math.PI * R;

  return (
    <div className="px-4 pt-16 pb-4 relative">
      <XPToast xp={toastXp} visible={xpToast} />

      {/* Mid-task check-in */}
      <AnimatePresence>
        {checkIn && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{ ...glass({ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(34,197,94,0.25)' }), padding: '14px 16px', marginBottom: 16 }}
          >
            <p className="text-sm font-bold text-slate-100 mb-1">Still focused? 👀</p>
            <p className="text-xs text-slate-400 mb-3">25 minutes in — great work. Keep going or take a break.</p>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setCheckIn(false)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                Keep going 💪
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => { setCheckIn(false); switchPhase(1); }}
                style={{ flex: 1, padding: '8px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                Take a break
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1">Focus mode</h1>
      <p className="text-sm text-slate-500 mb-5">Deep work, no distractions</p>

      {/* Phase selector */}
      <div style={{ ...glass(), padding: 4, display: 'flex', gap: 4, marginBottom: 28, borderRadius: 16 }}>
        {PHASES.map((p, i) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchPhase(i)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: phase === i ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'transparent',
              color:      phase === i ? '#fff' : '#64748b',
              fontSize:   12,
              fontWeight: phase === i ? 700 : 500,
              transition: 'all 0.2s',
            }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Timer ring */}
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 28px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#16a34a" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="110" cy="110" r={R} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress arc */}
          <circle cx="110" cy="110" r={R} fill="none"
            stroke="url(#arcGrad)" strokeWidth="8" strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - prog)}
            style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
          />
        </svg>

        {/* Timer text */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={running ? { scale: [1, 1.015, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 48, fontWeight: 300, color: '#f1f5f9', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
          >
            {mins}:{ss}
          </motion.div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{PHASES[phase].label}</span>
          {sessions > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              {Array.from({ length: Math.min(sessions, 4) }).map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              ))}
              {sessions > 4 && <span style={{ fontSize: 10, color: '#64748b' }}>+{sessions - 4}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Active task label */}
      <div style={{ ...glass(), padding: '11px 16px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.div
          animate={{ background: running ? '#22c55e' : '#334155' }}
          transition={{ duration: 0.3 }}
          style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9', flex: 1 }}>
          {activeTask?.title ?? 'No task selected'}
        </span>
        <Layers size={14} color="#475569" />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={resetTimer}
          style={{ width: 52, height: 52, borderRadius: 16, ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <RefreshCw size={19} color="#64748b" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.88 }} onClick={toggleTimer}
          style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(22,163,74,0.45)' }}>
          <AnimatePresence mode="wait">
            {running
              ? <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause size={26} color="#fff" fill="#fff" />
                </motion.div>
              : <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play size={26} color="#fff" fill="#fff" />
                </motion.div>
            }
          </AnimatePresence>
        </motion.button>

        <motion.button whileTap={{ scale: 0.88 }} onClick={skipPhase}
          style={{ width: 52, height: 52, borderRadius: 16, ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <SkipForward size={19} color="#64748b" />
        </motion.button>
      </div>

      {/* XP reward preview */}
      {PHASES[phase].xp > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>Complete this session → </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>+{PHASES[phase].xp} XP</span>
        </div>
      )}

      {/* Partner presence */}
      <AnimatePresence>
        {partnerActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...glass({ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }), padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>
              Your partner is also in a focus session right now
            </span>
            <HeartHandshake size={14} color="#3b82f6" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}