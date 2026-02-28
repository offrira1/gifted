-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users are managed by Supabase Auth; we reference auth.users
-- events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('wedding', 'bar_mitzvah', 'bat_mitzvah', 'private', 'other')),
  owner_display_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_address TEXT,
  private_area_password TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  bank_account_number TEXT,
  bank_beneficiary_name TEXT,
  bank_iban TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  welcome_text TEXT,
  cover_media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- gifts (donations/blessings)
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  giver_display_name TEXT NOT NULL,
  blessing_text TEXT,
  payer_first_name TEXT NOT NULL,
  payer_last_name TEXT NOT NULL,
  media_url TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 10),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bit', 'paybox', 'paypal', 'google_pay', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_gifts_event ON public.gifts(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON public.gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON public.gifts(created_at);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Events: owner can do everything; public can only read for public event page (we'll allow read by id in app)
CREATE POLICY "Users can read own events"
  ON public.events FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Public read event by id (for public event page /e/[id])
CREATE POLICY "Public can read event by id"
  ON public.events FOR SELECT
  USING (true);

-- Gifts: only event owner can read/update; anon and authenticated can insert (guest flow)
CREATE POLICY "Event owner can read gifts"
  ON public.gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = gifts.event_id AND e.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert gift"
  ON public.gifts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Event owner can update gift status"
  ON public.gifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = gifts.event_id AND e.owner_user_id = auth.uid()
    )
  );

-- Service role will be used for server-side reads of events by id for public page if we need to bypass RLS; anon can actually select events (we allowed it). So public event page can read event. For gifts insert we need anon - we allowed "Anyone can insert gift". Good.

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
