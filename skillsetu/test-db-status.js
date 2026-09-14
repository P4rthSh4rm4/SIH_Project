import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
)

async function main() {
  const { data, error } = await supabase.from('applications').select('id, status').in('id', ['ca8b0144-694c-452a-95ec-b92f356feaf5', '02947f7f-73fb-4eb7-8b48-32550d8a93d0'])
  console.log(JSON.stringify(data, null, 2))
}
main()
