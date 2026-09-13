import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function test() {
  const studentId = "b9090b4d-ef37-4d94-80cf-f30c9fb23063"; // random uuid just to test syntax
  const { data, error } = await supabase
    .from("application_skill_feedback")
    .select(`
      *,
      skill:skills(name),
      application:applications!inner(student_id, opportunity:opportunities(title, industry:users(name)))
    `)
    .eq("application.student_id", studentId);
    
  console.log("Feedback error:", error);
}

test();
