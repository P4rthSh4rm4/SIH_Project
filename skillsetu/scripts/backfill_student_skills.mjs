import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillStudentSkills() {
  console.log("Backfilling student_skills from assessments...");

  const { data: assessments, error: fetchError } = await supabase
    .from("assessments")
    .select("*");

  if (fetchError) {
    console.error("Error fetching assessments:", fetchError.message);
    process.exit(1);
  }

  console.log(`Found ${assessments.length} assessments.`);

  let upsertedCount = 0;

  for (const assessment of assessments) {
    // 1. Determine targetSkillName based on assessment responses
    const responses = assessment.responses_json || {};
    const sub = responses.subcategory || "";
    
    let targetSkillName = "";
    if (sub === "clinical_practice") targetSkillName = "Clinical Knowledge";
    else if (sub === "pharma") targetSkillName = "Ayurvedic Pharmacy";
    else if (sub === "research") targetSkillName = "Research Skills";
    else if (sub === "communication") targetSkillName = "Communication Skills";
    else if (sub === "documentation") targetSkillName = "Documentation";
    else if (sub === "quant") targetSkillName = "Quantitative Aptitude";
    else if (sub === "logical") targetSkillName = "Logical Reasoning";
    else {
        // use sub category as fallback if not matched
        targetSkillName = sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    if (!targetSkillName) continue;

    const profile = assessment.generated_profile_json || {};
    const score = profile.score || 0;

    // 2. Lookup master skill ID
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .select("id, name")
      .ilike("name", targetSkillName)
      .maybeSingle();

    if (skillError || !skill) {
      console.error(`Master skill not found for ${targetSkillName} in assessment ${assessment.id}`);
      continue;
    }

    // 3. Upsert student_skills using Service Role
    const { error: upsertError } = await supabase.from("student_skills").upsert(
      {
        student_id: assessment.student_id,
        skill_id: skill.id,
        proficiency_score: score,
        verified: false,
        source: "assessment",
      },
      { onConflict: "student_id,skill_id" }
    );

    if (upsertError) {
        console.error(`Error upserting student_skill for ${assessment.student_id}:`, upsertError.message);
    } else {
        console.log(`- Upserted ${skill.name} for student ${assessment.student_id}`);
        upsertedCount++;
    }
  }
  
  console.log(`\nFinished backfill. Upserted ${upsertedCount} student_skills.`);
}

backfillStudentSkills().catch(console.error);
