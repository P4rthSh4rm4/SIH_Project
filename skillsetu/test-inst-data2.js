import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function check() {
  // 1. Check institutions table
  console.log('=== All Institutions ===');
  const { data: institutions } = await supabase.from('institutions').select('*');
  console.log(JSON.stringify(institutions, null, 2));

  // 2. Check all students with their institution_id
  console.log('\n=== Students and their institution_id ===');
  const { data: students } = await supabase.from('users').select('id, name, email, role, institution_id').eq('role', 'student');
  for (const s of (students || [])) {
    console.log(`  ${s.name} (${s.email}): institution_id = ${s.institution_id}`);
  }

  // 3. Check all placement_records
  console.log('\n=== All placement_records ===');
  const { data: placements } = await supabase.from('placement_records').select('*');
  console.log(JSON.stringify(placements, null, 2));

  // 4. Check all certifications
  console.log('\n=== Certifications (verified=false) ===');
  const { data: certs } = await supabase.from('certifications').select('*').eq('verified', false);
  console.log(`Found ${certs?.length || 0} unverified certifications`);

  // 5. Check applications with pending_faculty status
  console.log('\n=== Applications with status=pending_faculty ===');
  const { data: pendingApps } = await supabase.from('applications').select('id, status, student_id').eq('status', 'pending_faculty');
  console.log(`Found ${pendingApps?.length || 0} pending_faculty applications`);
  if (pendingApps) console.log(JSON.stringify(pendingApps, null, 2));
}

check();
