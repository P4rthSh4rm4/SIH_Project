import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backfill() {
  console.log("=== Backfilling Existing Accounts to Department: 'CSE' ===");

  // 1. List all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Error listing auth users:", authError.message);
    return;
  }

  console.log(`Found ${authData.users.length} auth users.`);

  for (const user of authData.users) {
    const existingMeta = user.user_metadata || {};
    const updatedMeta = {
      ...existingMeta,
      department: existingMeta.department || 'CSE',
      onboarding_completed: true,
    };

    const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMeta,
    });

    if (updateAuthErr) {
      console.warn(`Failed to update metadata for ${user.email}:`, updateAuthErr.message);
    } else {
      console.log(`✅ Updated auth metadata for ${user.email} (${existingMeta.role || 'user'}) -> CSE`);
    }
  }

  // 2. Update public.users table if column exists
  try {
    const { data: updateRes, error: dbErr } = await supabase
      .from('users')
      .update({ department: 'CSE', onboarding_completed: true })
      .or('department.is.null,department.eq.""');

    if (dbErr) {
      console.log("Note on public.users table:", dbErr.message);
      console.log("👉 Please paste and run `supabase_department_and_onboarding_migration.sql` in Supabase SQL editor to create the `department` column on `public.users`.");
    } else {
      console.log("✅ Successfully updated public.users rows with department = 'CSE' and onboarding_completed = true.");
    }
  } catch (err) {
    console.log("public.users update skipped:", err.message);
  }

  console.log("=== Backfill Complete ===");
}

backfill();
