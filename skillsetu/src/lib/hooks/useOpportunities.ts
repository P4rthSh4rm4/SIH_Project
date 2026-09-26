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

      // Fetch the student's department and institution to ensure safe strict filtering
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("department, institution_id")
        .eq("id", user.id)
        .single();

      if (userError || !userData?.department) {
        // Fail closed: Do not return cross-department opportunities if department is unknown
        setOpportunities([]);
        return;
      }
      const userDepartment = userData.department;
      const userInstitutionId = userData.institution_id;

      // Fetch all active opportunities filtered by the student's department
      const { data: opps, error } = await supabase
        .from("opportunities")
        .select("*, users!inner(department)")
        .eq("status", "active")
        .eq("verification_status", "approved")
        .eq("users.department", userDepartment)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out institute-specific campus collaborations intended for other institutions
      const eligibleOpps = ((opps as any[]) ?? []).filter((opp) => {
        const isCampusCollab = opp.eligibility_requirements?.is_campus_collaboration;
        const targetInstId = opp.eligibility_requirements?.target_institution_id;
        
        // If it's a campus collaboration targeted to an institution:
        if (isCampusCollab && targetInstId) {
          // If student has an institution and it doesn't match, exclude
          if (userInstitutionId && userInstitutionId !== targetInstId) {
            return false;
          }
        }
        return true;
      });

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

      const withMatch: OpportunityWithMatch[] = eligibleOpps.map(
        (opp) => {
          const reqSkills = opp.required_skills ?? [];
          const matchCount = reqSkills.filter((sid: string) =>
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

          const isCollab = opp.eligibility_requirements?.is_campus_collaboration ?? false;
          const targetInstId = opp.eligibility_requirements?.target_institution_id;
          const targetInstName = opp.eligibility_requirements?.target_institution_name;
          const collabType = opp.eligibility_requirements?.campus_collaboration_type;
          const facultyNote = opp.eligibility_requirements?.faculty_note;

          return {
            ...opp,
            is_campus_collaboration: isCollab,
            target_institution_id: targetInstId,
            target_institution_name: targetInstName,
            campus_collaboration_type: collabType,
            faculty_note: facultyNote,
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
          status: "pending_faculty",
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
