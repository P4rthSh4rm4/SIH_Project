"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentGamification, Badge, StudentBadge } from "@/lib/types";

interface GamificationData {
  gamification: StudentGamification | null;
  badges: (StudentBadge & { badge: Badge })[];
  allBadges: Badge[];
}

export function useGamification() {
  const [data, setData] = useState<GamificationData>({
    gamification: null,
    badges: [],
    allBadges: [],
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [gamRes, badgesRes, allBadgesRes] = await Promise.all([
        supabase
          .from("student_gamification")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("student_badges")
          .select("*, badge:badges(*)")
          .eq("student_id", user.id)
          .order("earned_at", { ascending: false }),
        supabase.from("badges").select("*").order("xp_reward", { ascending: true }),
      ]);

      setData({
        gamification: gamRes.data as StudentGamification | null,
        badges: (badgesRes.data ?? []) as (StudentBadge & { badge: Badge })[],
        allBadges: (allBadgesRes.data ?? []) as Badge[],
      });
    } catch (err) {
      console.error("[useGamification]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, refetch: fetch };
}
