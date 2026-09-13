import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDk3MjAsImV4cCI6MjEwMzY4NTcyMH0.pgxeIBBLQigAqp_Xlsd99S5GIzmaRFyttMhN7aVPpC0";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, anonKey);
const adminClient = createClient(url, serviceKey);

async function run() {
  const email = "testacad_" + Date.now() + "@example.com";
  const password = "password123";

  // Register
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: "Test Acad", role: "academician" }
    }
  });

  if (authErr) {
    console.error("SignUp error:", authErr);
    return;
  }

  const userId = authData.user?.id;
  console.log("Logged in UID:", userId);

  // Wait a sec for trigger to create public.users
  await new Promise(r => setTimeout(r, 2000));

  // Check public.users role
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", userId).single();
  console.log("User Profile Role:", userProfile?.role);

  // Attempt INSERT
  const payload = {
    type: "FDP",
    title: "Test FDP",
    description: "FDP Workshop",
    start_date: "2024-01-01",
    end_date: "2024-01-02",
    duration: "2 Days",
    mode: "Online",
    location: "Zoom",
    instructor: "Dr. Smith",
    capacity: 50,
    created_by: userId,
    status: "upcoming"
  };

  console.log("Payload:", payload);

  const { data, error } = await supabase.from("academician_opportunities").insert(payload);
  
  if (error) {
    console.log("INSERT ERROR MESSAGE:", error.message);
    console.log("INSERT ERROR CODE:", error.code);
    console.log("INSERT ERROR DETAILS:", error.details);
    console.log("INSERT ERROR HINT:", error.hint);
  } else {
    console.log("INSERT SUCCESS!");
  }

  // Cleanup
  await adminClient.auth.admin.deleteUser(userId!);
}

run();
