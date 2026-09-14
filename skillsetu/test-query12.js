import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, application_offers(*)')
    .eq('student_id', 'e6374874-7ed6-4865-8600-f4e3d3e2bccf');
    
  console.log('Student apps:', JSON.stringify(data, null, 2), error);
}

run();
