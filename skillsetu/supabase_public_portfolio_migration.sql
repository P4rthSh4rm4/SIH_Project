-- 1. Add portfolio_slug to student_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS portfolio_slug TEXT UNIQUE;

-- 2. Create the SECURITY DEFINER function to securely fetch public portfolio data
CREATE OR REPLACE FUNCTION get_public_portfolio(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_record RECORD;
  v_users_record RECORD;
  v_skills JSONB;
  v_certs JSONB;
  v_projects JSONB;
  v_enrollments JSONB;
  v_result JSONB;
BEGIN
  -- Find the student ID and profile data from the slug
  SELECT *
  INTO v_student_record
  FROM student_profiles
  WHERE portfolio_slug = p_slug
  LIMIT 1;

  IF v_student_record.user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Fetch User Profile
  SELECT * 
  INTO v_users_record
  FROM users
  WHERE id = v_student_record.user_id;

  -- Fetch Skills (only verified ones)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'proficiency_score', ss.proficiency_score,
      'skill', row_to_json(s)
    )
  ), '[]'::jsonb) INTO v_skills
  FROM student_skills ss
  JOIN skills s ON s.id = ss.skill_id
  WHERE ss.student_id = v_student_record.user_id;

  -- Fetch Certificates
  SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb) INTO v_certs
  FROM career_certificates c
  WHERE c.student_id = v_student_record.user_id;

  -- Fetch Projects
  SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb) INTO v_projects
  FROM portfolio_items p
  WHERE p.user_id = v_student_record.user_id;

  -- Fetch Enrollments (to calculate completed roadmaps and stats)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'program_id', le.program_id,
      'progress_pct', le.progress_pct,
      'completed_at', le.completed_at,
      'program', row_to_json(lp)
    )
  ), '[]'::jsonb) INTO v_enrollments
  FROM learning_enrollments le
  LEFT JOIN learning_programs lp ON lp.id = le.program_id
  WHERE le.student_id = v_student_record.user_id;

  -- Build final JSON result
  v_result := jsonb_build_object(
    'profile', jsonb_build_object(
      'id', v_users_record.id,
      'name', v_users_record.name,
      'avatar_url', v_users_record.avatar_url,
      'bio', v_student_record.bio,
      'career_objective', v_student_record.career_objective,
      'github', v_student_record.github,
      'linkedin', v_student_record.linkedin,
      'portfolio_website', v_student_record.portfolio_website,
      'resume_url', v_student_record.resume_url,
      'email', v_users_record.email
    ),
    'skills', v_skills,
    'certificates', v_certs,
    'projects', v_projects,
    'enrollments', v_enrollments
  );

  RETURN v_result;
END;
$$;

-- Allow public access to the function
GRANT EXECUTE ON FUNCTION get_public_portfolio(TEXT) TO anon, authenticated;
