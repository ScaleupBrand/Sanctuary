create table if not exists public.sesiones_agendadas (
  id uuid default uuid_generate_v4() primary key,
  terapeuta_id uuid references public.users(id) on delete cascade not null,
  clienta_id uuid references public.users(id) on delete cascade not null,
  fecha_hora timestamp with time zone not null,
  notas_previas text,
  estado text default 'programada' not null check (estado in ('programada', 'completada', 'cancelada')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sesiones_agendadas enable row level security;

drop policy if exists "Clientas can view own scheduled sessions" on public.sesiones_agendadas;
create policy "Clientas can view own scheduled sessions"
on public.sesiones_agendadas
for select
using (auth.uid() = clienta_id);

drop policy if exists "Therapists can view own scheduled sessions" on public.sesiones_agendadas;
create policy "Therapists can view own scheduled sessions"
on public.sesiones_agendadas
for select
using (
  auth.uid() = terapeuta_id
  or public.get_auth_user_role() = 'admin'
);

drop policy if exists "Therapists can create scheduled sessions" on public.sesiones_agendadas;
create policy "Therapists can create scheduled sessions"
on public.sesiones_agendadas
for insert
with check (
  (
    auth.uid() = terapeuta_id
    and exists (
      select 1
      from public.users u
      where u.id = public.sesiones_agendadas.clienta_id
        and u.rol = 'clienta'
        and u.terapeuta_asignada = auth.uid()
    )
  )
  or public.get_auth_user_role() = 'admin'
);

drop policy if exists "Therapists can update own scheduled sessions" on public.sesiones_agendadas;
create policy "Therapists can update own scheduled sessions"
on public.sesiones_agendadas
for update
using (
  auth.uid() = terapeuta_id
  or public.get_auth_user_role() = 'admin'
)
with check (
  auth.uid() = terapeuta_id
  or public.get_auth_user_role() = 'admin'
);

create index if not exists sesiones_agendadas_terapeuta_fecha_idx
on public.sesiones_agendadas (terapeuta_id, fecha_hora);

create index if not exists sesiones_agendadas_clienta_fecha_idx
on public.sesiones_agendadas (clienta_id, fecha_hora);
