-- Fix for broken own-profile SELECT policy on public.users
-- and removal of the recursive "Academicians can read all users" policy.

-- 1. Ensure the recursive policy is dropped (this causes infinite recursion when combined with other policies)
DROP POLICY IF EXISTS "Academicians can read all users" ON public.users;

-- 2. Ensure users can always read their own profile (this fixes the missing name/email in the UI and the role routing)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
