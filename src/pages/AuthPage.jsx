import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const fadeUp = (d = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: d, ease: [0.22, 1, 0.36, 1] },
})

/** Matches the exact visual style of the rest of Taskr. */
export function AuthPage() {
  const [mode,       setMode]       = useState('login')   // 'login' | 'register'
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [name,       setName]       = useState('')
  const [showPass,   setShowPass]   = useState(false)

  const { login, register, loginGoogle, loading, error, clearError } = useAuthStore()

  function switchMode(m) {
    setMode(m)
    clearError()
    setEmail(''); setPassword(''); setName('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'login') await login(email, password)
    else                  await register(email, password, name.trim())
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--bg-page)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '20px',
      fontFamily:      'var(--font-body)',
    }}>

      {/* Background glow */}
      <div style={{
        position:     'fixed',
        top:          '30%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        width:        600,
        height:       600,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div {...fadeUp()} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Card */}
        <div className="card" style={{
          padding:   'clamp(28px, 6vw, 40px)',
          boxShadow: 'var(--shadow-xl)',
        }}>

          {/* Logo */}
          <motion.div {...fadeUp(0.05)} style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              fontFamily:    'var(--font-display)',
              fontSize:      42,
              fontWeight:    800,
              letterSpacing: '-2px',
              color:         'var(--text-primary)',
              lineHeight:    1,
              marginBottom:  6,
            }}>
              Task<span style={{ color: 'var(--brand)' }}>r</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {mode === 'login' ? 'Welcome back — keep the streak alive 🔥' : 'Start your productivity journey 🚀'}
            </p>
          </motion.div>

          {/* Google OAuth button */}
          <motion.div {...fadeUp(0.08)}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loginGoogle}
              disabled={loading}
              style={{
                width:           '100%',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             10,
                padding:         '11px 0',
                borderRadius:    'var(--radius-md)',
                border:          '1.5px solid var(--border)',
                background:      'var(--bg-surface-2)',
                fontSize:        14,
                fontWeight:      600,
                color:           'var(--text-primary)',
                cursor:          loading ? 'not-allowed' : 'pointer',
                fontFamily:      'var(--font-body)',
                transition:      'all 0.15s',
                opacity:         loading ? 0.7 : 1,
              }}
            >
              {/* SVG Google logo (no third-party dep) */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div {...fadeUp(0.1)} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </motion.div>

          {/* Form */}
          <motion.form {...fadeUp(0.12)} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Name field — register only */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{   opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ position: 'relative', paddingTop: 2 }}>
                    <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-base"
                      style={{ paddingLeft: 36 }}
                      required
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-base"
                style={{ paddingLeft: 36 }}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Password (min. 6 characters)' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-base"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{   opacity: 0, y: -4 }}
                  style={{
                    background:   'rgba(244,63,94,0.08)',
                    border:       '1px solid rgba(244,63,94,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding:      '8px 12px',
                    fontSize:     12,
                    color:        '#f43f5e',
                    lineHeight:   1.5,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <SpinnerIcon />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Mode toggle */}
          <motion.p {...fadeUp(0.16)} style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20, marginBottom: 0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </motion.p>
        </div>

        {/* Tagline below card */}
        <motion.div {...fadeUp(0.22)} style={{ textAlign: 'center', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
          <Zap size={12} color="var(--brand)" />
          <span>Earn XP · Build Streaks · Climb Leaderboards</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin-slow 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
