"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseResumeResult {
  uploadResume: (
    file: File
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteResume: () => Promise<{ success: boolean; error?: string }>;
  getResumeSignedUrl: (path: string) => Promise<string | null>;
  uploading: boolean;
}

/**
 * Hook for resume upload/replace/delete operations.
 * Files go to the `documents` storage bucket.
 * The URL is saved/cleared in `student_profiles.resume_url`.
 */
export function useResume(): UseResumeResult {
  const [uploading, setUploading] = useState(false);

  const uploadResume = useCallback(
    async (
      file: File
    ): Promise<{ success: boolean; url?: string; error?: string }> => {
      try {
        setUploading(true);
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/resume.${ext}`;

        // Upload (upsert replaces existing resume)
        const { error: uploadErr } = await supabase.storage
          .from("documents")
          .upload(fileName, file, { upsert: true });

        if (uploadErr) throw uploadErr;

        // Save path to student_profiles
        const { error: updateErr } = await supabase
          .from("student_profiles")
          .update({ resume_url: fileName })
          .eq("user_id", user.id);

        if (updateErr) throw updateErr;

        return { success: true, url: fileName };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to upload resume",
        };
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const deleteResume = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setUploading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current resume_url to delete from storage
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("resume_url")
        .eq("user_id", user.id)
        .single();

      if (sp?.resume_url) {
        await supabase.storage.from("documents").remove([sp.resume_url]);
      }

      // Clear resume_url
      const { error } = await supabase
        .from("student_profiles")
        .update({ resume_url: null })
        .eq("user_id", user.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to delete resume",
      };
    } finally {
      setUploading(false);
    }
  }, []);

  const getResumeSignedUrl = useCallback(
    async (path: string): Promise<string | null> => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(path, 3600);

        if (error) throw error;
        return data.signedUrl;
      } catch (err) {
        console.error("[useResume] signed URL error:", err);
        return null;
      }
    },
    []
  );

  return { uploadResume, deleteResume, getResumeSignedUrl, uploading };
}
