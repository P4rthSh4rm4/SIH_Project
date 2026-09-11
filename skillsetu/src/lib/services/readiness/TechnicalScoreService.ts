import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { ProfileSkillEntry } from "@/lib/hooks/useProfileSkills";
import type { MockInterviewRecord } from "@/lib/hooks/useMockInterview";

/**
 * Technical Skills Readiness Service
 *
 * Data sources:
 *  - student_skills (via useProfileSkills) → proficiency_score, verified, skill.category
 *  - mock_interviews (via useMockInterview) → technical_score
 *
 * Zero hardcoded values. If no skills or interviews exist, returns attempted=false.
 */

// Technical skill categories we look for in the skills master table
const TECHNICAL_CATEGORIES: Record<string, string[]> = {
  "Programming": ["programming", "python", "java", "c++", "c", "go", "rust", "kotlin", "swift"],
  "DSA": ["dsa", "data structures", "algorithms", "competitive programming"],
  "SQL & DBMS": ["sql", "dbms", "database", "mysql", "postgresql", "mongodb"],
  "OOP": ["oop", "object oriented", "design patterns"],
  "Web Development": ["web", "html", "css", "javascript", "typescript", "react", "angular", "vue", "next", "node", "express", "frontend", "backend"],
  "AI/ML": ["ai", "ml", "machine learning", "deep learning", "artificial intelligence", "data science", "pandas", "tensorflow", "pytorch"],
};

function matchCategory(skillName: string): string | null {
  const lower = skillName.toLowerCase();
  for (const [category, keywords] of Object.entries(TECHNICAL_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return null;
}

export function calculateTechnicalScore(
  skills: ProfileSkillEntry[],
  completedInterviews: MockInterviewRecord[]
): ReadinessMetric {
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  // ── Category-wise skill analysis ──
  const categoryScores: Record<string, number[]> = {};

  for (const s of skills) {
    const cat = matchCategory(s.skill?.name || "");
    if (cat) {
      if (!categoryScores[cat]) categoryScores[cat] = [];
      categoryScores[cat].push(s.proficiency_score);
    }
  }

  // Build breakdown from actual category scores
  let totalCategoryScore = 0;
  let categoryCount = 0;

  for (const category of Object.keys(TECHNICAL_CATEGORIES)) {
    const scores = categoryScores[category];
    if (scores && scores.length > 0) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      breakdown.push({ label: category, value: avg, maxValue: 100, status: "present" });
      totalCategoryScore += avg;
      categoryCount++;
    } else {
      breakdown.push({ label: category, value: null, maxValue: 100, status: "missing" });
      missingItems.push(`No ${category} skills assessed`);
      recommendations.push(`Complete a ${category} assessment to improve your technical score.`);
    }
  }

  // ── Mock Interview Technical Score ──
  let mockTechAvg: number | null = null;
  if (completedInterviews.length > 0) {
    const techScores = completedInterviews
      .map(i => i.technical_score)
      .filter((s): s is number => s !== null && s !== undefined);
    if (techScores.length > 0) {
      mockTechAvg = Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length);
    }
  }

  breakdown.push({
    label: "Mock Interview Technical",
    value: mockTechAvg,
    maxValue: 100,
    status: mockTechAvg !== null ? "present" : "missing",
  });

  if (mockTechAvg === null) {
    missingItems.push("No mock interview completed");
    recommendations.push("Complete a mock interview to get a technical evaluation.");
  }

  // ── Final Score Calculation ──
  // Weighted: 60% skills average, 40% mock interview (if available)
  const hasSkillData = categoryCount > 0;
  const hasMockData = mockTechAvg !== null;

  if (!hasSkillData && !hasMockData) {
    return { score: 0, maxScore: 100, attempted: false, breakdown, missingItems, recommendations };
  }

  const skillAvg = categoryCount > 0 ? Math.round(totalCategoryScore / categoryCount) : 0;

  let finalScore: number;
  if (hasSkillData && hasMockData) {
    finalScore = Math.round(skillAvg * 0.6 + mockTechAvg! * 0.4);
  } else if (hasSkillData) {
    finalScore = skillAvg;
  } else {
    finalScore = mockTechAvg!;
  }

  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
