import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load from .env.local
const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from("opportunities").select("*").in("title", ["E2E Test Job", "test opportunity"]);
  if (error) {
    console.error("Error opportunities:", error);
  } else {
    console.log("Opportunities:", JSON.stringify(data, null, 2));
    
    // For each opportunity, let's see what the industry_id maps to in users
    if (data && data.length > 0) {
      for (const opp of data) {
        const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", opp.industry_id);
        if (userError) {
          console.error(`Error fetching user for opp ${opp.title}:`, userError);
        } else {
          console.log(`User for ${opp.title}:`, JSON.stringify(userData, null, 2));
        }
      }
    }
  }

  // Also check academician_opportunities
  const { data: acOpps, error: acError } = await supabase.from("academician_opportunities").select("*");
  if (acError) {
    console.error("Error academician_opportunities:", acError);
  } else {
    console.log("Academician Opportunities:", JSON.stringify(acOpps, null, 2));
  }
}

check();
