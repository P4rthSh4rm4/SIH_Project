import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
// Academician token (we need one) or we can just use the service role and check if there is data first!
// We can use the service role just to verify the data exists for a student.
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, key);

async function check() {
  const { data: students } = await supabase.from("users").select("id, email").eq("role", "student").limit(2);
  
  if (!students || students.length === 0) return console.log("No students found");
  
  for (const student of students) {
    const studentId = student.id;
    console.log("Checking student:", student.email);
    
    const [
      skills,
      portfolio,
      edu,
      exp,
      cert,
      interviews,
      assess
    ] = await Promise.all([
      supabase.from("student_skills").select("*").eq("student_id", studentId),
      supabase.from("portfolio_items").select("*").eq("user_id", studentId),
      supabase.from("student_education").select("*").eq("user_id", studentId),
      supabase.from("student_experience").select("*").eq("user_id", studentId),
      supabase.from("certifications").select("*").eq("student_id", studentId),
      supabase.from("mock_interviews").select("*").eq("student_id", studentId),
      supabase.from("assessments").select("*").eq("student_id", studentId)
    ]);
    
    console.log(`Skills: ${skills.data?.length}`);
    console.log(`Portfolio: ${portfolio.data?.length}`);
    console.log(`Edu: ${edu.data?.length}`);
    console.log(`Exp: ${exp.data?.length}`);
    console.log(`Cert: ${cert.data?.length}`);
    console.log(`Interviews: ${interviews.data?.length}`);
    console.log(`Assessments: ${assess.data?.length}`);
    console.log("---");
  }
}

check();
