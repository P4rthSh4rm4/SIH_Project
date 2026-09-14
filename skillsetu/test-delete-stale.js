import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function cleanup() {
  const staleId = 'e13dd54f-507e-4b91-a615-f686bc35fb1a';

  console.log(`Attempting to delete stale placement record: ${staleId}`);
  
  // Verify it exists first
  const { data: record } = await supabase.from('placement_records').select('*').eq('id', staleId).single();
  
  if (!record) {
      console.log('Record not found or already deleted.');
      return;
  }
  
  console.log('Found record:', record);
  
  if (record.outcome === 'placed' && !record.opportunity_id) {
      const { data, error } = await supabase.from('placement_records').delete().eq('id', staleId);
      if (error) {
          console.error('Failed to delete:', error);
      } else {
          console.log(`Successfully deleted stale placement record.`);
      }
  } else {
      console.log('Safety check failed! Record has opportunity_id or different outcome.');
  }
}

cleanup();
