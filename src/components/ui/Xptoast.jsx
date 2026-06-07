// src/components/XPToast.jsx
// Floating "+50 XP" toast that appears on task completion.
// USAGE:
//   const [xpToast, setXpToast] = useState(null);
//   // On task complete:
//   setXpToast({ xp: 50, key: Date.now() });
//   setTimeout(() => setXpToast(null), 2200);
//   // In JSX:
//   <XPToast xp={xpToast?.xp} visible={!!xpToast} />

import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function XPToast({ xp, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.75 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -24, scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200]
            flex items-center gap-2 px-5 py-2.5 rounded-full
            font-bold text-base text-white whitespace-nowrap pointer-events-none"
          style={{
            background:  'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow:   '0 8px 32px rgba(22,163,74,0.5)',
          }}
        >
          <Zap size={16} fill="white" color="white" />
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}