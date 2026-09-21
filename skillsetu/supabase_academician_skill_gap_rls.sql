-- 1. Helper functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_my_institution_id()
RETURNS UUID AS $$
  SELECT institution_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_department()
RETURNS TEXT AS $$
  SELECT department FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_academician()
RETURNS BOOLEAN AS $$
  SELECT role IN ('academician', 'institution_admin', 'super_admin') FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Grant access to public.users for Academicians in the same institution or department
DROP POLICY IF EXISTS "Academicians can read users in their institution" ON public.users;
CREATE POLICY "Academicians can read users in their institution" ON public.users
FOR SELECT TO authenticated
USING (
  public.is_academician() AND 
  (
    (public.get_my_institution_id() IS NOT NULL AND institution_id = public.get_my_institution_id())
    OR
    (public.get_my_institution_id() IS NULL AND public.get_my_department() IS NOT NULL AND department = public.get_my_department())
  )
);

-- 3. Grant access to student_profiles for Academicians in the same institution or department
DROP POLICY IF EXISTS "Academicians can read student profiles in their institution" ON public.student_profiles;
CREATE POLICY "Academicians can read student profiles in their institution" ON public.student_profiles
FOR SELECT TO authenticated
USING (
  public.is_academician() AND 
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = student_profiles.user_id
    AND (
      (public.get_my_institution_id() IS NOT NULL AND u.institution_id = public.get_my_institution_id())
      OR
      (public.get_my_institution_id() IS NULL AND public.get_my_department() IS NOT NULL AND u.department = public.get_my_department())
    )
  )
);

-- 4. Grant access to applications for Academicians in the same institution or department
DROP POLICY IF EXISTS "Academicians can read applications for their institution" ON public.applications;
CREATE POLICY "Academicians can read applications for their institution" ON public.applications
FOR SELECT TO authenticated
USING (
  public.is_academician() AND 
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = applications.student_id
    AND (
      (public.get_my_institution_id() IS NOT NULL AND u.institution_id = public.get_my_institution_id())
      OR
      (public.get_my_institution_id() IS NULL AND public.get_my_department() IS NOT NULL AND u.department = public.get_my_department())
    )
  )
);

-- 5. Grant access to application_skill_feedback for Academicians in the same institution or department
DROP POLICY IF EXISTS "Academicians can read application_skill_feedback for their institution" ON public.application_skill_feedback;
CREATE POLICY "Academicians can read application_skill_feedback for their institution" ON public.application_skill_feedback
FOR SELECT TO authenticated
USING (
  public.is_academician() AND 
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.users u ON a.student_id = u.id
    WHERE a.id = application_skill_feedback.application_id
    AND (
      (public.get_my_institution_id() IS NOT NULL AND u.institution_id = public.get_my_institution_id())
      OR
      (public.get_my_institution_id() IS NULL AND public.get_my_department() IS NOT NULL AND u.department = public.get_my_department())
    )
  )
);
