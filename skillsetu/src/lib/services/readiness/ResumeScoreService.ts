import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { ProfileFormData } from "@/lib/types";

/**
 * Resume ATS Readiness Service
 *
 * Data sources:
 *  - student_profiles → resume_url, bio, career_objective
 *  - student_skills → count of skills (keyword richness)
 *  - student_education → education entries
 *  - student_experience → experience/internship entries
 *  - portfolio_items → projects
 *  - certifications → certification count
 *
 * Each section contributes a weighted portion. No hardcoded ATS score.
 */
export function calculateResumeScore(
  profile: ProfileFormData | null,
  skillsCount: number,
  educationCount: number,
  experienceCount: number,
  projectsCount: number,
  certificationsCount: number
): ReadinessMetric {
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  // ── Resume Uploaded (20 pts) ──
  const hasResume = !!profile?.resume_url;
  breakdown.push({
    label: "Resume Uploaded",
    value: hasResume ? 20 : 0,
    maxValue: 20,
    status: hasResume ? "present" : "missing",
  });
  if (!hasResume) {
    missingItems.push("No resume uploaded");
    recommendations.push("Upload your resume in the Resume Builder section.");
  }

  // ── Personal Info (10 pts) ──
  let personalScore = 0;
  if (profile?.name) personalScore += 3;
  if (profile?.email) personalScore += 3;
  if (profile?.phone) personalScore += 2;
  if (profile?.location) personalScore += 2;
  breakdown.push({
    label: "Personal Details",
    value: personalScore,
    maxValue: 10,
    status: personalScore >= 8 ? "present" : personalScore > 0 ? "partial" : "missing",
  });
  if (personalScore < 10) {
    if (!profile?.phone) missingItems.push("Phone number missing");
    if (!profile?.location) missingItems.push("Location missing");
    recommendations.push("Complete all personal details in your profile.");
  }

  // ── Professional Summary (10 pts) ──
  const hasBio = !!(profile?.bio && profile.bio.length > 20);
  const hasObjective = !!(profile?.career_objective && profile.career_objective.length > 10);
  const summaryScore = (hasBio ? 5 : 0) + (hasObjective ? 5 : 0);
  breakdown.push({
    label: "Professional Summary",
    value: summaryScore,
    maxValue: 10,
    status: summaryScore >= 10 ? "present" : summaryScore > 0 ? "partial" : "missing",
  });
  if (!hasBio) {
    missingItems.push("Bio/About section missing or too short");
    recommendations.push("Write a professional summary (at least 20 characters) in your profile.");
  }
  if (!hasObjective) {
    missingItems.push("Career objective missing");
    recommendations.push("Add a career objective to improve ATS keyword matching.");
  }

  // ── Skills (15 pts) ──
  const skillPts = Math.min(skillsCount * 3, 15);
  breakdown.push({
    label: `Skills (${skillsCount} listed)`,
    value: skillPts,
    maxValue: 15,
    status: skillsCount >= 5 ? "present" : skillsCount > 0 ? "partial" : "missing",
  });
  if (skillsCount < 5) {
    missingItems.push(`Only ${skillsCount} skills listed (recommend 5+)`);
    recommendations.push("Add more relevant technical skills to improve ATS keyword matching.");
  }

  // ── Education (15 pts) ──
  const eduPts = Math.min(educationCount * 15, 15);
  breakdown.push({
    label: `Education (${educationCount} entries)`,
    value: eduPts,
    maxValue: 15,
    status: educationCount > 0 ? "present" : "missing",
  });
  if (educationCount === 0) {
    missingItems.push("No education records");
    recommendations.push("Add your education details to your profile.");
  }

  // ── Experience (15 pts) ──
  const expPts = Math.min(experienceCount * 8, 15);
  breakdown.push({
    label: `Experience (${experienceCount} entries)`,
    value: expPts,
    maxValue: 15,
    status: experienceCount > 0 ? "present" : "missing",
  });
  if (experienceCount === 0) {
    missingItems.push("No experience/internship entries");
    recommendations.push("Add internships or work experience to your profile.");
  }

  // ── Projects (10 pts) ──
  const projPts = Math.min(projectsCount * 4, 10);
  breakdown.push({
    label: `Projects (${projectsCount} listed)`,
    value: projPts,
    maxValue: 10,
    status: projectsCount > 0 ? "present" : "missing",
  });
  if (projectsCount === 0) {
    missingItems.push("No projects listed");
    recommendations.push("Add portfolio projects with descriptions to strengthen your resume.");
  }

  // ── Certifications (5 pts) ──
  const certPts = Math.min(certificationsCount * 3, 5);
  breakdown.push({
    label: `Certifications (${certificationsCount})`,
    value: certPts,
    maxValue: 5,
    status: certificationsCount > 0 ? "present" : "missing",
  });
  if (certificationsCount === 0) {
    missingItems.push("No certifications");
    recommendations.push("Earn certifications to add measurable achievements to your resume.");
  }

  // ── Final Score ──
  const totalScore = (hasResume ? 20 : 0) + personalScore + summaryScore + skillPts + eduPts + expPts + projPts + certPts;
  const attempted = totalScore > 0;

  return {
    score: Math.min(totalScore, 100),
    maxScore: 100,
    attempted,
    breakdown,
    missingItems,
    recommendations,
  };
}
