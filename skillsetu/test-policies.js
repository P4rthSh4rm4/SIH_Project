import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';

// First log in as Parth
async function check() {
  const supabase = createClient(supabaseUrl, supabaseKey); // Need anon key normally, but we can't easily login without password.

  // Let's use the admin client to just check existing policies
  const { data: policies, error } = await supabase.from('pg_policies').select('*').in('tablename', ['student_skills', 'applications']);
  if (error) {
    console.error(error);
  } else {
    console.log(policies);
  }
}

check();
