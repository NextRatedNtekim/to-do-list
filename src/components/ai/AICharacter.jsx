/**
 * components/ai/AICharacter.jsx
 * Floating AI character anchored near bottom of Dashboard.
 * Tapping shows a "Coming Soon" modal.
 * All AI features are disabled — this is architecture-only.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AI_STATUS } from '@/services/ai'

// ── AI Orb ───────────────────────────────────────────────────
function AIOrb({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="ai-orb relative w-14 h-14 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 8px 32px rgba(167,139,250,0.2), 0 0 0 6px rgba(167,139,250,0.06)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Pulsing outer ring */}
      <div
        className="ai-orb-ring absolute inset-[-6px] rounded-full pointer-events-none"
        style={{
          border: '1px solid rgba(167,139,250,0.2)',
        }}
      />

      {/* Inner glow */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(167,139,250,0.5), transparent 70%)',
        }}
      />

      {/* AI symbol */}
      <span className="relative text-xl select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.8))' }}>
        ✦
      </span>

      {/* Beta badge */}
      <div
        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{
          background: 'rgba(167,139,250,0.2)',
          border: '1px solid rgba(167,139,250,0.3)',
          color: '#a78bfa',
        }}
      >
        AI
      </div>
    </motion.button>
  )
}

// ── Coming Soon Modal ─────────────────────────────────────────
function AiComingSoonModal({ onClose }) {
  const features = [
    { icon: '📅', text: 'AI scheduling assistant' },
    { icon: '🧭', text: 'Accountability coaching' },
    { icon: '⏰', text: 'Smart reminders' },
    { icon: '📊', text: 'Productivity insights' },
    { icon: '🔄', text: 'Routine optimization' },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow-lg)',
        }}
        initial={{ y: 60, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="text-4xl mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.6))' }}>
            ✦
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Features Coming Soon
          </h2>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {AI_STATUS.message}
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-2 mb-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.12)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))',
            border: '1px solid rgba(167,139,250,0.3)',
            color: '#a78bfa',
          }}
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────
export function AICharacter() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Floating orb — fixed, near bottom right */}
      <div className="fixed bottom-[88px] right-5 z-30">
        <AIOrb onClick={() => setModalOpen(true)} />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <AiComingSoonModal onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}