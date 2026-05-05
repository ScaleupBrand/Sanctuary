-- Therapist supervision notes and tool management policies

create table if not exists public.notas_supervision (
  id uuid default uuid_generate_v4() primary key,
  terapeuta_id uuid references public.users(id) on delete cascade not null,
  contenido text not null check (char_length(contenido) <= 3000),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notas_supervision enable row level security;

drop policy if exists "Therapists can manage own supervision notes" on public.notas_supervision;
create policy "Therapists can manage own supervision notes"
on public.notas_supervision
for all
using (
  auth.uid() = terapeuta_id
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
)
with check (
  auth.uid() = terapeuta_id
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);

drop policy if exists "Admins can view all supervision notes" on public.notas_supervision;
create policy "Admins can view all supervision notes"
on public.notas_supervision
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol = 'admin'
  )
);

drop policy if exists "Therapists can view all herramientas" on public.herramientas;
create policy "Therapists can view all herramientas"
on public.herramientas
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);

drop policy if exists "Therapists can create herramientas" on public.herramientas;
create policy "Therapists can create herramientas"
on public.herramientas
for insert
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);

drop policy if exists "Therapists can update herramientas" on public.herramientas;
create policy "Therapists can update herramientas"
on public.herramientas
for update
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);
