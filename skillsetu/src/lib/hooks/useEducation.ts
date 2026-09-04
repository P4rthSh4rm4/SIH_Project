"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentEducation } from "@/lib/types";

interface UseEducationResult {
  education: StudentEducation[];
  loading: boolean;
  addEducation: (
    data: Omit<StudentEducation, "id" | "user_id" | "created_at">
  ) => Promise<{ success: boolean; error?: string }>;
  updateEducation: (
    id: string,
    data: Partial<Omit<StudentEducation, "id" | "user_id" | "created_at">>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteEducation: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

/**
 * CRUD hook for the `student_education` table.
 */
export function useEducation(): UseEducationResult {
  const [education, setEducation] = useState<StudentEducation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEducation = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_education")
        .select("*")
        .eq("user_id", user.id)
        .order("start_year", { ascending: false });

      if (error) throw error;
      setEducation((data as StudentEducation[]) ?? []);
    } catch (err) {
      console.error("[useEducation] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const addEducation = useCallback(
    async (
      data: Omit<StudentEducation, "id" | "user_id" | "created_at">
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("student_education")
          .insert({ ...data, user_id: user.id });

        if (error) throw error;
        await fetchEducation();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to add education",
        };
      }
    },
    [fetchEducation]
  );

  const updateEducation = useCallback(
    async (
      id: string,
      data: Partial<Omit<StudentEducation, "id" | "user_id" | "created_at">>
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("student_education")
          .update(data)
          .eq("id", id);

        if (error) throw error;
        await fetchEducation();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to update education",
        };
      }
    },
    [fetchEducation]
  );

  const deleteEducation = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("student_education")
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchEducation();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to delete education",
        };
      }
    },
    [fetchEducation]
  );

  return {
    education,
    loading,
    addEducation,
    updateEducation,
    deleteEducation,
    refetch: fetchEducation,
  };
}
