const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Database Verification Start ---');
  
  // 1. Academicians
  const { data: academicians, error: err1 } = await supabase
    .from('users')
    .select('id, name, institution_id, role')
    .eq('role', 'academician');
  console.log('1. Academicians:', err1 ? err1 : academicians);

  // 2. Students
  const { data: students, error: err2 } = await supabase
    .from('users')
    .select('id, name, institution_id, role')
    .eq('role', 'student');
  console.log('2. Students:', err2 ? err2 : (students ? students.slice(0, 10) : []));

  // 3. Institutions
  const { data: institutions, error: err3 } = await supabase
    .from('institutions')
    .select('id, name');
  console.log('3. Institutions:', err3 ? err3 : institutions);

}
run();
