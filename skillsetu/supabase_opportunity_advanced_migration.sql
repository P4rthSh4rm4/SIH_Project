-- Add advanced fields for recruitment-ready opportunities
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS work_mode TEXT CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS positions INTEGER,
ADD COLUMN IF NOT EXISTS preferred_skills UUID[] DEFAULT '{}'::UUID[],
ADD COLUMN IF NOT EXISTS eligibility_requirements JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS assessment_requirements JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS hiring_process JSONB DEFAULT '["Application", "Screening", "Interview", "Offer", "Hired"]'::JSONB,
ADD COLUMN IF NOT EXISTS smart_screening_requirements JSONB DEFAULT '{}'::JSONB;

-- Note: We retain required_skills UUID[] which already exists.
-- Skills proficiency mapping can be stored inside smart_screening_requirements or eligibility_requirements.
-- For candidate matching, preferred_skills is array of UUIDs allowing fast overlap queries.
