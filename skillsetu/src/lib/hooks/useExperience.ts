"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentExperience, ExperienceType } from "@/lib/types";

type ExperienceInput = {
  type: ExperienceType;
  title: string;
  organization?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
};

interface UseExperienceResult {
  experiences: StudentExperience[];
  loading: boolean;
  addExperience: (
    data: ExperienceInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateExperience: (
    id: string,
    data: Partial<ExperienceInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteExperience: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

/**
 * CRUD hook for the `student_experience` table.
 */
export function useExperience(): UseExperienceResult {
  const [experiences, setExperiences] = useState<StudentExperience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_experience")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setExperiences((data as StudentExperience[]) ?? []);
    } catch (err) {
      console.error("[useExperience] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const addExperience = useCallback(
    async (
      data: ExperienceInput
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("student_experience")
          .insert({ ...data, user_id: user.id });

        if (error) throw error;
        await fetchExperiences();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to add experience",
        };
      }
    },
    [fetchExperiences]
  );

  const updateExperience = useCallback(
    async (
      id: string,
      data: Partial<ExperienceInput>
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("student_experience")
          .update(data)
          .eq("id", id);

        if (error) throw error;
        await fetchExperiences();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to update experience",
        };
      }
    },
    [fetchExperiences]
  );

  const deleteExperience = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("student_experience")
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchExperiences();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to delete experience",
        };
      }
    },
    [fetchExperiences]
  );

  return {
    experiences,
    loading,
    addExperience,
    updateExperience,
    deleteExperience,
    refetch: fetchExperiences,
  };
}
