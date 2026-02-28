-- BIT "me" payment link: https://www.bitpay.co.il/app/me/{ID}
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS bit_me_id TEXT;
