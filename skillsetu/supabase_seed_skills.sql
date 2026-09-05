-- ============================================================================
-- Seed Master Skills Catalog
-- Run this in the Supabase SQL Editor to populate the skills table 
-- with the categories required by the Assessment Module.
-- ============================================================================

INSERT INTO public.skills (name, category, source_taxonomy)
VALUES
  -- Coding
  ('Data Structures & Algorithms', 'Coding', 'System'),
  ('SQL', 'Coding', 'System'),
  ('Web Development', 'Coding', 'System'),
  
  -- Aptitude
  ('Quantitative Aptitude', 'Aptitude', 'System'),
  ('Logical Reasoning', 'Aptitude', 'System'),
  ('Verbal Ability', 'Aptitude', 'System'),
  
  -- Soft Skills
  ('Communication Skills', 'Soft Skills', 'System'),
  ('Leadership', 'Soft Skills', 'System'),
  ('Teamwork', 'Soft Skills', 'System'),
  ('Problem Solving', 'Soft Skills', 'System')
ON CONFLICT (name) DO NOTHING;
