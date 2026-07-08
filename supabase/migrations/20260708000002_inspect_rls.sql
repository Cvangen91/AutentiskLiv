do $$
declare
  rec record;
begin
  for rec in
    select schemaname, tablename, policyname, cmd, roles, qual, with_check
    from pg_policies
    where tablename in ('orders', 'order_items', 'payment_requests', 'bookings', 'time_slots', 'enrollments')
    order by tablename, cmd
  loop
    raise notice '% % [%] roles=% using=% check=%', rec.tablename, rec.policyname, rec.cmd, rec.roles, rec.qual, rec.with_check;
  end loop;
end $$;
