import { createClient } from "@supabase/supabase-js";
import { calculateResumeScore, calculateTechnicalScore, calculateSoftSkillsScore, calculateAptitudeScore, calculatePortfolioScore, calculateGitHubScore, calculateLinkedInScore, calculateExperienceScore } from "./src/lib/services/readiness/index";

const url = "https://yynuzpbzqhofhwiyuquo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnV6cGJ6cWhvZmh3aXl1cXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwOTcyMCwiZXhwIjoyMTAzNjg1NzIwfQ.9g8W-A5-287xTyYdcKWjyAWDti983gDku7uBUyw15lU";
const supabase = createClient(url, key);

async function simulate() {
  const { data: users } = await supabase.from("users").select("*").eq("role", "student").limit(2);
  if (!users) return console.log("no users");

  for (const u of users) {
    const studentId = u.id;
    console.log(`\n--- Fetching for ${u.name} (${u.email}) ---`);
    const [
      skillsRes,
      portfolioRes,
      eduRes,
      expRes,
      certRes,
      interviewRes,
      assessRes,
      profileRes,
      feedbackRes
    ] = await Promise.all([
      supabase.from("student_skills").select("*, skills(*)").eq("student_id", studentId),
      supabase.from("portfolio_items").select("*").eq("user_id", studentId),
      supabase.from("student_education").select("*").eq("user_id", studentId),
      supabase.from("student_experience").select("*").eq("user_id", studentId),
      supabase.from("certifications").select("*").eq("student_id", studentId),
      supabase.from("mock_interviews").select("*").eq("student_id", studentId).eq("status", "Completed").not("overall_score", "is", null),
      supabase.from("assessments").select("*").eq("student_id", studentId),
      supabase.from("student_profiles").select("*").eq("user_id", studentId).single(),
      supabase
        .from("application_skill_feedback")
        .select(`
          *,
          skill:skills(name),
          application:applications!inner(student_id, opportunity:opportunities(title, industry:users(name)))
        `)
        .eq("application.student_id", studentId)
    ]);
    
    // Simulate what the hook does if RLS blocked it (empty arrays)
    // Actually we are using service_role so it WON'T block it.
    // Let's force it to empty arrays to simulate the Academician view!
    
    // Wait, the Academician is blocked from EVERYTHING except student_profiles!
    const data = {
      skills: [],
      portfolioItems: [],
      education: [],
      experiences: [],
      certificates: [],
      completedInterviews: [],
      assessments: [],
      profile: profileRes.data || null, // ONLY profile is readable due to USING (true)
      industryFeedback: []
    };
    
    const READINESS_WEIGHTS = {
      technical:  0.25,
      softSkills: 0.15,
      aptitude:   0.15,
      resume:     0.10,
      portfolio:  0.10,
      github:     0.10,
      linkedin:   0.05,
      experience: 0.10,
    };
    
    const technicalMetric = calculateTechnicalScore(data.skills, data.completedInterviews);
    const softSkillsMetric = calculateSoftSkillsScore(data.skills, data.completedInterviews);
    const aptitudeMetric = calculateAptitudeScore(data.assessments);
    const resumeMetric = calculateResumeScore(
      data.profile,
      data.skills.length,
      data.education.length,
      data.experiences.length,
      data.portfolioItems.length,
      data.certificates.length
    );
    const portfolioMetric = calculatePortfolioScore(data.portfolioItems);
    const githubMetric = calculateGitHubScore(data.profile?.github, data.portfolioItems);
    const linkedinMetric = calculateLinkedInScore(
      data.profile,
      data.skills.length,
      data.education.length,
      data.experiences.length
    );
    const experienceMetric = calculateExperienceScore(data.portfolioItems, data.certificates.length, data.certificates, 0);

    let weightedSum = 0;
    let totalWeight = 0;

    if (technicalMetric.attempted) { weightedSum += technicalMetric.score * READINESS_WEIGHTS.technical; totalWeight += READINESS_WEIGHTS.technical; }
    if (softSkillsMetric.attempted) { weightedSum += softSkillsMetric.score * READINESS_WEIGHTS.softSkills; totalWeight += READINESS_WEIGHTS.softSkills; }
    if (aptitudeMetric.attempted) { weightedSum += aptitudeMetric.score * READINESS_WEIGHTS.aptitude; totalWeight += READINESS_WEIGHTS.aptitude; }
    if (resumeMetric.attempted) { weightedSum += resumeMetric.score * READINESS_WEIGHTS.resume; totalWeight += READINESS_WEIGHTS.resume; }
    if (portfolioMetric.attempted) { weightedSum += portfolioMetric.score * READINESS_WEIGHTS.portfolio; totalWeight += READINESS_WEIGHTS.portfolio; }
    if (githubMetric.attempted) { weightedSum += githubMetric.score * READINESS_WEIGHTS.github; totalWeight += READINESS_WEIGHTS.github; }
    if (linkedinMetric.attempted) { weightedSum += linkedinMetric.score * READINESS_WEIGHTS.linkedin; totalWeight += READINESS_WEIGHTS.linkedin; }
    if (experienceMetric.attempted) { weightedSum += experienceMetric.score * READINESS_WEIGHTS.experience; totalWeight += READINESS_WEIGHTS.experience; }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    
    console.log("overallScore:", overallScore);
  }
}
simulate();
