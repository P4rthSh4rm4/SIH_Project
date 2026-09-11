import type { ReadinessMetric } from "./types";
import type { Assessment } from "@/lib/types";

/**
 * Aptitude Readiness Service
 *
 * Data source: assessments table (type = "aptitude")
 * If no aptitude assessments exist, returns attempted=false, score=0.
 */
export function calculateAptitudeScore(
  assessmentHistory: Assessment[]
): ReadinessMetric {
  const breakdown = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  const aptAssessments = assessmentHistory.filter(
    a => a.type === "aptitude"
  );

  if (aptAssessments.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      attempted: false,
      breakdown: [
        { label: "Aptitude Assessment", value: null, maxValue: 100, status: "missing" },
      ],
      missingItems: ["No aptitude assessment taken"],
      recommendations: ["Take the Aptitude Assessment to measure your quantitative, logical, and verbal reasoning."],
    };
  }

  // Extract sub-scores from generated_profile_json if available
  const latestApt = aptAssessments[0]; // already sorted desc by taken_at
  const profile = latestApt.generated_profile_json as Record<string, any> || {};
  const responses = latestApt.responses_json as Record<string, any> || {};

  // Try to extract category scores from the profile JSON
  const quantitative = profile.quantitative ?? profile.quantitativeScore ?? responses.quantitative ?? null;
  const logical = profile.logical ?? profile.logicalScore ?? responses.logical ?? null;
  const verbal = profile.verbal ?? profile.verbalScore ?? responses.verbal ?? null;
  const overallFromProfile = profile.score ?? profile.overallScore ?? null;

  const components: number[] = [];

  if (typeof quantitative === "number") {
    breakdown.push({ label: "Quantitative", value: quantitative, maxValue: 100, status: "present" as const });
    components.push(quantitative);
  } else {
    breakdown.push({ label: "Quantitative", value: null, maxValue: 100, status: "missing" as const });
  }

  if (typeof logical === "number") {
    breakdown.push({ label: "Logical", value: logical, maxValue: 100, status: "present" as const });
    components.push(logical);
  } else {
    breakdown.push({ label: "Logical", value: null, maxValue: 100, status: "missing" as const });
  }

  if (typeof verbal === "number") {
    breakdown.push({ label: "Verbal", value: verbal, maxValue: 100, status: "present" as const });
    components.push(verbal);
  } else {
    breakdown.push({ label: "Verbal", value: null, maxValue: 100, status: "missing" as const });
  }

  // If we have sub-scores, average them. Otherwise use overall from profile.
  let finalScore: number;
  if (components.length > 0) {
    finalScore = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
  } else if (typeof overallFromProfile === "number") {
    finalScore = overallFromProfile;
    breakdown.push({ label: "Overall (from assessment)", value: overallFromProfile, maxValue: 100, status: "present" as const });
  } else {
    // Assessments exist but no extractable score — mark as attempted but 0
    finalScore = 0;
    missingItems.push("Assessment data exists but scores could not be extracted");
    recommendations.push("Retake the Aptitude Assessment to generate a measurable score.");
  }

  breakdown.push({
    label: "Assessments Completed",
    value: aptAssessments.length,
    maxValue: 10,
    status: "present" as const,
  });

  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
