"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  calculateTechnicalScore,
  calculateSoftSkillsScore,
  calculateAptitudeScore,
  calculateResumeScore,
  calculatePortfolioScore,
  calculateGitHubScore,
  calculateLinkedInScore,
  calculateExperienceScore
} from "@/lib/services/readiness";

// Reuse weights from existing service logic
const READINESS_WEIGHTS = {
  technical:  0.25,
  softSkills: 0.15,
  aptitude:   0.15,
  resume:     0.10,
  portfolio:  0.10,
  github:     0.10,
  linkedin:   0.05,
  experience: 0.10,
} as const;

export function useStudentSkillPassport(studentId?: string) {
  const [data, setData] = useState({
    skills: [] as any[],
    portfolioItems: [] as any[],
    education: [] as any[],
    experiences: [] as any[],
    certificates: [] as any[],
    completedInterviews: [] as any[],
    assessments: [] as any[],
    industryFeedback: [] as any[],
    profile: null as any
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setData({
        skills: [], portfolioItems: [], education: [], experiences: [],
        certificates: [], completedInterviews: [], assessments: [], industryFeedback: [], profile: null
      });
      return;
    }

    async function fetchPassportData() {
      // Clear previous student's data immediately so we don't show stale data
      setData({
        skills: [], portfolioItems: [], education: [], experiences: [],
        certificates: [], completedInterviews: [], assessments: [], industryFeedback: [], profile: null
      });
      setLoading(true);
      const supabase = createClient();

      try {
        // Fetch all student data in parallel
        // RLS NOTE: The tables queried here (student_skills, student_education, etc.) are strictly scoped 
        // to the student themselves (auth.uid() = student_id) via Row Level Security.
        // Therefore, these queries will return [] (empty data) when run by an Academician. 
        // Wait, Academicians should have access. If they don't, RLS needs updating.
        const [
          skillsRes,
          portfolioRes,
          eduRes,
          expRes,
          certRes,
          interviewRes,
          assessRes,
          profileRes,
          feedbackRes
        ] = await Promise.all([
          supabase.from("student_skills").select("*, skills(*)").eq("student_id", studentId),
          supabase.from("portfolio_items").select("*").eq("user_id", studentId),
          supabase.from("student_education").select("*").eq("user_id", studentId),
          supabase.from("student_experience").select("*").eq("user_id", studentId),
          supabase.from("certifications").select("*").eq("student_id", studentId),
          supabase.from("mock_interviews").select("*").eq("student_id", studentId).eq("status", "Completed").not("overall_score", "is", null),
          supabase.from("assessments").select("*").eq("student_id", studentId),
          supabase.from("student_profiles").select("*").eq("user_id", studentId).maybeSingle(),
          // Fetch industry feedback for this student
          supabase
            .from("application_skill_feedback")
            .select(`
              *,
              skill:skills(name),
              application:applications!inner(student_id, opportunity:opportunities(title, industry:users(name)))
            `)
            .eq("application.student_id", studentId)
        ]);
        
        console.log(`[DEBUG] Fetched passport for ${studentId}:`, {
          skills: { count: skillsRes.data?.length, error: skillsRes.error },
          portfolio: { count: portfolioRes.data?.length, error: portfolioRes.error },
          edu: { count: eduRes.data?.length, error: eduRes.error },
          exp: { count: expRes.data?.length, error: expRes.error },
          cert: { count: certRes.data?.length, error: certRes.error },
          interviews: { count: interviewRes.data?.length, error: interviewRes.error },
          assess: { count: assessRes.data?.length, error: assessRes.error },
          profile: { exists: !!profileRes.data, error: profileRes.error },
          feedback: { count: feedbackRes.data?.length, error: feedbackRes.error }
        });

        setData({
          skills: skillsRes.data || [],
          portfolioItems: portfolioRes.data || [],
          education: eduRes.data || [],
          experiences: expRes.data || [],
          certificates: certRes.data || [],
          completedInterviews: interviewRes.data || [],
          assessments: assessRes.data || [],
          profile: profileRes.data || null,
          industryFeedback: feedbackRes.data || []
        });

      } catch (err) {
        console.error("Error fetching passport data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPassportData();
  }, [studentId]);

  // 1. Service-driven Readiness Metrics
  const technicalMetric = calculateTechnicalScore(data.skills, data.completedInterviews);
  const softSkillsMetric = calculateSoftSkillsScore(data.skills, data.completedInterviews);
  const aptitudeMetric = calculateAptitudeScore(data.assessments);
  
  const resumeMetric = calculateResumeScore(
    data.profile,
    data.skills.length,
    data.education.length,
    data.experiences.length,
    data.portfolioItems.length,
    data.certificates.length
  );
  
  const portfolioMetric = calculatePortfolioScore(data.portfolioItems);
  const githubMetric = calculateGitHubScore(data.profile?.github, data.portfolioItems);
  
  const linkedinMetric = calculateLinkedInScore(
    data.profile,
    data.skills.length,
    data.education.length,
    data.experiences.length
  );
  
  const experienceMetric = calculateExperienceScore(
    data.portfolioItems,
    data.certificates.length,
    data.certificates,
    0 // courses not easily available here
  );

  // 2. Overall Score (weighted average - dynamic)
  let weightedSum = 0;
  let totalWeight = 0;

  if (technicalMetric.attempted) { weightedSum += technicalMetric.score * READINESS_WEIGHTS.technical; totalWeight += READINESS_WEIGHTS.technical; }
  if (softSkillsMetric.attempted) { weightedSum += softSkillsMetric.score * READINESS_WEIGHTS.softSkills; totalWeight += READINESS_WEIGHTS.softSkills; }
  if (aptitudeMetric.attempted) { weightedSum += aptitudeMetric.score * READINESS_WEIGHTS.aptitude; totalWeight += READINESS_WEIGHTS.aptitude; }
  if (resumeMetric.attempted) { weightedSum += resumeMetric.score * READINESS_WEIGHTS.resume; totalWeight += READINESS_WEIGHTS.resume; }
  if (portfolioMetric.attempted) { weightedSum += portfolioMetric.score * READINESS_WEIGHTS.portfolio; totalWeight += READINESS_WEIGHTS.portfolio; }
  if (githubMetric.attempted) { weightedSum += githubMetric.score * READINESS_WEIGHTS.github; totalWeight += READINESS_WEIGHTS.github; }
  if (linkedinMetric.attempted) { weightedSum += linkedinMetric.score * READINESS_WEIGHTS.linkedin; totalWeight += READINESS_WEIGHTS.linkedin; }
  if (experienceMetric.attempted) { weightedSum += experienceMetric.score * READINESS_WEIGHTS.experience; totalWeight += READINESS_WEIGHTS.experience; }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return {
    loading,
    data,
    metrics: {
      technical: technicalMetric,
      softSkills: softSkillsMetric,
      aptitude: aptitudeMetric,
      resume: resumeMetric,
      portfolio: portfolioMetric,
      github: githubMetric,
      linkedin: linkedinMetric,
      experience: experienceMetric,
      overallScore
    }
  };
}
