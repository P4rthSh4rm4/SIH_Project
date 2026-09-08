-- Career Assessment & Certification Migration

-- 1. Career Path Assessment Questions
CREATE TABLE IF NOT EXISTS public.career_assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Assessment Attempts
CREATE TABLE IF NOT EXISTS public.career_assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career_path_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers_json JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Career Path Certificates
CREATE TABLE IF NOT EXISTS public.career_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career_path_id TEXT NOT NULL,
  assessment_attempt_id UUID REFERENCES public.career_assessment_attempts(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  certificate_id TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, career_path_id)
);

-- Enable RLS
ALTER TABLE public.career_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_certificates ENABLE ROW LEVEL SECURITY;

-- Questions: Public read access
CREATE POLICY "Allow public read access to career questions" ON public.career_assessment_questions
    FOR SELECT USING (true);

-- Attempts: Users can insert and read their own
CREATE POLICY "Users can insert own attempts" ON public.career_assessment_attempts
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can read own attempts" ON public.career_assessment_attempts
    FOR SELECT USING (student_id = auth.uid());

-- Certificates: Users can insert and read their own
CREATE POLICY "Users can insert own certificates" ON public.career_certificates
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can read own certificates" ON public.career_certificates
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Users can update own certificates" ON public.career_certificates
    FOR UPDATE USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
