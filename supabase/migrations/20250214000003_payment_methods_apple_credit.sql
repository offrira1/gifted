-- Allow apple_pay and credit_card in gifts.payment_method
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_payment_method_check;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_payment_method_check
  CHECK (payment_method IN ('bit', 'paybox', 'paypal', 'google_pay', 'apple_pay', 'credit_card', 'bank_transfer'));
