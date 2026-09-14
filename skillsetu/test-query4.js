import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', '9a9170f4-2eff-4023-a39a-0fc76472f451');
    
  console.log('Opp cols:', JSON.stringify(data, null, 2), error);
}

run();
