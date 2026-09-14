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
    .select('id, title, industry_id')
    .eq('id', '9a9170f4-2eff-4023-a39a-0fc76472f451');
    
  console.log('Opp:', JSON.stringify(data, null, 2), error);

  if (data && data.length) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', data[0].industry_id);
    console.log('User:', JSON.stringify(user, null, 2), userError);
  }
}

run();
