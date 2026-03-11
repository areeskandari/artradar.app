-- Fix: infinite recursion in admin_profiles RLS
-- Run this in Supabase SQL Editor once.

-- 1. Drop the recursive policy
DROP POLICY IF EXISTS "Super admin manages all profiles" ON admin_profiles;

-- 2. Function that checks super_admin without triggering RLS (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Recreate the policy using the function (no self-reference → no recursion)
CREATE POLICY "Super admin manages all profiles" ON admin_profiles FOR ALL
  USING (public.is_super_admin());
