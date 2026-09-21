import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      id,
      industry_id,
      users!opportunities_industry_id_fkey(department)
    `)
    .limit(1);
    
  console.log('Opportunities Join Cols:', JSON.stringify(data, null, 2), error);
}

run();
