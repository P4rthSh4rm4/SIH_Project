import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, key);

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    // If RPC doesn't exist, we can just query pg_policies using postgres endpoint?
    // Supabase JS doesn't expose pg_policies directly via PostgREST, but let's try.
    const { data: policies, error: pgError } = await supabase.from('pg_policies').select('*').eq('tablename', 'student_skills');
    console.log("Policies:", policies || pgError);
  } else {
    console.log(data);
  }
}

checkRLS();
