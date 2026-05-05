drop policy if exists "Terapeutas can view assigned clientas sesiones" on public.sesiones;
create policy "Terapeutas can view assigned clientas sesiones"
on public.sesiones
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = public.sesiones.usuario_id
      and u.terapeuta_asignada = auth.uid()
  )
);
