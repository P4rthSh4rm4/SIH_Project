"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Application } from "@/lib/types";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select("*, opportunity:opportunities(*), application_offers(*)")
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications((data as Application[]) ?? []);
    } catch (err) {
      console.error("[useApplications] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const withdrawApplication = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("applications")
          .update({ status: "withdrawn" })
          .eq("id", id);
        if (error) throw error;
        await fetchApplications();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to withdraw",
        };
      }
    },
    [fetchApplications]
  );

  return { applications, loading, withdrawApplication, refetch: fetchApplications };
}
