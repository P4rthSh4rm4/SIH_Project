import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('placement_records')
    .select('student_id, outcome, package, date, opportunities(title, users(name))');
    
  console.log('Query 1 (opportunities(users(name))):', JSON.stringify(data, null, 2), error);

  const { data: d2, error: e2 } = await supabase
    .from('placement_records')
    .select('student_id, outcome, package, date, opportunities(title, industry:users!opportunities_industry_id_fkey(name))');

  console.log('Query 2 (opportunities(industry:users(name))):', JSON.stringify(d2, null, 2), e2);
}

run();
