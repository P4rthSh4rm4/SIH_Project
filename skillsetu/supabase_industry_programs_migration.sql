-- Migration: Upgrade learning_programs and add RLS policies
-- Supports Industry Programs module with real data, capacity enforcement, and proper status.

-- 1. Add missing columns to learning_programs
ALTER TABLE public.learning_programs
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. RLS for learning_programs
-- Industry can manage their own programs
DROP POLICY IF EXISTS "Industry can insert their own programs" ON public.learning_programs;
CREATE POLICY "Industry can insert their own programs"
ON public.learning_programs
FOR INSERT
TO authenticated
WITH CHECK (
  industry_id = auth.uid()
);

DROP POLICY IF EXISTS "Industry can update their own programs" ON public.learning_programs;
CREATE POLICY "Industry can update their own programs"
ON public.learning_programs
FOR UPDATE
TO authenticated
USING (
  industry_id = auth.uid()
)
WITH CHECK (
  industry_id = auth.uid()
);

DROP POLICY IF EXISTS "Industry can select their own programs" ON public.learning_programs;
CREATE POLICY "Industry can select their own programs"
ON public.learning_programs
FOR SELECT
TO authenticated
USING (
  industry_id = auth.uid() OR status = 'published'
);

-- Students can ONLY see published programs
DROP POLICY IF EXISTS "Students can select published programs" ON public.learning_programs;
CREATE POLICY "Students can select published programs"
ON public.learning_programs
FOR SELECT
TO authenticated
USING (
  status = 'published'
);

-- 3. RLS for learning_enrollments for Industry Analytics
-- Industry needs to see enrollments for their own programs to calculate metrics
DROP POLICY IF EXISTS "Industry can view enrollments for their programs" ON public.learning_enrollments;
CREATE POLICY "Industry can view enrollments for their programs"
ON public.learning_enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.learning_programs
    WHERE learning_programs.id = learning_enrollments.program_id
    AND learning_programs.industry_id = auth.uid()
  )
);

-- 4. RPC for Capacity-Enforced Enrollment
CREATE OR REPLACE FUNCTION public.enroll_in_program(p_program_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacity INTEGER;
  v_current_enrollments INTEGER;
BEGIN
  -- Check if already enrolled
  IF EXISTS (SELECT 1 FROM public.learning_enrollments WHERE program_id = p_program_id AND student_id = auth.uid()) THEN
    RETURN '{"success": false, "error": "Already enrolled"}';
  END IF;

  -- Get program capacity
  SELECT capacity INTO v_capacity FROM public.learning_programs WHERE id = p_program_id;
  
  IF v_capacity IS NOT NULL AND v_capacity > 0 THEN
    -- Get current enrollment count (bypassing RLS since function is SECURITY DEFINER)
    SELECT count(*) INTO v_current_enrollments FROM public.learning_enrollments WHERE program_id = p_program_id;
    
    IF v_current_enrollments >= v_capacity THEN
      RETURN '{"success": false, "error": "Program has reached maximum capacity"}';
    END IF;
  END IF;

  -- Insert enrollment
  INSERT INTO public.learning_enrollments (student_id, program_id, progress_pct)
  VALUES (auth.uid(), p_program_id, 0);

  RETURN '{"success": true}';
END;
$$;

-- 5. RPC to get program counts for UI
CREATE OR REPLACE FUNCTION public.get_published_programs_with_counts()
RETURNS TABLE (
  id UUID,
  industry_id UUID,
  provider TEXT,
  title TEXT,
  type TEXT,
  skills_covered UUID[],
  url TEXT,
  status TEXT,
  duration TEXT,
  capacity INTEGER,
  description TEXT,
  enrolled_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.id, lp.industry_id, lp.provider, lp.title, lp.type, lp.skills_covered, lp.url,
    lp.status, lp.duration, lp.capacity, lp.description,
    (SELECT count(*) FROM public.learning_enrollments le WHERE le.program_id = lp.id) as enrolled_count
  FROM public.learning_programs lp
  WHERE lp.status = 'published';
END;
$$;
