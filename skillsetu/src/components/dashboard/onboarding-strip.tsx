"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";

interface OnboardingStripProps {
  profile: UserProfile | null;
  skillsCount: number;
  assessmentsCount: number;
  badgesCount: number;
}

interface OnboardingStep {
  label: string;
  description: string;
  href: string;
  complete: boolean;
}

export function OnboardingStrip({
  profile,
  skillsCount,
  assessmentsCount,
  badgesCount,
}: OnboardingStripProps) {
  const steps: OnboardingStep[] = [
    {
      label: "Complete your profile",
      description: "Add your details and career interests",
      href: "/student/profile",
      complete: profile?.onboarding_completed ?? false,
    },
    {
      label: "Take skill assessment",
      description: "Map your technical and soft skills",
      href: "/student/assessment",
      complete: assessmentsCount > 0,
    },
    {
      label: "Map 5 skills",
      description: "Build your skill profile",
      href: "/student/profile",
      complete: skillsCount >= 5,
    },
    {
      label: "Earn your first badge",
      description: "Complete activities to unlock badges",
      href: "/student/dashboard",
      complete: badgesCount > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const allDone = completedCount === steps.length;

  // Don't show if everything is complete
  if (allDone) return null;

  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <Card className="border-border/40 border-dashed border-2 border-primary/20 bg-gradient-to-r from-primary/[0.03] to-chart-4/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">🚀 Get Started</CardTitle>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            {progressPct}% complete
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <Link
              key={i}
              href={step.complete ? "#" : step.href}
              className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 ${
                step.complete
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-card border border-border/50 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {step.complete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[0.85rem] font-semibold ${step.complete ? "text-emerald-600 dark:text-emerald-400 line-through" : ""}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {step.description}
                </p>
              </div>
              {!step.complete && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
