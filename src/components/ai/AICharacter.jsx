// /**
//  * components/ai/AICharacter.jsx
//  * Floating AI character anchored near bottom of Dashboard.
//  * Tapping shows a "Coming Soon" modal.
//  * All AI features are disabled — this is architecture-only.
//  */

// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { AI_STATUS } from '@/services/ai'

// // ── AI Orb ───────────────────────────────────────────────────
// function AIOrb({ onClick }) {
//   return (
//     <motion.button
//       onClick={onClick}
//       className="ai-orb relative w-14 h-14 rounded-full flex items-center justify-center"
//       style={{
//         background: 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))',
//         backdropFilter: 'blur(16px)',
//         border: '1px solid rgba(167,139,250,0.3)',
//         boxShadow: '0 8px 32px rgba(167,139,250,0.2), 0 0 0 6px rgba(167,139,250,0.06)',
//       }}
//       whileHover={{ scale: 1.1 }}
//       whileTap={{ scale: 0.92 }}
//     >
//       {/* Pulsing outer ring */}
//       <div
//         className="ai-orb-ring absolute inset-[-6px] rounded-full pointer-events-none"
//         style={{
//           border: '1px solid rgba(167,139,250,0.2)',
//         }}
//       />

//       {/* Inner glow */}
//       <div
//         className="absolute inset-2 rounded-full"
//         style={{
//           background: 'radial-gradient(circle at 40% 40%, rgba(167,139,250,0.5), transparent 70%)',
//         }}
//       />

//       {/* AI symbol */}
//       <span className="relative text-xl select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.8))' }}>
//         ✦
//       </span>

//       {/* Beta badge */}
//       <div
//         className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
//         style={{
//           background: 'rgba(167,139,250,0.2)',
//           border: '1px solid rgba(167,139,250,0.3)',
//           color: '#a78bfa',
//         }}
//       >
//         AI
//       </div>
//     </motion.button>
//   )
// }

// // ── Coming Soon Modal ─────────────────────────────────────────
// function AiComingSoonModal({ onClose }) {
//   const features = [
//     { icon: '📅', text: 'AI scheduling assistant' },
//     { icon: '🧭', text: 'Accountability coaching' },
//     { icon: '⏰', text: 'Smart reminders' },
//     { icon: '📊', text: 'Productivity insights' },
//     { icon: '🔄', text: 'Routine optimization' },
//   ]

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 flex items-end justify-center p-4"
//       style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="w-full max-w-sm rounded-3xl p-6"
//         style={{
//           background: 'var(--bg-elevated)',
//           border: '1px solid var(--glass-border)',
//           boxShadow: 'var(--glass-shadow-lg)',
//         }}
//         initial={{ y: 60, scale: 0.95 }}
//         animate={{ y: 0, scale: 1 }}
//         exit={{ y: 60, opacity: 0 }}
//         transition={{ type: 'spring', stiffness: 300, damping: 28 }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex flex-col items-center text-center mb-5">
//           <div className="text-4xl mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.6))' }}>
//             ✦
//           </div>
//           <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
//             AI Features Coming Soon
//           </h2>
//           <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
//             {AI_STATUS.message}
//           </p>
//         </div>

//         {/* Feature list */}
//         <div className="space-y-2 mb-6">
//           {features.map((f, i) => (
//             <motion.div
//               key={i}
//               className="flex items-center gap-3 p-3 rounded-xl"
//               style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.12)' }}
//               initial={{ opacity: 0, x: -8 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: i * 0.06 }}
//             >
//               <span className="text-lg">{f.icon}</span>
//               <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
//                 {f.text}
//               </span>
//             </motion.div>
//           ))}
//         </div>

//         {/* CTA */}
//         <button
//           onClick={onClose}
//           className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
//           style={{
//             background: 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))',
//             border: '1px solid rgba(167,139,250,0.3)',
//             color: '#a78bfa',
//           }}
//         >
//           Got it
//         </button>
//       </motion.div>
//     </motion.div>
//   )
// }

// // ── Main export ───────────────────────────────────────────────
// export function AICharacter() {
//   const [modalOpen, setModalOpen] = useState(false)

