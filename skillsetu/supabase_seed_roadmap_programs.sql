-- Seed script for missing Learning Programs mapped to Career Guidance Roadmap Phases
-- This script safely inserts realistic learning programs to ensure every phase has an exact match.

INSERT INTO learning_programs (id, title, provider, type, skills_covered, url)
VALUES 
  -- Full-Stack Engineer Roadmap
  (gen_random_uuid(), 'Frontend Fundamentals', 'SkillSetu Official', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=mU6anWqZJcc'),
  (gen_random_uuid(), 'Modern Frontend Frameworks', 'React Mastery', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=bMknfKXIFA8'),
  (gen_random_uuid(), 'Backend Development', 'Node.js Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=Oe421EPjeEQ'),
  (gen_random_uuid(), 'Databases & Architecture', 'Data Systems Inc.', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=WMEBRJq29fM'),
  (gen_random_uuid(), 'Deployment & DevOps', 'Cloud Native Foundation', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=hQcFE0RD0cQ'),
  (gen_random_uuid(), 'Advanced Engineering', 'Tech Leaders', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=1xo-0gCVhCU'),

  -- Data Scientist Roadmap
  (gen_random_uuid(), 'Programming & Math', 'Math for ML', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
  (gen_random_uuid(), 'Data Manipulation', 'Pandas Pros', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=vmEHCJofslg'),
  (gen_random_uuid(), 'Data Visualization', 'DataViz Masters', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=a9UrKTVEeZA'),
  (gen_random_uuid(), 'Machine Learning', 'AI Institute', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=7eh4d6sabA0'),
  (gen_random_uuid(), 'Deep Learning (Advanced)', 'Neural Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=aircAruvnKk'),
  (gen_random_uuid(), 'Model Deployment (MLOps)', 'MLOps Guru', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=aGjtijZpq_I'),

  -- DevOps Engineer Roadmap
  (gen_random_uuid(), 'OS & Networking', 'SysAdmin School', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=v_1A5I8E4w4'),
  (gen_random_uuid(), 'Version Control & CI/CD', 'Git Masters', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=RGOj5yH7evk'),
  (gen_random_uuid(), 'Containerization', 'Docker Pro', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=gAkwW2tuIqE'),
  (gen_random_uuid(), 'Infrastructure as Code', 'Terraform Experts', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=TOMvX5bEQ-0'),
  (gen_random_uuid(), 'Container Orchestration', 'K8s Academy', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=X48VuDVv0do'),
  (gen_random_uuid(), 'Monitoring & Observability', 'Prometheus Labs', 'tech', '{}'::uuid[], 'https://www.youtube.com/watch?v=b4O4F_G-bZ8')
ON CONFLICT (id) DO NOTHING;
