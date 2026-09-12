-- Migration: Allow Industry users to manage applications for their own opportunities
-- Added to fix the "Error shortlisting candidate: {}" issue caused by RLS blocking INSERT/UPDATE.

-- 1. Ensure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Industry can SELECT applications for their opportunities
-- Note: Check if policy already exists to avoid errors, or use IF NOT EXISTS if supported, 
-- but Postgres 11+ doesn't support IF NOT EXISTS for policies easily without DO blocks.
-- Let's drop them if they exist first.

DO $$
BEGIN
    DROP POLICY IF EXISTS "Industry can view applications for their opportunities" ON applications;
    DROP POLICY IF EXISTS "Industry can insert applications for their opportunities" ON applications;
    DROP POLICY IF EXISTS "Industry can update applications for their opportunities" ON applications;
END $$;

CREATE POLICY "Industry can view applications for their opportunities"
ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = applications.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

CREATE POLICY "Industry can insert applications for their opportunities"
ON applications
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'shortlisted' 
  AND EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = applications.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

CREATE POLICY "Industry can update applications for their opportunities"
ON applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = applications.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);
