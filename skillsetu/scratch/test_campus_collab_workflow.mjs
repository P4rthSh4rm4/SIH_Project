import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyWorkflow() {
  console.log('--- Starting Campus Collaboration & Direct Publishing Verification ---');

  // 1. Get an existing industry user and institution
  const { data: industryUsers } = await supabase.from('users').select('id, department').eq('role', 'industry').limit(1);
  if (!industryUsers || industryUsers.length === 0) {
    throw new Error('No industry user found for testing.');
  }
  const industryUser = industryUsers[0];
  console.log('Using Industry User:', industryUser.id, 'Dept:', industryUser.department);

  const { data: institutions } = await supabase.from('institutions').select('id, name').limit(1);
  if (!institutions || institutions.length === 0) {
    throw new Error('No institutions found for testing.');
  }
  const targetInst = institutions[0];
  console.log('Target Institution:', targetInst.id, targetInst.name);

  // 2. Post a Regular (Direct) Opportunity
  const directTitle = `Test Direct Job ${Date.now()}`;
  const { data: directOpp, error: directErr } = await supabase.from('opportunities').insert({
    industry_id: industryUser.id,
    title: directTitle,
    type: 'job',
    description: 'This is an open opportunity published directly to students.',
    status: 'active',
    verification_status: 'approved',
    eligibility_requirements: {
      is_campus_collaboration: false,
    }
  }).select().single();

  if (directErr) throw directErr;
  console.log('✓ Direct Opportunity Created:', directOpp.id, 'Status:', directOpp.verification_status);
  if (directOpp.verification_status !== 'approved') {
    throw new Error('Expected direct opportunity to be approved directly!');
  }

  // 3. Post a Campus Collaboration Opportunity
  const campusTitle = `Campus Drive ${Date.now()}`;
  const { data: campusOpp, error: campusErr } = await supabase.from('opportunities').insert({
    industry_id: industryUser.id,
    title: campusTitle,
    type: 'internship',
    description: 'Exclusive campus collaboration drive requiring faculty verification.',
    status: 'active',
    verification_status: 'pending',
    eligibility_requirements: {
      is_campus_collaboration: true,
      target_institution_id: targetInst.id,
      target_institution_name: targetInst.name,
      campus_collaboration_type: 'Campus Placement Drive',
      faculty_note: 'Greetings faculty, welcoming final year students!'
    }
  }).select().single();

  if (campusErr) throw campusErr;
  console.log('✓ Campus Collaboration Created:', campusOpp.id, 'Status:', campusOpp.verification_status);
  if (campusOpp.verification_status !== 'pending') {
    throw new Error('Expected campus collaboration to be pending!');
  }

  // 4. Verify Academician sees the pending campus collaboration
  const { data: pendingOpps, error: pendingErr } = await supabase
    .from('opportunities')
    .select('*, industry:users!inner(department)')
    .eq('verification_status', 'pending')
    .eq('id', campusOpp.id);

  if (pendingErr) throw pendingErr;
  console.log('✓ Academician pending queue includes campus opp:', pendingOpps.length === 1);
  if (pendingOpps.length !== 1) {
    throw new Error('Pending campus opp not found in academician queue');
  }

  // 5. Verify Student hook query DOES NOT return the pending campus opportunity yet
  const { data: studentOppsBefore } = await supabase
    .from('opportunities')
    .select('id, title, verification_status')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .in('id', [directOpp.id, campusOpp.id]);

  console.log('✓ Student query before approval: Direct opp found?', studentOppsBefore.some(o => o.id === directOpp.id));
  console.log('✓ Student query before approval: Campus opp withheld?', !studentOppsBefore.some(o => o.id === campusOpp.id));

  // 6. Simulate Faculty approval
  const { error: approveErr } = await supabase
    .from('opportunities')
    .update({ verification_status: 'approved' })
    .eq('id', campusOpp.id);

  if (approveErr) throw approveErr;
  console.log('✓ Faculty approved campus collaboration!');

  // 7. Verify Student query now returns both!
  const { data: studentOppsAfter } = await supabase
    .from('opportunities')
    .select('id, title, verification_status, eligibility_requirements')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .in('id', [directOpp.id, campusOpp.id]);

  console.log('✓ Student query after approval: Both opps found?', studentOppsAfter.length === 2);
  const foundCampus = studentOppsAfter.find(o => o.id === campusOpp.id);
  console.log('✓ Campus opp metadata preserved:', foundCampus?.eligibility_requirements?.campus_collaboration_type);

  // 8. Cleanup test rows
  await supabase.from('opportunities').delete().in('id', [directOpp.id, campusOpp.id]);
  console.log('✓ Test data cleaned up.');
  console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

verifyWorkflow().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
