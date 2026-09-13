-- Run this in your Supabase SQL editor to allow Academicians to read student data for mentorship
-- By default, RLS blocks access to these tables to anyone except the student themselves.

-- skills
DROP POLICY IF EXISTS "Academicians can read skills" ON public.student_skills;
CREATE POLICY "Academicians can read skills" ON public.student_skills
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- education
DROP POLICY IF EXISTS "Academicians can read education" ON public.student_education;
CREATE POLICY "Academicians can read education" ON public.student_education
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- experience
DROP POLICY IF EXISTS "Academicians can read experience" ON public.student_experience;
CREATE POLICY "Academicians can read experience" ON public.student_experience
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- portfolio_items
DROP POLICY IF EXISTS "Academicians can read portfolio" ON public.portfolio_items;
CREATE POLICY "Academicians can read portfolio" ON public.portfolio_items
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- certifications
DROP POLICY IF EXISTS "Academicians can read certifications" ON public.certifications;
CREATE POLICY "Academicians can read certifications" ON public.certifications
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- assessments
DROP POLICY IF EXISTS "Academicians can read assessments" ON public.assessments;
CREATE POLICY "Academicians can read assessments" ON public.assessments
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- mock_interviews
DROP POLICY IF EXISTS "Academicians can read mock interviews" ON public.mock_interviews;
CREATE POLICY "Academicians can read mock interviews" ON public.mock_interviews
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));
