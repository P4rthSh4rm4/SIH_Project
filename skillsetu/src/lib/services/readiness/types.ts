// ─── Readiness Score Types ─────────────────────────────────
// Shared contract for every scoring service

export interface ScoreBreakdownItem {
  label: string;
  value: number | null;   // null = not available
  maxValue: number;
  status: "present" | "missing" | "partial";
}

export interface ReadinessMetric {
  score: number;          // 0-100, calculated deterministically
  maxScore: 100;
  attempted: boolean;     // false if student has zero data for this metric
  breakdown: ScoreBreakdownItem[];
  missingItems: string[];
  recommendations: string[];
}
