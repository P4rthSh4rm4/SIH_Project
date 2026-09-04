"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp, Zap, Star } from "lucide-react";
import type { StudentGamification } from "@/lib/types";
import { getXpForCurrentLevel, getLevelTitle } from "@/lib/gamification";

interface GamificationBarProps {
  gamification: StudentGamification | null;
  loading?: boolean;
}

export function GamificationBar({ gamification, loading }: GamificationBarProps) {
  if (loading) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="h-16 rounded-xl bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const xp = gamification?.total_xp ?? 0;
  const level = gamification?.level ?? 1;
  const streak = gamification?.current_streak ?? 0;
  const levelProgress = getXpForCurrentLevel(xp);
  const levelTitle = getLevelTitle(level);

  return (
    <Card className="border-border/50 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5" />
      <CardContent className="relative p-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg">
              <span className="text-lg font-black text-white">{level}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{levelTitle}</p>
              <p className="text-xs text-muted-foreground">Level {level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {xp.toLocaleString()} XP
              </span>
              <span className="text-muted-foreground">
                {levelProgress.current}/{levelProgress.required} to Level {level + 1}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-chart-4 to-chart-2 transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {streak} day{streak !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">{gamification?.longest_streak ?? 0}</span>
              <span className="text-xs">best</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
