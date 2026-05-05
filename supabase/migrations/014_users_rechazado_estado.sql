alter table public.users
drop constraint if exists users_estado_check;

alter table public.users
add constraint users_estado_check
check (estado in ('activo', 'inactivo', 'pendiente', 'rechazado'));
