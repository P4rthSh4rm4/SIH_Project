-- ============================================================================
-- SkillSetu Profile Module Migration
-- Run this in the Supabase SQL Editor AFTER the previous migrations.
-- ============================================================================

-- ─── 1. Extend student_profiles with additional columns ─────────────────────

ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS career_objective TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS portfolio_website TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Gender validation
ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_gender_check;
ALTER TABLE public.student_profiles ADD CONSTRAINT student_profiles_gender_check
  CHECK (gender IS NULL OR gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));

-- Auto-update updated_at on student_profiles
DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. Create student_education table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    institute TEXT NOT NULL,
    degree TEXT NOT NULL,
    branch TEXT,
    cgpa NUMERIC(4,2),
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own education" ON public.student_education;
CREATE POLICY "Users can manage own education" ON public.student_education
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_student_education_user_id ON public.student_education(user_id);

-- ─── 3. Create student_experience table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('internship', 'project', 'research', 'part_time')),
    title TEXT NOT NULL,
    organization TEXT,
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own experience" ON public.student_experience;
CREATE POLICY "Users can manage own experience" ON public.student_experience
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_student_experience_user_id ON public.student_experience(user_id);

-- ─── 4. Extend certifications table ────────────────────────────────────────

ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS credential_id TEXT;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_verification_status_check;
ALTER TABLE public.certifications ADD CONSTRAINT certifications_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- ─── 5. Create storage buckets ──────────────────────────────────────────────

-- Public bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for documents (resumes, certificates, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ─── 6. Storage RLS Policies ────────────────────────────────────────────────

-- Avatars: authenticated users can upload/update/delete their own files
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Documents: authenticated users can manage their own files
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
CREATE POLICY "Users can read own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Done ───────────────────────────────────────────────────────────────────
-- After running this migration:
-- 1. Verify tables: student_education, student_experience exist
-- 2. Verify student_profiles has new columns
-- 3. Verify certifications has credential_id, certificate_url, verification_status
-- 4. Verify storage buckets: avatars (public), documents (private)
