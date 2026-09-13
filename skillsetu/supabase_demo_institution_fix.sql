DO $$
DECLARE
  demo_institution_id UUID;
BEGIN
  -- 1. Check if Demo University already exists, otherwise create it
  SELECT id INTO demo_institution_id
  FROM public.institutions
  WHERE name = 'Demo University'
  LIMIT 1;

  IF demo_institution_id IS NULL THEN
    INSERT INTO public.institutions (name, address, type)
    VALUES ('Demo University', 'Demo Campus', 'University')
    RETURNING id INTO demo_institution_id;
  END IF;

  -- 2. Assign all Academicians to this institution
  UPDATE public.users 
  SET institution_id = demo_institution_id
  WHERE role = 'academician';

  -- 3. Assign all Students to this institution
  UPDATE public.users 
  SET institution_id = demo_institution_id
  WHERE role = 'student';

END $$;
