import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";

export type SkillGap = {
  skill_id: string;
  name: string;
  count: number;
  gapCount: number;
  gapSeverity: number;
  gapLevel: string;
  avgRating: string;
};

export type AffectedStudent = {
  student_id: string;
  name: string;
  rating: number;
  gap_indicator: string;
  application_id: string;
};

export function useAcademicianSkillGaps() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [affectedStudents, setAffectedStudents] = useState<Record<string, AffectedStudent[]>>({});
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!profileLoading && profile?.id) {
      fetchSkillGaps();
    }
  }, [profile?.id, profileLoading]);

  const fetchSkillGaps = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch raw application feedback safely scoped by institution RLS
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("application_skill_feedback")
        .select(`
          id, rating, gap_indicator,
          skills (id, name),
          applications!inner (
            id, student_id,
            users!inner (id, name)
          )
        `);

      if (feedbackError) throw feedbackError;

      const rawData = feedbackData || [];

      // 2. Aggregate into skill gaps
      const gapsMap: Record<string, { skill_id: string, name: string, count: number, ratingSum: number, gapCount: number, students: AffectedStudent[] }> = {};

      rawData.forEach((row: any) => {
        const sId = row.skills?.id;
        if (!sId) return;

        if (!gapsMap[sId]) {
          gapsMap[sId] = {
            skill_id: sId,
            name: row.skills?.name || "Unknown Skill",
            count: 0,
            ratingSum: 0,
            gapCount: 0,
            students: []
          };
        }

        gapsMap[sId].count++;
        gapsMap[sId].ratingSum += row.rating;
        
        if (row.gap_indicator === 'Needs Improvement' || row.gap_indicator === 'Significant Gap') {
          gapsMap[sId].gapCount++;
          
          // Add to affected students if it's a negative rating
          // Avoid duplicate student entries for the same skill
          const existingStudent = gapsMap[sId].students.find(s => s.student_id === row.applications.student_id);
          if (!existingStudent) {
            gapsMap[sId].students.push({
              student_id: row.applications.student_id,
              name: row.applications.users?.name || "Unknown Student",
              rating: row.rating,
              gap_indicator: row.gap_indicator,
              application_id: row.applications.id
            });
          }
        }
      });

      const finalGaps: SkillGap[] = [];
      const finalStudentsMap: Record<string, AffectedStudent[]> = {};

      Object.values(gapsMap).forEach(stats => {
        if (stats.gapCount > 0) { // Only show skills that actually have gaps
          const avgRating = (stats.ratingSum / stats.count).toFixed(1);
          const gapSeverity = (stats.gapCount / stats.count) * 100;
          let gapLevel = 'Low (Adequate)';
          if (gapSeverity > 60) gapLevel = 'High (Significant Gap)';
          else if (gapSeverity > 30) gapLevel = 'Medium (Needs Improvement)';

          finalGaps.push({
            skill_id: stats.skill_id,
            name: stats.name,
            count: stats.count,
            gapCount: stats.gapCount,
            gapSeverity,
            gapLevel,
            avgRating
          });
          
          finalStudentsMap[stats.skill_id] = stats.students;
        }
      });

      // Sort by severity (desc) then by gap count (desc)
      finalGaps.sort((a, b) => {
        if (b.gapSeverity !== a.gapSeverity) return b.gapSeverity - a.gapSeverity;
        return b.gapCount - a.gapCount;
      });

      setSkillGaps(finalGaps);
      setAffectedStudents(finalStudentsMap);
    } catch (err: any) {
      console.error("Error fetching skill gaps:", err);
      setError(err.message || "Failed to load skill gap intelligence");
      toast.error("Failed to load skill gap intelligence");
    } finally {
      setLoading(false);
    }
  };

  const offerMentorship = async (studentId: string, skillName: string) => {
    if (!profile?.id) return false;
    setIsMutating(true);
    const toastId = toast.loading("Creating mentorship request...");

    try {
      // 1. Check if an active mentorship already exists between this mentor and mentee
      const { data: existing, error: checkError } = await supabase
        .from("mentorships")
        .select("id")
        .eq("mentor_id", profile.id)
        .eq("mentee_id", studentId)
        .eq("status", "active")
        .single();

      if (existing) {
        toast.error("An active mentorship already exists with this student.", { id: toastId });
        return false;
      }

      // 2. Create mentorship
      const { error: insertError } = await supabase
        .from("mentorships")
        .insert({
          mentor_id: profile.id,
          mentee_id: studentId,
          status: "active",
          notes: `Offered automatically via Skill Gap Intelligence to address industry feedback on: ${skillName}`
        });

      if (insertError) throw insertError;

      toast.success("Mentorship offered successfully! You can manage it in the Mentorship tab.", { id: toastId });
      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to offer mentorship", { id: toastId });
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    skillGaps,
    affectedStudents,
    loading,
    isMutating,
    error,
    offerMentorship,
    refresh: fetchSkillGaps
  };
}
