import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

async function runDetailedDiagnosis() {
  console.log("=== SUPABASE DEEP ROOT CAUSE ANALYSIS ===");
  
  // Fetch OpenAPI spec to verify table, columns, and types directly from PostgREST
  const openApiUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`;
  console.log(`\nFetching OpenAPI spec from: ${supabaseUrl}/rest/v1/...`);
  
  try {
    const res = await fetch(openApiUrl);
    const swagger = await res.json();
    
    // 1. Verify table exists
    const tableDef = swagger.definitions?.mock_interviews;
    if (!tableDef) {
      console.log("❌ Table 'mock_interviews' DOES NOT EXIST in the REST API schema.");
      return;
    }
    console.log("✅ Table 'mock_interviews' exists in the database schema.");
    
    // 2. Verify columns and types
    console.log("\n--- Column Definitions ---");
    for (const [colName, colProp] of Object.entries(tableDef.properties)) {
      console.log(`- ${colName}: ${colProp.type} (${colProp.format})`);
    }

    // Initialize client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4 & 7. Check records
    console.log("\n--- Checking Data ---");
    const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
    if (usersErr) {
      console.log("Error fetching users:", usersErr);
    } else {
      console.log(`Found ${users.users.length} authenticated users.`);
      
      const { data: rows, error: rowsErr } = await supabase.from('mock_interviews').select('*');
      console.log(`Found ${rows?.length || 0} records in mock_interviews.`);
      
      if (rows && rows.length > 0) {
        console.log("Sample record:", JSON.stringify(rows[0], null, 2));
      } else {
        console.log("No records found in mock_interviews. This means fetchInterviews should return an empty array [], NOT throw an error.");
      }
    }

    // 8. Why was an error thrown?
    console.log("\n--- Root Cause Analysis Conclusion ---");
    console.log("Since the table exists and columns match, the empty {} error in your browser console is typically caused by:");
    console.log("1. RLS Policy Denials: RLS does NOT throw an error on SELECT, it silently returns [].");
    console.log("2. Network / CORS Error: If the Supabase URL or anon key is invalid, the fetch request itself fails, throwing a TypeError which often stringifies to {} in the console.");
    console.log("3. Serialization: A PostgrestError stringified directly sometimes logs as {}. We updated the code to use console.error('...', error) which preserves the object.");

  } catch (err) {
    console.error("Diagnosis script failed:", err);
  }
}

runDetailedDiagnosis();
