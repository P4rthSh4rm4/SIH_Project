"use client";

import { useMemo } from "react";
import { useDigitalPortfolio } from "./useDigitalPortfolio";
import { useAssessments } from "./useAssessments";
import { useMockInterview } from "./useMockInterview";
import { useEducation } from "./useEducation";
import { useExperience } from "./useExperience";
import { getCareerPaths, CAREER_PATHS } from "@/lib/data/career-paths";

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
const CSE_WEIGHTS = {
  technical:  0.25,
  softSkills: 0.15,
  aptitude:   0.15,
  resume:     0.10,
  portfolio:  0.10,
  github:     0.10,
  linkedin:   0.05,
  experience: 0.10,
} as const;

const AYURVEDA_WEIGHTS = {
  technical:  0.30,
  softSkills: 0.20,
  aptitude:   0.10,
  resume:     0.15,
  portfolio:  0.10,
  github:     0.00,
  linkedin:   0.00,
  experience: 0.15,
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

  const isAyurveda = portfolio.profile?.department === "Ayurveda";
  const weights = isAyurveda ? AYURVEDA_WEIGHTS : CSE_WEIGHTS;

  const overallScore = useMemo(() => {
    let weightedSum = 0;
    let totalWeight = 0;

    if (technicalMetric.attempted) {
      weightedSum += technicalMetric.score * weights.technical;
      totalWeight += weights.technical;
    }
    if (softSkillsMetric.attempted) {
      weightedSum += softSkillsMetric.score * weights.softSkills;
      totalWeight += weights.softSkills;
    }
    if (aptitudeMetric.attempted) {
      weightedSum += aptitudeMetric.score * weights.aptitude;
      totalWeight += weights.aptitude;
    }
    if (resumeMetric.attempted) {
      weightedSum += resumeMetric.score * weights.resume;
      totalWeight += weights.resume;
    }
    if (portfolioMetric.attempted) {
      weightedSum += portfolioMetric.score * weights.portfolio;
      totalWeight += weights.portfolio;
    }
    if (githubMetric.attempted && !isAyurveda) {
      weightedSum += githubMetric.score * weights.github;
      totalWeight += weights.github;
    }
    if (linkedinMetric.attempted) {
      weightedSum += linkedinMetric.score * weights.linkedin;
      totalWeight += weights.linkedin;
    }
    if (experienceMetric.attempted) {
      weightedSum += experienceMetric.score * weights.experience;
      totalWeight += weights.experience;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }, [
    technicalMetric, softSkillsMetric, aptitudeMetric,
    resumeMetric, portfolioMetric, githubMetric,
    linkedinMetric, experienceMetric, weights, isAyurveda
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
    if (technicalMetric.attempted && technicalMetric.score >= 70) {
      s.push(isAyurveda ? "Strong Clinical & Domain Skills" : "Strong Technical Skills");
    }
    if (portfolioMetric.attempted && portfolioMetric.score >= 70) {
      s.push(isAyurveda ? "Excellent Clinical/Research Portfolio" : "Excellent Project Portfolio");
    }
    if (experienceMetric.attempted && experienceMetric.score >= 60) {
      s.push(isAyurveda ? "Solid Clinical Training & Certifications" : "Solid Experience & Certifications");
    }
    if (resumeMetric.attempted && resumeMetric.score >= 70) s.push("ATS-Optimized Resume");
    if (portfolio.completedRoadmaps.length > 0) s.push("Completed Career Roadmap");
    if (portfolio.skills.some((sk: any) => sk.verified)) s.push("Platform Verified Skills");
    if (softSkillsMetric.attempted && softSkillsMetric.score >= 70) s.push("Strong Soft Skills");
    if (githubMetric.attempted && githubMetric.score >= 60 && !isAyurveda) s.push("Active GitHub Presence");
    return s;
  }, [technicalMetric, portfolioMetric, experienceMetric, resumeMetric, portfolio.completedRoadmaps, portfolio.skills, softSkillsMetric, githubMetric, isAyurveda]);

  // ─── 5. Improvements (aggregated from all services) ──────

  const improvements = useMemo(() => {
    const allRecs: Array<{ title: string; priority: string; impact: string; action: string }> = [];

    // Collect the top recommendations from each service that has missing items
    const metricMap: Array<{ metric: ReadinessMetric; label: string; weight: number }> = [
      { metric: technicalMetric, label: isAyurveda ? "Clinical & Domain Skills" : "Technical Skills", weight: weights.technical },
      { metric: softSkillsMetric, label: "Soft Skills", weight: weights.softSkills },
      { metric: aptitudeMetric, label: "Aptitude", weight: weights.aptitude },
      { metric: resumeMetric, label: "Resume ATS", weight: weights.resume },
      { metric: portfolioMetric, label: "Portfolio", weight: weights.portfolio },
      ...(isAyurveda ? [] : [
        { metric: githubMetric, label: "GitHub", weight: weights.github },
        { metric: linkedinMetric, label: "LinkedIn", weight: weights.linkedin }
      ]),
      { metric: experienceMetric, label: "Experience", weight: weights.experience },
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
  }, [technicalMetric, softSkillsMetric, aptitudeMetric, resumeMetric, portfolioMetric, githubMetric, linkedinMetric, experienceMetric, weights, isAyurveda]);

  // ─── 6. Placement Checklist ───────────────────────────────

  const checklist = useMemo(() => {
    const list = [
      { id: "resume", label: "Resume uploaded", done: !!portfolio.profile?.resume_url },
      { id: "profile", label: "Profile completed", done: linkedinMetric.score >= 70 },
      { id: "portfolio", label: isAyurveda ? "Clinical Cases/Research Added" : "Portfolio projects added", done: portfolioMetric.attempted },
      { id: "cert", label: "Certifications earned", done: portfolio.stats.certificates > 0 },
      { id: "skills", label: "Skills verified", done: portfolio.skills.some((s: any) => s.verified) },
      { id: "interview", label: "Mock interview completed", done: completedInterviews.length > 0 },
    ];
    if (!isAyurveda) {
      list.splice(3, 0, { id: "github", label: "GitHub linked", done: githubMetric.attempted });
      list.splice(4, 0, { id: "linkedin", label: "LinkedIn linked", done: !!portfolio.profile?.linkedin });
    }
    return list;
  }, [portfolio.profile, linkedinMetric.score, portfolioMetric.attempted, githubMetric.attempted, portfolio.stats.certificates, portfolio.skills, completedInterviews.length, isAyurveda]);

  const checklistProgress = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  // ─── 7. Industry Readiness (Domains) ──────────────────────

  const industryReadiness = useMemo(() => {
    if (isAyurveda) {
      const paths = getCareerPaths("Ayurveda");
      return paths.map(path => {
        // Map required skills to actual student skills
        const reqSkills = path.requiredSkills.map(s => s.toLowerCase());
        const matched = portfolio.skills.filter((s: any) => reqSkills.includes(s.skill?.name?.toLowerCase()));
        
        let score = 0;
        if (reqSkills.length > 0) {
          // If no skills are verified/matched, score stays low
          const matchRatio = matched.length / reqSkills.length;
          score = Math.round((overallScore * 0.5) + (matchRatio * 50));
        } else {
          score = overallScore;
        }
        return { name: path.title, score };
      });
    }

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
  }, [overallScore, portfolio.skills, isAyurveda]);

  // ─── 8. Company Eligibility ───────────────────────────────

  const companyEligibility = useMemo((): CompanyEligibility[] => {
    const companies: CompanyEligibility[] = [];

    if (isAyurveda) {
      companies.push({
        company: "Top Ayurveda Hospitals & Wellness Centers",
        role: "Clinical Practitioner",
        status: overallScore >= 90 && portfolio.stats.projects >= 2 ? "Eligible" : overallScore >= 75 ? "Nearly Eligible" : "Not Eligible",
        reasons: overallScore < 90 ? ["Requires 90%+ Overall Readiness", "Needs documented clinical cases"] : [],
      });

      companies.push({
        company: "Ayurvedic Pharma",
        role: "Pharma Specialist",
        status: portfolio.stats.projects >= 2 && technicalMetric.score >= 70 ? "Eligible" : portfolio.stats.projects >= 1 ? "Nearly Eligible" : "Not Eligible",
        reasons: portfolio.stats.projects < 2 ? ["Needs minimum 2 clinical/research projects"] : [],
      });

      companies.push({
        company: "Ayurveda Research",
        role: "Ayurveda Researcher",
        status: overallScore >= 60 && !!portfolio.profile?.resume_url ? "Eligible" : "Not Eligible",
        reasons: overallScore < 60 ? ["Requires 60%+ Overall Readiness"] : !portfolio.profile?.resume_url ? ["Resume upload required"] : [],
      });
      return companies;
    }

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
  }, [overallScore, portfolio.stats, technicalMetric.score, portfolio.profile, isAyurveda]);

  // ─── 9. Placement Timeline ────────────────────────────────

  const placementTimeline = useMemo(() => [
    { id: "t1", title: "Profile Created", status: "completed" },
    { id: "t2", title: "Resume Uploaded", status: portfolio.profile?.resume_url ? "completed" : "pending" },
    { id: "t3", title: "Skill Assessment", status: assessmentHistory.length > 0 ? "completed" : "pending" },
    { id: "t4", title: isAyurveda ? "Clinical Case/Research Added" : "Project Added", status: portfolio.stats.projects > 0 ? "completed" : "pending" },
    { id: "t5", title: "Certification Earned", status: portfolio.stats.certificates > 0 ? "completed" : "pending" },
    { id: "t6", title: "Mock Interview", status: completedInterviews.length > 0 ? "completed" : "pending" },
    { id: "t7", title: "Placement Ready", status: overallScore >= 80 ? "completed" : "in-progress" },
  ], [portfolio.profile, assessmentHistory.length, portfolio.stats, completedInterviews.length, overallScore, isAyurveda]);

  // ─── 10. Dynamic Insights ─────────────────────────────────

  const placementInsights = useMemo(() => {
    const insights: string[] = [];

    if (technicalMetric.score > softSkillsMetric.score + 20) {
      insights.push(
        isAyurveda 
          ? "Your clinical and domain knowledge is strong, but improving patient communication and soft skills will dramatically increase your readiness."
          : "Your technical skills are strong, but improving communication and soft skills will dramatically increase your hiring chances."
      );
    } else if (softSkillsMetric.score > technicalMetric.score + 20) {
      insights.push(
        isAyurveda
          ? "You have great communication skills. Focus on documenting more clinical cases and deepening domain knowledge to balance your profile."
          : "You have great soft skills. Focus on building more technical projects to balance your profile."
      );
    }

    if (overallScore >= 80) {
      insights.push("Recruiters are highly likely to shortlist your profile. Keep your resume updated and start applying!");
    } else if (overallScore >= 60) {
      insights.push("You are on the right track. Focus on your improvement areas to reach the 'Excellent' readiness tier.");
    } else if (overallScore > 0) {
      insights.push("You have just started your placement journey. Follow the checklist and timeline to build a strong profile.");
    }

    if (portfolio.stats.projects > 0 && portfolio.stats.certificates === 0) {
      insights.push(
        isAyurveda
          ? "You have practical experience through clinical cases. Earning an Ayurveda certification will validate those skills for hospitals."
          : "You have practical experience through projects. Earning a certificate will validate those skills for recruiters."
      );
    }

    if (!aptitudeMetric.attempted) {
      insights.push("Take the Aptitude Assessment to unlock a portion of your overall readiness score.");
    }

    if (!githubMetric.attempted && !isAyurveda) {
      insights.push("Link your GitHub profile and connect your repositories to improve your score.");
    }

    return insights;
  }, [technicalMetric.score, softSkillsMetric.score, overallScore, portfolio.stats, aptitudeMetric.attempted, githubMetric.attempted, isAyurveda]);

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
      weights,
    },
  };
}
