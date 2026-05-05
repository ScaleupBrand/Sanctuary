-- High-priority fixes for production readiness.

-- 1. Check-ins must be one row per clienta and clinical date.
-- If duplicates already exist, keep the most recent row per user/date.
with ranked_checkins as (
  select
    id,
    row_number() over (
      partition by usuario_id, fecha
      order by created_at desc, id desc
    ) as rn
  from public.checkins
)
delete from public.checkins c
using ranked_checkins r
where c.id = r.id
  and r.rn > 1;

alter table public.checkins
drop constraint if exists checkins_usuario_fecha_unique;

alter table public.checkins
add constraint checkins_usuario_fecha_unique unique (usuario_id, fecha);

-- 2. Clientas need to create preparation rows for the next scheduled session.
drop policy if exists "Clientas can create own sesiones" on public.sesiones;
create policy "Clientas can create own sesiones"
on public.sesiones
for insert
with check (auth.uid() = usuario_id);

-- 3. Therapists/admins can delete resources from the Biblioteca.
drop policy if exists "Therapists can delete herramientas" on public.herramientas;
create policy "Therapists can delete herramientas"
on public.herramientas
for delete
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);
