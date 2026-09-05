-- ============================================================================
-- Backfill Student Skills from Assessment History
-- 
-- Run this script in the Supabase SQL Editor to repair the student_skills 
-- table for users who completed assessments before the skills master 
-- catalog was seeded.
-- 
-- Properties:
-- 1. Idempotent (safe to run multiple times).
-- 2. Uses the latest assessment score per student/skill.
-- 3. Does not modify existing assessment records.
-- ============================================================================

WITH assessment_data AS (
    SELECT 
        student_id,
        (generated_profile_json->>'score')::INTEGER as score,
        taken_at,
        responses_json->>'subcategory' as subcategory,
        -- Map the legacy subcategory IDs to the seeded master skill names
        CASE responses_json->>'subcategory'
            WHEN 'dsa' THEN 'Data Structures & Algorithms'
            WHEN 'sql' THEN 'SQL'
            WHEN 'web_dev' THEN 'Web Development'
            WHEN 'quant' THEN 'Quantitative Aptitude'
            WHEN 'logical' THEN 'Logical Reasoning'
            WHEN 'verbal' THEN 'Verbal Ability'
            WHEN 'communication' THEN 'Communication Skills'
            WHEN 'leadership' THEN 'Leadership'
            WHEN 'teamwork' THEN 'Teamwork'
            WHEN 'problem_solving' THEN 'Problem Solving'
            ELSE NULL
        END as mapped_skill_name
    FROM public.assessments
    WHERE type = 'questionnaire'
),
mapped_assessments AS (
    -- Join with the master skills table to get the correct UUID
    SELECT 
        ad.student_id,
        ad.score,
        ad.taken_at,
        s.id as skill_id
    FROM assessment_data ad
    JOIN public.skills s ON s.name = ad.mapped_skill_name
    WHERE ad.score IS NOT NULL
),
latest_assessments AS (
    -- Partition by student and skill to find the most recent assessment
    SELECT 
        student_id,
        skill_id,
        score,
        ROW_NUMBER() OVER(PARTITION BY student_id, skill_id ORDER BY taken_at DESC) as rn
    FROM mapped_assessments
)
-- Upsert the latest scores into student_skills
INSERT INTO public.student_skills (student_id, skill_id, proficiency_score, verified, source)
SELECT 
    student_id,
    skill_id,
    score as proficiency_score,
    FALSE as verified,
    'assessment' as source
FROM latest_assessments
WHERE rn = 1
ON CONFLICT (student_id, skill_id) 
DO UPDATE SET 
    proficiency_score = EXCLUDED.proficiency_score,
    source = EXCLUDED.source;
