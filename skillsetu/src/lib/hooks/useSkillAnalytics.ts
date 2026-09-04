"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentSkill } from "@/lib/types";

export interface SkillDataPoint {
  name: string;
  score: number;
  category: string;
}

export interface SkillGrowthPoint {
  date: string;
  avgScore: number;
}

export function useSkillAnalytics() {
  const [skills, setSkills] = useState<SkillDataPoint[]>([]);
  const [growth, setGrowth] = useState<SkillGrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current skills with their metadata
      const { data: studentSkills } = await supabase
        .from("student_skills")
        .select("proficiency_score, skill:skills(name, category)")
        .eq("student_id", user.id);

      const skillData: SkillDataPoint[] = (studentSkills ?? []).map(
        (ss: Record<string, unknown>) => {
          const skill = ss.skill as { name: string; category: string } | null;
          return {
            name: skill?.name ?? "Unknown",
            score: ss.proficiency_score as number,
            category: skill?.category ?? "Other",
          };
        }
      );
      setSkills(skillData);

      // Fetch assessment history for growth chart
      const { data: assessments } = await supabase
        .from("assessments")
        .select("taken_at, generated_profile_json")
        .eq("student_id", user.id)
        .order("taken_at", { ascending: true });

      const growthData: SkillGrowthPoint[] = (assessments ?? []).map(
        (a: Record<string, unknown>) => {
          const profile = a.generated_profile_json as Record<string, unknown> | null;
          const scores = profile?.scores as number[] | undefined;
          const avg =
            scores && scores.length > 0
              ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length)
              : 0;
          return {
            date: (a.taken_at as string).slice(0, 10),
            avgScore: avg,
          };
        }
      );
      setGrowth(growthData);
    } catch (err) {
      console.error("[useSkillAnalytics]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { skills, growth, loading, refetch: fetch };
}
