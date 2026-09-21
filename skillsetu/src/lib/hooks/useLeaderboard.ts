"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/lib/types";

export function useLeaderboard(limit = 20) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Get user department
      let department = "CSE";
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("department")
          .eq("id", user.id)
          .single();
        if (userData?.department) {
          department = userData.department;
        }
      }

      // 3. Fetch leaderboard data for the specific department
      // Since leaderboard_view lacks department, we query student_gamification directly
      const { data: rawLeaderboard } = await supabase
        .from("student_gamification")
        .select("*, users!inner(name, avatar_url, department, role)")
        .eq("users.role", "student")
        .eq("users.department", department)
        .order("total_xp", { ascending: false });

      // 4. Map it to LeaderboardEntry array with correct rank
      const allEntries = (rawLeaderboard || []).map((row: any, index: number) => ({
        user_id: row.user_id,
        name: row.users.name,
        avatar_url: row.users.avatar_url,
        total_xp: row.total_xp,
        level: row.level,
        current_streak: row.current_streak,
        rank: index + 1
      }));

      const topEntries = allEntries.slice(0, limit);
      setEntries(topEntries);

      // Find current user's rank
      if (user) {
        const myEntry = allEntries.find((e: any) => e.user_id === user.id);
        setMyRank(myEntry || null);
      }
    } catch (err) {
      console.error("[useLeaderboard]", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { entries, myRank, loading, refetch: fetch };
}
