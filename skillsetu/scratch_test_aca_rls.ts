import { createClient } from "@supabase/supabase-js";
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

async function testRLS() {
  const serviceClient = createClient(url, key);
  
  // Find an academician
  const { data: aca } = await serviceClient.from("users").select("*").eq("role", "academician").limit(1).single();
  if (!aca) return console.log("No academician found");
  
  // We cannot easily create a JWT here without the JWT secret.
  // But wait, we can just use supabase auth if we know their password, or we can just fetch the RLS policies and read them.
  console.log("Academician:", aca.email);
}

testRLS();
