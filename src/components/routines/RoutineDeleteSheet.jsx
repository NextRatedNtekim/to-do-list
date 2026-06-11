// /**
//  * components/routines/RoutineDeleteSheet.jsx
//  * Confirmation sheet before deleting a routine.
//  */

// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// export function RoutineDeleteSheet({ routine, onConfirm, onCancel }) {
//   const [deleting, setDeleting] = useState(false)

//   async function handleConfirm() {
//     setDeleting(true)
//     try {
//       await onConfirm(routine.id)
//     } finally {
//       setDeleting(false)
//     }
//   }

//   return (
//     <AnimatePresence>
//       {routine && (
//         <>
//           <motion.div
//             className="fixed inset-0 z-40"
//             style={{ background: 'rgba(0,0,0,0.5)' }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onCancel}
//           />
//           <motion.div
//             className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
//             style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--glass-border)' }}
//             initial={{ y: '100%' }}
//             animate={{ y: 0 }}
//             exit={{ y: '100%' }}
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//           >
//             <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.18)' }} />

//             <div className="text-center mb-6">
//               <div className="text-3xl mb-3">{routine.icon ?? '🔄'}</div>
//               <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
//                 Delete "{routine.title}"?
//               </h3>
//               <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
//                 This will permanently delete this routine and all its completion history. This cannot be undone.
//               </p>
//             </div>

//             <div className="space-y-3">
//               <button
//                 onClick={handleConfirm}
//                 disabled={deleting}
//                 className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
//                 style={{
//                   background: 'rgba(248,113,113,0.15)',
//                   border:     '1px solid rgba(248,113,113,0.25)',
//                   color:      '#f87171',
//                   opacity:    deleting ? 0.6 : 1,
//                 }}
//               >
//                 {deleting ? 'Deleting…' : 'Delete Routine'}
//               </button>
//               <button
//                 onClick={onCancel}
//                 className="w-full py-3.5 rounded-2xl text-sm font-bold"
//                 style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
//               >
//                 Cancel
//               </button>
//             </div>
//             <div className="h-4" />
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   )
// }

/**
 * src/components/routines/RoutineDeleteSheet.jsx
 * Fixed: CSS vars from globals.css, Lucide icons, theme-aware
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export function RoutineDeleteSheet({ routine, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try { await onConfirm(routine.id) }
    finally { setDeleting(false) }
  }

  return (
    <AnimatePresence>
      {routine && (
        <>
          <motion.div
            style={{ position:'fixed',inset:0,zIndex:410,background:'rgba(0,0,0,0.5)' }}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onCancel}
          />
          <motion.div
            style={{
              position:'fixed',bottom:0,left:0,right:0,zIndex:411,
              borderRadius:'var(--radius-2xl) var(--radius-2xl) 0 0',
              background:'var(--bg-surface)',
              border:'1px solid var(--border)',borderBottom:'none',
              padding:'20px 20px 32px',
              boxShadow:'var(--shadow-xl)',
            }}
            initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',stiffness:300,damping:30}}
          >
            <div style={{ width:40,height:4,borderRadius:99,background:'var(--border-strong)',margin:'0 auto 20px' }} />
            <div style={{ textAlign:'center',marginBottom:24 }}>
              <div style={{ fontSize:36,marginBottom:10 }}>{routine.icon ?? '🔄'}</div>
              <h3 style={{ margin:'0 0 8px',fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,color:'var(--text-primary)' }}>
                Delete "{routine.title}"?
              </h3>
              <p style={{ margin:0,fontSize:13,color:'var(--text-muted)',fontFamily:'var(--font-body)',lineHeight:1.6 }}>
                This will permanently delete this routine and all its completion history. This cannot be undone.
              </p>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <motion.button
                whileTap={{scale:0.97}}
                onClick={handleConfirm}
                disabled={deleting}
                style={{
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  padding:'13px',borderRadius:'var(--radius-lg)',cursor:deleting?'not-allowed':'pointer',
                  background:'rgba(239,68,68,0.1)',border:'1.5px solid rgba(239,68,68,0.25)',
                  color:'var(--priority-urgent)',fontFamily:'var(--font-body)',fontSize:14,fontWeight:700,
                  opacity:deleting?0.6:1,
                }}
              >
                <Trash2 size={15} />
                {deleting ? 'Deleting…' : 'Delete Routine'}
              </motion.button>
              <button
                onClick={onCancel}
                style={{ padding:'13px',borderRadius:'var(--radius-lg)',cursor:'pointer',background:'var(--bg-surface-2)',border:'1px solid var(--border)',color:'var(--text-secondary)',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600 }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}