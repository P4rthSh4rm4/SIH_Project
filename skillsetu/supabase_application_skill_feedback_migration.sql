-- Migration: Create application_skill_feedback table for Industry Skill Gap Insights
-- Stores feedback on specific skills during the recruitment process.

CREATE TABLE IF NOT EXISTS application_skill_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  gap_indicator TEXT NOT NULL CHECK (gap_indicator IN ('Strong', 'Adequate', 'Needs Improvement', 'Significant Gap')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure a recruiter can only rate a specific skill once per application
  CONSTRAINT unique_app_skill_feedback UNIQUE (application_id, skill_id)
);

-- Index for efficient querying by application and opportunity
CREATE INDEX IF NOT EXISTS idx_app_skill_feedback_application_id ON application_skill_feedback(application_id);
CREATE INDEX IF NOT EXISTS idx_app_skill_feedback_opportunity_id ON application_skill_feedback(opportunity_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_app_skill_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_skill_feedback_updated_at ON application_skill_feedback;

CREATE TRIGGER update_app_skill_feedback_updated_at
    BEFORE UPDATE ON application_skill_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_app_skill_feedback_updated_at();

-- Row Level Security
ALTER TABLE application_skill_feedback ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Industry can select application_skill_feedback for their opportunities" ON application_skill_feedback;
    DROP POLICY IF EXISTS "Industry can insert application_skill_feedback for their opportunities" ON application_skill_feedback;
    DROP POLICY IF EXISTS "Industry can update application_skill_feedback for their opportunities" ON application_skill_feedback;
END $$;

-- Industry user can view feedback for their opportunities
CREATE POLICY "Industry can select application_skill_feedback for their opportunities"
ON application_skill_feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_skill_feedback.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can insert feedback for their opportunities
CREATE POLICY "Industry can insert application_skill_feedback for their opportunities"
ON application_skill_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_skill_feedback.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can update feedback for their opportunities
CREATE POLICY "Industry can update application_skill_feedback for their opportunities"
ON application_skill_feedback
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_skill_feedback.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);
