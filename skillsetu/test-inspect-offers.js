import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
)

async function main() {
  // 1. Get all columns from application_offers by fetching a row
  const { data: allOffers, error: e1 } = await supabase.from('application_offers').select('*').limit(5);
  console.log("=== application_offers schema (sample rows) ===");
  if (allOffers && allOffers.length > 0) {
    console.log("Columns:", Object.keys(allOffers[0]));
    for (const o of allOffers) {
      console.log(JSON.stringify(o, null, 2));
    }
  } else {
    console.log("No rows found", e1);
  }

  // 2. Get distinct offer_status values
  const { data: statuses } = await supabase.from('application_offers').select('offer_status');
  if (statuses) {
    const unique = [...new Set(statuses.map(s => s.offer_status))];
    console.log("\n=== Distinct offer_status values ===");
    console.log(unique);
  }

  // 3. Check applications table for status values
  const { data: appStatuses } = await supabase.from('applications').select('status');
  if (appStatuses) {
    const unique = [...new Set(appStatuses.map(s => s.status))];
    console.log("\n=== Distinct application status values ===");
    console.log(unique);
  }
}

main();
