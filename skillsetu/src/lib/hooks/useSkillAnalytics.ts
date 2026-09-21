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

      const { data: assessments } = await supabase
        .from("assessments")
        .select("taken_at, generated_profile_json, responses_json")
        .eq("student_id", user.id)
        .order("taken_at", { ascending: true });

      console.log("[RUNTIME AUDIT] 3. Raw assessments returned from Supabase:", assessments);

      // Synthesize any skills that exist in assessments but failed to save to student_skills
      if (assessments) {
        // Build a map of highest score per mapped competency from assessments
        const assessmentMaxScores: Record<string, { score: number, category: string, sub: string }> = {};
        
        assessments.forEach((a: any) => {
          const profile = a.generated_profile_json as Record<string, any> | null;
          const responses = a.responses_json as Record<string, any> | null;
          if (profile && responses) {
            const score = profile.score || 0;
            const sub = responses.subcategory as string;
            
            // Map subcategories to expected radar competencies
            let mappedName = "";
            let category = "Ayurveda Knowledge";
            
            if (sub === "clinical_practice") mappedName = "Clinical Knowledge";
            else if (sub === "pharma") mappedName = "Ayurvedic Pharmacy";
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

        // Add them to skillData if they aren't already represented
        Object.entries(assessmentMaxScores).forEach(([name, data]) => {
          // Check if this mapped competency is already in skillData (by checking name)
          // Note: some existing skills might have the exact same name
          const exists = skillData.find(s => s.name === name || s.name === data.sub);
          if (!exists) {
            skillData.push({
              id: `synth-${data.sub}`,
              name: name,
              score: data.score,
              category: data.category,
              verified: false
            });
          }
        });
      }

      console.log("[RUNTIME AUDIT] 3b. skillData after synthesizing from assessments:", skillData);

      setSkills(skillData);

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
