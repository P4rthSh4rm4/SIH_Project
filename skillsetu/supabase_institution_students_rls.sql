-- supabase_institution_students_rls.sql

-- 1. Allow institution admins to read student_profiles of their students
DROP POLICY IF EXISTS "Institution admins can read student profiles" ON public.student_profiles;
CREATE POLICY "Institution admins can read student profiles" ON public.student_profiles
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND user_id IN (
        SELECT id FROM public.users WHERE institution_id = public.get_my_institution_id()
    )
  );

-- 2. Allow institution admins to read student_skills of their students
DROP POLICY IF EXISTS "Institution admins can read student skills" ON public.student_skills;
CREATE POLICY "Institution admins can read student skills" ON public.student_skills
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND student_id IN (
        SELECT id FROM public.users WHERE institution_id = public.get_my_institution_id()
    )
  );

-- 3. Allow institution admins to read applications of their students
DROP POLICY IF EXISTS "Institution admins can read student applications" ON public.applications;
CREATE POLICY "Institution admins can read student applications" ON public.applications
  FOR SELECT
  USING (
    public.is_institution_admin()
    AND student_id IN (
        SELECT id FROM public.users WHERE institution_id = public.get_my_institution_id()
    )
  );

-- 4. Allow institution admins to read skills (taxonomy) globally
DROP POLICY IF EXISTS "Institution admins can read all skills" ON public.skills;
CREATE POLICY "Institution admins can read all skills" ON public.skills
  FOR SELECT
  USING (
    public.is_institution_admin()
  );
