/**
 * LandingPage.jsx
 * Props:
 *   onGetStarted — called when user clicks Sign In / Get Started
 *   onPrivacy    — called when user clicks Privacy Policy
 */

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Zap, Trophy, Users, BarChart2, Bell, Moon,
  ArrowRight, Flame, ChevronDown, Star, Shield,
} from 'lucide-react'

const FEATURES = [
  { Icon: Zap,       title: 'XP & Levels',      desc: 'Every completed task earns experience points. Watch your level rise as real habits take hold.',          accent: '#22c55e' },
  { Icon: Trophy,    title: 'Leaderboards',      desc: 'Compete with friends or the global community. Healthy rivalry is the fastest productivity cheat code.',   accent: '#f59e0b' },
  { Icon: Users,     title: 'Partner Mode',      desc: 'Link with an accountability partner. See real-time progress and push each other to new highs.',            accent: '#3b82f6' },
  { Icon: BarChart2, title: 'Analytics',         desc: "Deep insight into your productivity patterns — know exactly when you're in the zone.",                    accent: '#8b5cf6' },
  { Icon: Bell,      title: 'Smart Alerts',      desc: 'Real-time notifications for XP milestones, partner check-ins, and level-up moments.',                     accent: '#f43f5e' },
  { Icon: Moon,      title: 'Dark by Default',   desc: 'Designed for focus. A clean, distraction-free UI that works as well at midnight as at noon.',              accent: '#22c55e' },
]

const STEPS = [
  { num: '01', title: 'Sign Up',   desc: 'Create a free account with Google or email — takes ten seconds.' },
  { num: '02', title: 'Add Tasks', desc: 'Drop in goals, daily tasks, or long-term projects. Tag and prioritise them.' },
  { num: '03', title: 'Earn XP',  desc: 'Complete tasks and watch the XP accumulate. Level up and unlock bragging rights.' },
  { num: '04', title: 'Compete',  desc: 'Climb the leaderboard, challenge a partner, and never look back.' },
]

const STATS = [
  { num: 'XP',  label: 'Earned per task' },
  { num: '∞',   label: 'Tasks you can track' },
  { num: '0',   label: 'Excuses accepted' },
]

const XP_CARDS = [
  { icon: <Zap  size={18} color="var(--brand)" />, val: '+50 XP', label: 'Task completed' },
  { icon: <Trophy size={18} color="#f59e0b" />,     val: '#1',     label: 'Leaderboard' },
  { icon: <Flame  size={18} color="#fb923c" />,     val: '7-Day',  label: 'Streak active' },
]

/* ─── animation helpers ─── */
const fadeUp   = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger  = (delay = 0) => ({ transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } })

