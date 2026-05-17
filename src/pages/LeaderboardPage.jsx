import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Leaderboard } from '@/components/gamification/Leaderboard'

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, delay: d, ease: [0.22,1,0.36,1] } })

export function LeaderboardPage() {
  return (
    <div>
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={28} color="#f59e0b" strokeWidth={2} /> Leaderboard
        </h1>
        <p className="page-subtitle">Compete with others — climb the ranks</p>
      </motion.div>
      <motion.div {...fadeUp(0.08)}>
        <Leaderboard />
      </motion.div>
    </div>
  )
}
