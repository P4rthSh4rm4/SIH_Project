"use client";

import type { SkillDataPoint } from "@/lib/hooks/useSkillAnalytics";

interface SkillRingsProps {
  skills: SkillDataPoint[];
  loading?: boolean;
}

function SkillRing({
  name,
  score,
  color,
  size = 80,
}: {
  name: string;
  score: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center leading-tight max-w-[80px] truncate">
        {name}
      </span>
    </div>
  );
}

// Colors that match the existing design system
const RING_COLORS = [
  "oklch(0.55 0.25 265)",   // primary violet
  "oklch(0.65 0.2 170)",    // teal/chart-2
  "oklch(0.7 0.18 45)",     // amber/chart-3
  "oklch(0.6 0.22 310)",    // pink/chart-4
  "oklch(0.75 0.15 85)",    // green/chart-5
  "oklch(0.6 0.2 200)",     // blue
];

export function SkillRings({ skills, loading }: SkillRingsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
            <div className="w-14 h-3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No skills mapped yet. Take a skill assessment to get started!
      </div>
    );
  }

  // Show top 6 skills
  const topSkills = [...skills]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="flex flex-wrap justify-center gap-5 py-2">
      {topSkills.map((skill, i) => (
        <SkillRing
          key={skill.name}
          name={skill.name}
          score={skill.score}
          color={RING_COLORS[i % RING_COLORS.length]}
        />
      ))}
    </div>
  );
}
