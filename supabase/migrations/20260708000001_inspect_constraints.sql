do $$
declare
  rec record;
begin
  for rec in
    select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid in ('public.payment_requests'::regclass, 'public.orders'::regclass)
      and contype = 'c'
  loop
    raise notice '%.% -> %', rec.table_name, rec.conname, rec.definition;
  end loop;
end $$;
