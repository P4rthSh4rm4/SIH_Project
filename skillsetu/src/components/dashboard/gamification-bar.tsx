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
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="p-5">
          <div className="h-18 rounded-xl bg-muted animate-pulse" />
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
    <Card className="border-border/40 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5" />
      <CardContent className="relative p-5">
        <div className="flex flex-wrap items-center gap-5 md:gap-7">
          {/* Level Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-xl ring-2 ring-primary/20">
              <span className="text-xl font-black text-white">{level}</span>
            </div>
            <div>
              <p className="text-[0.95rem] font-bold">{levelTitle}</p>
              <p className="text-xs text-muted-foreground font-medium">Level {level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Zap className="w-4 h-4 text-amber-500" />
                {xp.toLocaleString()} XP
              </span>
              <span className="text-muted-foreground font-medium">
                {levelProgress.current}/{levelProgress.required} to Level {level + 1}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-chart-4 to-chart-2 transition-all duration-1000 ease-out relative"
                style={{ width: `${levelProgress.percentage}%` }}
              >
                {/* Shimmer on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-btn_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-[0.9rem] font-extrabold text-orange-600 dark:text-orange-400">
                {streak} day{streak !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">Streak</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">{gamification?.longest_streak ?? 0}</span>
              <span className="text-xs font-medium">best</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
