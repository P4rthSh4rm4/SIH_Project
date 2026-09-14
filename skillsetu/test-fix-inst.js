import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function fix() {
  // Fix 1: Set the institution admin's institution_id to Demo University
  const ADMIN_ID = '319516db-78f2-4bb5-8932-65dac18a86fc';
  const INSTITUTION_ID = '234dde8f-8dae-45f6-8ec1-7589417e5cad';

  const { data, error } = await supabase
    .from('users')
    .update({ institution_id: INSTITUTION_ID })
    .eq('id', ADMIN_ID)
    .select('id, name, email, role, institution_id');

  if (error) {
    console.error('Error updating admin:', error);
  } else {
    console.log('Admin updated:', JSON.stringify(data, null, 2));
  }

  // Fix 2: Update the is_institution_admin() RLS function to match 'institution_admin' role
  const { error: rpcError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION public.is_institution_admin()
      RETURNS BOOLEAN AS $$
        SELECT role IN ('institution_admin', 'institution') FROM public.users WHERE id = auth.uid();
      $$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
    `
  });

  if (rpcError) {
    console.log('RPC exec_sql not available, will need manual SQL execution for is_institution_admin fix.');
    console.log('SQL to run manually:');
    console.log(`
      CREATE OR REPLACE FUNCTION public.is_institution_admin()
      RETURNS BOOLEAN AS $$
        SELECT role IN ('institution_admin', 'institution') FROM public.users WHERE id = auth.uid();
      $$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
    `);
  } else {
    console.log('is_institution_admin() function updated successfully');
  }
}

fix();
