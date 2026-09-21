const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';
const s = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing filter inside select string...");
  const dept = 'Ayurveda';
  const { data, error } = await s
    .from("application_skill_feedback")
    .select(`
      id, rating, gap_indicator,
      skills (id, name),
      applications!inner (
        id, student_id,
        users!inner (
          id, name, department,
          department:department.eq.${dept}
        )
      )
    `);
    
  console.log("Result:", JSON.stringify(data, null, 2), error);
}

test();
