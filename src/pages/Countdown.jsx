
import { useEffect, useState, useRef } from 'react'

// ── LAUNCH DATE: Saturday, June 3, 2026 ──────────────────────────────────────
const LAUNCH_DATE = new Date('2026-06-07T20:30:00')
// ─────────────────────────────────────────────────────────────────────────────

function getTimeLeft() {
  const diff = LAUNCH_DATE - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export function CountdownPage({ onLaunch, userName }) {
  const [timeLeft, setTimeLeft]   = useState(getTimeLeft)
  const [launched, setLaunched]   = useState(false)
  const [visible, setVisible]     = useState(false)
  const intervalRef               = useRef(null)

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Tick every second
  useEffect(() => {
    if (timeLeft === null) {
      handleLaunch()
      return
    }
    intervalRef.current = setInterval(() => {
      const t = getTimeLeft()
      if (!t) { handleLaunch(); return }
      setTimeLeft(t)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  function handleLaunch() {
    clearInterval(intervalRef.current)
    setLaunched(true)
    setTimeLeft(null)
    // brief flash before handing over to the main app
    setTimeout(() => onLaunch?.(), 1200)
  }

  const units = timeLeft
    ? [
        { label: 'DAYS',    value: timeLeft.days    },
        { label: 'HOURS',   value: timeLeft.hours   },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds },
      ]
    : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cdp-root {
          --bg:        #060609;
          --surface:   #0e0e14;
          --border:    rgba(255,255,255,0.07);
          --accent:    #e8ff47;
          --accent2:   #ff4d6d;
          --text:      #e8e8f0;
          --muted:     rgba(232,232,240,0.35);
          --radius:    4px;
          --mono:      'DM Mono', monospace;
          --display:   'Bebas Neue', sans-serif;

          min-height: 100dvh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--mono);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.9s ease;
        }

        .cdp-root.visible { opacity: 1; }
        .cdp-root.launched { opacity: 0; transition: opacity 0.7s ease; }

        /* ── scanline texture ── */
        .cdp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.18) 3px,
            rgba(0,0,0,0.18) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* ── glow orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
          animation: drift 14s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(232,255,71,0.12) 0%, transparent 70%);
          top: -120px; left: -100px;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,77,109,0.1) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation-delay: -7s;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }

        /* ── layout ── */
        .cdp-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          padding: 40px 24px;
          max-width: 780px;
          width: 100%;
          text-align: center;
        }

        /* ── top badge ── */
        .cdp-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: var(--muted);
          text-transform: uppercase;
        }
        .cdp-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── headline ── */
        .cdp-headline {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cdp-greeting {
          font-size: 13px;
          letter-spacing: 0.15em;
          color: var(--muted);
          text-transform: uppercase;
        }
        .cdp-title {
          font-family: var(--display);
          font-size: clamp(52px, 10vw, 96px);
          line-height: 0.92;
          letter-spacing: 0.02em;
          color: var(--text);
        }
        .cdp-title span { color: var(--accent); }
        .cdp-sub {
          font-size: 13px;
          color: var(--muted);
          letter-spacing: 0.08em;
          margin-top: 8px;
          line-height: 1.7;
          max-width: 480px;
          margin-inline: auto;
        }

        /* ── countdown grid ── */
        .cdp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }
        @media (max-width: 480px) {
          .cdp-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .cdp-unit {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px 12px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .cdp-unit::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .cdp-unit:hover { border-color: rgba(232,255,71,0.25); }
        .cdp-unit:hover::after { opacity: 1; }

        .cdp-num {
          font-family: var(--display);
          font-size: clamp(48px, 8vw, 80px);
          line-height: 1;
          color: var(--text);
          letter-spacing: 0.04em;
          transition: color 0.15s ease;
        }
        .cdp-num.tick {
          color: var(--accent);
        }
        .cdp-label {
          font-size: 9px;
          letter-spacing: 0.25em;
          color: var(--muted);
          text-transform: uppercase;
        }

        /* ── separator dots ── */
        .cdp-sep {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
          justify-content: center;
          padding-bottom: 28px;
          opacity: 0.3;
        }
        .cdp-sep span {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--text);
          animation: blink 1s step-end infinite;
        }
        .cdp-sep span:last-child { animation-delay: 0.5s; }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* ── bottom note ── */
        .cdp-footer {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.1em;
          border-top: 1px solid var(--border);
          padding-top: 24px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cdp-footer-brand {
          font-family: var(--display);
          font-size: 18px;
          letter-spacing: 0.12em;
          color: var(--text);
        }
        .cdp-footer-brand span { color: var(--accent); }

        /* ── launched state ── */
        .cdp-launch-msg {
          font-family: var(--display);
          font-size: clamp(36px, 8vw, 72px);
          letter-spacing: 0.06em;
          color: var(--accent);
          animation: launch-flash 0.4s ease-in-out 2;
        }
        @keyframes launch-flash {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      <div className={`cdp-root${visible ? ' visible' : ''}${launched ? ' launched' : ''}`}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="cdp-inner">

          {/* Badge */}
          <div className="cdp-badge">
            <div className="cdp-badge-dot" />
            You're in — launching soon
          </div>

          {/* Headline */}
          <div className="cdp-headline">
            {userName && (
              <p className="cdp-greeting">Welcome, {userName}</p>
            )}
            {launched ? (
              <p className="cdp-launch-msg">WE'RE LIVE</p>
            ) : (
              <>
                <h1 className="cdp-title">
                  TASK<span>R</span><br />IS COMING
                </h1>
                <p className="cdp-sub">
                  Something powerful is almost ready.
                  Your account is set up and waiting.
                  Check back when the clock runs out.
                </p>
              </>
            )}
          </div>

          {/* Countdown grid */}
          {!launched && timeLeft && (
            <div className="cdp-grid">
              {units.map(({ label, value }) => (
                <CountUnit key={label} label={label} value={value} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="cdp-footer">
            <span className="cdp-footer-brand">TASK<span>R</span></span>
            <span>Your account is active &amp; ready</span>
          </div>

        </div>
      </div>
    </>
  )
}

// Individual animated unit
function CountUnit({ label, value }) {
  const [tick, setTick] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value
      setTick(true)
      const t = setTimeout(() => setTick(false), 180)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className="cdp-unit">
      <div className={`cdp-num${tick ? ' tick' : ''}`}>{pad(value)}</div>
      <div className="cdp-label">{label}</div>
    </div>
  )
}

// Export the launch date so App.jsx can check it on load
export { LAUNCH_DATE }