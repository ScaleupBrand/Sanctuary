-- Alter the check constraint on estado to include 'pendiente'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_estado_check;
ALTER TABLE public.users ADD CONSTRAINT users_estado_check CHECK (estado IN ('activo', 'inactivo', 'pendiente'));

-- Set default to 'pendiente'
ALTER TABLE public.users ALTER COLUMN estado SET DEFAULT 'pendiente';
