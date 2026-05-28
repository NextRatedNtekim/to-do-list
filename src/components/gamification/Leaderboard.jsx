// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Zap, TrendingUp, Flame } from 'lucide-react'
// import { useLeaderboardStore, useUserStore } from '@/store'
// import { getRankForLevel, levelFromXP } from '@/utils/constants'

// const TABS = [
//   { id: 'xp',     label: 'XP',     Icon: Zap },
//   { id: 'streak', label: 'Streak', Icon: Flame },
//   { id: 'weekly', label: 'Weekly', Icon: TrendingUp },
// ]

// const MEDALS = ['🥇','🥈','🥉']
// const PODIUM_HEIGHTS = [100, 76, 60]
// const PODIUM_COLORS  = ['#f59e0b','#94a3b8','#cd7c2f']

// export function Leaderboard() {
//   const [tab, setTab] = useState('xp')
//   const { entries }   = useLeaderboardStore()
//   const { totalXP, streak, weeklyXP, profile } = useUserStore()

//   const myEntry = { id: 'me', name: profile.name, xp: totalXP, streak, weeklyXP, isMe: true }
//   const all     = [...entries, myEntry]

//   const sorted = [...all].sort((a, b) =>
//     tab === 'xp' ? b.xp - a.xp : tab === 'streak' ? b.streak - a.streak : b.weeklyXP - a.weeklyXP
//   )

//   const top3 = sorted.slice(0, 3)
//   const rest = sorted.slice(3)

//   function statVal(e) {
//     if (tab === 'xp')     return `${(e.xp || 0).toLocaleString()} XP`
//     if (tab === 'streak') return `${e.streak || 0} 🔥`
//     return `${(e.weeklyXP || 0).toLocaleString()} XP`
//   }

//   return (
//     <div>
//       {/* Tab bar */}
//       <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-surface-2)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
//         {TABS.map(({ id, label, Icon }) => (
//           <button key={id} onClick={() => setTab(id)}
//             style={{
//               flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
//               background: tab === id ? 'var(--bg-surface)' : 'transparent',
//               color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
//               fontSize: 13, fontWeight: tab === id ? 700 : 500,
//               cursor: 'pointer', fontFamily: 'var(--font-body)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
//               boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
//               transition: 'all .15s',
//             }}
//           >
//             <Icon size={13} /> {label}
//           </button>
//         ))}
//       </div>

//       {/* Podium — top 3 */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 10, marginBottom: 24, alignItems: 'flex-end' }}>
//         {[top3[1], top3[0], top3[2]].map((entry, i) => {
//           if (!entry) return <div key={i} />
//           const pos   = [2, 1, 3][i]
//           const color = PODIUM_COLORS[[1,0,2][i]]
//           const { level } = levelFromXP(entry.xp || 0)
//           const rank  = getRankForLevel(level)

//           return (
//             <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
//               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
//             >
//               <div style={{ fontSize: 22, marginBottom: 6 }}>{MEDALS[[1,0,2][i]]}</div>

//               {/* Avatar */}
//               <div style={{
//                 width: 44, height: 44, borderRadius: '50%', marginBottom: 7,
//                 background: `linear-gradient(135deg, ${color}80, ${color})`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 16, fontWeight: 800, color: '#fff',
//                 fontFamily: 'var(--font-display)', flexShrink: 0,
//                 border: entry.isMe ? '2.5px solid var(--brand)' : `2px solid ${color}40`,
//                 boxShadow: entry.isMe ? '0 0 0 3px var(--brand-glow)' : 'none',
//               }}>
//                 {entry.name.charAt(0).toUpperCase()}
//               </div>

//               <div style={{ fontSize: 11, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', marginBottom: 2, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 {entry.name.replace(' (You)', '')}{entry.isMe ? ' ✨' : ''}
//               </div>
//               <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{statVal(entry)}</div>

