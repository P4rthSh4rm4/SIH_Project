import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { ProfileFormData } from "@/lib/types";

/**
 * LinkedIn Readiness Service
 *
 * Data sources:
 *  - student_profiles → linkedin, career_objective, bio, avatar_url
 *  - student_skills → count (proxy for LinkedIn skills)
 *  - student_education → count
 *  - student_experience → count
 *
 * Does NOT use courses or generic internship data.
 * Returns 0 if LinkedIn URL is not connected.
 */
export function calculateLinkedInScore(
  profile: ProfileFormData | null,
  skillsCount: number,
  educationCount: number,
  experienceCount: number
): ReadinessMetric {
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  // ── Gate: LinkedIn URL ──
  const hasLinkedIn = !!profile?.linkedin;
  breakdown.push({
    label: "LinkedIn URL",
    value: hasLinkedIn ? 20 : 0,
    maxValue: 20,
    status: hasLinkedIn ? "present" : "missing",
  });

  if (!hasLinkedIn) {
    return {
      score: 0,
      maxScore: 100,
      attempted: false,
      breakdown,
      missingItems: ["LinkedIn profile not linked"],
      recommendations: ["Add your LinkedIn profile URL in Profile settings."],
    };
  }

  // ── Headline / Career Objective (15 pts) ──
  const hasHeadline = !!(profile?.career_objective && profile.career_objective.length > 10);
  breakdown.push({
    label: "Headline / Objective",
    value: hasHeadline ? 15 : 0,
    maxValue: 15,
    status: hasHeadline ? "present" : "missing",
  });
  if (!hasHeadline) {
    missingItems.push("Career objective/headline missing or too short");
    recommendations.push("Add a professional headline or career objective.");
  }

  // ── About / Bio (15 pts) ──
  const hasBio = !!(profile?.bio && profile.bio.length > 50);
  const hasShortBio = !!(profile?.bio && profile.bio.length > 10);
  const bioPts = hasBio ? 15 : hasShortBio ? 6 : 0;
  breakdown.push({
    label: "About Section",
    value: bioPts,
    maxValue: 15,
    status: hasBio ? "present" : hasShortBio ? "partial" : "missing",
  });
  if (!hasBio) {
    missingItems.push("About section missing or too short");
    recommendations.push("Write a detailed About section (50+ characters) on your profile.");
  }

  // ── Profile Photo (15 pts) ──
  const hasPhoto = !!profile?.avatar_url;
  breakdown.push({
    label: "Profile Photo",
    value: hasPhoto ? 15 : 0,
    maxValue: 15,
    status: hasPhoto ? "present" : "missing",
  });
  if (!hasPhoto) {
    missingItems.push("No profile photo");
    recommendations.push("Upload a professional profile photo.");
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
    missingItems.push(`Only ${skillsCount} skill(s) listed`);
    recommendations.push("Add at least 5 skills to your profile.");
  }

  // ── Education (10 pts) ──
  const eduPts = educationCount > 0 ? 10 : 0;
  breakdown.push({
    label: `Education (${educationCount} entries)`,
    value: eduPts,
    maxValue: 10,
    status: educationCount > 0 ? "present" : "missing",
  });
  if (educationCount === 0) {
    missingItems.push("No education records");
    recommendations.push("Add your education details.");
  }

  // ── Experience (10 pts) ──
  const expPts = Math.min(experienceCount * 5, 10);
  breakdown.push({
    label: `Experience (${experienceCount} entries)`,
    value: expPts,
    maxValue: 10,
    status: experienceCount > 0 ? "present" : "missing",
  });
  if (experienceCount === 0) {
    missingItems.push("No experience entries");
    recommendations.push("Add work experience or internships.");
  }

  const totalScore = 20 + (hasHeadline ? 15 : 0) + bioPts + (hasPhoto ? 15 : 0) + skillPts + eduPts + expPts;

  return {
    score: Math.min(totalScore, 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
