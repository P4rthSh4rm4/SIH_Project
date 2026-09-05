"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentSkill } from "@/lib/types";

export interface SkillDataPoint {
  id: string;
  name: string;
  score: number;
  category: string;
  verified: boolean;
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
        .select("skill_id, proficiency_score, verified, skill:skills(name, category)")
        .eq("student_id", user.id);

      console.log("[RUNTIME AUDIT] 1. Raw student_skills returned from Supabase:", studentSkills);

      const skillData: SkillDataPoint[] = (studentSkills ?? []).map(
        (ss: Record<string, unknown>) => {
          const skill = ss.skill as { name: string; category: string } | null;
          return {
            id: ss.skill_id as string,
            name: skill?.name ?? "Unknown",
            score: ss.proficiency_score as number,
            category: skill?.category ?? "Other",
            verified: ss.verified as boolean,
          };
        }
      );
      
      console.log("[RUNTIME AUDIT] 2. skillData after transformation:", skillData);
      setSkills(skillData);

      // Fetch assessment history for growth chart
      const { data: assessments } = await supabase
        .from("assessments")
        .select("taken_at, generated_profile_json")
        .eq("student_id", user.id)
        .order("taken_at", { ascending: true });

      console.log("[RUNTIME AUDIT] 3. Raw assessments returned from Supabase:", assessments);

      const growthData: SkillGrowthPoint[] = (assessments ?? []).map(
        (a: Record<string, unknown>) => {
          const profile = a.generated_profile_json as Record<string, unknown> | null;
          // Reading the single score written by saveAssessment
          const score = profile?.score as number | undefined;
          
          const dateObj = new Date(a.taken_at as string);
          const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

          return {
            date: `${dateStr} ${timeStr}`,
            avgScore: score ?? 0,
          };
        }
      );

      console.log("[RUNTIME AUDIT] 4. growthData after transformation:", growthData);
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
