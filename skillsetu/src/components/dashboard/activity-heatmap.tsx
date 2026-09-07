"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatmapDay } from "@/lib/hooks/useActivityLog";
import { useMemo } from "react";

interface ActivityHeatmapProps {
  heatmap: HeatmapDay[];
  loading?: boolean;
}

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted/40";
  if (count <= 2) return "bg-violet-200 dark:bg-violet-900/60";
  if (count <= 5) return "bg-violet-400 dark:bg-violet-700";
  if (count <= 10) return "bg-violet-500 dark:bg-violet-500";
  return "bg-violet-600 dark:bg-violet-400";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityHeatmap({ heatmap, loading }: ActivityHeatmapProps) {
  // Build a map of date → count for the last ~26 weeks (half year)
  const { weeks, monthLabels } = useMemo(() => {
    const dayMap = new Map<string, HeatmapDay>();
    for (const d of heatmap) {
      dayMap.set(d.date, d);
    }

    const today = new Date();
    const totalWeeks = 52;
    const weeksArray: { date: string; count: number; xp: number; dayOfWeek: number }[][] = [];
    const labels: { label: string; col: number }[] = [];

    // Start from (totalWeeks * 7) days ago
    const start = new Date(today);
    start.setDate(start.getDate() - totalWeeks * 7 + (7 - today.getDay()));

    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: { date: string; count: number; xp: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const current = new Date(start);
        current.setDate(start.getDate() + w * 7 + d);
        const dateStr = current.toISOString().slice(0, 10);
        const entry = dayMap.get(dateStr);
        const month = current.getMonth();

        if (month !== lastMonth) {
          labels.push({ label: MONTHS[month], col: w });
          lastMonth = month;
        }

        week.push({
          date: dateStr,
          count: entry?.count ?? 0,
          xp: entry?.xp ?? 0,
          dayOfWeek: d,
        });
      }
      weeksArray.push(week);
    }

    return { weeks: weeksArray, monthLabels: labels };
  }, [heatmap]);

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-7">
          <div className="h-36 rounded-xl bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const totalActivities = heatmap.reduce((sum, d) => sum + d.count, 0);
  const totalXp = heatmap.reduce((sum, d) => sum + d.xp, 0);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Activity</CardTitle>
          <div className="flex items-center gap-5 text-xs text-muted-foreground font-semibold">
            <span>{totalActivities} activities</span>
            <span>{totalXp.toLocaleString()} XP earned</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-[2px] min-w-fit">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1.5 pt-5">
              {DAYS.map((label, i) => (
                <div
                  key={i}
                  className="h-[17px] flex items-center text-[11px] text-muted-foreground font-medium"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex flex-col">
              {/* Month labels */}
              <div className="flex gap-[2px] mb-1 h-5">
                {weeks.map((_, wi) => {
                  const label = monthLabels.find((m) => m.col === wi);
                  return (
                    <div
                      key={wi}
                      className="w-[17px] text-[11px] text-muted-foreground font-medium"
                    >
                      {label?.label ?? ""}
                    </div>
                  );
                })}
              </div>

              {/* Grid of days */}
              <div className="flex gap-[2px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger>
                          <div
                            className={`w-[17px] h-[17px] rounded-[4px] ${getIntensityClass(day.count)} transition-colors duration-200 cursor-default hover:ring-1 hover:ring-foreground/20`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-semibold">{day.date}</p>
                          <p>{day.count} activities • {day.xp} XP</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[11px] text-muted-foreground font-medium">
          <span>Less</span>
          <div className="w-[15px] h-[15px] rounded-[3px] bg-muted/40" />
          <div className="w-[15px] h-[15px] rounded-[3px] bg-violet-200 dark:bg-violet-900/60" />
          <div className="w-[15px] h-[15px] rounded-[3px] bg-violet-400 dark:bg-violet-700" />
          <div className="w-[15px] h-[15px] rounded-[3px] bg-violet-500 dark:bg-violet-500" />
          <div className="w-[15px] h-[15px] rounded-[3px] bg-violet-600 dark:bg-violet-400" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
