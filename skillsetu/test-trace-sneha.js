import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function trace() {
  // 1. Find all Sneha users
  console.log('=== All Sneha Users ===');
  const { data: snehas } = await supabase.from('users').select('id, name, email, role, institution_id').ilike('name', '%sneha%');
  for (const s of (snehas || [])) {
    console.log(`  id=${s.id} | name=${s.name} | email=${s.email} | role=${s.role} | institution_id=${s.institution_id}`);
  }

  // 2. Check placement_records for each Sneha
  const snehaIds = (snehas || []).map(s => s.id);
  console.log('\n=== Placement Records for Sneha IDs ===');
  const { data: placements } = await supabase
    .from('placement_records')
    .select('id, student_id, opportunity_id, outcome, package, date')
    .in('student_id', snehaIds);
  console.log(JSON.stringify(placements, null, 2));

  // 3. Check application_offers for each Sneha (to compare)
  console.log('\n=== Application Offers for Sneha IDs ===');
  const { data: apps } = await supabase
    .from('applications')
    .select('id, student_id, status, opportunity_id, application_offers(*)')
    .in('student_id', snehaIds);
  console.log(JSON.stringify(apps, null, 2));

  // 4. If placement exists, get the opportunity details
  if (placements && placements.length > 0) {
    for (const p of placements) {
      if (p.opportunity_id) {
        const { data: opp } = await supabase.from('opportunities').select('id, title, company_name, posted_by').eq('id', p.opportunity_id).single();
        console.log(`\n=== Opportunity for placement ${p.id} ===`);
        console.log(JSON.stringify(opp, null, 2));
        if (opp?.posted_by) {
          const { data: poster } = await supabase.from('users').select('id, name, email').eq('id', opp.posted_by).single();
          console.log('Posted by:', JSON.stringify(poster, null, 2));
        }
      }
    }
  }
}

trace();
