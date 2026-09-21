"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Skill, StudentSkill } from "@/lib/types";

export interface ProfileSkillEntry extends StudentSkill {
  skill: Skill;
}

interface UseProfileSkillsResult {
  skills: ProfileSkillEntry[];
  loading: boolean;
  addSkill: (
    skillId: string,
    proficiency: number
  ) => Promise<{ success: boolean; error?: string }>;
  removeSkill: (
    skillId: string
  ) => Promise<{ success: boolean; error?: string }>;
  searchSkills: (query: string) => Promise<Skill[]>;
  refetch: () => void;
}

/**
 * Hook for managing student skills with search against the master `skills` table.
 */
export function useProfileSkills(): UseProfileSkillsResult {
  const [skills, setSkills] = useState<ProfileSkillEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_skills")
        .select("*, skill:skills(*)")
        .eq("student_id", user.id);

      if (error) throw error;

      let mapped: ProfileSkillEntry[] = (data ?? []).map(
        (row: Record<string, unknown>) => ({
          student_id: row.student_id as string,
          skill_id: row.skill_id as string,
          proficiency_score: row.proficiency_score as number,
          verified: row.verified as boolean,
          source: row.source as StudentSkill["source"],
          skill: row.skill as Skill,
        })
      );

      // Synthesize missing skills from completed assessments
      const { data: assessments } = await supabase
        .from("assessments")
        .select("taken_at, generated_profile_json, responses_json")
        .eq("student_id", user.id)
        .order("taken_at", { ascending: true });

      if (assessments) {
        const assessmentMaxScores: Record<string, { score: number, category: string, sub: string }> = {};
        
        assessments.forEach((a: any) => {
          const profile = a.generated_profile_json as Record<string, any> | null;
          const responses = a.responses_json as Record<string, any> | null;
          if (profile && responses) {
            const score = profile.score || 0;
            const sub = responses.subcategory as string;
            
            let mappedName = "";
            let category = "Ayurveda Knowledge";
            
            if (sub === "clinical_practice" || sub === "pharma") mappedName = "Clinical Knowledge";
            else if (sub === "research") mappedName = "Research Skills";
            else if (sub === "communication") { mappedName = "Communication Skills"; category = "Soft Skills"; }
            else if (sub === "documentation") { mappedName = "Documentation"; category = "Soft Skills"; }
            else if (sub === "quant") { mappedName = "Quantitative Aptitude"; category = "Aptitude"; }
            else if (sub === "logical") { mappedName = "Logical Reasoning"; category = "Aptitude"; }
            
            if (mappedName) {
              if (!assessmentMaxScores[mappedName] || score > assessmentMaxScores[mappedName].score) {
                assessmentMaxScores[mappedName] = { score, category, sub };
              }
            }
          }
        });

        Object.entries(assessmentMaxScores).forEach(([name, data]) => {
          const exists = mapped.some((m) => m.skill?.name === name);
          if (!exists) {
            mapped.push({
              student_id: user.id,
              skill_id: `synth_${data.sub}`,
              proficiency_score: data.score,
              verified: false,
              source: "assessment",
              skill: {
                id: `synth_${data.sub}`,
                name: name,
                category: data.category,
                source_taxonomy: "System",
              },
            });
          }
        });
      }

      setSkills(mapped);
    } catch (err) {
      console.error("[useProfileSkills] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const addSkill = useCallback(
    async (
      skillId: string,
      proficiency: number
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("student_skills").insert({
          student_id: user.id,
          skill_id: skillId,
          proficiency_score: proficiency,
          source: "manual",
          verified: false,
        });

        if (error) throw error;
        await fetchSkills();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to add skill",
        };
      }
    },
    [fetchSkills]
  );

  const removeSkill = useCallback(
    async (skillId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("student_skills")
          .delete()
          .eq("student_id", user.id)
          .eq("skill_id", skillId);

        if (error) throw error;
        await fetchSkills();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to remove skill",
        };
      }
    },
    [fetchSkills]
  );

  const searchSkills = useCallback(async (query: string): Promise<Skill[]> => {
    if (!query.trim()) return [];

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(20);

      if (error) throw error;
      return (data as Skill[]) ?? [];
    } catch (err) {
      console.error("[useProfileSkills] search error:", err);
      return [];
    }
  }, []);

  return {
    skills,
    loading,
    addSkill,
    removeSkill,
    searchSkills,
    refetch: fetchSkills,
  };
}
