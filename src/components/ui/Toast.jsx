import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X, Star } from 'lucide-react'
import { useUIStore } from '@/store'

const CONFIG = {
  success:   { bg: '#f0fdf4', border: '#86efac', text: '#14532d', Icon: CheckCircle, iconColor: '#22c55e' },
  error:     { bg: '#fff1f2', border: '#fda4af', text: '#881337', Icon: AlertCircle, iconColor: '#f43f5e' },
  info:      { bg: 'var(--bg-surface)', border: 'var(--border)', text: 'var(--text-primary)', Icon: Info, iconColor: '#64748b' },
  milestone: { bg: '#fffbeb', border: '#fde68a', text: '#78350f', Icon: Star, iconColor: '#f59e0b' },
}

export function ToastContainer() {
  const { toast, dismissToast } = useUIStore()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 36, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{   opacity: 0, y: 18, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{ position: 'fixed', bottom: 'clamp(20px,4vw,28px)', left: '50%', transform: 'translateX(-50%)', zIndex: 9998, maxWidth: 'min(380px, calc(100vw - 32px))', width: '100%' }}
        >
          {(() => {
            const c = CONFIG[toast.type] || CONFIG.info
            return (
              <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 14, padding: '10px 14px 10px 14px', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 9, boxShadow: 'var(--shadow-lg)' }}>
                <c.Icon size={15} color={c.iconColor} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.msg}</span>
                <button onClick={dismissToast} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.45, padding: 0, display: 'flex', alignItems: 'center', marginLeft: 2, flexShrink: 0 }}>
                  <X size={13} />
                </button>
              </div>
            )
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
