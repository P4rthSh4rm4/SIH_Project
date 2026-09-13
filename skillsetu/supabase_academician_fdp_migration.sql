-- Migration: Secure Dynamic FDP Module

-- 1. Extend existing academician_opportunities safely
ALTER TABLE public.academician_opportunities
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS mode TEXT CHECK (mode IN ('Offline', 'Online', 'Hybrid')),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
ADD CONSTRAINT check_fdp_dates CHECK (
  (start_date IS NULL AND end_date IS NULL) OR 
  (end_date >= start_date)
);

-- 2. Scoped RLS Policies for FDP Creation (Leaves existing Research/Consultancy alone)
DROP POLICY IF EXISTS "Academicians can insert FDPs" ON public.academician_opportunities;
CREATE POLICY "Academicians can insert FDPs" ON public.academician_opportunities
  FOR INSERT TO authenticated 
  WITH CHECK (
    created_by = auth.uid() 
    AND type = 'FDP' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );

DROP POLICY IF EXISTS "Academicians can update own FDPs" ON public.academician_opportunities;
CREATE POLICY "Academicians can update own FDPs" ON public.academician_opportunities
  FOR UPDATE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'FDP' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  )
  WITH CHECK (created_by = auth.uid() AND type = 'FDP');

DROP POLICY IF EXISTS "Academicians can delete own FDPs" ON public.academician_opportunities;
CREATE POLICY "Academicians can delete own FDPs" ON public.academician_opportunities
  FOR DELETE TO authenticated 
  USING (
    created_by = auth.uid() 
    AND type = 'FDP' 
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'academician')
  );

-- 3. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.academician_opportunity_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.academician_opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'cancelled')),
    UNIQUE(opportunity_id, user_id)
);

ALTER TABLE public.academician_opportunity_enrollments ENABLE ROW LEVEL SECURITY;

-- 4. RLS for Enrollments (Privacy-Safe & State-Aware)
DROP POLICY IF EXISTS "Users can read own enrollment" ON public.academician_opportunity_enrollments;
CREATE POLICY "Users can read own enrollment" ON public.academician_opportunity_enrollments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own enrollment" ON public.academician_opportunity_enrollments;
CREATE POLICY "Users can insert own enrollment" ON public.academician_opportunity_enrollments
  FOR INSERT TO authenticated 
  WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      -- Prevent enrolling in completed/cancelled FDPs natively in Postgres
      SELECT 1 FROM public.academician_opportunities 
      WHERE id = opportunity_id 
      AND status NOT IN ('cancelled', 'completed')
    )
  );

DROP POLICY IF EXISTS "Users can update own enrollment" ON public.academician_opportunity_enrollments;
CREATE POLICY "Users can update own enrollment" ON public.academician_opportunity_enrollments
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Safe Metrics RPC for Capacity Counts
DROP FUNCTION IF EXISTS get_fdp_enrollment_counts();
CREATE OR REPLACE FUNCTION get_fdp_enrollment_counts()
RETURNS TABLE (opportunity_id UUID, enrolled_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT opportunity_id, count(*)
  FROM public.academician_opportunity_enrollments
  WHERE status IN ('enrolled', 'completed')
  GROUP BY opportunity_id;
$$;

REVOKE ALL ON FUNCTION get_fdp_enrollment_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_fdp_enrollment_counts() TO authenticated;
