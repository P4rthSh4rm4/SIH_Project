import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';
const supabase = createClient(supabaseUrl, supabaseKey); // Admin client

async function check() {
  console.log('--- Checking Institution Admins ---');
  const { data: admins } = await supabase.from('users').select('*').in('role', ['institution_admin', 'institution']);
  console.log(admins);

  if (admins && admins.length > 0) {
    const admin = admins[0];
    const instId = admin.institution_id;
    console.log(`\nAdmin: ${admin.email}, institution_id: ${instId}`);

    console.log('\n--- Checking Students for this Institution ---');
    const { data: students } = await supabase.from('users').select('*').eq('role', 'student').eq('institution_id', instId);
    console.log(`Found ${students?.length} students.`);

    console.log('\n--- Checking Placements for these Students ---');
    if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        const { data: placements } = await supabase.from('placement_records').select('*').in('student_id', studentIds);
        console.log(`Found ${placements?.length} placements.`);
        console.log(placements);
    }
    
    console.log('\n--- Checking All Placements ---');
    const { data: allPlacements } = await supabase.from('placement_records').select('*');
    console.log(`Total placements in DB: ${allPlacements?.length}`);
  }
}

check();
