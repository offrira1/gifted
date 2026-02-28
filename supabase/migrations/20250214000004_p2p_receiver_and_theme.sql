-- P2P spec: Receiver BIT/PayBox phones, suggested amounts, theme
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS bit_phone TEXT,
  ADD COLUMN IF NOT EXISTS paybox_phone TEXT,
  ADD COLUMN IF NOT EXISTS suggested_amounts INTEGER[] DEFAULT ARRAY[100, 200, 500, 1000],
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#c41e5a';
