-- Single admin mode: events can have no Supabase user (owner_user_id null)
ALTER TABLE public.events
  ALTER COLUMN owner_user_id DROP NOT NULL;

-- Drop the foreign key so we can have null (optional; in PostgreSQL we can keep the FK and null is allowed)
-- ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_owner_user_id_fkey;
-- We keep the FK: null is allowed, non-null must reference auth.users