//               {/* Bar */}
//               <motion.div
//                 initial={{ height: 0 }} animate={{ height: PODIUM_HEIGHTS[i] }}
//                 transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.4,0,0.2,1] }}
//                 style={{
//                   width: '100%', background: `${color}22`,
//                   borderRadius: '8px 8px 0 0',
//                   border: `1px solid ${color}40`, borderBottom: 'none',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 18, fontWeight: 800, color,
//                   fontFamily: 'var(--font-display)',
//                 }}
//               >
//                 #{pos}
//               </motion.div>
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* Rest of list */}
//       <div className="card" style={{ overflow: 'hidden' }}>
//         <AnimatePresence mode="popLayout">
//           {rest.map((entry, idx) => {
//             const rank   = idx + 4
//             const { level } = levelFromXP(entry.xp || 0)
//             const rankData  = getRankForLevel(level)

//             return (
//               <motion.div key={entry.id} layout
//                 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
//                 transition={{ delay: idx * 0.04 }}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 12,
//                   padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,18px)',
//                   borderBottom: idx < rest.length - 1 ? '1px solid var(--border)' : 'none',
//                   background: entry.isMe ? 'var(--brand-muted)' : 'transparent',
//                   borderLeft: entry.isMe ? '3px solid var(--brand)' : '3px solid transparent',
//                   transition: 'background .14s',
//                 }}
//                 onMouseEnter={e => { if (!entry.isMe) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
//                 onMouseLeave={e => e.currentTarget.style.background = entry.isMe ? 'var(--brand-muted)' : 'transparent'}
//               >
//                 <div style={{ width: 26, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textAlign: 'center', flexShrink: 0 }}>
//                   #{rank}
//                 </div>
//                 <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${rankData.color}50, ${rankData.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
//                   {entry.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontSize: 13, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                     {entry.name.replace(' (You)', '')}{entry.isMe && ' ✨'}
//                   </div>
//                   <div style={{ fontSize: 11, color: rankData.color, fontWeight: 600 }}>{rankData.icon} {rankData.title}</div>
//                 </div>
//                 <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
//                   {statVal(entry)}
//                 </div>
//               </motion.div>
//             )
//           })}
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }


import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Flame, TrendingUp, Crown, Medal, Award,
  ChevronUp, ChevronDown, Minus, Star, Trophy,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   EMBEDDED STYLES  (self-contained, no external deps)
───────────────────────────────────────────────────────────── */
const STYLE_TAG = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@400;500;600;700&display=swap');

  .lb-root *, .lb-root *::before, .lb-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }
  .lb-root {
    --brand:       #00C37A;
    --brand-dim:   rgba(0,195,122,0.10);
    --brand-mid:   rgba(0,195,122,0.20);
    --gold:        #F59E0B;
    --silver:      #94A3B8;
    --bronze:      #CD7C2F;
    --bg:          #F5F7FA;
    --bg-card:     #FFFFFF;
    --bg-surface:  #EEF0F4;
    --text-primary:#0D1117;
    --text-sec:    #4B5563;
    --text-muted:  #9CA3AF;
    --border:      rgba(0,0,0,0.07);
    --shadow-sm:   0 1px 3px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04);
    --shadow-md:   0 4px 16px rgba(0,0,0,0.08);
    --shadow-gold: 0 6px 20px rgba(245,158,11,0.28);
    --shadow-brand:0 6px 20px rgba(0,195,122,0.30);
    --radius-sm:   10px;
    --radius-md:   14px;
    --radius-lg:   20px;
    --radius-full: 999px;
    --font-display:'Clash Display', sans-serif;
    --font-body:   'Satoshi', sans-serif;

    font-family: var(--font-body);
    background: var(--bg);
    max-width: 480px;
    margin: 0 auto;
    padding: 20px 16px 40px;
    min-height: 100vh;
  }

  /* Tab bar */
  .lb-tabs {
    display:flex; gap:6px; padding:5px;
    background:var(--bg-surface); border-radius:var(--radius-md);
    border:1px solid var(--border);
    margin-bottom:24px;
    box-shadow:var(--shadow-sm);
  }
  .lb-tab {
    flex:1; padding:9px 4px; border-radius:var(--radius-sm);
    border:none; background:transparent;
    color:var(--text-muted); font-size:13px; font-weight:600;
    cursor:pointer; font-family:var(--font-body);
    display:flex; align-items:center; justify-content:center; gap:5px;
    transition:all .15s;
  }
  .lb-tab.active {
    background:var(--bg-card); color:var(--text-primary); font-weight:700;
    box-shadow:var(--shadow-sm);
  }

  /* Podium */
  .lb-podium {
    display:grid; grid-template-columns:1fr 1.1fr 1fr;
    gap:8px; align-items:flex-end; margin-bottom:24px;
  }
  .lb-podium-cell {
    display:flex; flex-direction:column; align-items:center; text-align:center;
  }
  .lb-avatar {
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    font-weight:800; font-family:var(--font-display); color:#fff; flex-shrink:0;
  }
  .lb-bar {
    width:100%; border-radius:10px 10px 0 0;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-display); font-weight:800;
    border-bottom:none;
  }

  /* List */
  .lb-list { background:var(--bg-card); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); border:1px solid var(--border); }
  .lb-row {
    display:flex; align-items:center; gap:12px;
    padding:13px 16px;
    border-left:3px solid transparent;
    transition:background .14s;
  }
  .lb-row.me {
    background:var(--brand-dim);
    border-left-color:var(--brand);
  }
  .lb-row:not(:last-child) { border-bottom:1px solid var(--border); }
  .lb-row:not(.me):hover { background:var(--bg-surface); }

  /* Rank badge */
  .lb-rank-badge {
    width:28px; height:28px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:800; font-family:var(--font-display);
    flex-shrink:0;
  }

  /* delta chip */
  .delta-chip {
    display:inline-flex; align-items:center; gap:2px;
    font-size:10px; font-weight:700; padding:2px 6px;
    border-radius:var(--radius-full);
  }

  /* stat pill */
  .stat-pill {
    font-size:13px; font-weight:700; padding:4px 10px;
    border-radius:var(--radius-full); flex-shrink:0;
  }

  /* Section header */
  .lb-section-header {
    font-size:11px; font-weight:700; color:var(--text-muted);
    text-transform:uppercase; letter-spacing:.07em;
    padding:10px 16px 6px;
    border-bottom:1px solid var(--border);
    background:var(--bg-surface);
  }
