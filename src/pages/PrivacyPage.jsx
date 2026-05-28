/**
 * PrivacyPage.jsx
 * Props:
 *   onBack — called when user clicks "Back to home"
 */

const SECTIONS = [
  { title:'Overview', content:`Taskr ("we", "us", or "our") is a gamified productivity application that helps users track tasks, earn XP, and compete on leaderboards. This Privacy Policy explains what personal information we collect, how we use it, and your rights over your data. By using Taskr, you agree to the collection and use of information described here.` },
  { title:'Information We Collect', bullets:['Account information — your name and email address, provided when you sign up via Google OAuth or email/password.','Task data — the tasks, notes, and project details you create inside the app.','Usage data — XP earned, levels achieved, and leaderboard activity.','Partner data — activity shared with any accountability partner you connect with.','Device & log data — browser type, IP address, and timestamps for security and debugging.'] },
  { title:'How We Use Your Information', bullets:['To authenticate your account and keep it secure.','To save, sync, and display your tasks and progress across devices.','To calculate and display XP, levels, and leaderboard rankings.','To enable Partner Mode if you choose to use it.','To send in-app notifications about your activity and partner milestones.','To diagnose errors and improve app performance.'], highlight:'We do not sell, rent, or share your personal data with third parties for advertising or marketing purposes. Ever.' },
  { title:'Google OAuth & Third-Party Sign-In', content:`If you sign in using Google, we receive your name and email address as permitted by your Google account settings. We do not receive your Google password. Your use of Google Sign-In is also governed by Google's Privacy Policy (https://policies.google.com/privacy).` },
  { title:'Data Storage & Security', content:`Your data is stored securely using Supabase, a managed database platform with industry-standard encryption at rest and in transit (TLS). No method of transmission over the internet is 100% secure, but we take all reasonable measures to protect your information.` },
  { title:'Data Retention', content:`We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where required by law.` },
  { title:'Your Rights', bullets:['Access — request a copy of the data we hold about you.','Correction — ask us to fix inaccurate data.','Deletion — request that we delete your account and data.','Portability — request your data in a machine-readable format.','Objection — object to certain uses of your data.'], content:'To exercise any of these rights, contact: privacy@taskr-liard.vercel.app' },
  { title:"Children's Privacy", content:`Taskr is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with data, contact us and we will delete it promptly.` },
  { title:'Changes to This Policy', content:`We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Taskr after changes are posted constitutes your acceptance.` },
  { title:'Contact Us', content:'If you have questions about this Privacy Policy, please reach out:', contactBox: true },
]

export function PrivacyPage({ onBack }) {
  return (
    <div style={{ fontFamily:'var(--font-body)', background:'var(--bg-page)', color:'var(--text-primary)', minHeight:'100vh' }}>
      <style>{`
        .pp-nav { position:sticky; top:0; z-index:60; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(20px,4vw,48px); height:60px; background:rgba(7,13,8,0.9); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); }
        .pp-logo { font-family:var(--font-display); font-size:22px; font-weight:800; letter-spacing:-.5px; color:var(--text-primary); }
        .pp-logo span { color:var(--brand); }
        .pp-back { font-size:13px; font-weight:500; color:var(--text-muted); background:none; border:none; cursor:pointer; font-family:var(--font-body); transition:color .18s; display:flex; align-items:center; gap:6px; }
        .pp-back:hover { color:var(--text-primary); }
        .pp-wrap { max-width:760px; margin:0 auto; padding:72px clamp(20px,4vw,48px) 120px; }
        .pp-eyebrow { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--brand); margin-bottom:10px; }
        .pp-title { font-family:var(--font-display); font-size:clamp(44px,8vw,72px); font-weight:800; letter-spacing:-2px; line-height:.92; color:var(--text-primary); margin-bottom:10px; }
        .pp-meta { font-size:12px; color:var(--text-muted); padding-bottom:40px; border-bottom:1px solid var(--border); margin-bottom:56px; }
        .pp-section { margin-bottom:48px; }
        .pp-section-title { font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--text-primary); margin-bottom:14px; display:flex; align-items:center; gap:12px; }
        .pp-section-title::before { content:''; display:inline-block; width:4px; height:20px; background:var(--brand); border-radius:2px; flex-shrink:0; }
        .pp-text { font-size:13px; color:var(--text-muted); line-height:1.9; }
        .pp-list { list-style:none; margin:12px 0 0; padding:0; }
        .pp-list li { font-size:13px; color:var(--text-muted); line-height:1.8; padding:6px 0 6px 20px; position:relative; }
        .pp-list li::before { content:'—'; position:absolute; left:0; color:var(--brand); opacity:.6; }
        .pp-highlight { background:var(--bg-surface); border:1px solid var(--border); border-left:3px solid var(--brand); padding:18px 22px; border-radius:var(--radius-md); margin-top:16px; font-size:13px; color:var(--text-secondary); line-height:1.8; font-weight:500; }
        .pp-contact-box { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:22px 24px; margin-top:16px; display:flex; flex-direction:column; gap:10px; }
        .pp-contact-row { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-muted); }
        .pp-contact-link { color:var(--brand); text-decoration:none; font-weight:500; }
        .pp-contact-link:hover { text-decoration:underline; }
        .pp-footer { border-top:1px solid var(--border); padding:28px clamp(20px,4vw,48px); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:var(--bg-surface); }
        .pp-footer-brand { font-family:var(--font-display); font-size:18px; font-weight:800; color:var(--text-primary); }
        .pp-footer-brand span { color:var(--brand); }
        .pp-footer-copy { font-size:11px; color:var(--text-muted); }
      `}</style>

      <nav className="pp-nav">
        <div className="pp-logo">Taskr<span>.</span></div>
        <button className="pp-back" onClick={onBack}>← Back to home</button>
      </nav>

      <div className="pp-wrap">
        <p className="pp-eyebrow">Legal</p>
        <h1 className="pp-title">Privacy<br />Policy</h1>
        <p className="pp-meta">Last updated: May 26, 2026 · Effective: May 26, 2026</p>

        {SECTIONS.map(s => (
          <div className="pp-section" key={s.title}>
            <h2 className="pp-section-title">{s.title}</h2>
            {s.content   && <p className="pp-text">{s.content}</p>}
            {s.bullets   && <ul className="pp-list">{s.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>}
            {s.highlight && <div className="pp-highlight">{s.highlight}</div>}
            {s.contactBox && (
              <div className="pp-contact-box">
                <div className="pp-contact-row"><span>📧</span><a className="pp-contact-link" href="mailto:privacy@taskr-liard.vercel.app">privacy@taskr-liard.vercel.app</a></div>
                <div className="pp-contact-row"><span>🌐</span><a className="pp-contact-link" href="https://taskr-liard.vercel.app" target="_blank" rel="noopener noreferrer">https://taskr-liard.vercel.app</a></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="pp-footer">
        <div className="pp-footer-brand">Taskr<span>.</span></div>
        <span className="pp-footer-copy">© 2026 Taskr. All rights reserved.</span>
      </footer>
    </div>
  )
}