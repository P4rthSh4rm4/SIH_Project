"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/lib/types";

export interface OpportunityWithMatch extends Opportunity {
  matchScore: number;
  matchLabel: string;
  hasApplied: boolean;
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<OpportunityWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all active opportunities
      const { data: opps, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user's skills for matching
      const { data: userSkills } = await supabase
        .from("student_skills")
        .select("skill_id")
        .eq("student_id", user.id);

      const userSkillIds = new Set(
        (userSkills ?? []).map((s: { skill_id: string }) => s.skill_id)
      );

      // Fetch user's applications
      const { data: apps } = await supabase
        .from("applications")
        .select("opportunity_id")
        .eq("student_id", user.id);

      const appliedSet = new Set(
        (apps ?? []).map((a: { opportunity_id: string }) => a.opportunity_id)
      );

      const withMatch: OpportunityWithMatch[] = ((opps as Opportunity[]) ?? []).map(
        (opp) => {
          const reqSkills = opp.required_skills ?? [];
          const matchCount = reqSkills.filter((sid) =>
            userSkillIds.has(sid)
          ).length;
          const matchScore =
            reqSkills.length > 0
              ? Math.round((matchCount / reqSkills.length) * 100)
              : 0;
          const matchLabel =
            matchScore >= 80
              ? "Great Match"
              : matchScore >= 50
                ? "Good Match"
                : "Low Match";
          return {
            ...opp,
            matchScore,
            matchLabel,
            hasApplied: appliedSet.has(opp.id),
          };
        }
      );

      setOpportunities(withMatch);
    } catch (err) {
      console.error("[useOpportunities] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const applyToOpportunity = useCallback(
    async (
      opportunityId: string,
      matchScore: number
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("applications").insert({
          opportunity_id: opportunityId,
          student_id: user.id,
          status: "applied",
          match_score: matchScore,
        });

        if (error) throw error;
        await fetchOpportunities();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to apply",
        };
      }
    },
    [fetchOpportunities]
  );

  return { opportunities, loading, applyToOpportunity, refetch: fetchOpportunities };
}
