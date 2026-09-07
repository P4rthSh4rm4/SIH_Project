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
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-3 animate-scale-in"
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
          <span className="text-xl font-extrabold">{score}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground text-center leading-tight max-w-[120px] truncate">
        {name}
      </span>
    </div>
  );
}

// Colors that match the existing design system
const RING_COLORS = [
  "oklch(0.55 0.15 245)",   // primary ocean
  "oklch(0.68 0.15 190)",   // teal
  "oklch(0.70 0.14 150)",   // emerald
  "oklch(0.62 0.15 280)",   // purple-blue
  "oklch(0.75 0.15 60)",    // warm amber
];

export function SkillRings({ skills, loading }: SkillRingsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-8 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-[120px] h-[120px] rounded-full bg-muted animate-pulse" />
            <div className="w-20 h-4 rounded bg-muted animate-pulse" />
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
