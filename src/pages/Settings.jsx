import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, User, Trash2, Download, Shield, Palette, Database, Info, LogOut } from 'lucide-react'
import { useUserStore, useTaskStore, useUIStore } from '@/store'
import { useAuthStore } from '@/store/authStore'
import { useTheme }     from '@/hooks'
import { useProfileSync } from '@/hooks/useProfileSync'
import { deleteAllTasks } from '@/services/taskService'

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, delay: d, ease: [0.22,1,0.36,1] } })

function Section({ title, Icon, children, index = 0 }) {
  return (
    <motion.div {...fadeUp(index * 0.07)} className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: 'clamp(12px,2.5vw,16px) clamp(14px,3vw,20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} color="var(--brand)" />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{title}</span>
      </div>
      <div style={{ padding: 'clamp(4px,1vw,8px) 0' }}>{children}</div>
    </motion.div>
  )
}

function Row({ label, sub, children, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(11px,2vw,14px) clamp(14px,3vw,20px)', borderBottom: last ? 'none' : '1px solid var(--border)', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const { profile, streakFreezes } = useUserStore()
  const { tasks, clearAll }         = useTaskStore()
  const { showToast }               = useUIStore()
  const { user, logout }            = useAuthStore()
  const { theme, setTheme }         = useTheme()
  const { addStreakFreeze, updateName } = useProfileSync()

  const [name,   setName]   = useState(profile.name || user?.name || '')
  const [saving, setSaving] = useState(false)

  async function handleSaveName() {
    const trimmed = name.trim(); if (!trimmed) return
    setSaving(true)
    updateName(trimmed)   // updates store + Supabase
    setSaving(false)
    showToast('Profile updated!', 'success')
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString(), version: '2.0' }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'taskr-backup.json'; a.click(); URL.revokeObjectURL(a.href)
    showToast('Data exported!', 'success')
  }

  async function handleClearData() {
    if (!window.confirm('Permanently delete ALL tasks?')) return
    clearAll()
    if (user?.id) {
      deleteAllTasks(user.id).catch(console.error)
    }
    showToast('All tasks cleared', 'info')
  }

  async function handleLogout() {
    await logout()
  }

  return (
    <div>
      <motion.div {...fadeUp()} style={{ marginBottom: 'clamp(18px,3vw,28px)' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your Taskr experience</p>
      </motion.div>

      {/* Account */}
      <Section title="Account" Icon={User} index={0}>
        <Row label="Signed in as" sub={user?.email || 'Unknown'}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>
            via {user?.provider || 'email'}
          </span>
        </Row>
        <Row label="Display Name" sub="Shown on leaderboard and partner feed">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="input-base" style={{ width: 'clamp(140px,30vw,200px)' }}
            />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSaveName} disabled={saving}
              className="btn btn-primary btn-sm" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? '...' : 'Save'}
            </motion.button>
          </div>
        </Row>
        <Row label="Sign Out" sub="End your current session" last>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleLogout} className="btn btn-ghost btn-sm"
            style={{ color: '#f43f5e', borderColor: '#fda4af' }}>
            <LogOut size={13} /> Sign Out
          </motion.button>
        </Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" Icon={Palette} index={1}>
        <Row label="Theme" sub="Switch between dark and light mode" last>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-2)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
            {[{ value: 'light', label: 'Light', Icon: Sun }, { value: 'dark', label: 'Dark', Icon: Moon }].map(opt => (
              <button key={opt.value} onClick={() => setTheme(opt.value)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', background: theme === opt.value ? 'var(--bg-surface)' : 'transparent', color: theme === opt.value ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13, fontWeight: theme === opt.value ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: theme === opt.value ? 'var(--shadow-sm)' : 'none', transition: 'all .14s' }}>
                <opt.Icon size={13} /> {opt.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Streak */}
      <Section title="Streak Protection" Icon={Shield} index={2}>
        <Row label="Streak Freezes" sub={`${streakFreezes}/3 remaining — protect your streak when you miss a day`} last>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={addStreakFreeze}   // syncs to Supabase via useProfileSync
            disabled={streakFreezes >= 3}
            className="btn btn-secondary btn-sm" style={{ opacity: streakFreezes >= 3 ? 0.5 : 1 }}>
            <Shield size={13} /> Add Freeze
          </motion.button>
        </Row>
      </Section>

      {/* Data */}
      <Section title="Data Management" Icon={Database} index={3}>
        <Row label="Export Data" sub="Download all tasks as a JSON backup">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={13} /> Export
          </motion.button>
        </Row>
        <Row label="Clear All Tasks" sub="Permanently delete every task — cannot be undone" last>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleClearData} className="btn btn-ghost btn-sm" style={{ color: '#f43f5e', borderColor: '#fda4af' }}>
            <Trash2 size={13} /> Clear All
          </motion.button>
        </Row>
      </Section>

      {/* About */}
      <Section title="About" Icon={Info} index={4}>
        <div style={{ padding: 'clamp(12px,2.5vw,16px) clamp(14px,3vw,20px)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>wT</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>WithTaskr v1.0</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gamified Productivity Platform</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Built with React, Vite, Supabase, Zustand, and Framer Motion.
            <br />
            <div style={{ color: 'var(--brand)', fontWeight: 700 }}>Designed and developed by <span style={{color: 'var(--text-muted)'}}>Samuel Ntekim</span></div>
            <div style={{ color: 'var(--brand)', fontWeight: 700 }}>Marketing Lead by <span style={{color: 'var(--text-muted)'}}>Prisilla-Fagha Debo</span></div>
          </div>
        </div>
      </Section>
    </div>
  )
}
