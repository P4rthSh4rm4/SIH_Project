-- ============================================================================
-- SkillSetu Department and Student Onboarding Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- ============================================================================

-- 1. Add department column to public.users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'CSE';

-- 2. Add department column to public.student_profiles if not exists
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'CSE';

-- 3. Set all existing users' department to 'CSE' if unset
UPDATE public.users 
SET department = 'CSE' 
WHERE department IS NULL OR department = '';

UPDATE public.student_profiles
SET department = 'CSE'
WHERE department IS NULL OR department = '';

-- 4. Mark all existing users as onboarding_completed so current users are not disrupted
UPDATE public.users
SET onboarding_completed = TRUE
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;

-- 5. Update the handle_new_user() trigger to automatically save department
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role, department, onboarding_completed)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'User'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        COALESCE(new.raw_user_meta_data->>'department', 'CSE'),
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        department = COALESCE(EXCLUDED.department, public.users.department, 'CSE'),
        name = EXCLUDED.name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Index on department for quick filtering
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_role_dept ON public.users(role, department);
