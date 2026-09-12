-- Migration: Create application_interview_evaluations table for Industry Applicants Workflow
-- Allows recruiters to evaluate interviews for candidates.

CREATE TABLE IF NOT EXISTS application_interview_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  technical_score NUMERIC NOT NULL CHECK (technical_score >= 0 AND technical_score <= 100),
  problem_solving_score NUMERIC NOT NULL CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
  communication_score NUMERIC NOT NULL CHECK (communication_score >= 0 AND communication_score <= 100),
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  recruiter_feedback TEXT NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('Proceed to Offer', 'Further Review', 'Reject')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure only one evaluation per application for now
  CONSTRAINT unique_application_evaluation UNIQUE (application_id)
);

-- Index for efficient querying by application and opportunity
CREATE INDEX IF NOT EXISTS idx_app_interview_evals_application_id ON application_interview_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_app_interview_evals_opportunity_id ON application_interview_evaluations(opportunity_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_app_interview_evals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_interview_evals_updated_at ON application_interview_evaluations;

CREATE TRIGGER update_app_interview_evals_updated_at
    BEFORE UPDATE ON application_interview_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_app_interview_evals_updated_at();

-- Row Level Security
ALTER TABLE application_interview_evaluations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Industry can select application_interview_evaluations for their opportunities" ON application_interview_evaluations;
    DROP POLICY IF EXISTS "Industry can insert application_interview_evaluations for their opportunities" ON application_interview_evaluations;
    DROP POLICY IF EXISTS "Industry can update application_interview_evaluations for their opportunities" ON application_interview_evaluations;
END $$;

-- Industry user can view evaluations for their opportunities
CREATE POLICY "Industry can select application_interview_evaluations for their opportunities"
ON application_interview_evaluations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interview_evaluations.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can insert evaluations for their opportunities
CREATE POLICY "Industry can insert application_interview_evaluations for their opportunities"
ON application_interview_evaluations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interview_evaluations.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can update evaluations for their opportunities
CREATE POLICY "Industry can update application_interview_evaluations for their opportunities"
ON application_interview_evaluations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_interview_evaluations.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);
