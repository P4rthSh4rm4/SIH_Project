import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('users')
    .update({ name: 'TechCorp Solutions' })
    .eq('id', 'ece1cbb6-a386-4cff-be9c-4fdcc7c66491');
    
  console.log('Updated user:', error ? error : 'Success');
}

run();