function InView({ children, delay = 0, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── main component ─── */
export function LandingPage({ onGetStarted, onPrivacy }) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY   = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpa = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      background: 'var(--bg-page)',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
    }}>
      <style>{`
        /* ── nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 60;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(20px, 4vw, 48px); height: 60px;
          background: rgba(7,13,8,0.88); backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
        }
        .lp-logo { font-family: var(--font-display); font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: var(--text-primary); }
        .lp-logo span { color: var(--brand); }
        .lp-nav-links { display: flex; align-items: center; gap: 20px; }
        .lp-nav-link  { font-size: 13px; font-weight: 500; color: var(--text-muted); background: none; border: none; cursor: pointer; font-family: var(--font-body); transition: color .18s; text-decoration: none; }
        .lp-nav-link:hover { color: var(--text-primary); }
        .lp-btn-nav {
          background: var(--brand); color: #fff;
          padding: 8px 20px; border-radius: var(--radius-md);
          font-size: 13px; font-weight: 600; border: none; cursor: pointer;
          font-family: var(--font-body); transition: all .18s;
          box-shadow: var(--shadow-brand);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .lp-btn-nav:hover { background: var(--brand-hover); transform: translateY(-1px); }

        /* ── hero ── */
        .lp-hero {
          min-height: 100dvh; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 100px clamp(20px, 4vw, 80px) 80px; text-align: center;
        }

        /* ── animated orbs ── */
        @keyframes lp-drift-1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.06)} }
        @keyframes lp-drift-2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
        @keyframes lp-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)} }

        .lp-orb { position: absolute; border-radius: 50%; filter: blur(110px); pointer-events: none; }
        .lp-orb-1 { width: 560px; height: 560px; background: radial-gradient(circle, rgba(34,197,94,.18) 0%, transparent 70%); top: -180px; left: -140px; animation: lp-drift-1 18s ease-in-out infinite; }
        .lp-orb-2 { width: 440px; height: 440px; background: radial-gradient(circle, rgba(245,158,11,.1)  0%, transparent 70%); bottom: -100px; right: -100px; animation: lp-drift-2 22s ease-in-out infinite; }

        /* ── badge ── */
        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid var(--border); background: var(--brand-muted);
          padding: 5px 16px; border-radius: var(--radius-full);
          font-size: 12px; font-weight: 600; color: var(--brand); margin-bottom: 32px;
        }
        .lp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); animation: lp-pulse 2s ease-in-out infinite; }

        /* ── hero title ── */
        .lp-title {
          font-family: var(--font-display);
          font-size: clamp(52px, 11vw, 112px); font-weight: 800;
          line-height: .9; letter-spacing: -3px; color: var(--text-primary); margin-bottom: 24px;
        }
        .lp-title .accent { color: var(--brand); }
        .lp-title .dim    { color: var(--text-muted); }
        .lp-sub {
          font-size: clamp(14px, 2vw, 17px); color: var(--text-secondary);
          line-height: 1.75; max-width: 520px; margin: 0 auto 44px;
        }

        /* ── cta buttons ── */
        .lp-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .lp-btn-primary {
          background: var(--brand); color: #fff;
          padding: 14px 36px; border-radius: var(--radius-lg);
          font-size: 15px; font-weight: 700; border: none; cursor: pointer;
          box-shadow: var(--shadow-brand); transition: all .18s; font-family: var(--font-body);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .lp-btn-primary:hover { background: var(--brand-hover); transform: translateY(-2px); box-shadow: 0 10px 32px rgba(34,197,94,.42); }
        .lp-btn-outline {
          background: transparent; color: var(--text-secondary);
          padding: 14px 32px; border-radius: var(--radius-lg);
          font-size: 15px; font-weight: 600; cursor: pointer;
          border: 1.5px solid var(--border); transition: all .18s; font-family: var(--font-body);
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .lp-btn-outline:hover { border-color: var(--border-muted); color: var(--text-primary); background: var(--bg-surface-2); transform: translateY(-2px); }

        /* ── xp strip ── */
        .lp-xp-strip { margin-top: 64px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lp-xp-card  {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 14px 20px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: var(--shadow-sm); font-size: 13px; font-weight: 600; color: var(--text-secondary);
          transition: transform .2s, border-color .2s;
        }
        .lp-xp-card:hover { transform: translateY(-3px); border-color: var(--border-muted); }
        .lp-xp-val { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--brand); }

        /* ── stats strip ── */
        .lp-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .lp-stat { padding: 48px 24px; text-align: center; border-right: 1px solid var(--border); }
        .lp-stat:last-child { border-right: none; }
        .lp-stat-num   { font-family: var(--font-display); font-size: clamp(40px,6vw,64px); font-weight: 800; color: var(--brand); letter-spacing: -2px; display: block; line-height: 1; }
        .lp-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 6px; display: block; font-weight: 500; }

        /* ── section ── */
        .lp-section { padding: 96px clamp(20px, 4vw, 80px); max-width: 1160px; margin: 0 auto; }
        .lp-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: var(--brand); margin-bottom: 12px; }
        .lp-section-title { font-family: var(--font-display); font-size: clamp(32px,5vw,56px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.05; color: var(--text-primary); margin-bottom: 56px; }
        .lp-section-title span { color: var(--brand); }

        /* ── feature grid ── */
        .lp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        .lp-card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 28px 24px;
          position: relative; overflow: hidden;
          transition: transform .22s, box-shadow .22s, border-color .22s;
        }
        .lp-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--card-accent, var(--brand)), transparent);
          opacity: 0; transition: opacity .22s;
        }
        .lp-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--border-muted); }
        .lp-card:hover::before { opacity: 1; }
        .lp-card-icon-wrap {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          background: color-mix(in srgb, var(--card-accent, var(--brand)) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--card-accent, var(--brand)) 20%, transparent);
        }
        .lp-card-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary); }
        .lp-card-desc  { font-size: 13px; color: var(--text-muted); line-height: 1.8; }

        /* ── how it works ── */
        .lp-how { background: var(--bg-surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 96px clamp(20px,4vw,80px); }
        .lp-how-inner { max-width: 1160px; margin: 0 auto; }
        .lp-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin-top: 56px; position: relative; }
        .lp-steps::before {
          content: ''; position: absolute; top: 27px; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), var(--border), transparent);
        }
        .lp-step { padding: 0 16px; text-align: center; }
        .lp-step-num {
          width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--border);
          background: var(--bg-page); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 22px; position: relative; z-index: 1;
          font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--brand);
          transition: background .22s, border-color .22s, box-shadow .22s;
        }
        .lp-step:hover .lp-step-num {
          background: var(--brand-muted); border-color: var(--brand);
          box-shadow: 0 0 0 6px var(--brand-glow);
        }
        .lp-step-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
        .lp-step-desc  { font-size: 12px; color: var(--text-muted); line-height: 1.8; }

        /* ── cta ── */
        .lp-cta { padding: 120px clamp(20px,4vw,80px); text-align: center; position: relative; overflow: hidden; }
        .lp-cta-title { font-family: var(--font-display); font-size: clamp(44px,9vw,96px); font-weight: 800; letter-spacing: -3px; line-height: .92; color: var(--text-primary); margin-bottom: 28px; position: relative; z-index: 1; }
        .lp-cta-title span { color: var(--brand); }
        .lp-cta-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 40px; position: relative; z-index: 1; }

        /* ── footer ── */
        .lp-footer {
          border-top: 1px solid var(--border);
          padding: 36px clamp(20px, 4vw, 48px);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px; background: var(--bg-surface);
        }
        .lp-footer-brand { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .lp-footer-brand span { color: var(--brand); }
        .lp-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .lp-footer-link {
          font-size: 12px; color: var(--text-muted); background: none; border: none;
          cursor: pointer; font-weight: 500; font-family: var(--font-body);
          transition: color .18s; text-decoration: none;
        }
        .lp-footer-link:hover { color: var(--text-primary); }
        .lp-footer-copy { width: 100%; text-align: center; font-size: 11px; color: var(--text-faint); padding-top: 20px; border-top: 1px solid var(--border); margin-top: 8px; }

        /* ── scroll indicator ── */
        @keyframes lp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .lp-scroll-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted); font-size: 11px; font-weight: 500; animation: lp-bounce 2s ease-in-out infinite; letter-spacing: .06em; text-transform: uppercase; }

        /* ── responsive ── */
        @media (max-width: 900px) { .lp-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 768px) {
          .lp-steps { grid-template-columns: repeat(2,1fr); gap: 32px; }
          .lp-steps::before { display: none; }
        }
        @media (max-width: 600px) {
          .lp-nav-link:not(.lp-btn-nav) { display: none; }
          .lp-stats { grid-template-columns: 1fr; }
          .lp-stat  { border-right: none; border-bottom: 1px solid var(--border); }
          .lp-stat:last-child { border-bottom: none; }
        }
        @media (max-width: 560px) {
          .lp-grid  { grid-template-columns: 1fr; }
          .lp-steps { grid-template-columns: 1fr; }
        }
        @media (max-width: 440px) {
          .lp-btn-primary, .lp-btn-outline { width: 100%; justify-content: center; }
          .lp-actions { flex-direction: column; align-items: stretch; padding: 0 8px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <motion.nav
        className="lp-nav"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="lp-logo">Taskr<span>.</span></div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how"      className="lp-nav-link">How it works</a>
          <button className="lp-nav-link" onClick={onPrivacy}>Privacy</button>
          <button className="lp-btn-nav" onClick={onGetStarted}>
            Sign In <ArrowRight size={13} />
          </button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />

        <motion.div
          style={{ position: 'relative', zIndex: 1, maxWidth: 800, width: '100%', y: heroY, opacity: heroOpa }}
        >
          <motion.div className="lp-badge" variants={fadeUp} initial="hidden" animate="show" {...stagger(0.05)}>
            <div className="lp-badge-dot" />
            Launching June 7, 2026
          </motion.div>

          <motion.h1 className="lp-title" variants={fadeUp} initial="hidden" animate="show" {...stagger(0.12)}>
            BEAT<br /><span className="accent">YOUR</span><br /><span className="dim">DAY.</span>
          </motion.h1>

          <motion.p className="lp-sub" variants={fadeUp} initial="hidden" animate="show" {...stagger(0.22)}>
            Taskr turns your to-do list into a game. Complete tasks, earn XP, level up, and compete with friends on the leaderboard.
          </motion.p>

          <motion.div className="lp-actions" variants={fadeUp} initial="hidden" animate="show" {...stagger(0.32)}>
            <button className="lp-btn-primary" onClick={onGetStarted}>
              Get Started — Free <Zap size={15} />
            </button>
            <a href="#features" className="lp-btn-outline">
              See How It Works <ChevronDown size={15} />
            </a>
          </motion.div>

          <motion.div className="lp-xp-strip" variants={fadeUp} initial="hidden" animate="show" {...stagger(0.45)}>
            {XP_CARDS.map(({ icon, val, label }) => (
              <div className="lp-xp-card" key={label}>
                {icon}
                <div>
                  <div className="lp-xp-val">{val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="lp-scroll-hint">
          <ChevronDown size={16} />
          scroll
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="lp-stats">
        {STATS.map(({ num, label }, i) => (
          <InView key={label} delay={i * 0.1}>
            <div className="lp-stat">
              <span className="lp-stat-num">{num}</span>
              <span className="lp-stat-label">{label}</span>
            </div>
          </InView>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <InView>
          <p className="lp-eyebrow">What you get</p>
          <h2 className="lp-section-title">Built for <span>doers</span></h2>
        </InView>
        <div className="lp-grid">
          {FEATURES.map((f, i) => (
            <InView key={f.title} delay={i * 0.07}>
              <div className="lp-card" style={{ '--card-accent': f.accent }}>
                <div className="lp-card-icon-wrap" style={{ '--card-accent': f.accent }}>
                  <f.Icon size={20} color={f.accent} strokeWidth={1.8} />
                </div>
                <h3 className="lp-card-title">{f.title}</h3>
                <p className="lp-card-desc">{f.desc}</p>
              </div>
            </InView>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="lp-how" id="how">
        <div className="lp-how-inner">
          <InView>
            <p className="lp-eyebrow">The flow</p>
            <h2 className="lp-section-title">How <span>Taskr</span> works</h2>
          </InView>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <InView key={s.num} delay={i * 0.1}>
                <div className="lp-step">
                  <div className="lp-step-num">{s.num}</div>
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-desc">{s.desc}</p>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-orb lp-orb-1" style={{ opacity: .5 }} />
        <InView>
          <h2 className="lp-cta-title">Ready to<br /><span>Level Up?</span></h2>
          <p className="lp-cta-sub">Join the waitlist. Launching June 7, 2026.</p>
          <button
            className="lp-btn-primary"
            onClick={onGetStarted}
            style={{ fontSize: 16, padding: '16px 48px', position: 'relative', zIndex: 1 }}
          >
            Create Your Free Account <ArrowRight size={17} />
          </button>
        </InView>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">Taskr<span>.</span></div>
        <div className="lp-footer-links">
          <a href="#features" className="lp-footer-link">Features</a>
          <a href="#how"      className="lp-footer-link">How it works</a>
          <button className="lp-footer-link" onClick={onPrivacy}>Privacy Policy</button>
        </div>
        <p className="lp-footer-copy">© 2026 Taskr. All rights reserved.</p>
      </footer>
    </div>
  )
}