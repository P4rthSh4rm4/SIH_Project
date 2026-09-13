-- ============================================================================
-- SkillSetu Consultancy RLS Migration
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Scoped RLS Policies for Consultancy Creation

DROP POLICY IF EXISTS "Academicians can insert Consultancy" ON public.academician_opportunities;
CREATE POLICY "Academicians can insert Consultancy" ON public.academician_opportunities
  FOR INSERT TO authenticated 
  WITH CHECK (
    created_by = auth.uid() 
    AND type = 'consultancy' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );

DROP POLICY IF EXISTS "Academicians can update own Consultancy" ON public.academician_opportunities;
CREATE POLICY "Academicians can update own Consultancy" ON public.academician_opportunities
  FOR UPDATE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'consultancy' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  )
  WITH CHECK (created_by = auth.uid() AND type = 'consultancy');

DROP POLICY IF EXISTS "Academicians can delete own Consultancy" ON public.academician_opportunities;
CREATE POLICY "Academicians can delete own Consultancy" ON public.academician_opportunities
  FOR DELETE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'consultancy' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );
