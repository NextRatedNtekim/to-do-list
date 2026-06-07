// src/components/InviteModal.jsx
// Generates a 6-char invite code using your existing partner_invites table.
// Also accepts codes from other users.
// USAGE:
//   const [open, setOpen] = useState(false);
//   <button onClick={() => setOpen(true)}>Invite partner</button>
//   <InviteModal open={open} onClose={() => setOpen(false)} onSuccess={(partnerId) => {}} />

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Share2, UserPlus, Link, ArrowRight, Loader2
} from 'lucide-react';
import { generateInviteCode, acceptInviteCode } from '@/lib/supabase';

export default function InviteModal({ open, onClose, onSuccess }) {
  const [mode,    setMode]    = useState('generate'); // 'generate' | 'enter'
  const [invite,  setInvite]  = useState(null);       // { code, expires_at }
  const [copied,  setCopied]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [input,   setInput]   = useState('');
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (open && mode === 'generate' && !invite) fetchCode();
  }, [open, mode]);

  async function fetchCode() {
    setLoading(true);
    const data = await generateInviteCode();
    setInvite(data);
    setLoading(false);
  }

  function handleCopy() {
    if (!invite?.code) return;
    navigator.clipboard.writeText(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    if (!invite?.code) return;
    const url  = `${window.location.origin}/invite/${invite.code}`;
    const text = `Join me on WithTaskr as my accountability partner! Code: ${invite.code}\n${url}`;
    if (navigator.share) {
      navigator.share({ title: 'WithTaskr Partner Invite', text, url });
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  async function handleAccept() {
    if (input.length < 4) return;
    setError('');
    setLoading(true);
    const result = await acceptInviteCode(input.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onSuccess?.(result.partnerId);
    onClose?.();
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  };

  const sheet = {
    width: '100%', maxWidth: 480,
    background:     'rgba(10,15,26,0.98)',
    backdropFilter: 'blur(24px)',
    border:         '1px solid rgba(255,255,255,0.08)',
    borderBottom:   'none',
    borderRadius:   '28px 28px 0 0',
    padding:        '24px 24px 40px',
  };

  const glassInput = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.06)',
    border:     error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: '#f1f5f9',
    fontSize: 16, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    outline: 'none',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          style={overlay}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{    y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 35 }}
            style={sheet}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Add accountability partner</h2>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Share your code or enter a friend's code</p>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, cursor: 'pointer' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4 }}>
              {[
                { id: 'generate', label: 'Share my code', icon: Share2 },
                { id: 'enter',    label: 'Enter a code',  icon: UserPlus },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setError(''); }}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: mode === tab.id ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'transparent',
                    color:      mode === tab.id ? '#fff' : '#64748b',
                    fontSize: 12, fontWeight: mode === tab.id ? 700 : 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Generate mode */}
            {mode === 'generate' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                {loading ? (
                  <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
                    <Loader2 size={24} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <>
                    {/* Code display */}
                    <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '20px 24px', marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Your invite code</p>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#22c55e', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
                        {invite?.code ?? '------'}
                      </div>
                      <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>Expires in 24 hours</p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <motion.button whileTap={{ scale: 0.92 }} onClick={handleCopy}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: copied ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        {copied ? <Check size={15} color="#22c55e" /> : <Copy size={15} color="#94a3b8" />}
                        <span style={{ fontSize: 13, fontWeight: 700, color: copied ? '#22c55e' : '#94a3b8' }}>{copied ? 'Copied!' : 'Copy code'}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.92 }} onClick={handleShare}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}>
                        <Share2 size={15} color="#fff" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Share</span>
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Enter code mode */}
            {mode === 'enter' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Enter your friend's 6-character code</label>
                <input
                  style={glassInput}
                  placeholder="ENTER CODE"
                  maxLength={6}
                  value={input}
                  onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(''); }}
                />
                {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{error}</p>}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAccept}
                  disabled={input.length < 4 || loading}
                  style={{ width: '100%', padding: '14px 0', borderRadius: 16, background: input.length >= 4 ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.05)', border: 'none', cursor: input.length >= 4 ? 'pointer' : 'default', color: input.length >= 4 ? '#fff' : '#475569', fontWeight: 700, fontSize: 15, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: input.length >= 4 ? '0 4px 16px rgba(22,163,74,0.35)' : 'none', transition: 'all 0.2s' }}>
                  {loading ? <Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={18} color={input.length >= 4 ? '#fff' : '#475569'} />}
                  {loading ? 'Connecting...' : 'Connect as partners'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}