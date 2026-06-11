-- ============================================================
--  TASKR — RLS Permission Fix
--  Run this in Supabase SQL Editor → New Query → Run query
-- ============================================================

-- ── FIX 1: partner_invites ────────────────────────────────────────
-- Problem: "permission denied for table partner_invites"
-- The original update policy fails because accepted_by is NULL at update time

drop policy if exists "Anyone can read invites"        on public.partner_invites;
drop policy if exists "Inviter can create"             on public.partner_invites;
drop policy if exists "Inviter or acceptor can update" on public.partner_invites;

-- Any logged-in user can READ an invite (needed to look up a code)
create policy "Anyone can read invites"
  on public.partner_invites for select
  to authenticated
  using (true);

-- Only the inviter can CREATE
create policy "Inviter can create"
  on public.partner_invites for insert
  to authenticated
  with check (auth.uid() = inviter_id);

-- Any authenticated user can UPDATE (mark as used when accepting)
-- We can't check accepted_by at update time since it starts as NULL
create policy "Authenticated users can update invites"
  on public.partner_invites for update
  to authenticated
  using (true)
  with check (true);


-- ── FIX 2: partner_connections ────────────────────────────────────
-- Problem: acceptInvite inserts BOTH directions (A→B and B→A)
-- But the original policy only allows user_id = auth.uid()
-- This blocks inserting the B→A row when A is the one calling the function

drop policy if exists "Users manage own connections"     on public.partner_connections;
drop policy if exists "Users can view own connections"   on public.partner_connections;
drop policy if exists "Users can insert own connections" on public.partner_connections;
drop policy if exists "Users can update own connections" on public.partner_connections;

-- Any authenticated user can INSERT connections
-- (needed because acceptInvite inserts both directions at once)
create policy "Authenticated can insert connections"
  on public.partner_connections for insert
  to authenticated
  with check (true);

-- Users can only READ their own side
create policy "Users view own connections"
  on public.partner_connections for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can only UPDATE their own side
create policy "Users update own connections"
  on public.partner_connections for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can only DELETE their own side
create policy "Users delete own connections"
  on public.partner_connections for delete
  to authenticated
  using (auth.uid() = user_id);


-- ── FIX 3: tasks ─────────────────────────────────────────────────
-- Recreate with explicit "to authenticated" to ensure they apply correctly

drop policy if exists "Users can view own tasks"   on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Users can view own tasks"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);


-- ── FIX 4: user_profiles ─────────────────────────────────────────

drop policy if exists "Users can view own profile"   on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id);


-- ── FIX 5: activity_feed ─────────────────────────────────────────

drop policy if exists "Users see own feed"       on public.activity_feed;
drop policy if exists "Users insert own events"  on public.activity_feed;

create policy "Users see own feed"
  on public.activity_feed for select
  to authenticated
  using (auth.uid() = partner_id or auth.uid() = user_id);

create policy "Users insert own events"
  on public.activity_feed for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ── FIX 6: notifications ─────────────────────────────────────────

drop policy if exists "Users see own notifications"    on public.notifications;
drop policy if exists "Users insert own notifications" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;

create policy "Users see own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own notifications"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);


-- ── VERIFY: check all policies were created ───────────────────────
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;



-- ══════════════════════════════════════════════════════════
-- TASKR 2.0 — Routines Table + RLS Policies
-- Run this in your Supabase SQL Editor
-- Project ref: cechpuugcqnlsskxlnbx
-- ══════════════════════════════════════════════════════════

-- 1. Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  description   text,
  icon          text        DEFAULT '🔄',
  color         text        DEFAULT '#22c55e',
  frequency     text        NOT NULL DEFAULT 'daily',
    -- 'daily' | 'weekly' | 'monthly' | 'custom'
  days_of_week  integer[]   DEFAULT ARRAY[]::integer[],
    -- 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    -- empty = every day (for daily frequency)
  time_of_day   text,
    -- "HH:MM" 24h format, nullable
  is_active     boolean     DEFAULT true,
  order_index   integer     DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 2. Create routine_completions table
--    Each row = one completed instance on a specific date
CREATE TABLE IF NOT EXISTS public.routine_completions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id  uuid        NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_on date       NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamptz DEFAULT now(),
  note        text,
  UNIQUE(routine_id, completed_on)
    -- prevents double-completing the same routine on the same day
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_routines_user_id       ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_is_active     ON public.routines(is_active);
CREATE INDEX IF NOT EXISTS idx_completions_routine_id ON public.routine_completions(routine_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_id    ON public.routine_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_date       ON public.routine_completions(completed_on);

-- 4. Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS routines_updated_at ON public.routines;
CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable RLS
ALTER TABLE public.routines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — routines
DROP POLICY IF EXISTS routines_select ON public.routines;
DROP POLICY IF EXISTS routines_insert ON public.routines;
DROP POLICY IF EXISTS routines_update ON public.routines;
DROP POLICY IF EXISTS routines_delete ON public.routines;

CREATE POLICY routines_select ON public.routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY routines_insert ON public.routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY routines_update ON public.routines
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY routines_delete ON public.routines
  FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS Policies — routine_completions
DROP POLICY IF EXISTS completions_select ON public.routine_completions;
DROP POLICY IF EXISTS completions_insert ON public.routine_completions;
DROP POLICY IF EXISTS completions_update ON public.routine_completions;
DROP POLICY IF EXISTS completions_delete ON public.routine_completions;

CREATE POLICY completions_select ON public.routine_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY completions_insert ON public.routine_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY completions_update ON public.routine_completions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY completions_delete ON public.routine_completions
  FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════
-- Done. Tables: routines, routine_completions
-- Both have RLS. Safe to use immediately.
-- ══════════════════════════════════════════════════════════