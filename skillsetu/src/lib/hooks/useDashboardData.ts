"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  skillsMapped: number;
  matchScore: number;
  applications: number;
  certifications: number;
  skillsTrend: string;
  matchTrend: string;
  appsTrend: string;
  certsTrend: string;
}

const DEFAULT_STATS: DashboardStats = {
  skillsMapped: 0,
  matchScore: 0,
  applications: 0,
  certifications: 0,
  skillsTrend: "",
  matchTrend: "",
  appsTrend: "",
  certsTrend: "",
};

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all counts in parallel
      const [skillsRes, appsRes, certsRes, appsInProgressRes] =
        await Promise.all([
          supabase
            .from("student_skills")
            .select("proficiency_score", { count: "exact" })
            .eq("student_id", user.id),
          supabase
            .from("applications")
            .select("*", { count: "exact" })
            .eq("student_id", user.id),
          supabase
            .from("certifications")
            .select("*", { count: "exact" })
            .eq("student_id", user.id),
          supabase
            .from("applications")
            .select("*", { count: "exact" })
            .eq("student_id", user.id)
            .in("status", ["applied", "shortlisted", "interview"]),
        ]);

      const skillsCount = skillsRes.count ?? 0;
      const appsCount = appsRes.count ?? 0;
      const certsCount = certsRes.count ?? 0;
      const appsInProgress = appsInProgressRes.count ?? 0;

      // Calculate average match score from skills
      const skillScores = skillsRes.data?.map((s) => s.proficiency_score) ?? [];
      const avgScore =
        skillScores.length > 0
          ? Math.round(
              skillScores.reduce((a: number, b: number) => a + b, 0) /
                skillScores.length
            )
          : 0;

      // Pending certs count
      const pendingCerts = certsRes.data?.filter(
        (c: { verified: boolean }) => !c.verified
      ).length ?? 0;

      setStats({
        skillsMapped: skillsCount,
        matchScore: avgScore,
        applications: appsCount,
        certifications: certsCount,
        skillsTrend: skillsCount > 0 ? `${skillsCount} tracked` : "Start mapping",
        matchTrend: avgScore > 0 ? `Avg proficiency` : "Take assessment",
        appsTrend:
          appsInProgress > 0
            ? `${appsInProgress} in progress`
            : "Browse opportunities",
        certsTrend:
          pendingCerts > 0
            ? `${pendingCerts} pending verify`
            : certsCount > 0
              ? "All verified"
              : "Earn your first",
      });
    } catch (err) {
      console.error("[useDashboardData]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
