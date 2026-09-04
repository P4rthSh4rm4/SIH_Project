-- ============================================================================
-- SkillSetu Auth Fix Migration
-- Run this in the Supabase SQL Editor AFTER the original supabase_schema.sql
-- ============================================================================

-- ─── 1. Add missing columns to public.users ────────────────────────────────

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- ─── 2. Update role CHECK constraint ────────────────────────────────────────
-- Use canonical role values consistently across the app.
-- NOTE: 'institution' is renamed to 'institution_admin' for clarity.
--       'admin' is renamed to 'super_admin'.

-- STEP A: Drop the OLD constraint FIRST (it blocks the rename UPDATEs)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- STEP B: Now migrate existing rows safely
UPDATE public.users SET role = 'institution_admin' WHERE role = 'institution';
UPDATE public.users SET role = 'super_admin' WHERE role = 'admin';

-- STEP C: Add the new constraint with canonical values
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('student', 'industry', 'academician', 'institution_admin', 'super_admin'));

-- ─── 3. Auto-update updated_at on row change ────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 4. Fix handle_new_user trigger (safe, idempotent) ──────────────────────
-- Only allows non-privileged roles from signup metadata.
-- Defaults to 'student' if role is missing or privileged.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
  _name TEXT;
  _avatar TEXT;
BEGIN
  -- Extract and sanitize role: only allow non-privileged roles
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF _role NOT IN ('student', 'industry', 'academician') THEN
    _role := 'student';
  END IF;

  -- Extract name: prefer metadata, then email prefix
  _name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1),
    'User'
  );

  -- Extract avatar from OAuth metadata
  _avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- Idempotent insert: skip if profile already exists
  INSERT INTO public.users (id, name, email, role, avatar_url)
  VALUES (NEW.id, _name, NEW.email, _role, _avatar)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists from the original schema, but recreate to be safe:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 5. RLS Policies for public.users ───────────────────────────────────────

-- Allow authenticated users to read their OWN profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to update their OWN profile (but NOT the role column)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent role escalation: role cannot be changed by the user
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
  );

-- Allow the trigger (SECURITY DEFINER) to insert — no explicit policy needed
-- because SECURITY DEFINER functions bypass RLS.
-- However, the fallback client-side insert in useUserProfile needs this:
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND role IN ('student', 'industry', 'academician')
  );

-- ─── 6. RLS Policies for other key tables ──────────────────────────────────

-- student_profiles: users can read/write their own
DROP POLICY IF EXISTS "Users can manage own student profile" ON public.student_profiles;
CREATE POLICY "Users can manage own student profile" ON public.student_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- student_skills: users can manage their own
DROP POLICY IF EXISTS "Users can manage own skills" ON public.student_skills;
CREATE POLICY "Users can manage own skills" ON public.student_skills
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- assessments: users can read/write their own
DROP POLICY IF EXISTS "Users can manage own assessments" ON public.assessments;
CREATE POLICY "Users can manage own assessments" ON public.assessments
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- opportunities: industry users can manage their own, all can read active
DROP POLICY IF EXISTS "Anyone can read active opportunities" ON public.opportunities;
CREATE POLICY "Anyone can read active opportunities" ON public.opportunities
  FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Industry can manage own opportunities" ON public.opportunities;
CREATE POLICY "Industry can manage own opportunities" ON public.opportunities
  FOR ALL
  USING (industry_id = auth.uid())
  WITH CHECK (industry_id = auth.uid());

-- applications: students can manage their own, industry can read for their opportunities
DROP POLICY IF EXISTS "Students can manage own applications" ON public.applications;
CREATE POLICY "Students can manage own applications" ON public.applications
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Industry can read applications for own opportunities" ON public.applications;
CREATE POLICY "Industry can read applications for own opportunities" ON public.applications
  FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM public.opportunities WHERE industry_id = auth.uid()
    )
  );

-- notifications: users can read their own
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- certifications: users can manage their own
DROP POLICY IF EXISTS "Users can manage own certifications" ON public.certifications;
CREATE POLICY "Users can manage own certifications" ON public.certifications
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- institutions: all authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read institutions" ON public.institutions;
CREATE POLICY "Authenticated users can read institutions" ON public.institutions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- learning_programs: all authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read programs" ON public.learning_programs;
CREATE POLICY "Authenticated users can read programs" ON public.learning_programs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- academician_opportunities: all authenticated can read
DROP POLICY IF EXISTS "Authenticated users can read academic opportunities" ON public.academician_opportunities;
CREATE POLICY "Authenticated users can read academic opportunities" ON public.academician_opportunities
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- mentorships: participants can read their own
DROP POLICY IF EXISTS "Mentorship participants can manage" ON public.mentorships;
CREATE POLICY "Mentorship participants can manage" ON public.mentorships
  FOR ALL
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- placement_records: student can read their own
DROP POLICY IF EXISTS "Students can read own placements" ON public.placement_records;
CREATE POLICY "Students can read own placements" ON public.placement_records
  FOR SELECT
  USING (student_id = auth.uid());

-- ─── 7. Create index for faster profile lookups ────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ─── Done ──────────────────────────────────────────────────────────────────
-- After running this, configure your Supabase Dashboard:
--   1. Auth → URL Configuration → Site URL: http://localhost:3000
--   2. Auth → URL Configuration → Redirect URLs: http://localhost:3000/auth/callback
--   3. Auth → Providers → Google: Enable + credentials
--   4. Auth → Providers → GitHub: Enable + credentials
--   5. Auth → Email → Enable "Confirm email" 
--   6. Auth → Email → Enable "Secure email change"
