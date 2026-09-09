-- Seed script for missing Learning Programs mapped to Career Guidance Roadmap Phases
-- This script safely inserts realistic learning programs to ensure every phase has an exact match.

-- First, clean up any existing duplicates (created by previously running this script with gen_random_uuid())
DELETE FROM public.learning_programs
WHERE ctid NOT IN (
    SELECT DISTINCT ON (title) ctid
    FROM public.learning_programs
    ORDER BY title
);

-- Then, insert using fixed UUIDs so that ON CONFLICT (id) DO NOTHING works correctly
INSERT INTO public.learning_programs (id, title, provider, type, skills_covered, url)
VALUES 
  -- Full-Stack Engineer Roadmap
  ('89cd3d5a-9a27-4254-9b75-60cb5798ac36', 'Frontend Fundamentals', 'SkillSetu Official', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=mU6anWqZJcc'),
  ('dcab13b6-9d6c-4d0e-9169-7036bc416975', 'Modern Frontend Frameworks', 'React Mastery', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=bMknfKXIFA8'),
  ('b41c6f07-2cfe-4680-8cb7-71903670993a', 'Backend Development', 'Node.js Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=fBNz5xF-Kx4'),
  ('8e517198-0901-4e7d-b7f5-f0c847ea32fa', 'Databases & Architecture', 'Data Systems Inc.', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=fBNz5xF-Kx4'),
  ('f14978b6-a4ea-4fc5-b4f2-9b8085478a87', 'Deployment & DevOps', 'Cloud Native Foundation', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=hQcFE0RD0cQ'),
  ('d624b825-84c1-4a18-83c5-c0a6500a8cfe', 'Advanced Engineering', 'Tech Leaders', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=X48VuDVv0do'),

  -- Data Scientist Roadmap
  ('2089271c-d783-442f-8586-618958fe6be0', 'Programming & Math', 'Math for ML', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
  ('66b7d0b6-9eb8-4a7f-9a8c-d3288f985982', 'Data Manipulation', 'Pandas Pros', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=vmEHCJofslg'),
  ('315c81eb-c2a0-40d2-b716-5067dde59176', 'Data Visualization', 'DataViz Masters', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=a9UrKTVEeZA'),
  ('8dae7e41-6b20-4689-ad42-80e12af353fc', 'Machine Learning', 'AI Institute', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=7eh4d6sabA0'),
  ('7a340fc5-6be3-41c7-bc5c-7b4ce7b0d89f', 'Deep Learning (Advanced)', 'Neural Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=aircAruvnKk'),
  ('fa590488-247e-489e-8c35-4285ddcdb4c8', 'Model Deployment (MLOps)', 'MLOps Guru', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=kqtD5dpn9C8'),

  -- DevOps Engineer Roadmap
  ('1c694924-390c-4c52-8982-86d7d989a4ed', 'OS & Networking', 'SysAdmin School', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=pTFZFxd4hOI'),
  ('65f3df05-6001-480b-8935-2f27c9b2a42a', 'Version Control & CI/CD', 'Git Masters', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=RGOj5yH7evk'),
  ('5426c48b-2e22-4ad8-b476-e9d95673068e', 'Containerization', 'Docker Pro', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=gAkwW2tuIqE'),
  ('eb1377ae-9ced-40ba-b8c7-eef12359f3ea', 'Infrastructure as Code', 'Terraform Experts', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=hQcFE0RD0cQ'),
  ('b951daa4-1dde-4047-9ba9-3f4ea658beff', 'Container Orchestration', 'K8s Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=X48VuDVv0do'),
  ('3668682a-d460-40bf-b87f-2353ce6e40e8', 'Monitoring & Observability', 'Prometheus Labs', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=hQcFE0RD0cQ')
ON CONFLICT (id) DO NOTHING;
