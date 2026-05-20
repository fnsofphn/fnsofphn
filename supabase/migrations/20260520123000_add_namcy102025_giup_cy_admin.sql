create or replace function public.is_giup_cy_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'fnsofphn@gmail.com',
    'namcy@gmail.com',
    'namcy102025@gmail.com'
  )
$$;
