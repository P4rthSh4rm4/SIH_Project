import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { PortfolioItem, Certification } from "@/lib/types";
import type { CareerCertificate } from "@/lib/hooks/useCareerAssessment";

/**
 * Experience & Certifications Readiness Service
 *
 * Data sources:
 *  - portfolio_items (type = "internship" | "achievement")
 *  - certifications table
 *  - career_certificates (from useCareerAssessment)
 *  - completed courses count (from useLearningHub)
 */
export function calculateExperienceScore(
  portfolioItems: PortfolioItem[],
  certificationsCount: number,
  careerCertificates: CareerCertificate[],
  completedCoursesCount: number
): ReadinessMetric {
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  const internships = portfolioItems.filter(p => p.type === "internship");
  const achievements = portfolioItems.filter(p => p.type === "achievement");

  // ── Internships (30 pts) ──
  const internPts = Math.min(internships.length * 15, 30);
  breakdown.push({
    label: `Internships (${internships.length})`,
    value: internPts,
    maxValue: 30,
    status: internships.length > 0 ? "present" : "missing",
  });
  if (internships.length === 0) {
    missingItems.push("No internships recorded");
    recommendations.push("Apply for internships and add them to your portfolio.");
  }

  // ── Certifications (25 pts) ──
  const totalCerts = certificationsCount + careerCertificates.length;
  const certPts = Math.min(totalCerts * 6, 25);
  breakdown.push({
    label: `Certifications (${totalCerts})`,
    value: certPts,
    maxValue: 25,
    status: totalCerts > 0 ? "present" : "missing",
  });
  if (totalCerts === 0) {
    missingItems.push("No certifications earned");
    recommendations.push("Complete a career roadmap to earn a certification.");
  }

  // ── Completed Courses (25 pts) ──
  const coursePts = Math.min(completedCoursesCount * 5, 25);
  breakdown.push({
    label: `Completed Courses (${completedCoursesCount})`,
    value: coursePts,
    maxValue: 25,
    status: completedCoursesCount > 0 ? "present" : "missing",
  });
  if (completedCoursesCount === 0) {
    missingItems.push("No courses completed");
    recommendations.push("Complete courses from the Learning Hub to build your experience.");
  }

  // ── Achievements / Hackathons (20 pts) ──
  const achPts = Math.min(achievements.length * 10, 20);
  breakdown.push({
    label: `Achievements (${achievements.length})`,
    value: achPts,
    maxValue: 20,
    status: achievements.length > 0 ? "present" : "missing",
  });
  if (achievements.length === 0) {
    missingItems.push("No achievements or hackathon entries");
    recommendations.push("Add hackathon wins, awards, or extracurricular achievements.");
  }

  const totalScore = internPts + certPts + coursePts + achPts;
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
