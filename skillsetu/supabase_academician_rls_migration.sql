-- Run this in your Supabase SQL editor to allow Academicians to verify opportunities and applications

-- Allow Academicians to update opportunities
DROP POLICY IF EXISTS "Academicians can update opportunities" ON public.opportunities;
CREATE POLICY "Academicians can update opportunities" ON public.opportunities
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));

-- Allow Academicians to update applications
DROP POLICY IF EXISTS "Academicians can update applications" ON public.applications;
CREATE POLICY "Academicians can update applications" ON public.applications
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician'));
