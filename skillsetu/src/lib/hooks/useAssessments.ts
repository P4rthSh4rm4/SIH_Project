"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Assessment } from "@/lib/types";

export interface AssessmentQuestion {
  id: string;
  question: string;
  codeSnippet: string | null;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillTag: string;
  difficulty: string;
}

export interface AssessmentResult {
  score: number;
  correctCount: number;
  totalCount: number;
  feedback: string;
  skillsAssessed: Array<{ name: string; score: number }>;
  questionResults: Array<{
    questionId: string;
    skillTag: string;
    isCorrect: boolean;
    userAnswer: number;
    correctAnswer: number;
  }>;
  timeTakenSeconds: number;
}

export function useAssessments() {
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("student_id", user.id)
        .order("taken_at", { ascending: false });

      if (error) throw error;
      setHistory((data as Assessment[]) ?? []);
    } catch (err) {
      console.error("[useAssessments] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const generateQuestions = useCallback(
    async (
      category: string,
      subcategory: string,
      difficulty: string,
      count: number
    ): Promise<AssessmentQuestion[]> => {
      const res = await fetch("/api/gemini/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subcategory, difficulty, count }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      return data.questions;
    },
    []
  );

  const evaluateAssessment = useCallback(
    async (
      category: string,
      subcategory: string,
      questions: AssessmentQuestion[],
      answers: Record<string, number>,
      timeTakenSeconds: number
    ): Promise<AssessmentResult> => {
      const res = await fetch("/api/gemini/evaluate-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subcategory,
          questions,
          answers,
          timeTakenSeconds,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate assessment");
      return res.json();
    },
    []
  );

  const saveAssessment = useCallback(
    async (
      category: string,
      subcategory: string,
      targetSkillName: string,
      questions: AssessmentQuestion[],
      answers: Record<string, number>,
      result: AssessmentResult
    ) => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Save assessment record
        await supabase.from("assessments").insert({
          student_id: user.id,
          type: "questionnaire",
          responses_json: { category, subcategory, questions, answers },
          generated_profile_json: {
            score: result.score,
            skillsAssessed: result.skillsAssessed,
            feedback: result.feedback,
          },
        });

        console.log("[DEBUG] targetSkillName passed to saveAssessment:", targetSkillName);

        // Look for the main skill in the master catalog based on the targetSkillName
        let masterSkillId: string | null = null;
        
        if (targetSkillName) {
          const { data: existingSkill, error } = await supabase
            .from("skills")
            .select("id")
            .ilike("name", targetSkillName)
            .maybeSingle();
            
          console.log("[DEBUG] skills lookup result (existingSkill):", existingSkill);
          if (error) {
            console.error("[DEBUG] lookup error from skills table:", error);
          }
            
          if (existingSkill?.id) {
            masterSkillId = existingSkill.id;
          }
        }
        
        console.log("[DEBUG] masterSkillId resolved to:", masterSkillId);

        // If we found a matching master skill, upsert the overall score into student_skills
        if (masterSkillId) {
          const { data: upsertData, error: upsertError } = await supabase.from("student_skills").upsert(
            {
              student_id: user.id,
              skill_id: masterSkillId,
              proficiency_score: result.score,
              verified: false,
              source: "assessment",
            },
            { onConflict: "student_id,skill_id" }
          ).select();
          
          console.log("[DEBUG] student_skills upsert result:", upsertData);
          if (upsertError) {
            console.error("[DEBUG] student_skills upsert error:", upsertError);
          }
        } else {
          console.warn("[DEBUG] Skipping student_skills upsert because masterSkillId is null. The targetSkillName was not found in the skills table.");
        }

        await fetchHistory();
      } catch (err) {
        console.error("[useAssessments] save error:", err);
      }
    },
    [fetchHistory]
  );

  return {
    history,
    loading,
    generateQuestions,
    evaluateAssessment,
    saveAssessment,
    refetch: fetchHistory,
  };
}
