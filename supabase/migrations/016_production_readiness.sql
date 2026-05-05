-- Production readiness hardening for Sanctuary.
-- Run after migrations 001-015 in Supabase SQL Editor or via Supabase CLI.

-- Helper functions avoid recursive RLS checks and keep policies readable.
create or replace function public.is_active_client(target_user uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = target_user
      and u.rol = 'clienta'
      and u.estado = 'activo'
  );
$$;

create or replace function public.is_therapist_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
      and u.estado = 'activo'
  );
$$;

-- Clinical profile: clientas can create/update only while active.
drop policy if exists "Clientas can view own perfil" on public.perfil_clinico_inicial;
create policy "Clientas can view own perfil"
on public.perfil_clinico_inicial
for select
using (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can create own perfil" on public.perfil_clinico_inicial;
create policy "Clientas can create own perfil"
on public.perfil_clinico_inicial
for insert
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can update own perfil" on public.perfil_clinico_inicial;
create policy "Clientas can update own perfil"
on public.perfil_clinico_inicial
for update
using (auth.uid() = usuario_id and public.is_active_client(usuario_id))
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

-- Client data: inactive/revoked users keep their data, but cannot keep writing.
drop policy if exists "Clientas can manage own checkins" on public.checkins;
create policy "Clientas can manage own checkins"
on public.checkins
for all
using (auth.uid() = usuario_id and public.is_active_client(usuario_id))
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can manage own brotes" on public.brotes;
create policy "Clientas can manage own brotes"
on public.brotes
for all
using (auth.uid() = usuario_id and public.is_active_client(usuario_id))
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can manage own herramientas usage" on public.uso_herramientas;
create policy "Clientas can manage own herramientas usage"
on public.uso_herramientas
for all
using (auth.uid() = usuario_id and public.is_active_client(usuario_id))
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can view own sesiones" on public.sesiones;
create policy "Clientas can view own sesiones"
on public.sesiones
for select
using (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can update own sesiones (preguntas)" on public.sesiones;
create policy "Clientas can update own sesiones (preguntas)"
on public.sesiones
for update
using (auth.uid() = usuario_id and public.is_active_client(usuario_id))
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can create own sesiones" on public.sesiones;
create policy "Clientas can create own sesiones"
on public.sesiones
for insert
with check (auth.uid() = usuario_id and public.is_active_client(usuario_id));

drop policy if exists "Clientas can view own scheduled sessions" on public.sesiones_agendadas;
create policy "Clientas can view own scheduled sessions"
on public.sesiones_agendadas
for select
using (auth.uid() = clienta_id and public.is_active_client(clienta_id));

-- Resources should not be publicly readable through table RLS; only authenticated app users.
drop policy if exists "Anyone can view active herramientas" on public.herramientas;
create policy "Authenticated users can view active herramientas"
on public.herramientas
for select
using (
  activa = true
  and (
    public.is_active_client(auth.uid())
    or public.is_therapist_or_admin()
  )
);

-- Storage buckets must exist in production.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recursos',
  'recursos',
  true,
  52428800,
  array[
    'audio/mpeg',
    'audio/mp3',
    'audio/m4a',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

