-- ============================================================================
-- SkillSetu Gamification Migration
-- Run this in the Supabase SQL Editor AFTER supabase_migration.sql
-- ============================================================================

-- ─── 1. ACTIVITY LOG ───────────────────────────────────────────────────────
-- Tracks every user action for XP calculation + calendar heatmap

CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'assessment_completed', 'course_enrolled', 'course_completed',
        'certification_earned', 'profile_updated', 'portfolio_item_added',
        'application_submitted', 'document_uploaded', 'login', 'badge_earned',
        'skill_added', 'streak_milestone'
    )),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action_type);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own activity" ON public.activity_log;
CREATE POLICY "Users can read own activity" ON public.activity_log
    FOR SELECT USING (user_id = auth.uid());

-- Insert is done ONLY via server-side function (award_xp), not direct client writes.
-- The function runs as SECURITY DEFINER, so no INSERT policy is needed for clients.


-- ─── 2. BADGES (Global catalog) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'award',
    xp_reward INTEGER NOT NULL DEFAULT 0,
    criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read badges" ON public.badges;
CREATE POLICY "Anyone can read badges" ON public.badges
    FOR SELECT USING (true);


-- ─── 3. STUDENT BADGES (Junction) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_badges (
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (student_id, badge_id)
);

ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own badges" ON public.student_badges;
CREATE POLICY "Users can read own badges" ON public.student_badges
    FOR SELECT USING (student_id = auth.uid());


-- ─── 4. STUDENT GAMIFICATION ───────────────────────────────────────────────
-- Per-student XP, level, streak tracking

CREATE TABLE IF NOT EXISTS public.student_gamification (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own gamification" ON public.student_gamification;
CREATE POLICY "Users can read own gamification" ON public.student_gamification
    FOR SELECT USING (user_id = auth.uid());

-- Allow all authenticated users to read gamification data (for leaderboard)
DROP POLICY IF EXISTS "Authenticated can read all gamification" ON public.student_gamification;
CREATE POLICY "Authenticated can read all gamification" ON public.student_gamification
    FOR SELECT USING (auth.role() = 'authenticated');


-- ─── 5. DOCUMENTS (Document Center) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('resume', 'academic', 'internship_report', 'other')),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- ─── 6. LEARNING ENROLLMENTS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.learning_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.learning_programs(id) ON DELETE CASCADE,
    progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    enrolled_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, program_id)
);

ALTER TABLE public.learning_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own enrollments" ON public.learning_enrollments;
CREATE POLICY "Users can manage own enrollments" ON public.learning_enrollments
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());


-- ─── 7. PORTFOLIO ITEMS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('project', 'achievement', 'internship')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- ─── 8. LEADERBOARD VIEW ──────────────────────────────────────────────────
-- Computed view: no separate table, always fresh data

CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
    g.user_id,
    u.name,
    u.avatar_url,
    g.total_xp,
    g.level,
    g.current_streak,
    RANK() OVER (ORDER BY g.total_xp DESC) AS rank
FROM public.student_gamification g
JOIN public.users u ON u.id = g.user_id
WHERE u.role = 'student'
ORDER BY g.total_xp DESC;


-- ─── 9. SERVER-SIDE FUNCTION: award_xp ─────────────────────────────────────
-- All XP awards go through this function. Clients call it via supabase.rpc().
-- It: (a) logs the activity, (b) updates gamification totals, (c) manages streaks.

