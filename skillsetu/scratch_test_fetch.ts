import { createClient } from "@supabase/supabase-js";
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function testFetch() {
  const { data: users } = await supabase.from("users").select("*").eq("role", "student").limit(2);
  for (const student of users || []) {
    const studentId = student.id;
    console.log(`Testing query for ${student.email} (${studentId})`);
    
    const res = await Promise.all([
      supabase.from("student_skills").select("*, skills(*)").eq("student_id", studentId),
      supabase.from("portfolio_items").select("*").eq("user_id", studentId),
      supabase.from("student_education").select("*").eq("user_id", studentId),
      supabase.from("student_experience").select("*").eq("user_id", studentId),
      supabase.from("certifications").select("*").eq("student_id", studentId),
      supabase.from("mock_interviews").select("*").eq("student_id", studentId).eq("status", "Completed").not("overall_score", "is", null),
      supabase.from("assessments").select("*").eq("student_id", studentId),
      supabase.from("student_profiles").select("*").eq("user_id", studentId).single(),
      supabase.from("application_skill_feedback").select("*, skill:skills(name), application:applications!inner(student_id, opportunity:opportunities(title, industry:users(name)))").eq("application.student_id", studentId)
    ]);
    
    const profile = res[7];
    console.log("Profile data:", profile.data);
    console.log("Profile error:", profile.error);
    
    // Check if any rejected
    const errors = res.filter(r => r.error && r.error.code !== 'PGRST116');
    if (errors.length > 0) {
      console.log("ERRORS:", errors.map(e => e.error));
    }
  }
}

testFetch();
