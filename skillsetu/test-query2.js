import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('placement_records')
    .select('student_id, outcome, package, date, opportunities(title, users(name))');
    
  console.log('Query 1:', JSON.stringify(data, null, 2), error);
}

run();
