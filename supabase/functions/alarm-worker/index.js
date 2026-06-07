// supabase/functions/alarm-worker/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function — plain JavaScript (Deno runtime, no TypeScript).
// Runs every minute via cron. Fires push notifications for upcoming alarms
// and detects missed tasks.
//
// DEPLOY:  supabase functions deploy alarm-worker
// CRON:    * * * * *  (set in Supabase Dashboard → Edge Functions → Schedule)
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const now    = new Date();
  const in60s  = new Date(now.getTime() + 60 * 1000).toISOString();
  const ago30m = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

  const results = { alarmsFired: 0, preRemindersFired: 0, missedDetected: 0, errors: [] };

  // ── 1. Fire start alarms (alarm_time within the next 60 seconds) ───────────
  const { data: upcomingTasks, error: upErr } = await supabase
    .from('tasks')
    .select('id, title, user_id, alarm_time, priority')
    .gte('alarm_time', now.toISOString())
    .lte('alarm_time', in60s)
    .is('completed_at', null)
    .is('missed_at', null);

  if (upErr) {
    results.errors.push('Alarm fetch: ' + upErr.message);
  } else {
    for (const task of (upcomingTasks || [])) {
      try {
        await sendPush(task.user_id, {
          title:   'Time for: ' + task.title,
          body:    'Your accountability sprint starts now. Tap to open focus mode.',
          url:     '/focus',
          tag:     'alarm-start-' + task.id,
          actions: [
            { action: 'do_now',  title: '▶ Start now' },
            { action: 'dismiss', title: 'Dismiss'      },
          ],
        });
        results.alarmsFired++;
      } catch (e) {
        results.errors.push('Push failed for task ' + task.id + ': ' + e.message);
      }
    }
  }

  // ── 2. Fire pre-task reminders ─────────────────────────────────────────────
  const offsets = [60, 30, 10]; // minutes before alarm_time

  for (const offsetMins of offsets) {
    const windowStart = new Date(now.getTime() + offsetMins * 60 * 1000).toISOString();
    const windowEnd   = new Date(now.getTime() + (offsetMins * 60 + 60) * 1000).toISOString();

    const { data: preTasks } = await supabase
      .from('tasks')
      .select('id, title, user_id, reminder_offsets')
      .gte('alarm_time', windowStart)
      .lte('alarm_time', windowEnd)
      .is('completed_at', null)
      .is('missed_at', null)
      .contains('reminder_offsets', [offsetMins]);

    for (const task of (preTasks || [])) {
      try {
        await sendPush(task.user_id, {
          title: task.title + ' in ' + offsetMins + ' minute' + (offsetMins > 1 ? 's' : ''),
          body:  getPreTaskCopy(offsetMins),
          url:   '/',
          tag:   'alarm-pre-' + task.id + '-' + offsetMins,
        });
        results.preRemindersFired++;
      } catch (_e) {
        // Pre-reminders are best-effort — don't block on failure
      }
    }
  }

  // ── 3. Detect missed tasks (alarm_time passed 30+ min ago, not completed) ──
  const { data: missedTasks, error: missErr } = await supabase
    .from('tasks')
    .select('id, title, user_id, alarm_time')
    .lt('alarm_time', ago30m)
    .is('completed_at', null)
    .is('missed_at', null);

  if (missErr) {
    results.errors.push('Missed fetch: ' + missErr.message);
  } else {
    for (const task of (missedTasks || [])) {
      try {
        // Mark missed in DB
        await supabase
          .from('tasks')
          .update({ missed_at: now.toISOString() })
          .eq('id', task.id);

        // Send recovery push
        await sendPush(task.user_id, {
          title:   'You missed: ' + task.title,
          body:    "That's okay — let's recover it. Tap to reschedule.",
          url:     '/alarms',
          tag:     'alarm-missed-' + task.id,
          actions: [
            { action: 'do_now',  title: '⚡ Do it now' },
            { action: 'dismiss', title: 'Later'         },
          ],
        });

        results.missedDetected++;
      } catch (e) {
        results.errors.push('Missed handling failed for ' + task.id + ': ' + e.message);
      }
    }
  }

  // ── 4. Daily streak reminder at 8 PM UTC ───────────────────────────────────
  const hour = now.getUTCHours();
  if (hour === 20) {
    const todayStr = now.toISOString().split('T')[0];

    const { data: streakUsers } = await supabase
      .from('user_profiles')
      .select('user_id, streak, display_name')
      .gt('streak', 0)
      .neq('last_completed_day', todayStr);

    for (const u of (streakUsers || [])) {
      try {
        await sendPush(u.user_id, {
          title: 'Keep your ' + u.streak + '-day streak alive 🔥',
          body:  "You haven't completed a task today. Don't break your streak!",
          url:   '/',
          tag:   'streak-reminder',
        });
      } catch (_e) {
        // Silent — streak reminders are non-critical
      }
    }
  }

  console.log('[alarm-worker] Complete:', JSON.stringify(results));

  return new Response(JSON.stringify(results), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ── Helper: call the send-push Edge Function ──────────────────────────────────
async function sendPush(userId, payload) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const res = await fetch(supabaseUrl + '/functions/v1/send-push', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + serviceKey,
    },
    body: JSON.stringify({ user_id: userId, ...payload }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('send-push responded ' + res.status + ': ' + text);
  }
}

// ── Helper: pre-task notification copy ────────────────────────────────────────
function getPreTaskCopy(mins) {
  if (mins >= 60) return 'Upcoming in 1 hour — plan ahead.';
  if (mins === 30) return 'Clear your space. Starting soon.';
  if (mins <= 10)  return "Almost time — wrap up what you're doing.";
  return 'Starting in ' + mins + ' minutes.';
}