"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProfileCompletionResult } from "@/lib/types";

interface ProfileCompletionCardProps {
  completion: ProfileCompletionResult;
}

/**
 * Displays profile completion as a percentage ring and a checklist.
 */
export function ProfileCompletionCard({
  completion,
}: ProfileCompletionCardProps) {
  const { percentage, items } = completion;

  // SVG ring parameters
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const ringColor =
    percentage >= 80
      ? "text-emerald-500"
      : percentage >= 50
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-5">
          {/* Completion ring */}
          <div className="relative shrink-0">
            <svg width="72" height="72" className="-rotate-90">
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-muted/40"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${ringColor} transition-all duration-700 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{percentage}%</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">Profile Completion</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-xs"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span
                    className={
                      item.completed
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
