-- Fix infinite recursion by using a security definer function for role checks
-- and add the missing INSERT policy.

-- 1. Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Terapeutas can view assigned clientas" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- 2. Create a security definer function to get the current user's role safely
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.users WHERE id = auth.uid();
$$;

-- 3. Recreate the policies using the function
CREATE POLICY "Terapeutas can view assigned clientas" ON public.users
  FOR SELECT USING (
    get_auth_user_role() = 'terapeuta'
    AND terapeuta_asignada = auth.uid()
  );

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    get_auth_user_role() = 'admin'
  );

-- 4. Add the missing INSERT policy so users can register!
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
