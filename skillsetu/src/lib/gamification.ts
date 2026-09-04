import type { ActivityAction } from "@/lib/types";

// ─── XP Rewards per action ─────────────────────────────────────────────────
export const XP_REWARDS: Record<ActivityAction, number> = {
  assessment_completed: 100,
  course_enrolled: 25,
  course_completed: 150,
  certification_earned: 200,
  profile_updated: 25,
  portfolio_item_added: 50,
  application_submitted: 75,
  document_uploaded: 20,
  login: 5,
  badge_earned: 0, // XP comes from the badge itself
  skill_added: 15,
  streak_milestone: 50,
};

// ─── Level thresholds ──────────────────────────────────────────────────────
export const XP_PER_LEVEL = 500;

export function getLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
}

export function getXpForCurrentLevel(totalXp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const level = getLevel(totalXp);
  const xpForPreviousLevels = (level - 1) * XP_PER_LEVEL;
  const current = totalXp - xpForPreviousLevels;
  const required = XP_PER_LEVEL;
  return {
    current,
    required,
    percentage: Math.min(100, Math.round((current / required) * 100)),
  };
}

// ─── Level titles ──────────────────────────────────────────────────────────
const LEVEL_TITLES = [
  "Novice",        // 1
  "Apprentice",    // 2
  "Explorer",      // 3
  "Achiever",      // 4
  "Rising Star",   // 5
  "Specialist",    // 6
  "Expert",        // 7
  "Master",        // 8
  "Grandmaster",   // 9
  "Legend",         // 10+
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || "Legend";
}

// ─── Badge icon mapping (lucide icon names) ────────────────────────────────
export const BADGE_ICONS: Record<string, string> = {
  "clipboard-check": "ClipboardCheck",
  "compass": "Compass",
  "award": "Award",
  "flame": "Flame",
  "zap": "Zap",
  "send": "Send",
  "folder-open": "FolderOpen",
  "star": "Star",
  "trophy": "Trophy",
  "user-check": "UserCheck",
};

// ─── Streak messages ───────────────────────────────────────────────────────
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak < 3) return "Keep it going!";
  if (streak < 7) return "You're building momentum!";
  if (streak < 14) return "Impressive dedication!";
  if (streak < 30) return "Unstoppable! 🔥";
  return "Legendary streak! 🏆";
}
