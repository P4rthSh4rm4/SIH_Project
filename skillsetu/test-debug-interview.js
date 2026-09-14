import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yynuzpbzqhofhwiyuquo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU'
)

async function main() {
  // Get all applications with interview status
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      users!student_id ( name ),
      application_interview_evaluations ( overall_score, recommendation ),
      application_interviews ( id, interview_status ),
      application_offers ( id, offer_status )
    `)
    .eq('status', 'interview');

  if (error) {
    console.error('Error:', error);
    return;
  }

  for (const app of data) {
    const name = app.users?.name || 'Unknown';
    const evalData = Array.isArray(app.application_interview_evaluations) 
      ? (app.application_interview_evaluations.length > 0 ? app.application_interview_evaluations[0] : null)
      : (app.application_interview_evaluations || null);
    const interview = Array.isArray(app.application_interviews)
      ? (app.application_interviews.length > 0 ? app.application_interviews[0] : null)
      : (app.application_interviews || null);
    const offer = Array.isArray(app.application_offers)
      ? (app.application_offers.length > 0 ? app.application_offers[0] : null)
      : (app.application_offers || null);

    console.log(`--- ${name} (${app.id}) ---`);
    console.log(`  status: ${app.status}`);
    console.log(`  interview: ${JSON.stringify(interview)}`);
    console.log(`  evaluation: ${JSON.stringify(evalData)}`);
    console.log(`  offer: ${JSON.stringify(offer)}`);
    
    // Simulate the JSX conditions
    const colId = 'interview';
    const isInterviewCol = colId === 'interview';
    
    // Line 578: Mark Completed gate
    const showMarkCompleted = isInterviewCol && interview && interview.interview_status === 'scheduled';
    console.log(`  [L578] showMarkCompleted: ${showMarkCompleted}`);
    
    // Line 583: Evaluate Interview gate
    const showEvaluate = isInterviewCol && interview && interview.interview_status === 'completed' && !evalData;
    console.log(`  [L583] showEvaluate: ${showEvaluate}`);
    
    // Line 588: Evaluated + Skill Feedback + Create Offer gate
    const showEvaluatedBlock = isInterviewCol && evalData;
    console.log(`  [L588] showEvaluatedBlock (parent gate): ${!!showEvaluatedBlock}`);
    
    if (showEvaluatedBlock) {
      // Line 596-601: Create Offer gate
      const noActiveOffer = !offer || !offer.id || offer.offer_status === 'draft';
      const notRejected = evalData && (!evalData.recommendation || evalData.recommendation.toLowerCase() !== 'reject');
      const showCreateOffer = noActiveOffer && notRejected;
      console.log(`    noActiveOffer: ${noActiveOffer}`);
      console.log(`    notRejected: ${notRejected}`);
      console.log(`    [L596-601] showCreateOffer: ${!!showCreateOffer}`);
    }
    console.log('');
  }
}

main();
