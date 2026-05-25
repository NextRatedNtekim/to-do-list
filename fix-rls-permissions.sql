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