CREATE OR REPLACE FUNCTION public.award_xp(
    p_action_type TEXT,
    p_xp INTEGER DEFAULT 10,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_today DATE := CURRENT_DATE;
    v_last_active DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_new_total_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get the calling user's ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Insert the activity log entry
    INSERT INTO public.activity_log (user_id, action_type, xp_earned, metadata_json)
    VALUES (v_user_id, p_action_type, p_xp, p_metadata);

    -- 2. Upsert student_gamification row
    INSERT INTO public.student_gamification (user_id, total_xp, level, current_streak, longest_streak, last_active_date)
    VALUES (v_user_id, p_xp, 1, 1, 1, v_today)
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = student_gamification.total_xp + p_xp,
        updated_at = timezone('utc'::text, now());

    -- 3. Manage streak
    SELECT last_active_date, current_streak, longest_streak
    INTO v_last_active, v_current_streak, v_longest_streak
    FROM public.student_gamification
    WHERE user_id = v_user_id;

    IF v_last_active IS NULL OR v_last_active < v_today - INTERVAL '1 day' THEN
        -- Streak broken or first activity
        v_current_streak := 1;
    ELSIF v_last_active = v_today - INTERVAL '1 day' THEN
        -- Consecutive day
        v_current_streak := v_current_streak + 1;
    END IF;
    -- If v_last_active = v_today, streak stays the same (already active today)

    IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
    END IF;

    -- 4. Calculate level (every 500 XP = 1 level)
    SELECT total_xp INTO v_new_total_xp FROM public.student_gamification WHERE user_id = v_user_id;
    v_new_level := GREATEST(1, FLOOR(v_new_total_xp / 500.0)::INTEGER + 1);

    -- 5. Update gamification row with streak + level
    UPDATE public.student_gamification SET
        current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_active_date = v_today,
        level = v_new_level,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'xp_earned', p_xp,
        'total_xp', v_new_total_xp,
        'level', v_new_level,
        'streak', v_current_streak
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 10. DB TRIGGER: Auto-check and award badges ──────────────────────────
-- Fires after every activity_log insert. Checks badge criteria and awards.

CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    v_badge RECORD;
    v_count INTEGER;
    v_gamification RECORD;
BEGIN
    -- Get current gamification state
    SELECT * INTO v_gamification
    FROM public.student_gamification
    WHERE user_id = NEW.user_id;

    -- Loop through all badges the user hasn't earned yet
    FOR v_badge IN
        SELECT b.*
        FROM public.badges b
        WHERE NOT EXISTS (
            SELECT 1 FROM public.student_badges sb
            WHERE sb.student_id = NEW.user_id AND sb.badge_id = b.id
        )
    LOOP
        -- Check criteria based on badge slug
        CASE v_badge.slug
            WHEN 'first_assessment' THEN
                SELECT COUNT(*) INTO v_count FROM public.assessments WHERE student_id = NEW.user_id;
                IF v_count >= 1 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'skill_explorer' THEN
                SELECT COUNT(*) INTO v_count FROM public.student_skills WHERE student_id = NEW.user_id;
                IF v_count >= 5 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'certification_pro' THEN
                SELECT COUNT(*) INTO v_count FROM public.certifications WHERE student_id = NEW.user_id;
                IF v_count >= 3 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'streak_7' THEN
                IF v_gamification.current_streak >= 7 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'streak_30' THEN
                IF v_gamification.current_streak >= 30 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'first_application' THEN
                SELECT COUNT(*) INTO v_count FROM public.applications WHERE student_id = NEW.user_id;
                IF v_count >= 1 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'portfolio_builder' THEN
                SELECT COUNT(*) INTO v_count FROM public.portfolio_items WHERE user_id = NEW.user_id;
                IF v_count >= 3 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'level_5' THEN
                IF v_gamification.level >= 5 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'level_10' THEN
                IF v_gamification.level >= 10 THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            WHEN 'profile_complete' THEN
                IF NEW.action_type = 'profile_updated' THEN
                    INSERT INTO public.student_badges (student_id, badge_id) VALUES (NEW.user_id, v_badge.id);
                END IF;

            ELSE
                -- Unknown badge type, skip
                NULL;
        END CASE;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_activity_logged ON public.activity_log;
CREATE TRIGGER on_activity_logged
    AFTER INSERT ON public.activity_log
    FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();


-- ─── 11. SEED BADGE DATA ──────────────────────────────────────────────────

INSERT INTO public.badges (slug, name, description, icon_name, xp_reward, criteria_json)
VALUES
    ('first_assessment', 'First Assessment', 'Complete your first skill assessment', 'clipboard-check', 50, '{"assessments_count": 1}'),
    ('skill_explorer', 'Skill Explorer', 'Map 5 or more skills to your profile', 'compass', 75, '{"skills_count": 5}'),
    ('certification_pro', 'Certification Pro', 'Earn 3 or more certifications', 'award', 100, '{"certifications_count": 3}'),
    ('streak_7', 'Week Warrior', 'Maintain a 7-day activity streak', 'flame', 100, '{"streak_days": 7}'),
    ('streak_30', 'Monthly Master', 'Maintain a 30-day activity streak', 'zap', 250, '{"streak_days": 30}'),
    ('first_application', 'Go-Getter', 'Submit your first job/internship application', 'send', 50, '{"applications_count": 1}'),
    ('portfolio_builder', 'Portfolio Builder', 'Add 3 items to your digital portfolio', 'folder-open', 75, '{"portfolio_count": 3}'),
    ('level_5', 'Rising Star', 'Reach Level 5', 'star', 150, '{"level": 5}'),
    ('level_10', 'Veteran', 'Reach Level 10', 'trophy', 300, '{"level": 10}'),
    ('profile_complete', 'Identity Verified', 'Complete your student profile', 'user-check', 25, '{"profile_complete": true}')
ON CONFLICT (slug) DO NOTHING;


-- ─── 12. SUPABASE STORAGE BUCKETS ──────────────────────────────────────────
-- These must be created via the Supabase Dashboard or Management API.
-- The SQL below documents the intended buckets. Run the INSERT statements
-- only if your Supabase instance supports storage.objects manipulation via SQL.

-- Bucket: student-documents (private, for Document Center uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-documents',
    'student-documents',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: student-portfolio (public, for Portfolio images/files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-portfolio',
    'student-portfolio',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can manage their own files (path = user_id/filename)
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('student-documents', 'student-portfolio')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
CREATE POLICY "Users can read own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id IN ('student-documents', 'student-portfolio')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents" ON storage.objects
    FOR DELETE USING (
        bucket_id IN ('student-documents', 'student-portfolio')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Public read for portfolio bucket (it's a public bucket)
DROP POLICY IF EXISTS "Public can read portfolio files" ON storage.objects;
CREATE POLICY "Public can read portfolio files" ON storage.objects
    FOR SELECT USING (bucket_id = 'student-portfolio');


-- ─── DONE ──────────────────────────────────────────────────────────────────
-- After running this migration:
-- 1. Verify tables in Supabase Dashboard → Table Editor
-- 2. Verify storage buckets in Supabase Dashboard → Storage
-- 3. Test: SELECT * FROM public.badges; (should return 10 rows)
-- 4. Test: SELECT * FROM public.leaderboard_view; (should return 0 rows initially)
