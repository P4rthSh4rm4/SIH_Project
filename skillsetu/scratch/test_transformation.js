const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yynuzpbzqhofhwiyuquo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU';
const s = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing data flow...");
  const profile = { role: 'academician', department: 'Ayurveda' };
  
  let query = s
        .from("applications")
        .select(`
          id, student_id,
          users!inner (id, name, department),
          application_skill_feedback!inner (
            id, rating, gap_indicator,
            skills (id, name)
          )
        `);

  query = query.eq('users.department', profile.department);
      
  const { data: feedbackData, error: feedbackError } = await query;
  if (feedbackError) throw feedbackError;

  const rawData = feedbackData || [];
  console.log("RAW DATA:", JSON.stringify(rawData, null, 2));

  const gapsMap = {};

  rawData.forEach((appRow) => {
    const feedbacks = appRow.application_skill_feedback || [];
    feedbacks.forEach((row) => {
      const sId = row.skills?.id;
      if (!sId) {
          console.log("SKIPPING DUE TO MISSING sId", row);
          return;
      }

      if (!gapsMap[sId]) {
        gapsMap[sId] = {
          skill_id: sId,
          name: row.skills?.name || "Unknown Skill",
          count: 0,
          ratingSum: 0,
          gapCount: 0,
          students: []
        };
      }

      gapsMap[sId].count++;
      gapsMap[sId].ratingSum += row.rating;
      
      if (row.gap_indicator === 'Needs Improvement' || row.gap_indicator === 'Significant Gap') {
        gapsMap[sId].gapCount++;
        
        const existingStudent = gapsMap[sId].students.find(s => s.student_id === appRow.student_id);
        if (!existingStudent) {
          gapsMap[sId].students.push({
            student_id: appRow.student_id,
            name: appRow.users?.name || "Unknown Student",
            rating: row.rating,
            gap_indicator: row.gap_indicator,
            application_id: appRow.id
          });
        }
      }
    });
  });

  console.log("MAPPED SKILL GAPS MAP", JSON.stringify(gapsMap, null, 2));
}

test();
