import type { ReadinessMetric } from "./types";
import type { MockInterviewRecord } from "@/lib/hooks/useMockInterview";

/**
 * Soft Skills Readiness Service
 *
 * Data sources:
 *  - mock_interviews → communication_score, confidence_score
 *  - student_skills → skills matching "communication"
 *
 * Returns attempted=false and score=0 if no data exists.
 */
export function calculateSoftSkillsScore(
  skills: Array<{ skill?: { name?: string }; proficiency_score: number }>,
  completedInterviews: MockInterviewRecord[]
): ReadinessMetric {
  const breakdown = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];
  let components: number[] = [];

  // ── Communication from skills ──
  const commSkills = skills.filter(s => s.skill?.name?.toLowerCase().includes("communication"));
  const commAvg = commSkills.length > 0
    ? Math.round(commSkills.reduce((a, s) => a + s.proficiency_score, 0) / commSkills.length)
    : null;

  breakdown.push({
    label: "Communication (Self-assessed)",
    value: commAvg,
    maxValue: 100,
    status: commAvg !== null ? "present" as const : "missing" as const,
  });

  if (commAvg !== null) components.push(commAvg);
  else {
    missingItems.push("No communication skill self-assessment");
    recommendations.push("Add 'Communication' to your skills and rate your proficiency.");
  }

  // ── Mock Interview Communication Score ──
  let mockCommAvg: number | null = null;
  if (completedInterviews.length > 0) {
    const scores = completedInterviews.map(i => i.communication_score).filter((s): s is number => s !== null);
    if (scores.length > 0) mockCommAvg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  breakdown.push({
    label: "Mock Interview Communication",
    value: mockCommAvg,
    maxValue: 100,
    status: mockCommAvg !== null ? "present" as const : "missing" as const,
  });

  if (mockCommAvg !== null) components.push(mockCommAvg);
  else {
    missingItems.push("No mock interview communication score");
    recommendations.push("Complete a mock interview to get your communication evaluated.");
  }

  // ── Mock Interview Confidence Score ──
  let mockConfAvg: number | null = null;
  if (completedInterviews.length > 0) {
    const scores = completedInterviews.map(i => i.confidence_score).filter((s): s is number => s !== null);
    if (scores.length > 0) mockConfAvg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  breakdown.push({
    label: "Mock Interview Confidence",
    value: mockConfAvg,
    maxValue: 100,
    status: mockConfAvg !== null ? "present" as const : "missing" as const,
  });

  if (mockConfAvg !== null) components.push(mockConfAvg);
  else {
    missingItems.push("No mock interview confidence score");
  }

  // ── HR Evaluation (from mock interview ai_feedback) ──
  let hrAvg: number | null = null;
  if (completedInterviews.length > 0) {
    const hrScores = completedInterviews
      .map(i => i.ai_feedback?.hrReadiness ?? null)
      .filter((s): s is number => s !== null);
    if (hrScores.length > 0) hrAvg = Math.round(hrScores.reduce((a, b) => a + b, 0) / hrScores.length);
  }

  breakdown.push({
    label: "HR Evaluation",
    value: hrAvg,
    maxValue: 100,
    status: hrAvg !== null ? "present" as const : "missing" as const,
  });

  if (hrAvg !== null) components.push(hrAvg);

  // ── Final Score ──
  if (components.length === 0) {
    return { score: 0, maxScore: 100, attempted: false, breakdown, missingItems, recommendations };
  }

  const finalScore = Math.round(components.reduce((a, b) => a + b, 0) / components.length);

  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
