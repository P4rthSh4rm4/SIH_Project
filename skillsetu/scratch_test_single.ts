import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function testSingle() {
  try {
    const randomUuid = "b9090b4d-ef37-4d94-80cf-f30c9fb23063"; // no profile
    const [res] = await Promise.all([
      supabase.from("student_profiles").select("*").eq("user_id", randomUuid).single()
    ]);
    console.log("Resolved:", res);
  } catch (err) {
    console.log("Rejected with error:", err);
  }
}

testSingle();
