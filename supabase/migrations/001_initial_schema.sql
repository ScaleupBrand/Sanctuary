-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Enum for roles
create type user_role as enum ('clienta', 'terapeuta', 'admin');

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  email text not null,
  rol user_role default 'clienta'::user_role not null,
  terapeuta_asignada uuid references public.users(id),
  estado text default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Perfil Clínico Inicial
create table public.perfil_clinico_inicial (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  sintomas_principales text,
  tiempo_diagnostico text,
  tratamientos_previos text,
  fase_metodo integer check (fase_metodo between 1 and 4) default 1,
  fecha_diagnostico_inicial date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Checkins Diarios
create table public.checkins (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  fecha date default CURRENT_DATE not null,
  energia integer check (energia between 1 and 5),
  dolor integer check (dolor between 1 and 5),
  alerta_ansiedad integer check (alerta_ansiedad between 1 and 5),
  sueno text check (sueno in ('mal', 'medio', 'bien')),
  hubo_brote boolean default false,
  nota_libre text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brotes
create table public.brotes (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  fecha date default CURRENT_DATE not null,
  hora time without time zone default CURRENT_TIME not null,
  que_siente text,
  intensidad integer check (intensidad between 1 and 5),
  zona_corporal text,
  posible_causa text,
  que_paso_antes text,
  que_hizo_para_regularse text,
  duracion_estimada text,
  sigue_activo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Herramientas
create table public.herramientas (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  tipo text check (tipo in ('audio', 'practica', 'checklist', 'protocolo')),
  duracion integer,
  fase_metodo integer check (fase_metodo between 1 and 4),
  archivo_url text,
  contenido text,
  activa boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Uso de Herramientas
create table public.uso_herramientas (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  herramienta_id uuid references public.herramientas(id) on delete cascade not null,
  fecha timestamp with time zone default timezone('utc'::text, now()) not null,
  completada boolean default false
);

-- Sesiones
create table public.sesiones (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  terapeuta_id uuid references public.users(id) on delete set null,
  fecha_programada timestamp with time zone not null,
  resumen_semanal text,
  preguntas_para_llevar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Configuration

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.perfil_clinico_inicial enable row level security;
alter table public.checkins enable row level security;
alter table public.brotes enable row level security;
alter table public.herramientas enable row level security;
alter table public.uso_herramientas enable row level security;
alter table public.sesiones enable row level security;

-- Users Policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Terapeutas can view assigned clientas" on public.users
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.rol = 'terapeuta'
    )
    and (terapeuta_asignada = auth.uid())
  );

create policy "Admins can view all users" on public.users
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.rol = 'admin'
    )
  );

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Perfil Clinico Inicial Policies
create policy "Clientas can view own perfil" on public.perfil_clinico_inicial
  for select using (auth.uid() = usuario_id);

create policy "Terapeutas can view clientas perfiles" on public.perfil_clinico_inicial
  for select using (
    exists (
      select 1 from public.users u
      where u.id = public.perfil_clinico_inicial.usuario_id and u.terapeuta_asignada = auth.uid()
    )
  );

-- Checkins Policies
create policy "Clientas can manage own checkins" on public.checkins
  for all using (auth.uid() = usuario_id);

create policy "Terapeutas can view clientas checkins" on public.checkins
  for select using (
    exists (
      select 1 from public.users u
      where u.id = public.checkins.usuario_id and u.terapeuta_asignada = auth.uid()
    )
  );

-- Brotes Policies
create policy "Clientas can manage own brotes" on public.brotes
  for all using (auth.uid() = usuario_id);

create policy "Terapeutas can view clientas brotes" on public.brotes
  for select using (
    exists (
      select 1 from public.users u
      where u.id = public.brotes.usuario_id and u.terapeuta_asignada = auth.uid()
    )
  );

-- Herramientas Policies
create policy "Anyone can view active herramientas" on public.herramientas
  for select using (activa = true);

-- Uso de Herramientas Policies
create policy "Clientas can manage own herramientas usage" on public.uso_herramientas
  for all using (auth.uid() = usuario_id);

create policy "Terapeutas can view clientas herramientas usage" on public.uso_herramientas
  for select using (
    exists (
      select 1 from public.users u
      where u.id = public.uso_herramientas.usuario_id and u.terapeuta_asignada = auth.uid()
    )
  );

-- Sesiones Policies
create policy "Clientas can view own sesiones" on public.sesiones
  for select using (auth.uid() = usuario_id);

create policy "Clientas can update own sesiones (preguntas)" on public.sesiones
  for update using (auth.uid() = usuario_id);

create policy "Terapeutas can manage clientas sesiones" on public.sesiones
  for all using (auth.uid() = terapeuta_id);
