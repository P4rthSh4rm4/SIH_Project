import { createClient } from "@supabase/supabase-js";
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function inspectProfiles() {
  const { data: users } = await supabase.from("users").select("id, email").eq("role", "student").limit(5);
  if (!users) return console.log("No users");

  for (const u of users) {
    const { data: profile } = await supabase.from("student_profiles").select("*").eq("user_id", u.id).single();
    
    if (profile) {
      let score = 0;
      if (profile.resume_url) score += 20;
      if (profile.name) score += 3;
      if (profile.email) score += 3;
      if (profile.phone) score += 2;
      if (profile.location) score += 2;
      if (profile.bio && profile.bio.length > 20) score += 5;
      if (profile.career_objective && profile.career_objective.length > 10) score += 5;
      console.log(`Student ${u.email} resume score based on profile: ${score}`);
    } else {
      console.log(`Student ${u.email} has no profile`);
    }
  }
}

inspectProfiles();
