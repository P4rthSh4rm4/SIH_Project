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
    .select('id, application_offers(*)')
    .eq('id', '757407a6-9933-4f34-bd29-7aa1c8b79e1f');
    
  console.log('App with offer:', JSON.stringify(data, null, 2), error);
}

run();
