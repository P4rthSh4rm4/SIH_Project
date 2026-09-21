-- Add departments array column to skills table
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT ARRAY['CSE'];

-- Update existing Ayurveda-specific skills
UPDATE public.skills 
SET departments = ARRAY['Ayurveda'] 
WHERE name IN (
  'Clinical Knowledge', 
  'Ayurvedic Pharmacy', 
  'Research Skills', 
  'Industry Awareness', 
  'Panchakarma', 
  'Patient Counselling'
);

-- Update explicitly shared generic skills
UPDATE public.skills 
SET departments = ARRAY['CSE', 'Ayurveda', 'BPharma'] 
WHERE name IN (
  'Communication Skills', 
  'Documentation',
  'Ethics',
  'Professionalism'
);

-- By default, other skills like 'Problem Solving', 'SQL', 'React', 'Logical Reasoning', 'Quantitative Aptitude'
-- will retain the default ARRAY['CSE'] which ensures they do not leak into Ayurveda opportunities unless intended.

-- NOTE: If a skill needs to be shared with BPharma in the future, it can be updated to include 'BPharma' in the array.
