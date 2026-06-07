-- supabase-rpc-increment-xp.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase Studio → SQL Editor.
-- Creates the increment_xp RPC function called by FocusMode.jsx
-- and any other XP-awarding flows.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_xp(user_id_input UUID, xp_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_xp  INT;
  new_xp      INT;
  new_weekly  INT;
BEGIN
  -- Get current XP values
  SELECT total_xp, weekly_xp
  INTO current_xp, new_weekly
  FROM user_profiles
  WHERE user_id = user_id_input;

  -- Calculate new values
  new_xp     := COALESCE(current_xp, 0) + xp_amount;
  new_weekly := COALESCE(new_weekly,  0) + xp_amount;

  -- Update user_profiles
  UPDATE user_profiles
  SET
    total_xp  = new_xp,
    weekly_xp = new_weekly,
    updated_at = now()
  WHERE user_id = user_id_input;

  -- If no row exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, total_xp, weekly_xp)
    VALUES (user_id_input, xp_amount, xp_amount);
  END IF;
END;
$$;

-- Grant execute to authenticated users (they can only call it for themselves
-- because the function uses the user_id_input parameter, which the app passes
-- from the authenticated session)
GRANT EXECUTE ON FUNCTION increment_xp(UUID, INT) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- Also run this weekly reset function (call via a cron Edge Function or
-- Supabase pg_cron if available on your plan):
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reset_weekly_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles SET weekly_xp = 0;
END;
$$;

-- To schedule weekly reset at midnight every Monday:
-- SELECT cron.schedule('reset-weekly-xp', '0 0 * * 1', 'SELECT reset_weekly_xp()');