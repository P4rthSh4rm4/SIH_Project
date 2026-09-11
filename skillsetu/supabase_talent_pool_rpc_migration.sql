-- Create the RPC to fetch talent pool candidates securely
-- This bypasses nested RLS policies while strictly enforcing caller is an industry user

CREATE OR REPLACE FUNCTION get_talent_pool_candidates()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_result JSONB;
BEGIN
  -- 1. Verify Caller Authentication & Role
  -- auth.uid() returns the authenticated user's ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_caller_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;

  -- Allow industry or admin to view talent pool
  IF v_caller_role NOT IN ('industry', 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only industry and admin users can access the talent pool.';
  END IF;

  -- 2. Build Candidate JSON Payload
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'institutions', (
         SELECT jsonb_build_object('name', i.name)
         FROM institutions i WHERE i.id = u.institution_id
      ),
      'student_profiles', (
         SELECT jsonb_build_object(
           'bio', sp.bio,
           'resume_url', sp.resume_url,
           'portfolio_website', sp.portfolio_website,
           'linkedin', sp.linkedin,
           'github', sp.github
         )
         FROM student_profiles sp WHERE sp.user_id = u.id LIMIT 1
      ),
      'student_education', (
         SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'degree', se.degree,
             'branch', se.branch,
             'cgpa', se.cgpa,
             'start_year', se.start_year,
             'end_year', se.end_year,
             'institute', se.institute
           )
         ), '[]'::jsonb)
         FROM student_education se WHERE se.user_id = u.id
      ),
      'student_skills', (
         SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'skill_id', ss.skill_id,
             'proficiency_score', ss.proficiency_score,
             'verified', ss.verified,
             'skills', (
                SELECT jsonb_build_object('id', s.id, 'name', s.name, 'category', s.category)
                FROM skills s WHERE s.id = ss.skill_id LIMIT 1
             )
           )
         ), '[]'::jsonb)
         FROM student_skills ss WHERE ss.student_id = u.id
      ),
      'assessments', (
         SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'type', a.type,
             'taken_at', a.taken_at,
             'generated_profile_json', a.generated_profile_json
           )
         ), '[]'::jsonb)
         FROM assessments a WHERE a.student_id = u.id
      ),
      'mock_interviews', (
         SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'id', mi.id,
             'student_id', mi.student_id,
             'interview_type', mi.interview_type,
             'career_path', mi.career_path,
             'difficulty', mi.difficulty,
             'started_at', mi.started_at,
             'completed_at', mi.completed_at,
             'time_taken', mi.time_taken,
             'status', mi.status,
             'technical_score', mi.technical_score,
             'communication_score', mi.communication_score,
             'problem_solving_score', mi.problem_solving_score,
             'grammar_score', mi.grammar_score,
             'overall_score', mi.overall_score
           )
         ), '[]'::jsonb)
         FROM mock_interviews mi WHERE mi.student_id = u.id
      ),
      'student_experience', (
         SELECT COALESCE(jsonb_agg(jsonb_build_object('id', se.id)), '[]'::jsonb)
         FROM student_experience se WHERE se.user_id = u.id
      ),
      'portfolio_items', (
         SELECT COALESCE(jsonb_agg(jsonb_build_object('id', pi.id, 'type', pi.type)), '[]'::jsonb)
         FROM portfolio_items pi WHERE pi.user_id = u.id
      ),
      'certifications', (
         SELECT COALESCE(jsonb_agg(jsonb_build_object('id', c.id, 'verified', c.verified)), '[]'::jsonb)
         FROM certifications c WHERE c.student_id = u.id
      )
    )
  ), '[]'::jsonb)
  INTO v_result
  FROM users u
  WHERE u.role = 'student';

  RETURN v_result;
END;
$$;

-- Revoke default public execute and grant only to authenticated role
REVOKE EXECUTE ON FUNCTION get_talent_pool_candidates() FROM public;
REVOKE EXECUTE ON FUNCTION get_talent_pool_candidates() FROM anon;
GRANT EXECUTE ON FUNCTION get_talent_pool_candidates() TO authenticated;
