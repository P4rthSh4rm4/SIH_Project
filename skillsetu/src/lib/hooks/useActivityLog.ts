"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/lib/types";

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  xp: number;
}

export function useActivityLog(days = 365) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });

      const logs = (data ?? []) as ActivityLog[];
      setActivities(logs);

      // Aggregate into daily heatmap
      const dayMap = new Map<string, { count: number; xp: number }>();
      for (const log of logs) {
        const dateStr = log.created_at.slice(0, 10);
        const existing = dayMap.get(dateStr) || { count: 0, xp: 0 };
        dayMap.set(dateStr, {
          count: existing.count + 1,
          xp: existing.xp + log.xp_earned,
        });
      }

      const heatmapData: HeatmapDay[] = [];
      for (const [date, vals] of dayMap.entries()) {
        heatmapData.push({ date, ...vals });
      }
      setHeatmap(heatmapData.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      console.error("[useActivityLog]", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { activities, heatmap, loading, refetch: fetch };
}
