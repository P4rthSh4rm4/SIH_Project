-- Migration: Create application_offers table for Industry Applicants Workflow
-- Stores job offers created by recruiters for candidates.

CREATE TABLE IF NOT EXISTS application_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  position_title TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  salary_package TEXT NOT NULL,
  joining_date DATE NOT NULL,
  offer_expiry_date DATE NOT NULL,
  additional_terms TEXT,
  recruiter_message TEXT,
  offer_status TEXT DEFAULT 'draft' CHECK (offer_status IN ('draft', 'sent', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure only one offer per application
  CONSTRAINT unique_application_offer UNIQUE (application_id)
);

-- Index for efficient querying by application and opportunity
CREATE INDEX IF NOT EXISTS idx_application_offers_application_id ON application_offers(application_id);
CREATE INDEX IF NOT EXISTS idx_application_offers_opportunity_id ON application_offers(opportunity_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_app_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_offers_updated_at ON application_offers;

CREATE TRIGGER update_app_offers_updated_at
    BEFORE UPDATE ON application_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_app_offers_updated_at();

-- Row Level Security
ALTER TABLE application_offers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Industry can select application_offers for their opportunities" ON application_offers;
    DROP POLICY IF EXISTS "Industry can insert application_offers for their opportunities" ON application_offers;
    DROP POLICY IF EXISTS "Industry can update application_offers for their opportunities" ON application_offers;
END $$;

-- Industry user can view offers for their opportunities
CREATE POLICY "Industry can select application_offers for their opportunities"
ON application_offers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_offers.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can insert offers for their opportunities
CREATE POLICY "Industry can insert application_offers for their opportunities"
ON application_offers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_offers.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- Industry user can update offers for their opportunities
CREATE POLICY "Industry can update application_offers for their opportunities"
ON application_offers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM opportunities
    WHERE opportunities.id = application_offers.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);
