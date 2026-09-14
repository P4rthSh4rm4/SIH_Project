import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function debug() {
  const sid = 'e6374874-7ed6-4865-8600-f4e3d3e2bccf';

  // 1. Raw student_skills rows for Sneha
  console.log('=== Raw student_skills for Sneha ===');
  const { data: raw, error: rawErr } = await supabase.from('student_skills').select('*').eq('student_id', sid);
  console.log('error:', rawErr);
  console.log('data:', JSON.stringify(raw, null, 2));

  // 2. Try the exact query the hook uses
  console.log('\n=== Hook query: student_skills with skills(name) ===');
  const { data: joined, error: joinErr } = await supabase.from('student_skills').select('student_id, skills(name)').eq('student_id', sid);
  console.log('error:', joinErr);
  console.log('data:', JSON.stringify(joined, null, 2));

  // 3. Check if student_skills uses user_id instead of student_id
  console.log('\n=== Try user_id column ===');
  const { data: byUser, error: userErr } = await supabase.from('student_skills').select('*').eq('user_id', sid);
  console.log('error:', userErr);
  console.log('data count:', byUser?.length);

  // 4. Check the skills table structure
  console.log('\n=== Sample skills table ===');
  const { data: skills } = await supabase.from('skills').select('*').limit(3);
  console.log(JSON.stringify(skills, null, 2));

  // 5. Check student_skills column names
  console.log('\n=== student_skills first row (all columns) ===');
  const { data: firstRow } = await supabase.from('student_skills').select('*').limit(1);
  if (firstRow && firstRow[0]) {
    console.log('Columns:', Object.keys(firstRow[0]));
    console.log('Row:', JSON.stringify(firstRow[0], null, 2));
  }
}

debug();
