// supabase/functions/send-push/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function — plain JavaScript (Deno runtime, no TypeScript).
// VS Code will no longer show type errors.
//
// DEPLOY:  supabase functions deploy send-push
// CALL:    supabase.functions.invoke('send-push', { body: { user_id, title, body, url } })
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush          from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // ── CORS preflight ─────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      user_id,
      title,
      body,
      url     = '/',
      tag     = 'withtaskr',
      actions = [],
      icon    = '/icon-192.png',
      badge   = '/badge-72.png',
    } = await req.json();

    // ── Validate required fields ────────────────────────────────────────────
    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Supabase admin client ───────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    // ── Fetch push subscription for this user ──────────────────────────────
    const { data: sub, error: subErr } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)
      .single();

    if (subErr || !sub) {
      // User hasn't granted push permission yet — not an error
      return new Response(
        JSON.stringify({ skipped: true, reason: 'no subscription found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Configure VAPID ────────────────────────────────────────────────────
    webpush.setVapidDetails(
      'mailto:' + (Deno.env.get('VAPID_CONTACT_EMAIL') || 'hello@withtaskr.app'),
      Deno.env.get('VAPID_PUBLIC_KEY'),
      Deno.env.get('VAPID_PRIVATE_KEY')
    );

    // ── Send push notification ─────────────────────────────────────────────
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    const payload = JSON.stringify({ title, body, url, tag, icon, badge, actions });

    await webpush.sendNotification(pushSubscription, payload, { TTL: 3600 });

    // ── Log to your existing notifications table ───────────────────────────
    await supabase.from('notifications').insert({
      user_id,
      type:     tag,
      title,
      message:  body,
      metadata: { url, sent_at: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[send-push] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});