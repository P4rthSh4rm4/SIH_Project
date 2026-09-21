import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for script verification testing
);

async function testOpportunities(departmentLabel, simulatedDepartment) {
  console.log(`\n=== Testing for: ${departmentLabel} (Simulated Dept: ${simulatedDepartment}) ===`);
  
  if (!simulatedDepartment) {
    console.log("FAIL CLOSED: Department is missing/null, returning [] as per hook logic.");
    return;
  }

  const { data: opps, error } = await supabase
    .from("opportunities")
    .select("*, users!inner(department)")
    .eq("status", "active")
    .eq("users.department", simulatedDepartment)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  console.log(`Found ${opps.length} opportunities.`);
  opps.forEach(o => {
    console.log(`- Title: ${o.title}, Industry Dept: ${o.users.department}`);
  });
}

async function run() {
  // Test 1: Ayurveda Student
  await testOpportunities("Ayurveda Student", "Ayurveda");

  // Test 2: CSE Student
  await testOpportunities("CSE Student", "CSE");

  // Test 3: Missing Department
  await testOpportunities("Missing Department Student", null);
}

run();
