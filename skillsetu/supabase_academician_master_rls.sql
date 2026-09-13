-- COMPLETE ACADEMICIAN RLS MIGRATION

-- 1. Mentorship Hub: Allow Academicians to read student data
DROP POLICY IF EXISTS "Academicians can read skills" ON public.student_skills;
CREATE POLICY "Academicians can read skills" ON public.student_skills
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read education" ON public.student_education;
CREATE POLICY "Academicians can read education" ON public.student_education
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read experience" ON public.student_experience;
CREATE POLICY "Academicians can read experience" ON public.student_experience
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read portfolio" ON public.portfolio_items;
CREATE POLICY "Academicians can read portfolio" ON public.portfolio_items
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read certifications" ON public.certifications;
CREATE POLICY "Academicians can read certifications" ON public.certifications
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read mock interviews" ON public.mock_interviews;
CREATE POLICY "Academicians can read mock interviews" ON public.mock_interviews
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

DROP POLICY IF EXISTS "Academicians can read assessments" ON public.assessments;
CREATE POLICY "Academicians can read assessments" ON public.assessments
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- 2. Placements Page: Allow Academicians (and everyone) to read industry user names
-- Without this, the inner join `industry:users(name)` fails and returns null, 
-- causing the "Unknown Company" bug in the Academician view.
DROP POLICY IF EXISTS "Users can read industry profiles" ON public.users;
CREATE POLICY "Users can read industry profiles" ON public.users
  FOR SELECT
  USING (role = 'industry');

-- Also explicitly grant Academicians read access to all users just to be safe
DROP POLICY IF EXISTS "Academicians can read all users" ON public.users;
CREATE POLICY "Academicians can read all users" ON public.users
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));
