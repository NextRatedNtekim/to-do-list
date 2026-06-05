# WithTaskr V1 — Integration Guide
## Every file, in exact order. Copy-paste ready.

---

## Files in this package

| File | Action | Where it goes |
|------|--------|---------------|
| `supabase-additions.sql` | Run in Supabase Studio | SQL Editor |
| `supabase-rpc-increment-xp.sql` | Run in Supabase Studio | SQL Editor |
| `tailwind.config.js` | Replace your existing file | project root |
| `.env.example` | Copy to `.env`, fill values | project root |
| `public/sw.js` | New file | `public/sw.js` |
| `src/lib/push.js` | New file | `src/lib/push.js` |
| `src/lib/supabase-additions.js` | Append to existing `supabase.js` | `src/lib/supabase.js` |
| `src/lib/xp.js` | New file | `src/lib/xp.js` |
| `src/stores/notificationStore.js` | New file | `src/stores/notificationStore.js` |
| `src/stores/alarmStore.js` | New file | `src/stores/alarmStore.js` |
| `src/components/AppShell.jsx` | New file | `src/components/AppShell.jsx` |
| `src/components/XPToast.jsx` | New file | `src/components/XPToast.jsx` |
| `src/components/AlarmPicker.jsx` | New file | `src/components/AlarmPicker.jsx` |
| `src/components/MissedTaskRecovery.jsx` | New file | `src/components/MissedTaskRecovery.jsx` |
| `src/components/ActivityFeed.jsx` | New file | `src/components/ActivityFeed.jsx` |
| `src/components/PartnerCard.jsx` | New file | `src/components/PartnerCard.jsx` |
| `src/components/InviteModal.jsx` | New file | `src/components/InviteModal.jsx` |
| `src/pages/OnboardingFlow.jsx` | New file | `src/pages/OnboardingFlow.jsx` |
| `src/pages/AlarmsScreen.jsx` | New file | `src/pages/AlarmsScreen.jsx` |
| `src/pages/FocusMode.jsx` | Replace existing | `src/pages/FocusMode.jsx` |
| `src/pages/AccountabilityPage.jsx` | Replace existing | `src/pages/AccountabilityPage.jsx` |
| `src/pages/Dashboard-additions.jsx` | Read, then add sections to Dashboard.jsx | `src/pages/Dashboard.jsx` |
| `src/pages/ProfilePage-additions.jsx` | Read, then add sections to ProfilePage.jsx | `src/pages/ProfilePage.jsx` |
| `App.jsx-changes.js` | Read, apply changes to App.jsx | `src/App.jsx` |
| `supabase/functions/send-push/index.ts` | New Edge Function | `supabase/functions/send-push/index.ts` |
| `supabase/functions/alarm-worker/index.ts` | New Edge Function | `supabase/functions/alarm-worker/index.ts` |

---

## Exact execution order

### Phase 1 — Database (do this FIRST, before touching any code)

```bash
# 1. Open Supabase Studio → SQL Editor
# 2. Paste and run supabase-additions.sql
# 3. Paste and run supabase-rpc-increment-xp.sql
```

### Phase 2 — Environment setup

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Copy output, then:
cp .env.example .env
# Fill in VITE_VAPID_PUBLIC_KEY in .env

# Add to Supabase Dashboard → Settings → Edge Functions → Secrets:
# VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT_EMAIL
```

### Phase 3 — Install dependencies

```bash
npm install web-push
# framer-motion and lucide-react should already be installed
# confirm with: cat package.json | grep -E "framer|lucide|web-push"
```

### Phase 4 — Config files

```
1. Replace tailwind.config.js with the one in this package
2. Copy public/sw.js → your project's public/sw.js
```

### Phase 5 — New lib files (just copy, no edits needed)

```
src/lib/push.js          ← copy as-is
src/lib/xp.js            ← copy as-is
```

### Phase 6 — Append to existing supabase.js

```
Open src/lib/supabase.js
Scroll to the bottom
Copy-paste everything from src/lib/supabase-additions.js
Save
```

### Phase 7 — New Zustand stores (copy as-is)

```
src/stores/notificationStore.js  ← copy as-is
src/stores/alarmStore.js         ← copy as-is
```

### Phase 8 — New components (copy as-is)

```
src/components/AppShell.jsx
src/components/XPToast.jsx
src/components/AlarmPicker.jsx
src/components/MissedTaskRecovery.jsx
src/components/ActivityFeed.jsx
src/components/PartnerCard.jsx
src/components/InviteModal.jsx
```

### Phase 9 — New pages (copy as-is)

```
src/pages/OnboardingFlow.jsx
src/pages/AlarmsScreen.jsx
```

### Phase 10 — Replace existing pages

```
src/pages/FocusMode.jsx          ← replace your existing file
src/pages/AccountabilityPage.jsx ← replace your existing file
```

### Phase 11 — Edit existing pages

```
Dashboard.jsx:
  - Read Dashboard-additions.jsx carefully
  - Add the imports listed in STEP A
  - Add initAlarmListener() call to your useEffect
  - Add XP toast state
  - Insert the 5 new sections above your task list

ProfilePage.jsx:
  - Read ProfilePage-additions.jsx carefully
  - Add imports listed in STEP 1
  - Derive level data after your profile fetch (STEP 2)
  - Replace your stats display with <StatsGrid>
  - Add <XPLevelCard> above stats
  - Add <BadgeGrid> below stats
  - Add <StreakCard> at bottom
```

### Phase 12 — Update App.jsx

```
Read App.jsx-changes.js carefully.
Apply the changes — do NOT copy the whole file,
your existing auth logic stays in place.
Key changes:
  - Import AppShell, OnboardingFlow, new pages
  - Import registerSW, initAlarmListener
  - Add registerSW() + initAlarmListener() in useEffect
  - Add onboarding check
  - Wrap Routes in <AppShell>
  - Add /alarms and /focus routes
```

### Phase 13 — Deploy Edge Functions

```bash
supabase functions deploy send-push
supabase functions deploy alarm-worker

# Set cron schedule in Supabase Dashboard:
# Edge Functions → alarm-worker → Schedule → * * * * *
```

### Phase 14 — Test

```bash
npm run dev

# Test checklist:
# [ ] Push permission prompt appears on load
# [ ] Bottom nav shows 5 tabs with animations
# [ ] Task completion shows XP toast
# [ ] Onboarding shows for new users
# [ ] Partner invite modal generates a code
# [ ] Focus timer runs and awards XP on complete
# [ ] Alarms screen shows tasks with alarm_time set
# [ ] Missed task recovery card appears
```

---

## Common issues

**"VITE_VAPID_PUBLIC_KEY not set"**
→ Add it to your .env file and restart dev server

**Push notifications not arriving**
→ Check browser permission (Settings → Notifications → your localhost)
→ Confirm sw.js is accessible at http://localhost:5173/sw.js

**alarm-worker not firing**
→ Check Edge Function logs in Supabase Dashboard
→ Confirm cron schedule is set to `* * * * *`

**ActivityFeed shows nothing**
→ Check partner_connections has status='active' rows
→ Check Realtime is enabled on activity_feed table in Supabase Dashboard

**XP not saving**
→ Run supabase-rpc-increment-xp.sql in SQL Editor
→ Check the GRANT statement ran successfully