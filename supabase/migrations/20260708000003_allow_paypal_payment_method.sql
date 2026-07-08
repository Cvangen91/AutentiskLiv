-- payment_requests.payment_method only allowed 'invoice' and 'vipps' — add 'paypal'.
alter table public.payment_requests
  drop constraint payment_requests_payment_method_check;

alter table public.payment_requests
  add constraint payment_requests_payment_method_check
  check (payment_method = any (array['invoice', 'vipps', 'paypal']));
