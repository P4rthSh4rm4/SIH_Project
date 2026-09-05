-- supabase_opportunity_status_and_rls_migration.sql
-- 1. Updates the CHECK constraint on the `opportunities` table's `status` column.
-- 2. Updates RLS policies so Industry and Faculty can see Student profiles.

BEGIN;

-- ==========================================
-- 1. OPPORTUNITIES STATUS CONSTRAINT
-- ==========================================
ALTER TABLE public.opportunities 
DROP CONSTRAINT IF EXISTS opportunities_status_check;

ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_status_check 
CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'closed', 'archived'));


-- ==========================================
-- 2. RLS POLICIES FOR USERS & PROFILES
-- ==========================================

-- Allow ANY authenticated user to read all 'student' users (needed for Industry/Faculty)
DROP POLICY IF EXISTS "Users can read student profiles" ON public.users;
CREATE POLICY "Users can read student profiles" ON public.users
  FOR SELECT
  USING (role = 'student' OR auth.uid() = id);

-- Allow ANY authenticated user to read all student_profiles
DROP POLICY IF EXISTS "Anyone can read student profiles" ON public.student_profiles;
CREATE POLICY "Anyone can read student profiles" ON public.student_profiles
  FOR SELECT
  USING (true);

COMMIT;
