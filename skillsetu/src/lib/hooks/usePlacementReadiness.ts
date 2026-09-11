"use client";

import { useMemo } from "react";
import { useDigitalPortfolio } from "./useDigitalPortfolio";
import { useAssessments } from "./useAssessments";
import { useMockInterview } from "./useMockInterview";
import { useEducation } from "./useEducation";
import { useExperience } from "./useExperience";
import { CAREER_PATHS } from "@/lib/data/career-paths";

import {
  calculateTechnicalScore,
  calculateSoftSkillsScore,
  calculateAptitudeScore,
  calculateResumeScore,
  calculatePortfolioScore,
  calculateGitHubScore,
  calculateLinkedInScore,
  calculateExperienceScore,
  type ReadinessMetric,
} from "@/lib/services/readiness";

export interface CompanyEligibility {
  company: string;
  role: string;
  status: "Eligible" | "Nearly Eligible" | "Not Eligible";
  reasons: string[];
}

// ── Overall Readiness Weights ──────────────────────────────
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

export function usePlacementReadiness() {
  const portfolio = useDigitalPortfolio();
  const { history: assessmentHistory } = useAssessments();
  const { interviews } = useMockInterview();
  const { education } = useEducation();
  const { experiences } = useExperience();

  const completedInterviews = useMemo(
    () => interviews.filter(i => i.status === "Completed" && i.overall_score !== null),
    [interviews]
  );

  // ─── 1. Service-driven Readiness Metrics ─────────────────

  const technicalMetric: ReadinessMetric = useMemo(
    () => calculateTechnicalScore(portfolio.skills, completedInterviews),
    [portfolio.skills, completedInterviews]
  );

  const softSkillsMetric: ReadinessMetric = useMemo(
    () => calculateSoftSkillsScore(portfolio.skills, completedInterviews),
    [portfolio.skills, completedInterviews]
  );

  const aptitudeMetric: ReadinessMetric = useMemo(
    () => calculateAptitudeScore(assessmentHistory),
    [assessmentHistory]
  );

  const resumeMetric: ReadinessMetric = useMemo(
    () =>
      calculateResumeScore(
        portfolio.profile,
        portfolio.skills.length,
        education.length,
        experiences.length,
        portfolio.stats.projects,
        portfolio.stats.certificates
      ),
    [portfolio.profile, portfolio.skills.length, education.length, experiences.length, portfolio.stats.projects, portfolio.stats.certificates]
  );

  const portfolioMetric: ReadinessMetric = useMemo(
    () => calculatePortfolioScore(portfolio.portfolioItems),
    [portfolio.portfolioItems]
  );

  const githubMetric: ReadinessMetric = useMemo(
    () => calculateGitHubScore(portfolio.profile?.github, portfolio.portfolioItems),
    [portfolio.profile?.github, portfolio.portfolioItems]
  );

  const linkedinMetric: ReadinessMetric = useMemo(
    () =>
      calculateLinkedInScore(
        portfolio.profile,
        portfolio.skills.length,
        education.length,
        experiences.length
      ),
    [portfolio.profile, portfolio.skills.length, education.length, experiences.length]
  );

  const experienceMetric: ReadinessMetric = useMemo(
    () =>
      calculateExperienceScore(
        portfolio.portfolioItems,
        portfolio.stats.certificates,
        portfolio.certificates,
        portfolio.stats.courses
      ),
    [portfolio.portfolioItems, portfolio.stats.certificates, portfolio.certificates, portfolio.stats.courses]
  );

  // ─── 2. Overall Score (weighted average) ──────────────────

  const overallScore = useMemo(() => {
    const total =
      technicalMetric.score  * READINESS_WEIGHTS.technical +
      softSkillsMetric.score * READINESS_WEIGHTS.softSkills +
      aptitudeMetric.score   * READINESS_WEIGHTS.aptitude +
      resumeMetric.score     * READINESS_WEIGHTS.resume +
      portfolioMetric.score  * READINESS_WEIGHTS.portfolio +
      githubMetric.score     * READINESS_WEIGHTS.github +
      linkedinMetric.score   * READINESS_WEIGHTS.linkedin +
      experienceMetric.score * READINESS_WEIGHTS.experience;

    return Math.round(total);
  }, [
    technicalMetric.score, softSkillsMetric.score, aptitudeMetric.score,
    resumeMetric.score, portfolioMetric.score, githubMetric.score,
    linkedinMetric.score, experienceMetric.score,
  ]);

  // ─── 3. Status ────────────────────────────────────────────

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  const status = getReadinessStatus(overallScore);

  // ─── 4. Strengths (derived from real metric data) ────────

  const strengths = useMemo(() => {
    const s: string[] = [];
    if (technicalMetric.attempted && technicalMetric.score >= 70) s.push("Strong Technical Skills");
    if (portfolioMetric.attempted && portfolioMetric.score >= 70) s.push("Excellent Project Portfolio");
    if (experienceMetric.attempted && experienceMetric.score >= 60) s.push("Solid Experience & Certifications");
    if (resumeMetric.attempted && resumeMetric.score >= 70) s.push("ATS-Optimized Resume");
    if (portfolio.completedRoadmaps.length > 0) s.push("Completed Career Roadmap");
    if (portfolio.skills.some((sk: any) => sk.verified)) s.push("Platform Verified Skills");
    if (softSkillsMetric.attempted && softSkillsMetric.score >= 70) s.push("Strong Soft Skills");
    if (githubMetric.attempted && githubMetric.score >= 60) s.push("Active GitHub Presence");
    return s;
  }, [technicalMetric, portfolioMetric, experienceMetric, resumeMetric, portfolio.completedRoadmaps, portfolio.skills, softSkillsMetric, githubMetric]);

  // ─── 5. Improvements (aggregated from all services) ──────

  const improvements = useMemo(() => {
    const allRecs: Array<{ title: string; priority: string; impact: string; action: string }> = [];

    // Collect the top recommendations from each service that has missing items
    const metricMap: Array<{ metric: ReadinessMetric; label: string; weight: number }> = [
      { metric: technicalMetric, label: "Technical Skills", weight: READINESS_WEIGHTS.technical },
      { metric: softSkillsMetric, label: "Soft Skills", weight: READINESS_WEIGHTS.softSkills },
      { metric: aptitudeMetric, label: "Aptitude", weight: READINESS_WEIGHTS.aptitude },
      { metric: resumeMetric, label: "Resume ATS", weight: READINESS_WEIGHTS.resume },
      { metric: portfolioMetric, label: "Portfolio", weight: READINESS_WEIGHTS.portfolio },
      { metric: githubMetric, label: "GitHub", weight: READINESS_WEIGHTS.github },
      { metric: linkedinMetric, label: "LinkedIn", weight: READINESS_WEIGHTS.linkedin },
      { metric: experienceMetric, label: "Experience", weight: READINESS_WEIGHTS.experience },
    ];

    // Sort by weight descending so highest-impact recommendations come first
    const sorted = [...metricMap].sort((a, b) => b.weight - a.weight);

    for (const { metric, label, weight } of sorted) {
      if (metric.recommendations.length > 0) {
        const priority = weight >= 0.15 ? "High" : weight >= 0.10 ? "Medium" : "Low";
        // Take only the first recommendation per service to avoid overwhelming the user
        allRecs.push({
          title: label,
          priority,
          impact: `${Math.round(weight * 100)}% of Overall Score`,
          action: metric.recommendations[0],
        });
      }
    }

    return allRecs;
  }, [technicalMetric, softSkillsMetric, aptitudeMetric, resumeMetric, portfolioMetric, githubMetric, linkedinMetric, experienceMetric]);

  // ─── 6. Placement Checklist ───────────────────────────────

  const checklist = useMemo(() => [
    { id: "resume", label: "Resume uploaded", done: !!portfolio.profile?.resume_url },
    { id: "profile", label: "Profile completed", done: linkedinMetric.score >= 70 },
    { id: "portfolio", label: "Portfolio projects added", done: portfolioMetric.attempted },
    { id: "github", label: "GitHub linked", done: githubMetric.attempted },
    { id: "linkedin", label: "LinkedIn linked", done: !!portfolio.profile?.linkedin },
    { id: "cert", label: "Certifications earned", done: portfolio.stats.certificates > 0 },
    { id: "skills", label: "Skills verified", done: portfolio.skills.some((s: any) => s.verified) },
    { id: "interview", label: "Mock interview completed", done: completedInterviews.length > 0 },
  ], [portfolio.profile, linkedinMetric.score, portfolioMetric.attempted, githubMetric.attempted, portfolio.stats.certificates, portfolio.skills, completedInterviews.length]);

  const checklistProgress = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  // ─── 7. Industry Readiness (Domains) ──────────────────────

  const industryReadiness = useMemo(() => {
    const domains = [];
    const hasData = portfolio.skills.some((s: any) => ["python", "sql", "data", "pandas", "machine learning"].includes(s.skill?.name?.toLowerCase()));
    const hasFrontend = portfolio.skills.some((s: any) => ["react", "html", "css", "javascript", "frontend"].includes(s.skill?.name?.toLowerCase()));
    const hasBackend = portfolio.skills.some((s: any) => ["node", "express", "python", "java", "backend", "sql"].includes(s.skill?.name?.toLowerCase()));

    domains.push({ name: "Software Engineer", score: Math.max(overallScore - 5, 0) });
    domains.push({ name: "Data Analyst", score: hasData ? Math.min(overallScore + 5, 100) : Math.max(overallScore - 20, 0) });
    domains.push({ name: "Frontend Developer", score: hasFrontend ? Math.min(overallScore + 10, 100) : Math.max(overallScore - 15, 0) });
    domains.push({ name: "Backend Developer", score: hasBackend ? Math.min(overallScore + 10, 100) : Math.max(overallScore - 15, 0) });
    domains.push({ name: "Full Stack Developer", score: (hasFrontend && hasBackend) ? Math.min(overallScore + 15, 100) : Math.max(overallScore - 10, 0) });

    return domains;
  }, [overallScore, portfolio.skills]);

  // ─── 8. Company Eligibility ───────────────────────────────

  const companyEligibility = useMemo((): CompanyEligibility[] => {
    const companies: CompanyEligibility[] = [];

    companies.push({
      company: "Top Tech (FAANG)",
      role: "SDE I",
      status: overallScore >= 90 && portfolio.stats.projects >= 2 ? "Eligible" : overallScore >= 75 ? "Nearly Eligible" : "Not Eligible",
      reasons: overallScore < 90 ? ["Requires 90%+ Overall Readiness", "Needs strong DSA/Projects"] : [],
    });

    companies.push({
      company: "Startups",
      role: "Full Stack Developer",
      status: portfolio.stats.projects >= 3 && technicalMetric.score >= 70 ? "Eligible" : portfolio.stats.projects >= 1 ? "Nearly Eligible" : "Not Eligible",
      reasons: portfolio.stats.projects < 3 ? ["Needs minimum 3 portfolio projects"] : [],
    });

    companies.push({
      company: "Service Based IT",
      role: "Systems Engineer",
      status: overallScore >= 60 && !!portfolio.profile?.resume_url ? "Eligible" : "Not Eligible",
      reasons: overallScore < 60 ? ["Requires 60%+ Overall Readiness"] : !portfolio.profile?.resume_url ? ["Resume upload required"] : [],
    });

    return companies;
  }, [overallScore, portfolio.stats, technicalMetric.score, portfolio.profile]);

  // ─── 9. Placement Timeline ────────────────────────────────

  const placementTimeline = useMemo(() => [
    { id: "t1", title: "Profile Created", status: "completed" },
    { id: "t2", title: "Resume Uploaded", status: portfolio.profile?.resume_url ? "completed" : "pending" },
    { id: "t3", title: "Skill Assessment", status: assessmentHistory.length > 0 ? "completed" : "pending" },
    { id: "t4", title: "Project Added", status: portfolio.stats.projects > 0 ? "completed" : "pending" },
    { id: "t5", title: "Certification Earned", status: portfolio.stats.certificates > 0 ? "completed" : "pending" },
    { id: "t6", title: "Mock Interview", status: completedInterviews.length > 0 ? "completed" : "pending" },
    { id: "t7", title: "Placement Ready", status: overallScore >= 80 ? "completed" : "in-progress" },
  ], [portfolio.profile, assessmentHistory.length, portfolio.stats, completedInterviews.length, overallScore]);

  // ─── 10. Dynamic Insights ─────────────────────────────────

  const placementInsights = useMemo(() => {
    const insights: string[] = [];

    if (technicalMetric.score > softSkillsMetric.score + 20) {
      insights.push("Your technical skills are strong, but improving communication and soft skills will dramatically increase your hiring chances.");
    } else if (softSkillsMetric.score > technicalMetric.score + 20) {
      insights.push("You have great soft skills. Focus on building more technical projects to balance your profile.");
    }

    if (overallScore >= 80) {
      insights.push("Recruiters are highly likely to shortlist your profile. Keep your resume updated and start applying!");
    } else if (overallScore >= 60) {
      insights.push("You are on the right track. Focus on your improvement areas to reach the 'Excellent' readiness tier.");
    } else if (overallScore > 0) {
      insights.push("You have just started your placement journey. Follow the checklist and timeline to build a strong profile.");
    }

    if (portfolio.stats.projects > 0 && portfolio.stats.certificates === 0) {
      insights.push("You have practical experience through projects. Earning a certificate will validate those skills for recruiters.");
    }

    if (!aptitudeMetric.attempted) {
      insights.push("Take the Aptitude Assessment to unlock 15% of your overall readiness score.");
    }

    if (!githubMetric.attempted) {
      insights.push("Link your GitHub profile and connect your repositories to improve your score.");
    }

    return insights;
  }, [technicalMetric.score, softSkillsMetric.score, overallScore, portfolio.stats, aptitudeMetric.attempted, githubMetric.attempted]);

  // ─── 11. Probability ──────────────────────────────────────

  const probability = useMemo(() => {
    // Derived entirely from the overall score — no magic additions
    return Math.min(overallScore, 98);
  }, [overallScore]);

  // ─── Return ───────────────────────────────────────────────

  return {
    ...portfolio,
    readiness: {
      overallScore,
      status,
      // Detailed metric objects for the UI breakdown
      metrics: {
        technical: technicalMetric,
        softSkills: softSkillsMetric,
        aptitude: aptitudeMetric,
        resume: resumeMetric,
        portfolio: portfolioMetric,
        github: githubMetric,
        linkedin: linkedinMetric,
        experience: experienceMetric,
      },
      // Convenience: raw scores for backward compatibility
      technicalScore: technicalMetric.score,
      softSkillsScore: softSkillsMetric.score,
      aptitudeScore: aptitudeMetric.score,
      atsScore: resumeMetric.score,
      portfolioScore: portfolioMetric.score,
      githubScore: githubMetric.score,
      linkedinScore: linkedinMetric.score,
      experienceBonus: experienceMetric.score,
      // Data-driven aggregates
      strengths,
      improvements,
      checklist,
      checklistProgress,
      industryReadiness,
      companyEligibility,
      placementTimeline,
      placementInsights,
      probability,
      weights: READINESS_WEIGHTS,
    },
  };
}
