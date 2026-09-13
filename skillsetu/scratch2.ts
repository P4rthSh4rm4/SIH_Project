import { createClient } from "@supabase/supabase-js";

// Load from .env.local
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      industry:users(name)
    `)
    .in("title", ["E2E Test Job", "test opportunity"]);
    
  if (error) {
    console.error("Error opportunities query:", error);
  } else {
    console.log("Opportunities with industry:users(name):", JSON.stringify(data, null, 2));
  }
}

check();
