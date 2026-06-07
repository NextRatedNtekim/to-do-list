// src/pages/OnboardingFlow.jsx
// 5-step onboarding flow shown once after first sign-up.
// HOW TO TRIGGER in App.jsx:
//   const [onboarded, setOnboarded] = useState(null);
//   useEffect(() => {
//     checkOnboardingComplete(user.id).then(setOnboarded);
//   }, [user]);
//   if (onboarded === false) return <OnboardingFlow onComplete={() => setOnboarded(true)} />;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Briefcase, Dumbbell, Brain, Heart,
  ChevronRight, ChevronLeft, Check, Zap, Bell, Users
} from 'lucide-react';
import {AlarmPicker }      from '@/components/AlarmPicker';
import {InviteModal   }    from '@/components/InviteModal';
import { completeOnboarding } from '@/lib/supabase';

const GOALS = [
  { id: 'study',   icon: GraduationCap, label: 'Study & Learning', color: '#3b82f6' },
  { id: 'work',    icon: Briefcase,     label: 'Career & Work',    color: '#8b5cf6' },
  { id: 'health',  icon: Dumbbell,      label: 'Health & Fitness', color: '#22c55e' },
  { id: 'growth',  icon: Brain,         label: 'Personal Growth',  color: '#f59e0b' },
  { id: 'other',   icon: Heart,         label: 'Something else',   color: '#ef4444' },
];

export default function OnboardingFlow({ onComplete }) {
  const [step,     setStep]     = useState(0);
  const [goal,     setGoal]     = useState(null);
  const [inviteOpen, setInvite] = useState(false);
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [quietStart, setQuietStart] = useState(23);
  const [quietEnd,   setQuietEnd]   = useState(7);
  const [firstTask,  setFirstTask]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const STEPS = [
    'Your goal',
    'Get a partner',
    'Alarm settings',
    'First task',
    'Quick win',
  ];

  async function finish() {
    setLoading(true);
    await completeOnboarding(goal);
    setLoading(false);
    onComplete?.();
  }

  const bg = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #030712 0%, #0a0f1a 40%, #050d0a 100%)',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
  };

  const card = {
    background:     'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border:         '1px solid rgba(255,255,255,0.08)',
    borderRadius:   20,
    padding:        '16px 18px',
    marginBottom:   12,
  };

  return (
    <div style={bg}>
      {/* Progress bar */}
      <div style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Step {step + 1} of {STEPS.length}</span>
          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>{STEPS[step]}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(to right, #16a34a, #22c55e)', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, paddingTop: 24 }}>
        <AnimatePresence mode="wait">

          {/* Step 0: Goal */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.03em' }}>
                What are you working toward?
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                Pick your main focus. You can always add more later.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {GOALS.map((g) => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setGoal(g.id)}
                    style={{
                      padding: '18px 14px', borderRadius: 18, cursor: 'pointer', textAlign: 'left',
                      background: goal === g.id ? `${g.color}18` : 'rgba(255,255,255,0.04)',
                      border: goal === g.id ? `2px solid ${g.color}` : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <g.icon size={24} color={g.color} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginTop: 10 }}>{g.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Partner */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.03em' }}>
                Get an accountability partner
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                People with partners are 65% more likely to follow through. Invite a friend now or skip and do it later.
              </p>
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Invite a partner</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Share a 6-character invite code</p>
                  </div>
                </div>
                {partnerLinked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <Check size={16} color="#22c55e" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Partner connected!</span>
                  </div>
                ) : (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setInvite(true)}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
                    Invite now
                  </motion.button>
                )}
              </div>
              <InviteModal open={inviteOpen} onClose={() => setInvite(false)} onSuccess={() => { setPartnerLinked(true); setInvite(false); }} />
            </motion.div>
          )}

          {/* Step 2: Alarm settings */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.03em' }}>
                Set your quiet hours
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                We'll never send notifications during these hours.
              </p>
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Bell size={16} color="#f59e0b" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Quiet hours</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5 }}>From</label>
                    <input type="time" defaultValue="23:00" onChange={(e) => setQuietStart(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 15, fontWeight: 600, outline: 'none', colorScheme: 'dark' }} />
                  </div>
                  <span style={{ color: '#475569', marginTop: 16 }}>to</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5 }}>Until</label>
                    <input type="time" defaultValue="07:00" onChange={(e) => setQuietEnd(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 15, fontWeight: 600, outline: 'none', colorScheme: 'dark' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: First task */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.03em' }}>
                Create your first task
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                What's one important thing you want to do today?
              </p>
              <div style={card}>
                <input
                  value={firstTask}
                  onChange={(e) => setFirstTask(e.target.value)}
                  placeholder="e.g. Study React for 1 hour"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#f1f5f9', fontSize: 15, outline: 'none', marginBottom: 14 }}
                />
                <AlarmPicker onChange={() => {}} />
              </div>
            </motion.div>
          )}

          {/* Step 4: Quick win */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} style={{ textAlign: 'center', paddingTop: 20 }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(22,163,74,0.4)' }}>
                <Zap size={36} fill="#fff" color="#fff" />
              </motion.div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>You're all set!</h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
                Start your streak right now — complete this 5-minute task and earn your first 25 XP.
              </p>
              <div style={{ ...card, textAlign: 'left', marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>⚡ Quick win — take 5 minutes right now</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Write down your top 3 goals for this week.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>+25 XP</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#475569' }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>Starts your streak</span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div style={{ paddingBottom: 40, paddingTop: 20, display: 'flex', gap: 12 }}>
        {step > 0 && (
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setStep(s => s - 1)}
            style={{ padding: '14px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronLeft size={16} color="#64748b" />
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : finish}
          disabled={loading || (step === 0 && !goal)}
          style={{
            flex: 1, padding: '14px 0', borderRadius: 16,
            background: (step === 0 && !goal) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #16a34a, #22c55e)',
            border: 'none', cursor: (step === 0 && !goal) ? 'default' : 'pointer',
            color: '#fff', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: (step === 0 && !goal) ? 'none' : '0 4px 20px rgba(22,163,74,0.4)',
          }}
        >
          {step === STEPS.length - 1 ? (
            loading ? 'Setting up...' : '🚀 Start earning XP'
          ) : (
            <>Continue <ChevronRight size={17} /></>
          )}
        </motion.button>

        {/* Skip for optional steps */}
        {(step === 1 || step === 3) && (
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setStep(s => s + 1)}
            style={{ padding: '14px 16px', borderRadius: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: '#475569', fontSize: 13 }}>
            Skip
          </motion.button>
        )}
      </div>
    </div>
  );
}