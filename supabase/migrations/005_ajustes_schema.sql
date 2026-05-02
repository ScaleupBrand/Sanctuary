-- Migrations for Ajustes (Settings)

-- 1. Add new columns to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notificaciones_activas boolean DEFAULT true;

-- 2. Add new columns to public.perfil_clinico_inicial
ALTER TABLE public.perfil_clinico_inicial ADD COLUMN IF NOT EXISTS hora_checkin time without time zone DEFAULT '20:00';

-- 3. Create 'avatars' Storage Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Bucket Policies for 'avatars'
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "avatars_public_access" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Allow public access to view avatars
CREATE POLICY "avatars_public_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own avatars
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own avatars
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );
