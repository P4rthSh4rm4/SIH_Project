import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("academician_opportunities")
    .select(`
      id, 
      type, 
      title, 
      deadline,
      users (
        name
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.log("ERROR MESSAGE:", error.message);
    console.log("ERROR CODE:", error.code);
    console.log("ERROR DETAILS:", error.details);
    console.log("ERROR HINT:", error.hint);
  } else {
    console.log("NO ERROR WITH SERVICE ROLE. Rows:", data?.length);
  }
}

main();
