-- Migration: Create application_interviews table for Industry Applicants Workflow
-- Allows recruiters to schedule and persist interviews for shortlisted candidates.

CREATE TABLE IF NOT EXISTS application_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('Technical', 'HR', 'Technical + HR')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Online', 'Offline')),
  meeting_link TEXT,
  location TEXT,
  interviewer TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying by application and opportunity
CREATE INDEX IF NOT EXISTS idx_application_interviews_application_id ON application_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_application_interviews_opportunity_id ON application_interviews(opportunity_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_application_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_application_interviews_updated_at ON application_interviews;

CREATE TRIGGER update_application_interviews_updated_at
    BEFORE UPDATE ON application_interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_application_interviews_updated_at();

-- Row Level Security
ALTER TABLE application_interviews ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Industry can select application_interviews for their opportunities" ON application_interviews;
    DROP POLICY IF EXISTS "Industry can insert application_interviews for their opportunities" ON application_interviews;
    DROP POLICY IF EXISTS "Industry can update application_interviews for their opportunities" ON application_interviews;
END $$;

-- Industry user can view interviews for their opportunities
CREATE POLICY "Industry can select application_interviews for their opportunities"
ON application_interviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interviews.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can insert interviews for their opportunities
CREATE POLICY "Industry can insert application_interviews for their opportunities"
ON application_interviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interviews.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can update interviews for their opportunities
CREATE POLICY "Industry can update application_interviews for their opportunities"
ON application_interviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interviews.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);
