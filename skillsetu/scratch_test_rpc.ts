import { createClient } from "@supabase/supabase-js";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";

const adminClient = createClient(url, serviceKey);

async function run() {
  const { data: user } = await adminClient.from("users").select("id").eq("role", "academician").limit(1).single();
  const userId = user?.id;
  
  if (!userId) {
    console.log("No academician found");
    return;
  }

  // Create an RPC to execute the insert as the user
  const rpcQuery = `
    CREATE OR REPLACE FUNCTION test_insert_as_user(uid UUID)
    RETURNS JSON AS $$
    DECLARE
      res JSON;
    BEGIN
      -- Set the role to authenticated
      SET LOCAL role = 'authenticated';
      -- Set the JWT claim for auth.uid()
      PERFORM set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);

      -- Attempt to insert
      BEGIN
        INSERT INTO public.academician_opportunities (type, title, description, start_date, end_date, duration, mode, location, instructor, capacity, created_by, status)
        VALUES ('FDP', 'Test FDP RPC', 'FDP Workshop', '2024-01-01', '2024-01-02', '2 Days', 'Online', 'Zoom', 'Dr. Smith', 50, uid, 'upcoming')
        RETURNING row_to_json(academician_opportunities.*) INTO res;
        
        RETURN res;
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM, 'state', SQLSTATE);
      END;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // Actually, we can't execute raw SQL easily with Supabase-js without the postgres connection string!
  // Wait, `adminClient.rpc` requires the function to exist. We can't create it via PostgREST.
  console.log("Cannot create RPC without direct SQL access.");
}
run();
