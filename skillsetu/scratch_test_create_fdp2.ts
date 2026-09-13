import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const adminClient = createClient(url, serviceKey);

async function run() {
  const { data: user } = await adminClient.from("users").select("id").eq("role", "academician").limit(1).single();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";
  console.log("Using user ID:", userId);

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

  const { data, error } = await adminClient.from("academician_opportunities").insert(payload);
  
  if (error) {
    console.log("INSERT ERROR MESSAGE:", error.message);
    console.log("INSERT ERROR CODE:", error.code);
    console.log("INSERT ERROR DETAILS:", error.details);
    console.log("INSERT ERROR HINT:", error.hint);
  } else {
    console.log("INSERT SUCCESS!");
  }
}

run();
