import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, serviceKey);

async function run() {
  const { data, error } = await supabase.rpc("execute_sql", {
    sql_query: `
      SELECT policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'academician_opportunities';
    `
  });
  
  if (error) {
    // Fallback if execute_sql is not available
    const { data: policies, error: polError } = await supabase.from('pg_policies').select('*').eq('tablename', 'academician_opportunities');
    console.log("Policies (REST fallback):", policies);
    if (polError) console.error("Error:", polError);
  } else {
    console.log("Policies (RPC):", data);
  }
}

run();