`;

/* ─── CONFIG ───────────────────────────────────────────────── */
const TABS = [
  { id: "xp",     label: "XP",     Icon: Zap },
  { id: "streak", label: "Streak", Icon: Flame },
  { id: "weekly", label: "Weekly", Icon: TrendingUp },
];

const MEDAL_COLORS  = ["#F59E0B", "#94A3B8", "#CD7C2F"];
const PODIUM_ORDER  = [1, 0, 2]; // left=2nd, center=1st, right=3rd
const PODIUM_H      = [90, 120, 72];

const MedalIcons = [Crown, Medal, Award]; // 1st 2nd 3rd

/* ─── SEED DATA ────────────────────────────────────────────── */
const SEED_ENTRIES = [
  { id: "1",  name: "Alex Rivera",    xp: 14800, streak: 22, weeklyXP: 3200 },
  { id: "2",  name: "Jordan Kim",     xp: 13200, streak: 18, weeklyXP: 2900 },
  { id: "3",  name: "Sam Okafor",     xp: 11700, streak: 31, weeklyXP: 2600 },
  { id: "4",  name: "Taylor Nguyen",  xp:  9850, streak: 14, weeklyXP: 2100 },
  { id: "5",  name: "Morgan Blake",   xp:  8400, streak:  9, weeklyXP: 1900 },
  { id: "6",  name: "Casey Lin",      xp:  7200, streak: 12, weeklyXP: 1600 },
  { id: "7",  name: "Drew Hassan",    xp:  6100, streak:  5, weeklyXP: 1400 },
  { id: "me", name: "You",            xp:  5300, streak: 16, weeklyXP: 1750, isMe: true },
  { id: "8",  name: "Jamie Park",     xp:  4700, streak:  3, weeklyXP: 1200 },
  { id: "9",  name: "Quinn Torres",   xp:  3900, streak:  7, weeklyXP:  980 },
];

/* ─── HELPERS ──────────────────────────────────────────────── */
function statVal(entry, tab) {
  if (tab === "xp")     return `${(entry.xp || 0).toLocaleString()} XP`;
  if (tab === "streak") return `${entry.streak || 0} days`;
  return `${(entry.weeklyXP || 0).toLocaleString()} XP`;
}

function rankColor(rank) {
  if (rank === 1) return "#F59E0B";
  if (rank === 2) return "#94A3B8";
  if (rank === 3) return "#CD7C2F";
  return "var(--text-muted)";
}

function avatarGradient(idx) {
  const GRADS = [
    ["#6366f1","#8b5cf6"], ["#ec4899","#f43f5e"], ["#14b8a6","#06b6d4"],
    ["#f59e0b","#f97316"], ["#22c55e","#16a34a"], ["#3b82f6","#6366f1"],
    ["#a855f7","#ec4899"], ["#00C37A","#14b8a6"], ["#f43f5e","#f97316"],
    ["#06b6d4","#3b82f6"],
  ];
  const [a, b] = GRADS[idx % GRADS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/* ─── PODIUM CELL ───────────────────────────────────────────── */
function PodiumCell({ entry, position, tabIdx, tab, avatarIdx }) {
  if (!entry) return <div />;
  const color = MEDAL_COLORS[tabIdx];
  const MedalIcon = MedalIcons[tabIdx];
  const isCenter = tabIdx === 0;
  const avatarSize = isCenter ? 52 : 42;

  return (
    <motion.div
      className="lb-podium-cell"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: tabIdx * 0.08, type: "spring", damping: 22, stiffness: 280 }}
    >
      {/* Medal icon */}
      <div style={{ marginBottom: 6, color }}>
        <MedalIcon size={isCenter ? 22 : 18} strokeWidth={2} fill={`${color}30`} />
      </div>

      {/* Avatar */}
      <div className="lb-avatar"
        style={{
          width: avatarSize, height: avatarSize, fontSize: isCenter ? 20 : 16,
          background: entry.isMe ? "linear-gradient(135deg, #00C37A, #14b8a6)" : avatarGradient(avatarIdx),
          marginBottom: 8,
          border: entry.isMe ? "2.5px solid var(--brand)" : `2.5px solid ${color}50`,
          boxShadow: entry.isMe
            ? "0 0 0 3px rgba(0,195,122,0.25)"
            : isCenter ? `var(--shadow-gold)` : "none",
        }}>
        {entry.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <p style={{
        fontSize: isCenter ? 13 : 11, fontWeight: entry.isMe ? 800 : 700,
        color: entry.isMe ? "var(--brand)" : "var(--text-primary)",
        maxWidth: isCenter ? 90 : 72, overflow: "hidden",
        textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3,
      }}>
        {entry.name}{entry.isMe ? " ✦" : ""}
      </p>

      {/* Stat */}
      <p style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>
        {statVal(entry, tab)}
      </p>

      {/* Bar */}
      <motion.div
        className="lb-bar"
        initial={{ height: 0 }} animate={{ height: PODIUM_H[tabIdx] }}
        transition={{ delay: 0.25 + tabIdx * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: `linear-gradient(to top, ${color}28, ${color}12)`,
          border: `1.5px solid ${color}40`,
          fontSize: 20, color,
        }}
      >
        #{position}
      </motion.div>
    </motion.div>
  );
}

/* ─── ROW ───────────────────────────────────────────────────── */
function LeaderRow({ entry, rank, tab, avatarIdx, delay }) {
  const isTop = rank <= 3;
  const color = isTop ? rankColor(rank) : "var(--text-muted)";

  // fake delta for visual polish
  const delta = useMemo(() => {
    if (entry.isMe) return 0;
    return Math.floor(Math.random() * 3) - 1;
  }, [entry.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay, type: "spring", damping: 24, stiffness: 300 }}
      className={`lb-row${entry.isMe ? " me" : ""}`}
    >
      {/* Rank badge */}
      <div className="lb-rank-badge"
        style={{
          background: isTop ? `${color}18` : "var(--bg-surface)",
          color,
        }}>
        <span style={{ fontFamily: "var(--font-display)" }}>#{rank}</span>
      </div>

      {/* Avatar */}
      <div className="lb-avatar"
        style={{
          width: 36, height: 36, fontSize: 14, flexShrink: 0,
          background: entry.isMe ? "linear-gradient(135deg,#00C37A,#14b8a6)" : avatarGradient(avatarIdx),
          border: entry.isMe ? "2px solid var(--brand)" : "2px solid transparent",
          boxShadow: entry.isMe ? "var(--shadow-brand)" : "none",
        }}>
        {entry.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + sub */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: entry.isMe ? 800 : 600,
          color: entry.isMe ? "var(--brand)" : "var(--text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "var(--font-display)",
        }}>
          {entry.name}{entry.isMe ? " ✦" : ""}
        </p>
        {/* Delta indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          {delta > 0 && (
            <span className="delta-chip" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
              <ChevronUp size={10} strokeWidth={3} />{delta}
            </span>
          )}
          {delta < 0 && (
            <span className="delta-chip" style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444" }}>
              <ChevronDown size={10} strokeWidth={3} />{Math.abs(delta)}
            </span>
          )}
          {delta === 0 && !entry.isMe && (
            <span className="delta-chip" style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}>
              <Minus size={10} strokeWidth={3} />
            </span>
          )}
          {entry.isMe && (
            <span className="delta-chip" style={{ background: "var(--brand-mid)", color: "var(--brand)" }}>
              <Star size={9} strokeWidth={3} fill="currentColor" /> You
            </span>
          )}
        </div>
      </div>

      {/* Stat */}
      <span className="stat-pill"
        style={{
          background: entry.isMe ? "var(--brand-dim)" : isTop ? `${color}14` : "var(--bg-surface)",
          color: entry.isMe ? "var(--brand)" : isTop ? color : "var(--text-sec)",
        }}>
        {statVal(entry, tab)}
      </span>
    </motion.div>
  );
}

/* ─── MAIN ──────────────────────────────────────────────────── */
export  function Leaderboard() {
  const [tab, setTab] = useState("xp");

  const sorted = useMemo(() => {
    return [...SEED_ENTRIES].sort((a, b) =>
      tab === "xp" ? b.xp - a.xp
      : tab === "streak" ? b.streak - a.streak
      : b.weeklyXP - a.weeklyXP
    );
  }, [tab]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // build avatar index map (stable across re-sorts)
  const avatarMap = useMemo(() => {
    const map = {};
    SEED_ENTRIES.forEach((e, i) => { map[e.id] = i; });
    return map;
  }, []);

  const myRank = sorted.findIndex(e => e.isMe) + 1;

  return (
    <>
      <style>{STYLE_TAG}</style>
      <div className="lb-root">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Trophy size={22} color="#F59E0B" fill="#F59E0B33" />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              Leaderboard
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            You're ranked <strong style={{ color: "var(--brand)" }}>#{myRank}</strong> this week
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="lb-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`lb-tab${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}>
              <Icon size={13} strokeWidth={2.5} /> {label}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="lb-podium">
          {PODIUM_ORDER.map((entryIdx, pIdx) => (
            <PodiumCell
              key={pIdx}
              entry={top3[entryIdx]}
              position={entryIdx + 1}
              tabIdx={pIdx}
              tab={tab}
              avatarIdx={avatarMap[top3[entryIdx]?.id] ?? pIdx}
            />
          ))}
        </div>

        {/* Podium base line */}
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, var(--border), transparent)", borderRadius: 2, marginBottom: 20 }} />

        {/* Rest list */}
        <div className="lb-list">
          <div className="lb-section-header">Rankings</div>
          <AnimatePresence mode="popLayout">
            {rest.map((entry, idx) => (
              <LeaderRow
                key={entry.id}
                entry={entry}
                rank={idx + 4}
                tab={tab}
                avatarIdx={avatarMap[entry.id] ?? idx}
                delay={idx * 0.04}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Your rank callout (if outside top 3 visible area) */}
        {myRank > 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{
              marginTop: 14, padding: "12px 16px",
              background: "var(--brand-dim)", borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--brand-mid)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={15} color="var(--brand)" fill="rgba(0,195,122,0.2)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Your position</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--brand)", fontFamily: "var(--font-display)" }}>
              #{myRank}
            </span>
          </motion.div>
        )}
      </div>
    </>
  );
}