-- Add 'omitido' column to checkins table
ALTER TABLE public.checkins ADD COLUMN omitido boolean DEFAULT false;

-- Add 'hora_checkin' column to perfil_clinico_inicial table
ALTER TABLE public.perfil_clinico_inicial ADD COLUMN hora_checkin time without time zone DEFAULT '08:00:00';
