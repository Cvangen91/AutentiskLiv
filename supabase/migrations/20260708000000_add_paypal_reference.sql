-- Stores the PayPal order id so we can look up / verify a payment later
-- (e.g. from the capture edge function or when debugging a disputed payment).
alter table public.payment_requests
  add column if not exists provider_reference text;
