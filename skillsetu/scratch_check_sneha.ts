import { createClient } from "@supabase/supabase-js";
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function checkData() {
  const { data: users } = await supabase.from("users").select("*").eq("role", "student");
  console.log("Found students:", users?.length);
  
  const sneha = users?.find(u => u.name.toLowerCase().includes("sneha"));
  if (!sneha) return console.log("Sneha not found");
  
  console.log("Checking data for Sneha:", sneha.id, sneha.email);
  
  const res = await Promise.all([
      supabase.from("student_skills").select("*").eq("student_id", sneha.id),
      supabase.from("portfolio_items").select("*").eq("user_id", sneha.id),
      supabase.from("student_education").select("*").eq("user_id", sneha.id),
      supabase.from("student_experience").select("*").eq("user_id", sneha.id),
      supabase.from("certifications").select("*").eq("student_id", sneha.id),
      supabase.from("assessments").select("*").eq("student_id", sneha.id)
  ]);
  
  console.log("Skills:", res[0].data?.length);
  console.log("Portfolio:", res[1].data?.length);
  console.log("Education:", res[2].data?.length);
  console.log("Experience:", res[3].data?.length);
  console.log("Certifications:", res[4].data?.length);
  console.log("Assessments:", res[5].data?.length);
}

checkData();
