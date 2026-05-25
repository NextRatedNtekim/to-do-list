-- -- ============================================================
-- --  TASKR — Supabase Database Schema
-- --  Paste this entire file into:
-- --  Supabase Dashboard → SQL Editor → New Query → Run
-- -- ============================================================


-- -- ── 1. USER PROFILES ─────────────────────────────────────────────
-- -- One row per authenticated user.
-- -- Created automatically on first login by the app.

-- create table if not exists public.user_profiles (
--   id                  uuid primary key references auth.users(id) on delete cascade,

--   -- Display info
--   name                text        not null default 'Taskr User',

--   -- XP & levelling
--   total_xp            integer     not null default 0,
--   weekly_xp           integer     not null default 0,
--   week_start          timestamptz not null default now(),

--   -- Streak
--   streak              integer     not null default 0,
--   longest_streak      integer     not null default 0,
--   last_completed_day  timestamptz,
--   streak_freezes      integer     not null default 2,

--   -- JSON blobs (small, queried rarely — ideal for JSONB)
--   daily_activity      jsonb       not null default '{}',     -- { "2024-01-15": { completed: 3, xp: 30 } }
--   unlocked_milestones integer[]   not null default '{}',     -- [3, 7, 14, ...]

--   -- Timestamps
--   created_at          timestamptz not null default now(),
--   updated_at          timestamptz not null default now()
-- );

-- -- Auto-update updated_at on every write
-- create or replace function public.touch_updated_at()
-- returns trigger language plpgsql as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$;

-- drop trigger if exists user_profiles_updated_at on public.user_profiles;
-- create trigger user_profiles_updated_at
--   before update on public.user_profiles
--   for each row execute procedure public.touch_updated_at();


-- -- ── 2. TASKS ─────────────────────────────────────────────────────
-- -- One row per task. user_id is the FK to auth.users.

-- create table if not exists public.tasks (
--   id           text        primary key,          -- client-generated nanoid
--   user_id      uuid        not null references auth.users(id) on delete cascade,

--   -- Core fields
--   text         text        not null,
--   done         boolean     not null default false,
--   priority     text        not null default 'medium'
--                            check (priority in ('urgent','high','medium','low')),

--   -- Optional metadata
--   category     text,
--   tags         text[]      not null default '{}',
--   due_date     timestamptz,
--   recurring    text        check (recurring in ('daily','weekly','monthly') or recurring is null),
--   notes        text        not null default '',
--   subtasks     jsonb       not null default '[]',   -- [{ id, text, done, created }]

--   -- Completion tracking
--   completed_at timestamptz,
--   xp_awarded   boolean     not null default false,

--   -- Timestamps
--   created_at   timestamptz not null default now(),
--   updated_at   timestamptz not null default now()
-- );

-- -- Index for the most common query: all tasks for a user, newest first
-- create index if not exists tasks_user_created
--   on public.tasks (user_id, created_at desc);

-- -- Index for filtering active / done tasks
-- create index if not exists tasks_user_done
--   on public.tasks (user_id, done);

-- drop trigger if exists tasks_updated_at on public.tasks;
-- create trigger tasks_updated_at
--   before update on public.tasks
--   for each row execute procedure public.touch_updated_at();


-- -- ── 3. ROW LEVEL SECURITY ────────────────────────────────────────
-- -- Users can only read/write their OWN rows.
-- -- The anon key is safe to use client-side because of these policies.

-- -- Enable RLS
-- alter table public.user_profiles enable row level security;
-- alter table public.tasks         enable row level security;

-- -- user_profiles policies
-- drop policy if exists "Users can view own profile"   on public.user_profiles;
-- drop policy if exists "Users can insert own profile" on public.user_profiles;
-- drop policy if exists "Users can update own profile" on public.user_profiles;

-- create policy "Users can view own profile"
--   on public.user_profiles for select
--   using ( auth.uid() = id );

-- create policy "Users can insert own profile"
--   on public.user_profiles for insert
--   with check ( auth.uid() = id );

-- create policy "Users can update own profile"
--   on public.user_profiles for update
--   using ( auth.uid() = id );

-- -- tasks policies
-- drop policy if exists "Users can view own tasks"   on public.tasks;
-- drop policy if exists "Users can insert own tasks" on public.tasks;
-- drop policy if exists "Users can update own tasks" on public.tasks;
-- drop policy if exists "Users can delete own tasks" on public.tasks;

-- create policy "Users can view own tasks"
--   on public.tasks for select
--   using ( auth.uid() = user_id );

-- create policy "Users can insert own tasks"
--   on public.tasks for insert
--   with check ( auth.uid() = user_id );

