-- supabase_institution_admin_rls.sql

-- 0. Helper function to check if the current user is an institution admin without recursion
CREATE OR REPLACE FUNCTION public.is_institution_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('institution_admin', 'institution') FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 1. Allow institution admins to read their students' user profiles
DROP POLICY IF EXISTS "Institution admins can read their students" ON public.users;
CREATE POLICY "Institution admins can read their students" ON public.users
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND institution_id = public.get_my_institution_id()
  );

-- 2. Allow institution admins to read all industry users (for placement company names)
DROP POLICY IF EXISTS "Institution admins can read industry users" ON public.users;
CREATE POLICY "Institution admins can read industry users" ON public.users
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND role = 'industry'
  );

-- 3. Allow institution admins to read placement records for their students
DROP POLICY IF EXISTS "Institution admins can read placement records" ON public.placement_records;
CREATE POLICY "Institution admins can read placement records" ON public.placement_records
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND student_id IN (
        SELECT id FROM public.users WHERE institution_id = public.get_my_institution_id()
    )
  );

-- 4. Allow institution admins to read certifications for their students
DROP POLICY IF EXISTS "Institution admins can read certifications" ON public.certifications;
CREATE POLICY "Institution admins can read certifications" ON public.certifications
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND student_id IN (
        SELECT id FROM public.users WHERE institution_id = public.get_my_institution_id()
    )
  );

-- 5. Allow institution admins to read opportunities (for placement details)
DROP POLICY IF EXISTS "Institution admins can read opportunities" ON public.opportunities;
CREATE POLICY "Institution admins can read opportunities" ON public.opportunities
  FOR SELECT
  USING (
    public.is_institution_admin()
  );
