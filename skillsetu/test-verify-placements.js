import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
);

async function verifyPlacements() {
  const studentIds = ['e6374874-7ed6-4865-8600-f4e3d3e2bccf', '8a552bb8-6de5-45cb-952e-96cbad1846da'];
  
  for (const sid of studentIds) {
    console.log(`\n===========================================`);
    console.log(`Verifying Student ID: ${sid}`);
    
    // 1. Get Student User
    const { data: user } = await supabase.from('users').select('name, email').eq('id', sid).single();
    console.log(`Student: ${user?.name} (${user?.email})`);
    
    // 2. Get Placement Record
    const { data: placement } = await supabase.from('placement_records').select('*').eq('student_id', sid).eq('outcome', 'placed').single();
    if (placement) {
      console.log(`Placement Record: id=${placement.id}, outcome=${placement.outcome}, opportunity_id=${placement.opportunity_id}, package=${placement.package}`);
    } else {
      console.log(`Placement Record: None found with outcome=placed`);
      continue;
    }
    
    // 3. Get Application and Offer for that opportunity
    if (placement.opportunity_id) {
        const { data: apps } = await supabase
            .from('applications')
            .select('id, status, opportunity_id, application_offers(id, offer_status, position_title)')
            .eq('student_id', sid)
            .eq('opportunity_id', placement.opportunity_id);
            
        if (apps && apps.length > 0) {
            apps.forEach(app => {
                console.log(`Application for ${placement.opportunity_id}: id=${app.id}, status=${app.status}`);
                if (app.application_offers) {
                    console.log(`Offer: id=${app.application_offers.id}, status=${app.application_offers.offer_status}, title=${app.application_offers.position_title}`);
                } else {
                    console.log(`Offer: No offer record exists for this application.`);
                }
            });
        } else {
            console.log(`Application: No application found for this opportunity!`);
        }
        
        // 4. Check if Opportunity still exists
        const { data: opp } = await supabase.from('opportunities').select('id, title').eq('id', placement.opportunity_id).single();
        if (opp) {
            console.log(`Opportunity: exists (${opp.title})`);
        } else {
            console.log(`Opportunity: DELETED/Not Found`);
        }
    } else {
        console.log(`Application/Opportunity: The placement record has a null opportunity_id. Cannot cross-reference application.`);
        
        // Let's just check all applications for this user to see if they have any accepted offers
        const { data: apps } = await supabase
            .from('applications')
            .select('id, status, opportunity_id, application_offers(id, offer_status, position_title)')
            .eq('student_id', sid);
            
        let foundOffer = false;
        if (apps) {
            apps.forEach(app => {
                if (app.application_offers && app.application_offers.offer_status === 'accepted') {
                    console.log(`Found an accepted offer on a different application: opp_id=${app.opportunity_id}, status=${app.status}, offer_status=${app.application_offers.offer_status}`);
                    foundOffer = true;
                }
            });
        }
        if (!foundOffer) {
            console.log(`No accepted offers exist for this student on ANY application.`);
        }
    }
  }
}

verifyPlacements();
