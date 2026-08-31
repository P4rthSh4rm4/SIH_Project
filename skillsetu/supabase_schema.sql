-- SkillSetu Database Schema
-- Paste this script directly into the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    address TEXT
);

-- 2. USERS (Profiles matching Supabase Auth users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'industry', 'academician', 'institution', 'admin')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SKILLS (ESCO / O*NET / Lightcast Taxonomy)
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    source_taxonomy TEXT,
    external_id TEXT
);

-- 4. STUDENT PROFILES
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    resume_url TEXT,
    portfolio_json JSONB DEFAULT '{}'::jsonb
);

-- 5. STUDENT SKILLS (Link table)
CREATE TABLE public.student_skills (
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_score INTEGER NOT NULL CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
    verified BOOLEAN DEFAULT FALSE,
    source TEXT NOT NULL CHECK (source IN ('assessment', 'certificate', 'manual', 'ai_inferred')),
    PRIMARY KEY (student_id, skill_id)
);

-- 6. ASSESSMENTS
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    responses_json JSONB DEFAULT '{}'::jsonb,
    generated_profile_json JSONB DEFAULT '{}'::jsonb,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. OPPORTUNITIES (Jobs, Internships, Bounties)
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('internship', 'job', 'micro-internship', 'bounty')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills UUID[] DEFAULT '{}'::UUID[],
    location TEXT,
    stipend TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. APPLICATIONS
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100)
);

-- 9. LEARNING PROGRAMS
CREATE TABLE public.learning_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    provider TEXT,
    title TEXT NOT NULL,
    type TEXT,
    skills_covered UUID[] DEFAULT '{}'::UUID[],
    url TEXT
);

-- 10. CERTIFICATIONS
CREATE TABLE public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    credential_hash TEXT,
    issued_at DATE
);

-- 11. ACADEMICIAN OPPORTUNITIES
CREATE TABLE public.academician_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('FDP', 'consultancy', 'research', 'guest-lecture')),
    title TEXT NOT NULL,
    host_industry_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    deadline DATE
);

-- 12. MENTORSHIPS
CREATE TABLE public.mentorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT
);

-- 13. PLACEMENT RECORDS
CREATE TABLE public.placement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('placed', 'not_placed')),
    package TEXT,
    date DATE NOT NULL
);

-- 14. NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload_json JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academician_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Setup basic public read policy for skills
CREATE POLICY "Allow public read access to skills" ON public.skills
    FOR SELECT USING (true);

-- Setup automatic profile creation trigger for Supabase Auth users
-- Note: You can customize this trigger function depending on how signup metadata is sent.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'User'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
