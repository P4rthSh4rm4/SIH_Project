import { createClient } from "@supabase/supabase-js";
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function checkAll() {
  const { data: users } = await supabase.from("users").select("*").eq("role", "student");
  for (const u of users || []) {
    const res = await Promise.all([
      supabase.from("student_skills").select("*").eq("student_id", u.id),
      supabase.from("portfolio_items").select("*").eq("user_id", u.id),
      supabase.from("student_education").select("*").eq("user_id", u.id),
      supabase.from("student_experience").select("*").eq("user_id", u.id),
      supabase.from("certifications").select("*").eq("student_id", u.id),
      supabase.from("assessments").select("*").eq("student_id", u.id)
    ]);
    const counts = res.map(r => r.data?.length || 0);
    console.log(`${u.name}: Skills ${counts[0]}, Port ${counts[1]}, Edu ${counts[2]}, Exp ${counts[3]}, Cert ${counts[4]}, Assess ${counts[5]}`);
  }
}

checkAll();
