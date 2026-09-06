"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LearningProgram, LearningEnrollment } from "@/lib/types";

export const MOCK_PROGRAMS = [
  {
    id: "mock-tech-1",
    title: "Full Stack Web Development with Next.js",
    provider: "Sheryians Coding School",
    type: "tech",
    skills_covered: ["React", "Next.js", "Node.js", "MongoDB"],
    url: "https://www.youtube.com/watch?v=8hly31xKli0"
  },
  {
    id: "mock-apti-1",
    title: "Quantitative Aptitude Mastery",
    provider: "SkillSetu Prep",
    type: "aptitude",
    skills_covered: ["Problem Solving", "Mathematics", "Speed Math"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "mock-comm-1",
    title: "Business Communication & Soft Skills",
    provider: "Corporate Trainers Inc",
    type: "communication",
    skills_covered: ["Public Speaking", "Email Etiquette", "Negotiation"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

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

      const loadedPrograms = (programsRes.data as LearningProgram[]) ?? [];
      const loadedEnrollments = (enrollmentsRes.data as LearningEnrollment[]) ?? [];

      // Merge with persisted mock enrollments only if the real database is empty
      try {
        if (typeof window !== "undefined" && loadedPrograms.length === 0) {
          const storedMocks = localStorage.getItem("mock_enrollments");
          if (storedMocks) {
            const parsedMocks = JSON.parse(storedMocks) as LearningEnrollment[];
            loadedEnrollments.push(...parsedMocks);
          }
        }
      } catch(e) {
        console.error("Failed to parse mock enrollments", e);
      }
      
      console.log("[useLearningHub] programs.length after fetching:", loadedPrograms.length);
      console.log("[useLearningHub] enrollments.length after fetching:", loadedEnrollments.length);

      setPrograms(loadedPrograms);
      setEnrollments(loadedEnrollments);
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

        console.log("[useLearningHub] handleEnroll executed");
        console.log("[useLearningHub] Program ID:", programId);
        console.log("[useLearningHub] Authenticated User ID:", user.id);

        if (programId.startsWith("mock-")) {
          // Intercept mock program enrollment to preserve UI functionality without DB errors
          console.log("[useLearningHub] Intercepting mock program enrollment for:", programId);
          await new Promise(r => setTimeout(r, 800)); // Simulate network delay
          
          const mockProgram = MOCK_PROGRAMS.find(p => p.id === programId);
          
          const newEnrollment = {
            id: `mock-enroll-${Date.now()}`,
            student_id: user.id,
            program_id: programId,
            progress_pct: 0,
            enrolled_at: new Date().toISOString(),
            completed_at: null,
            // @ts-ignore - Mocking the program join for UI purposes
            program: { 
              id: programId, 
              title: mockProgram?.title || "Mock Program", 
              provider: mockProgram?.provider || "Mock Provider" 
            }
          };

          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem("mock_enrollments");
              const parsed = stored ? JSON.parse(stored) : [];
              localStorage.setItem("mock_enrollments", JSON.stringify([newEnrollment, ...parsed]));
            }
          } catch(e) {}
          
          setEnrollments(prev => [newEnrollment, ...prev]);
          return { success: true };
        }
        
        const payload = {
          student_id: user.id,
          program_id: programId,
          progress_pct: 0,
        };
        console.log("[useLearningHub] Exact Supabase insert payload:", payload);

        const { data, error } = await supabase.from("learning_enrollments").insert(payload).select();
        console.log("[useLearningHub] Complete Supabase response:", { data, error });

        if (error) {
          console.error("[useLearningHub] enroll Supabase error object:", JSON.stringify(error, null, 2));
          throw new Error(error.message || error.details || "Supabase insert failed");
        }
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

        if (enrollmentId.startsWith("mock-")) {
          console.log("[useLearningHub] Intercepting mock program update for:", enrollmentId);
          await new Promise(r => setTimeout(r, 800)); // Simulate network delay
          
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem("mock_enrollments");
              if (stored) {
                const parsed = JSON.parse(stored);
                const updated = parsed.map((e: any) => {
                  if (e.id === enrollmentId) {
                    return { ...e, progress_pct: progressPct, completed_at: updateData.completed_at as string || e.completed_at };
                  }
                  return e;
                });
                localStorage.setItem("mock_enrollments", JSON.stringify(updated));
              }
            }
          } catch(e) {}

          setEnrollments(prev => prev.map(e => {
            if (e.id === enrollmentId) {
              return { ...e, progress_pct: progressPct, completed_at: updateData.completed_at as string || e.completed_at };
            }
            return e;
          }));
          return { success: true };
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