-- create policy "Users can update own tasks"
--   on public.tasks for update
--   using ( auth.uid() = user_id );

-- create policy "Users can delete own tasks"
--   on public.tasks for delete
--   using ( auth.uid() = user_id );


-- -- ── 4. OPTIONAL: LEADERBOARD VIEW ────────────────────────────────
-- -- Public read-only view exposing only non-sensitive fields.
-- -- Enable only if you want real leaderboard data from real users.

-- create or replace view public.leaderboard as
--   select
--     id,
--     name,
--     total_xp   as xp,
--     weekly_xp,
--     streak
--   from public.user_profiles
--   order by total_xp desc
--   limit 100;

-- -- Grant read access to authenticated users
-- grant select on public.leaderboard to authenticated;


-- -- ── 5. HELPER: auto-create profile on sign-up ────────────────────
-- -- Optional but recommended: creates a minimal profile row the moment
-- -- a new user is created in auth.users, so the app never hits a "no profile" case.

-- create or replace function public.handle_new_user()
-- returns trigger language plpgsql security definer as $$
-- begin
--   insert into public.user_profiles (id, name)
--   values (
--     new.id,
--     coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
--   )
--   on conflict (id) do nothing;
--   return new;
-- end;
-- $$;

-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();


-- -- ── Done ──────────────────────────────────────────────────────────
-- -- Tables:   user_profiles, tasks
-- -- Indexes:  tasks_user_created, tasks_user_done
-- -- RLS:      all tables protected
-- -- Trigger:  auto-create profile on signup
-- -- View:     leaderboard (optional)


-- -- ============================================================
-- --  TASKR — Realtime & Notifications Schema (Addendum)
-- --  Paste this block into Supabase SQL Editor and Run
-- -- ============================================================

-- -- ── PARTNER CONNECTIONS ───────────────────────────────────────────
-- -- Stores accepted partner pairs.
-- -- Each row represents one directional connection (A → B).
-- -- We insert two rows per pair so each user can query their own.

-- create table if not exists public.partner_connections (
--   id           uuid        primary key default gen_random_uuid(),
--   user_id      uuid        not null references auth.users(id) on delete cascade,
--   partner_id   uuid        not null references auth.users(id) on delete cascade,
--   partner_name text        not null,
--   status       text        not null default 'active'
--                            check (status in ('pending', 'active', 'removed')),
--   created_at   timestamptz not null default now(),
--   unique (user_id, partner_id)
-- );

-- alter table public.partner_connections enable row level security;

-- create policy "Users manage own connections"
--   on public.partner_connections for all
--   using  (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

-- create index if not exists partner_connections_user
--   on public.partner_connections (user_id, status);


-- -- ── PARTNER INVITES ───────────────────────────────────────────────
-- -- Invite codes — a user generates a code, shares it, partner enters it.

-- create table if not exists public.partner_invites (
--   code        text        primary key,              -- 6-char uppercase e.g. "XK9M2A"
--   inviter_id  uuid        not null references auth.users(id) on delete cascade,
--   inviter_name text       not null,
--   accepted_by uuid        references auth.users(id) on delete set null,
--   used        boolean     not null default false,
--   expires_at  timestamptz not null default (now() + interval '24 hours'),
--   created_at  timestamptz not null default now()
-- );

-- alter table public.partner_invites enable row level security;

-- -- Anyone authenticated can read an invite by code (to accept it)
-- create policy "Anyone can read invites"
--   on public.partner_invites for select
--   using (auth.uid() is not null);

-- -- Only the inviter can create
-- create policy "Inviter can create"
--   on public.partner_invites for insert
--   with check (auth.uid() = inviter_id);

-- -- Inviter OR acceptor can update (mark as used)
-- create policy "Inviter or acceptor can update"
--   on public.partner_invites for update
--   using (auth.uid() = inviter_id or auth.uid() = accepted_by);


-- -- ── ACTIVITY FEED ─────────────────────────────────────────────────
-- -- Real-time events broadcast to partners.
-- -- Supabase Realtime listens on INSERT for instant delivery.

-- create table if not exists public.activity_feed (
--   id           uuid        primary key default gen_random_uuid(),
--   user_id      uuid        not null references auth.users(id) on delete cascade,
--   partner_id   uuid        not null references auth.users(id) on delete cascade,
--   actor_name   text        not null,
--   action       text        not null
--                            check (action in ('completed','streak','level_up','nudge','checkin')),
--   text         text        not null default '',
--   xp           integer     not null default 0,
--   meta         jsonb       not null default '{}',
--   created_at   timestamptz not null default now()
-- );

-- alter table public.activity_feed enable row level security;

-- -- Users see events where they are the recipient (partner_id = them)
-- -- OR events they sent (user_id = them)
-- create policy "Users see own feed"
--   on public.activity_feed for select
--   using (auth.uid() = partner_id or auth.uid() = user_id);

-- create policy "Users insert own events"
--   on public.activity_feed for insert
--   with check (auth.uid() = user_id);

-- create index if not exists activity_feed_partner
--   on public.activity_feed (partner_id, created_at desc);

-- create index if not exists activity_feed_user
--   on public.activity_feed (user_id, created_at desc);


-- -- ── IN-APP NOTIFICATIONS ──────────────────────────────────────────
-- -- Persistent notifications per user.
-- -- Realtime INSERT triggers the bell badge in the UI.

-- create table if not exists public.notifications (
--   id           uuid        primary key default gen_random_uuid(),
--   user_id      uuid        not null references auth.users(id) on delete cascade,
--   type         text        not null
--                            check (type in ('nudge','partner_joined','partner_completed','streak_milestone','level_up','checkin')),
--   title        text        not null,
--   body         text        not null default '',
--   read         boolean     not null default false,
--   meta         jsonb       not null default '{}',
--   created_at   timestamptz not null default now()
-- );

-- alter table public.notifications enable row level security;

-- create policy "Users see own notifications"
--   on public.notifications for select
--   using (auth.uid() = user_id);

-- create policy "Users insert own notifications"
--   on public.notifications for insert
--   with check (auth.uid() = user_id);

-- create policy "Users update own notifications"
--   on public.notifications for update
--   using (auth.uid() = user_id);

-- create index if not exists notifications_user_unread
--   on public.notifications (user_id, read, created_at desc);


-- -- ── Enable Realtime on the tables that need live updates ──────────
-- -- Run this in the SQL editor OR enable via Dashboard:
-- --   Database → Replication → Tables → toggle these ON

-- alter publication supabase_realtime add table public.activity_feed;
-- alter publication supabase_realtime add table public.notifications;







-- ============================================================
-- TASKR PRODUCTION DATABASE SCHEMA
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'task_priority'
  ) THEN
    CREATE TYPE task_priority AS ENUM (
      'urgent',
      'high',
      'medium',
      'low'
    );
  END IF;