//   return (
//     <>
//       {/* Floating orb — fixed, near bottom right */}
//       <div className="fixed bottom-[88px] right-5 z-30">
//         <AIOrb onClick={() => setModalOpen(true)} />
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {modalOpen && (
//           <AiComingSoonModal onClose={() => setModalOpen(false)} />
//         )}
//       </AnimatePresence>
//     </>
//   )
// }


/**
 * components/ai/AICharacter.jsx
 * Floating AI orb → side drawer (slides in from right).
 * All AI features are Coming Soon — architecture only.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  CalendarClock,
  BrainCircuit,
  BellRing,
  BarChart3,
  RefreshCcw,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { AI_STATUS } from '@/services/ai'

// ── Constants ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: CalendarClock,
    label: 'AI scheduling assistant',
    desc: 'Automatically plan your day around your energy and priorities.',
  },
  {
    icon: BrainCircuit,
    label: 'Accountability coaching',
    desc: 'Stay on track with an AI that keeps you honest and motivated.',
  },
  {
    icon: BellRing,
    label: 'Smart reminders',
    desc: 'Context-aware nudges that know when you actually need them.',
  },
  {
    icon: BarChart3,
    label: 'Productivity insights',
    desc: 'Understand your focus patterns and what blocks your progress.',
  },
  {
    icon: RefreshCcw,
    label: 'Routine optimization',
    desc: 'Evolving routines that adapt to how your week actually goes.',
  },
]

// ── Orb pulse ring ─────────────────────────────────────────────
function PulseRing() {
  return (
    <motion.span
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ border: '1.5px solid rgba(167,139,250,0.35)' }}
      animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

// ── AI Orb ─────────────────────────────────────────────────────
function AIOrb({ onClick, isOpen }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Open AI features"
      className="relative w-14 h-14 rounded-full flex items-center justify-center focus-visible:outline-none"
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, rgba(167,139,250,0.5), rgba(96,165,250,0.35))'
          : 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(96,165,250,0.14))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(167,139,250,0.28)',
        boxShadow: isOpen
          ? '0 0 0 6px rgba(167,139,250,0.12), 0 8px 28px rgba(167,139,250,0.28)'
          : '0 0 0 6px rgba(167,139,250,0.07), 0 6px 20px rgba(167,139,250,0.16)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <PulseRing />

      {/* Inner radial glow */}
      <span
        className="absolute inset-2 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 38% 38%, rgba(167,139,250,0.45), transparent 68%)',
        }}
      />

      {/* Icon */}
      <motion.span
        className="relative"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Sparkles
          size={22}
          strokeWidth={1.8}
          style={{ color: '#c4b5fd', filter: 'drop-shadow(0 0 5px rgba(167,139,250,0.7))' }}
        />
      </motion.span>

      {/* AI badge */}
      <span
        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none"
        style={{
          background: 'rgba(167,139,250,0.18)',
          border: '1px solid rgba(167,139,250,0.32)',
          color: '#a78bfa',
          letterSpacing: '0.04em',
        }}
      >
        AI
      </span>
    </motion.button>
  )
}

// ── Feature row ────────────────────────────────────────────────
function FeatureRow({ icon: Icon, label, desc, index }) {
  return (
    <motion.div
      className="flex items-start gap-3.5 p-3.5 rounded-2xl"
      style={{
        background: 'rgba(167,139,250,0.06)',
        border: '1px solid rgba(167,139,250,0.11)',
      }}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.18 + index * 0.07, ease: [0.34, 1.56, 0.64, 1], duration: 0.45 }}
    >
      <span
        className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(167,139,250,0.13)',
          border: '1px solid rgba(167,139,250,0.2)',
        }}
      >
        <Icon size={16} strokeWidth={1.7} style={{ color: '#a78bfa' }} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {desc}
        </p>
      </div>

      <ChevronRight size={14} strokeWidth={2} style={{ color: 'rgba(167,139,250,0.4)', marginTop: 4, flexShrink: 0 }} />
    </motion.div>
  )
}

// ── Side Drawer ────────────────────────────────────────────────
function AIDrawer({ onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="AI features"
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(380px, 100vw)',
          background: 'var(--bg-elevated, var(--bg-surface))',
          borderLeft: '1px solid var(--glass-card-border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-start justify-between px-5 pt-6 pb-4 flex-shrink-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(96,165,250,0.12))',
                border: '1px solid rgba(167,139,250,0.24)',
              }}
            >
              <Sparkles size={18} strokeWidth={1.7} style={{ color: '#c4b5fd' }} />
            </span>
            <div>
              <h2
                className="text-base font-bold leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}
              >
                AI Assistant
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {AI_STATUS?.message ?? 'Launching soon'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="btn-icon flex-shrink-0 mt-0.5"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </motion.div>

        {/* Hero banner */}
        <motion.div
          className="mx-4 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(96,165,250,0.08) 100%)',
            border: '1px solid rgba(167,139,250,0.18)',
            padding: '18px 20px',
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} strokeWidth={2} style={{ color: '#a78bfa' }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#a78bfa' }}
            >
              Coming soon
            </span>
          </div>
          <p
            className="text-sm font-semibold leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Your personal productivity intelligence — always one tap away.
          </p>
        </motion.div>

        {/* Feature list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">
          <p
            className="section-label mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            What's coming
          </p>

          <div className="flex flex-col gap-2.5">
            {FEATURES.map((f, i) => (
              <FeatureRow key={f.label} {...f} index={i} />
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          className="px-4 pt-3 pb-5 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(96,165,250,0.1))',
              border: '1px solid rgba(167,139,250,0.28)',
              color: '#a78bfa',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Sparkles size={15} strokeWidth={1.8} />
            Notify me when it launches
          </button>
        </motion.div>
      </motion.aside>
    </>
  )
}

// ── Main export ────────────────────────────────────────────────
export function AICharacter() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Floating orb */}
      <div className="fixed bottom-[88px] right-5 z-30">
        <AIOrb onClick={() => setDrawerOpen(true)} isOpen={drawerOpen} />
      </div>

      {/* Side drawer */}
      <AnimatePresence>
        {drawerOpen && <AIDrawer onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>
    </>
  )
}