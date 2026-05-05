-- Admin access for Sanctuary operations.
-- Run this in Supabase SQL Editor after the user account exists.

update public.users
set rol = 'admin',
    estado = 'activo'
where lower(email) = lower('joacopc123@gmail.com');

drop policy if exists "Admins can view all checkins" on public.checkins;
create policy "Admins can view all checkins"
on public.checkins
for select
using (public.get_auth_user_role() = 'admin');

drop policy if exists "Admins can view all brotes" on public.brotes;
create policy "Admins can view all brotes"
on public.brotes
for select
using (public.get_auth_user_role() = 'admin');

drop policy if exists "Admins can view all perfiles clinicos" on public.perfil_clinico_inicial;
create policy "Admins can view all perfiles clinicos"
on public.perfil_clinico_inicial
for select
using (public.get_auth_user_role() = 'admin');

drop policy if exists "Admins can view all sesiones" on public.sesiones;
create policy "Admins can view all sesiones"
on public.sesiones
for select
using (public.get_auth_user_role() = 'admin');

drop policy if exists "Admins can view all uso herramientas" on public.uso_herramientas;
create policy "Admins can view all uso herramientas"
on public.uso_herramientas
for select
using (public.get_auth_user_role() = 'admin');
