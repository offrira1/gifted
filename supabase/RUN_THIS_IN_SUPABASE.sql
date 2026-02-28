-- ============================================================
-- Gifted: הרץ את כל הסקריפט הזה ב-Supabase SQL Editor (פעם אחת)
-- Dashboard → SQL Editor → New query → הדבק והרץ
-- ============================================================

-- 1) טבלאות events + gifts
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  bit_phone TEXT,
  paybox_phone TEXT,
  suggested_amounts INTEGER[] DEFAULT ARRAY[100, 200, 500, 1000],
  theme_color TEXT DEFAULT '#c41e5a',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  giver_display_name TEXT NOT NULL,
  blessing_text TEXT,
  payer_first_name TEXT NOT NULL,
  payer_last_name TEXT NOT NULL,
  media_url TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 10),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bit', 'paybox', 'paypal', 'google_pay', 'apple_pay', 'credit_card', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_gifts_event ON public.gifts(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON public.gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON public.gifts(created_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own events" ON public.events;
CREATE POLICY "Users can read own events" ON public.events FOR SELECT USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can update own events" ON public.events;
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Public can read event by id" ON public.events;
CREATE POLICY "Public can read event by id" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Event owner can read gifts" ON public.gifts;
CREATE POLICY "Event owner can read gifts" ON public.gifts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = gifts.event_id AND e.owner_user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can insert gift" ON public.gifts;
CREATE POLICY "Anyone can insert gift" ON public.gifts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Event owner can update gift status" ON public.gifts;
CREATE POLICY "Event owner can update gift status" ON public.gifts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = gifts.event_id AND e.owner_user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 2) Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-media',
  'event-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read event-media" ON storage.objects;
CREATE POLICY "Public read event-media" ON storage.objects FOR SELECT USING (bucket_id = 'event-media');

DROP POLICY IF EXISTS "Authenticated upload event-media" ON storage.objects;
CREATE POLICY "Authenticated upload event-media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anon insert event-media" ON storage.objects;
CREATE POLICY "Anon insert event-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-media');

DROP POLICY IF EXISTS "Users update own event-media" ON storage.objects;
CREATE POLICY "Users update own event-media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own event-media" ON storage.objects;
CREATE POLICY "Users delete own event-media" ON storage.objects FOR DELETE
  USING (bucket_id = 'event-media' AND auth.uid()::text = (storage.foldername(name))[1]);
