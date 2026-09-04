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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch top N from leaderboard view
      const { data: leaderboard } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(limit);

      const entries = (leaderboard ?? []) as LeaderboardEntry[];
      setEntries(entries);

      // Find current user's rank
      if (user) {
        const myEntry = entries.find((e) => e.user_id === user.id);
        if (myEntry) {
          setMyRank(myEntry);
        } else {
          // User not in top N — fetch their specific rank
          const { data: myData } = await supabase
            .from("leaderboard_view")
            .select("*")
            .eq("user_id", user.id)
            .single();
          setMyRank((myData as LeaderboardEntry) ?? null);
        }
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
