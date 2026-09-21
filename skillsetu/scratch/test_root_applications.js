const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';
const s = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing alternative query from applications root...");
  const { data, error } = await s
    .from("applications")
    .select(`
      id, student_id,
      users!inner (id, name, department),
      application_skill_feedback!inner (
        id, rating, gap_indicator,
        skills (id, name)
      )
    `)
    .eq('users.department', 'Ayurveda');
    
  console.log("Result:", JSON.stringify(data, null, 2), error);
}

test();
