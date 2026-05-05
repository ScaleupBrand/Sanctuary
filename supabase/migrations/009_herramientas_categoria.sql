alter table public.herramientas
add column if not exists categoria text default 'regulacion'
check (categoria in ('respiracion', 'enraizamiento', 'movimiento', 'meditacion', 'regulacion', 'emergencia'));
