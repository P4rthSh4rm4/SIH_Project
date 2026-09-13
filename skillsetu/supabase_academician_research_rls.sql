-- ============================================================================
-- SkillSetu Research RLS Migration
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Scoped RLS Policies for Research Creation (Leaves FDP/Consultancy alone)

DROP POLICY IF EXISTS "Academicians can insert Research" ON public.academician_opportunities;
CREATE POLICY "Academicians can insert Research" ON public.academician_opportunities
  FOR INSERT TO authenticated 
  WITH CHECK (
    created_by = auth.uid() 
    AND type = 'research' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );

DROP POLICY IF EXISTS "Academicians can update own Research" ON public.academician_opportunities;
CREATE POLICY "Academicians can update own Research" ON public.academician_opportunities
  FOR UPDATE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'research' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  )
  WITH CHECK (created_by = auth.uid() AND type = 'research');

DROP POLICY IF EXISTS "Academicians can delete own Research" ON public.academician_opportunities;
CREATE POLICY "Academicians can delete own Research" ON public.academician_opportunities
  FOR DELETE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'research' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );
