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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AYURVEDA_SKILLS = [
  { name: "Clinical Knowledge", category: "Ayurveda Knowledge", source_taxonomy: "System" },
  { name: "Ayurvedic Pharmacy", category: "Ayurveda Knowledge", source_taxonomy: "System" },
  { name: "Documentation", category: "Soft Skills", source_taxonomy: "System" },
  { name: "Logical Reasoning", category: "Aptitude", source_taxonomy: "System" },
  { name: "Quantitative Aptitude", category: "Aptitude", source_taxonomy: "System" },
  { name: "Research Skills", category: "Ayurveda Knowledge", source_taxonomy: "System" },
  { name: "Communication Skills", category: "Soft Skills", source_taxonomy: "System" },
  { name: "Industry Awareness", category: "Ayurveda Knowledge", source_taxonomy: "System" },
];

async function seedSkills() {
  console.log("Seeding Ayurveda skills...");

  let insertedCount = 0;
  for (const skill of AYURVEDA_SKILLS) {
    // Check if skill exists
    const { data: existing, error: lookupError } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", skill.name)
      .maybeSingle();

    if (lookupError) {
      console.error(`Error looking up ${skill.name}:`, lookupError.message);
      continue;
    }

    if (existing) {
      console.log(`- ${skill.name} already exists.`);
    } else {
      const { error: insertError } = await supabase
        .from("skills")
        .insert([skill]);

      if (insertError) {
        console.error(`Error inserting ${skill.name}:`, insertError.message);
      } else {
        console.log(`- Inserted ${skill.name}.`);
        insertedCount++;
      }
    }
  }

  console.log(`\nFinished seeding. Inserted ${insertedCount} new skills.`);
}

seedSkills().catch(console.error);
