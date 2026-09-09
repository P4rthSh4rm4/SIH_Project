"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateMockQuestions, InterviewType, InterviewDifficulty, InterviewQuestion } from "@/lib/data/mock-interview-questions";

export interface MockInterviewRecord {
  id: string;
  student_id: string;
  interview_type: string;
  career_path: string;
  difficulty: string;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  started_at: string;
  completed_at: string | null;
  time_taken: number;
  status: 'In Progress' | 'Completed' | 'Abandoned';
  technical_score: number | null;
  communication_score: number | null;
  confidence_score: number | null;
  problem_solving_score: number | null;
  grammar_score: number | null;
  overall_score: number | null;
  ai_feedback: any | null;
}

export function useMockInterview() {
  const [interviews, setInterviews] = useState<MockInterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mock_interviews")
        .select("*")
        .eq("student_id", user.id)
        .order("started_at", { ascending: false });

      if (error) {
        console.error("Supabase Error fetching mock interviews:", error);
        throw error;
      }
      
      setInterviews(data as MockInterviewRecord[]);
    } catch (err) {
      console.error("Runtime Error in fetchInterviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const startNewInterview = async (type: InterviewType, careerPath: string, difficulty: InterviewDifficulty) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Simulate AI generation by pulling from local data
    const questions = generateMockQuestions(type, careerPath, difficulty, 5);

    const { data, error } = await supabase
      .from("mock_interviews")
      .insert({
        student_id: user.id,
        interview_type: type,
        career_path: careerPath,
        difficulty: difficulty,
        questions: questions,
        answers: {},
        status: 'In Progress'
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error starting interview:", error);
      throw error;
    }
    
    // Update local state
    setInterviews(prev => [data as MockInterviewRecord, ...prev]);
    return data as MockInterviewRecord;
  };

  const saveProgress = async (id: string, answers: Record<string, string>, timeTaken: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("mock_interviews")
      .update({ answers, time_taken: timeTaken })
      .eq("id", id);
      
    if (error) {
      console.error("Supabase Error saving progress:", error);
      throw error;
    }
    
    setInterviews(prev => prev.map(inv => inv.id === id ? { ...inv, answers, time_taken: timeTaken } : inv));
  };

  const finishInterview = async (id: string, answers: Record<string, string>, timeTaken: number) => {
    const supabase = createClient();
    const completedAt = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("mock_interviews")
      .update({ 
        answers, 
        time_taken: timeTaken, 
        completed_at: completedAt,
        status: 'Completed'
      })
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Supabase Error finishing interview:", error);
      throw error;
    }
    
    setInterviews(prev => prev.map(inv => inv.id === id ? data as MockInterviewRecord : inv));
    return data;
  };

  const abandonInterview = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("mock_interviews")
      .update({ status: 'Abandoned' })
      .eq("id", id);
      
    if (error) {
      console.error("Supabase Error abandoning interview:", error);
      throw error;
    }
    setInterviews(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Abandoned' } : inv));
  };

  const evaluateInterview = async (id: string) => {
    const interview = interviews.find(i => i.id === id);
    if (!interview) throw new Error("Interview not found in local state");

    // Dynamic import to avoid circular or SSR issues if any, but static is fine here since it's rule-based
    const { FinalScoreCalculator } = await import("@/lib/services/evaluators/FinalScoreCalculator");
    
    // Construct EvaluationInput[]
    const inputs = interview.questions.map(q => ({
      question: q,
      answer: interview.answers[q.id] || ""
    }));

    const report = FinalScoreCalculator.generateReport(inputs);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("mock_interviews")
      .update({
        technical_score: report.technicalScore,
        communication_score: report.communicationScore,
        confidence_score: report.confidenceScore,
        problem_solving_score: report.problemSolvingScore,
        grammar_score: report.communicationScore, // Using comm score for grammar proxy
        overall_score: report.overallScore,
        ai_feedback: report as any
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error evaluating interview:", error);
      throw error;
    }

    // Update local state
    setInterviews(prev => prev.map(inv => inv.id === id ? data as MockInterviewRecord : inv));
    return report;
  };

  const getStats = () => {
    const completed = interviews.filter(i => i.status === 'Completed');
    return {
      total: interviews.length,
      completed: completed.length,
      // For now, these are null because scoring isn't implemented
      bestScore: completed.length > 0 ? "Pending AI Evaluation" : "N/A",
      averageScore: completed.length > 0 ? "Pending AI Evaluation" : "N/A",
      latest: interviews[0] || null
    };
  };

  return {
    interviews,
    loading,
    startNewInterview,
    saveProgress,
    finishInterview,
    abandonInterview,
    evaluateInterview,
    fetchInterviews,
    getStats
  };
}
