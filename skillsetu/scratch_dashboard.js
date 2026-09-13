const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const menteeId = 'efe0bada-e334-4207-a965-4becab0ff62d'; // Parvinder

  // Check what passport data actually exists
  const [prof, edu, exp, cert] = await Promise.all([
    supabase.from('student_profiles').select('*').eq('user_id', menteeId),
    supabase.from('student_education').select('*').eq('student_id', menteeId),
    supabase.from('student_experience').select('*').eq('student_id', menteeId),
    supabase.from('certifications').select('*').eq('student_id', menteeId)
  ]);

  console.log('Profile:', prof.data?.length);
  console.log('Education:', edu.data?.length);
  console.log('Experience:', exp.data?.length);
  console.log('Certifications:', cert.data?.length);

  // Check what opportunities exist
  const opps = await supabase.from('opportunities').select('id, title, status').eq('status', 'pending');
  console.log('Pending opportunities (Student jobs):', opps.data?.length);

  const acadOpps = await supabase.from('academician_opportunities').select('id, title, status, created_by');
  console.log('All academician_opportunities:', acadOpps.data);

}
run();
