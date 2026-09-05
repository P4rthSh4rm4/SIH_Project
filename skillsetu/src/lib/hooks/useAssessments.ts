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

        // Upsert student_skills for each assessed skill
        for (const skill of result.skillsAssessed) {
          // Find or create the skill in the skills table
          let { data: existingSkill } = await supabase
            .from("skills")
            .select("id")
            .eq("name", skill.name)
            .single();

          if (!existingSkill) {
            const { data: newSkill } = await supabase
              .from("skills")
              .insert({
                name: skill.name,
                category: category,
              })
              .select("id")
              .single();
            existingSkill = newSkill;
          }

          if (existingSkill) {
            await supabase.from("student_skills").upsert(
              {
                student_id: user.id,
                skill_id: existingSkill.id,
                proficiency_score: skill.score,
                verified: false,
                source: "assessment",
              },
              { onConflict: "student_id,skill_id" }
            );
          }
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
