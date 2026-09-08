"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getQuestionsForPath, type AssessmentQuestionData } from "@/lib/data/career-assessment-questions";

export interface CareerAssessmentAttempt {
  id: string;
  student_id: string;
  career_path_id: string;
  score: number;
  correct_count: number;
  total_count: number;
  passed: boolean;
  answers_json: any;
  started_at: string;
  completed_at: string;
}

export interface CareerCertificate {
  id: string;
  student_id: string;
  career_path_id: string;
  assessment_attempt_id?: string;
  score: number;
  certificate_id: string;
  issued_at: string;
}

export function useCareerAssessment() {
  const [loading, setLoading] = useState(false);

  // Check if student has 100% progress in all phases of the career path
  const checkPathCompletion = useCallback(async (careerPathId: string, phases: { title: string }[]) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get all enrollments for this user
      const { data: enrollments, error } = await supabase
        .from("learning_enrollments")
        .select("progress_pct, program:program_id(title)")
        .eq("student_id", user.id);

      if (error) throw error;

      // We need to match phase.title to program.title
      const completedPhaseTitles = new Set(
        enrollments
          .filter((e) => e.progress_pct === 100)
          .map((e) => (e.program as any)?.title)
      );

      // Check if all phases exist in the completed set
      return phases.every((phase) => completedPhaseTitles.has(phase.title));
    } catch (err) {
      console.error("[checkPathCompletion] Error:", err);
      return false;
    }
  }, []);

  const getAttempts = useCallback(async (careerPathId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("career_assessment_attempts")
        .select("*")
        .eq("student_id", user.id)
        .eq("career_path_id", careerPathId)
        .order("completed_at", { ascending: false });

      if (error) {
        // Table doesn't exist yet — migration not run
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("[getAttempts] Table 'career_assessment_attempts' does not exist. Run the migration SQL.");
          return [];
        }
        console.error("[getAttempts] Supabase error:", { code: error.code, message: error.message, details: error.details, hint: error.hint });
        return [];
      }
      return data as CareerAssessmentAttempt[];
    } catch (err) {
      console.error("[getAttempts] Unexpected error:", err);
      return [];
    }
  }, []);

  const getCertificates = useCallback(async () => {
    const supabase = createClient();

    // 1. Check authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("[getCertificates] Authenticated user:", user);
    if (authError) {
      console.error("[getCertificates] Auth error:", authError);
    }
    if (!user) {
      console.warn("[getCertificates] No authenticated user found. Returning [].");
      return [];
    }

    // 2. Query career_certificates
    const { data, error } = await supabase
      .from("career_certificates")
      .select("*")
      .eq("student_id", user.id)
      .order("issued_at", { ascending: false });

    // 3. Log raw response
    console.log("[getCertificates] Supabase response:", { data, error });

    // 4. If error, log full details
    if (error) {
      console.error("[getCertificates] Supabase Error Details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      // Return empty instead of throwing so the page still renders
      return [];
    }

    // 5. Log returned data
    console.log("[getCertificates] Returned data:", data);
    return data as CareerCertificate[];
  }, []);

  const submitAttempt = useCallback(
    async (careerPathId: string, startedAt: string, userAnswers: Record<string, number>) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const questions = getQuestionsForPath(careerPathId);
        
        // Ensure we score out of the provided answers matching the questions
        let correctCount = 0;
        const answersJson = questions.map((q) => {
          const selected = userAnswers[q.id];
          const isCorrect = selected === q.correctOption;
          if (isCorrect) correctCount++;
          return {
            question_id: q.id,
            selected_option: selected ?? null,
            correct_option: q.correctOption,
            is_correct: isCorrect,
          };
        });

        const totalCount = questions.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        const passed = score >= 75;

        // 1. Insert Attempt
        const { data: attempt, error: attemptError } = await supabase
          .from("career_assessment_attempts")
          .insert({
            student_id: user.id,
            career_path_id: careerPathId,
            score,
            correct_count: correctCount,
            total_count: totalCount,
            passed,
            answers_json: answersJson,
            started_at: startedAt,
          })
          .select()
          .single();

        if (attemptError) throw attemptError;

        // 2. Auto-generate certificate if passed
        let certificateId = null;
        if (passed) {
          const certPrefix = careerPathId.substring(0, 3).toUpperCase();
          const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
          const certId = `CERT-${certPrefix}-2026-${randomSuffix}`;

          // Upsert to handle retakes if somehow taking after already certified
          const { error: certError } = await supabase
            .from("career_certificates")
            .upsert({
              student_id: user.id,
              career_path_id: careerPathId,
              assessment_attempt_id: attempt.id,
              score,
              certificate_id: certId,
            }, { onConflict: "student_id, career_path_id" });

          if (certError) throw certError;
          certificateId = certId;
        }

        return { success: true, score, passed, attemptId: attempt.id, certificateId };
      } catch (err) {
        console.error("[submitAttempt] Error:", err);
        return { success: false, error: String(err) };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    checkPathCompletion,
    getAttempts,
    getCertificates,
    submitAttempt,
  };
}
