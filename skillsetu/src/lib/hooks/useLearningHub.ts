"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LearningProgram, LearningEnrollment } from "@/lib/types";

export function useLearningHub() {
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [enrollments, setEnrollments] = useState<LearningEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [programsRes, enrollmentsRes] = await Promise.all([
        supabase
          .from("learning_programs")
          .select("*")
          .order("title", { ascending: true }),
        supabase
          .from("learning_enrollments")
          .select("*, program:learning_programs(*)")
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false }),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;

      setPrograms((programsRes.data as LearningProgram[]) ?? []);
      setEnrollments((enrollmentsRes.data as LearningEnrollment[]) ?? []);
    } catch (err) {
      console.error("[useLearningHub] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enroll = useCallback(
    async (
      programId: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("learning_enrollments").insert({
          student_id: user.id,
          program_id: programId,
          progress_pct: 0,
        });

        if (error) throw error;
        await fetchData();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to enroll",
        };
      }
    },
    [fetchData]
  );

  const updateProgress = useCallback(
    async (
      enrollmentId: string,
      progressPct: number
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const updateData: Record<string, unknown> = {
          progress_pct: progressPct,
        };
        if (progressPct >= 100) {
          updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from("learning_enrollments")
          .update(updateData)
          .eq("id", enrollmentId);

        if (error) throw error;
        await fetchData();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update progress",
        };
      }
    },
    [fetchData]
  );

  return { programs, enrollments, loading, enroll, updateProgress, refetch: fetchData };
}
