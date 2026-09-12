-- Migration: Add interview_status to application_interviews
-- This corrects the workflow by requiring an interview to be marked 'completed'
-- before it can be evaluated.

-- 1. Add the column with a check constraint
ALTER TABLE application_interviews 
ADD COLUMN IF NOT EXISTS interview_status TEXT DEFAULT 'scheduled' 
CHECK (interview_status IN ('scheduled', 'completed', 'cancelled'));

-- 2. Safely cleanup the specific dummy test evaluation we created earlier
-- This ensures the UI doesn't accidentally show an evaluation for an interview that isn't completed.
DELETE FROM application_interview_evaluations 
WHERE id = 'f437b03d-a89f-4a4f-91f7-60ae4ff30c16';