END $$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT 'Taskr User',

  total_xp INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,

  week_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,

  last_completed_day TIMESTAMPTZ,

  streak_freezes INTEGER NOT NULL DEFAULT 2,

  daily_activity JSONB NOT NULL DEFAULT '{}',

  unlocked_milestones INTEGER[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT total_xp_positive
    CHECK (total_xp >= 0),

  CONSTRAINT weekly_xp_positive
    CHECK (weekly_xp >= 0),

  CONSTRAINT streak_positive
    CHECK (streak >= 0),

  CONSTRAINT longest_streak_positive
    CHECK (longest_streak >= 0),

  CONSTRAINT freezes_positive
    CHECK (streak_freezes >= 0)
);

DROP TRIGGER IF EXISTS user_profiles_updated_at
ON public.user_profiles;

CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.touch_updated_at();

-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tasks (

  id TEXT PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  text TEXT NOT NULL,

  done BOOLEAN NOT NULL DEFAULT FALSE,

  priority task_priority NOT NULL DEFAULT 'medium',

  category TEXT,

  tags TEXT[] NOT NULL DEFAULT '{}',

  due_date TIMESTAMPTZ,

  recurring TEXT
    CHECK (
      recurring IN ('daily','weekly','monthly')
      OR recurring IS NULL
    ),

  notes TEXT NOT NULL DEFAULT '',

  subtasks JSONB NOT NULL DEFAULT '[]',

  archived BOOLEAN NOT NULL DEFAULT FALSE,

  archived_at TIMESTAMPTZ,

  completed_at TIMESTAMPTZ,

  xp_awarded BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tasks_updated_at
ON public.tasks;

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE PROCEDURE public.touch_updated_at();

-- ============================================================
-- USER STATISTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_stats (

  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  tasks_completed INTEGER NOT NULL DEFAULT 0,

  tasks_created INTEGER NOT NULL DEFAULT 0,

  total_focus_minutes INTEGER NOT NULL DEFAULT 0,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTNER CONNECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.partner_connections (

  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  partner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  partner_name TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (
      status IN (
        'pending',
        'active',
        'removed'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_partner
    CHECK (user_id <> partner_id),

  UNIQUE(user_id, partner_id)
);

-- ============================================================
-- PARTNER INVITES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.partner_invites (

  code TEXT PRIMARY KEY,

  inviter_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  inviter_name TEXT NOT NULL,

  accepted_by UUID
    REFERENCES auth.users(id)
    ON DELETE SET NULL,

  used BOOLEAN NOT NULL DEFAULT FALSE,

  expires_at TIMESTAMPTZ NOT NULL
    DEFAULT (NOW() + INTERVAL '24 hours'),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY FEED
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_feed (

  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  partner_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  actor_name TEXT NOT NULL,

  action TEXT NOT NULL
    CHECK (
      action IN (
        'completed',
        'streak',
        'level_up',
        'nudge',
        'checkin'
      )
    ),

  text TEXT NOT NULL DEFAULT '',

  xp INTEGER NOT NULL DEFAULT 0,

  meta JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (

  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  type TEXT NOT NULL
    CHECK (
      type IN (
        'nudge',
        'partner_joined',
        'partner_completed',
        'streak_milestone',
        'level_up',
        'checkin'
      )
    ),

  title TEXT NOT NULL,

  body TEXT NOT NULL DEFAULT '',

  read BOOLEAN NOT NULL DEFAULT FALSE,

  read_at TIMESTAMPTZ,

  meta JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS tasks_user_created
ON public.tasks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS tasks_user_done
ON public.tasks(user_id, done);

CREATE INDEX IF NOT EXISTS tasks_due_date
ON public.tasks(user_id, due_date);

CREATE INDEX IF NOT EXISTS tasks_priority
ON public.tasks(user_id, priority);

CREATE INDEX IF NOT EXISTS partner_connections_user
ON public.partner_connections(user_id, status);

CREATE INDEX IF NOT EXISTS partner_connections_partner
ON public.partner_connections(partner_id);

CREATE INDEX IF NOT EXISTS activity_feed_partner
ON public.activity_feed(partner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS activity_feed_user
ON public.activity_feed(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread
ON public.notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_created
ON public.notifications(user_id, created_at DESC);

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER PROFILE POLICIES
-- ============================================================

CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = id);

-- ============================================================
-- TASK POLICIES
-- ============================================================

CREATE POLICY "Users can view own tasks"
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- PARTNER CONNECTIONS POLICIES
-- ============================================================

CREATE POLICY "Users manage own connections"
ON public.partner_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PARTNER INVITES POLICIES
-- ============================================================

CREATE POLICY "Anyone can read invites"
ON public.partner_invites
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inviter can create"
ON public.partner_invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Inviter or acceptor can update"
ON public.partner_invites
FOR UPDATE
USING (
  auth.uid() = inviter_id
  OR auth.uid() = accepted_by
)
WITH CHECK (
  auth.uid() = inviter_id
  OR auth.uid() = accepted_by
);

-- ============================================================
-- ACTIVITY FEED POLICIES
-- ============================================================

CREATE POLICY "Users see own feed"
ON public.activity_feed
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = partner_id
);

CREATE POLICY "Users insert own events"
ON public.activity_feed
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

CREATE POLICY "Users see own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.leaderboard
WITH (security_barrier = true)
AS
SELECT
  id,
  name,
  total_xp AS xp,
  weekly_xp,
  streak
FROM public.user_profiles
ORDER BY total_xp DESC
LIMIT 100;

GRANT SELECT
ON public.leaderboard
TO authenticated;

-- ============================================================
-- AUTO CREATE USER PROFILE
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  INSERT INTO public.user_profiles (
    id,
    name
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email,'@',1)
    )
  )
  ON CONFLICT (id)
  DO NOTHING;

  INSERT INTO public.user_stats(user_id)
  VALUES (new.id)
  ON CONFLICT (user_id)
  DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- AUTO NOTIFICATION CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification_from_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    meta
  )
  VALUES (
    NEW.partner_id,
    CASE
      WHEN NEW.action = 'completed'
      THEN 'partner_completed'
      WHEN NEW.action = 'level_up'
      THEN 'level_up'
      WHEN NEW.action = 'streak'
      THEN 'streak_milestone'
      ELSE 'checkin'
    END,
    NEW.actor_name || ' activity',
    NEW.text,
    NEW.meta
  );

  RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS activity_notification_trigger
ON public.activity_feed;

CREATE TRIGGER activity_notification_trigger
AFTER INSERT ON public.activity_feed
FOR EACH ROW
EXECUTE PROCEDURE public.create_notification_from_activity();

-- ============================================================
-- CLEANUP EXPIRED INVITES
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS VOID
LANGUAGE SQL
AS $$
DELETE
FROM public.partner_invites
WHERE expires_at < NOW();
$$;

-- ============================================================
-- SAFE REALTIME REGISTRATION
-- ============================================================

DO $$
BEGIN

  BEGIN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.activity_feed;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

END $$;

-- ============================================================
-- END OF SCHEMA
-- ============================================================