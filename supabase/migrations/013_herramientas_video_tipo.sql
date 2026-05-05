alter table public.herramientas
drop constraint if exists herramientas_tipo_check;

alter table public.herramientas
add constraint herramientas_tipo_check
check (tipo in ('audio', 'practica', 'checklist', 'protocolo', 'video'));
