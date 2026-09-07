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
  size = 100,
  delay = 0,
}: {
  name: string;
  score: number;
  color: string;
  size?: number;
  delay?: number;
}) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-2.5 animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
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
            className="text-muted/30"
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
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-extrabold">{score}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground text-center leading-tight max-w-[100px] truncate">
        {name}
      </span>
    </div>
  );
}

// Colors that match the existing design system
const RING_COLORS = [
  "oklch(0.52 0.26 267)",   // primary violet
  "oklch(0.62 0.2 170)",    // teal/chart-2
  "oklch(0.68 0.18 45)",    // amber/chart-3
  "oklch(0.58 0.22 310)",   // pink/chart-4
  "oklch(0.72 0.15 85)",    // green/chart-5
  "oklch(0.58 0.2 200)",    // blue
];

export function SkillRings({ skills, loading }: SkillRingsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-7 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <div className="w-[100px] h-[100px] rounded-full bg-muted animate-pulse" />
            <div className="w-16 h-3.5 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="py-10 text-center text-[0.9rem] text-muted-foreground">
        No skills mapped yet. Take a skill assessment to get started!
      </div>
    );
  }

  // Show top 6 skills
  const topSkills = [...skills]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="flex flex-wrap justify-center gap-6 py-3">
      {topSkills.map((skill, i) => (
        <SkillRing
          key={skill.name}
          name={skill.name}
          score={skill.score}
          color={RING_COLORS[i % RING_COLORS.length]}
          delay={i * 80}
        />
      ))}
    </div>
  );
}
