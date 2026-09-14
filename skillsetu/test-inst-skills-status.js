import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';
const supabase = createClient(supabaseUrl, supabaseKey); // Admin client

async function check() {
  const institutionId = '234dde8f-8dae-45f6-8ec1-7589417e5cad';

  console.log('--- Checking Students for Institution ---');
  const { data: students } = await supabase.from('users').select('id, name').eq('role', 'student').eq('institution_id', institutionId);
  const studentIds = students?.map(s => s.id) || [];
  console.log(`Found ${studentIds.length} students.`);

  console.log('\n--- Checking Student Skills ---');
  const { data: skills, error: skillsError } = await supabase.from('student_skills').select('student_id, skills(name)').in('student_id', studentIds);
  console.log(skills || skillsError);

  console.log('\n--- Checking Applications ---');
  const { data: apps, error: appsError } = await supabase.from('applications').select('student_id, status').in('student_id', studentIds);
  console.log(apps || appsError);
  
  console.log('\n--- Checking Placement Records ---');
  const { data: placements, error: placementsError } = await supabase.from('placement_records').select('student_id, outcome').in('student_id', studentIds);
  console.log(placements || placementsError);
}

check();
