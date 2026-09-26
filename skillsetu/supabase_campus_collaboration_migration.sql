-- ============================================================================
-- Migration: Campus Collaboration & Direct Publishing
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- ============================================================================

-- 1. Ensure verification_status column exists on public.opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'approved';

-- 2. Add optional target_institution_id and is_campus_collaboration columns for opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS target_institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_campus_collaboration BOOLEAN DEFAULT FALSE;

-- 3. Update existing active opportunities to 'approved' so they appear directly to students
UPDATE public.opportunities
SET verification_status = 'approved'
WHERE verification_status = 'pending' 
  AND (
    eligibility_requirements->>'is_campus_collaboration' IS NULL 
    OR eligibility_requirements->>'is_campus_collaboration' = 'false'
  );

-- 4. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_status_verif 
ON public.opportunities(status, verification_status);
