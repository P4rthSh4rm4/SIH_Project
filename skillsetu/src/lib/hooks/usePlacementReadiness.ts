"use client";

import { useMemo } from "react";
import { useDigitalPortfolio } from "./useDigitalPortfolio";
import { useAssessments } from "./useAssessments";
import { useMockInterview } from "./useMockInterview";
import { CAREER_PATHS } from "@/lib/data/career-paths";

export interface CompanyEligibility {
  company: string;
  role: string;
  status: "Eligible" | "Nearly Eligible" | "Not Eligible";
  reasons: string[];
}

export function usePlacementReadiness() {
  const portfolio = useDigitalPortfolio();
  const { history: assessmentHistory } = useAssessments();
  const { interviews } = useMockInterview();

  const completedInterviews = useMemo(() => interviews.filter(i => i.status === 'Completed' && i.overall_score !== null), [interviews]);

  // 1. Core Scores (0-100)
  const technicalScore = useMemo(() => {
    const verifiedSkillsCount = portfolio.skills.filter((s: any) => s.verified || s.proficiency_score >= 80).length;
    let baseScore = Math.min(verifiedSkillsCount * 10, 60); // Max 60 from skills
    baseScore += Math.min(portfolio.stats.projects * 10, 40); // Max 40 from projects
    
    // Blend with Mock Interview Technical Score
    if (completedInterviews.length > 0) {
      const avgMockTech = completedInterviews.reduce((acc, i) => acc + (i.technical_score || 0), 0) / completedInterviews.length;
      return Math.round((baseScore * 0.4) + (avgMockTech * 0.6)); // Mock interview weighs heavily
    }
    return baseScore;
  }, [portfolio.skills, portfolio.stats.projects, completedInterviews]);

  const softSkillsScore = useMemo(() => {
    // Derived from communication skills if any, else default to 40 + courses
    const commSkill = portfolio.skills.find((s: any) => s.skill?.name?.toLowerCase().includes("communication"));
    let baseScore = commSkill ? commSkill.proficiency_score || 50 : 40;
    baseScore += Math.min(portfolio.stats.courses * 2, 20); // active learning shows soft skills
    
    // Blend with Mock Interview Communication Score
    if (completedInterviews.length > 0) {
      const avgMockComm = completedInterviews.reduce((acc, i) => acc + (i.communication_score || 0), 0) / completedInterviews.length;
      return Math.round((baseScore * 0.4) + (avgMockComm * 0.6));
    }
    return Math.min(baseScore, 100);
  }, [portfolio.skills, portfolio.stats.courses, completedInterviews]);

  const aptitudeScore = useMemo(() => {
    const aptAssessments = assessmentHistory.filter((a: any) => a.type === "aptitude" || a.title?.toLowerCase().includes("aptitude"));
    if (aptAssessments.length === 0) return 0;
    const avg = aptAssessments.reduce((acc, a: any) => acc + (a.score || 0), 0) / aptAssessments.length;
    return Math.round(avg);
  }, [assessmentHistory]);

  const atsScore = useMemo(() => {
    let score = 0;
    if (portfolio.profile?.resume_url) score += 40; // Having a resume is huge
    if (portfolio.profile?.bio && portfolio.profile?.career_objective) score += 20;
    score += Math.min(portfolio.skills.length * 2, 20); // Keywords
    score += Math.min(portfolio.stats.projects * 5, 20); // Experience
    return score;
  }, [portfolio.profile, portfolio.skills.length, portfolio.stats.projects]);

  const githubScore = useMemo(() => {
    let score = 0;
    if (portfolio.profile?.github) score += 50;
    if (portfolio.stats.projects > 0) score += 30;
    if (portfolio.stats.projects > 2) score += 20;
    return score;
  }, [portfolio.profile?.github, portfolio.stats.projects]);

  const linkedinScore = useMemo(() => {
    let score = 0;
    if (portfolio.profile?.linkedin) score += 50;
    if (portfolio.profile?.avatar_url) score += 20;
    if (portfolio.profile?.career_objective) score += 15;
    if (portfolio.profile?.bio) score += 15;
    return score;
  }, [portfolio.profile]);

  const overallScore = useMemo(() => {
    const weights = [
      { score: technicalScore, weight: 0.3 },
      { score: atsScore, weight: 0.2 },
      { score: portfolio.recruiterScore, weight: 0.2 },
      { score: softSkillsScore, weight: 0.1 },
      { score: githubScore, weight: 0.1 },
      { score: linkedinScore, weight: 0.1 },
    ];
    let total = 0;
    weights.forEach(w => {
      total += w.score * w.weight;
    });
    return Math.round(total);
  }, [technicalScore, atsScore, portfolio.recruiterScore, softSkillsScore, githubScore, linkedinScore]);

  // Status mapping
  const getReadinessStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  const status = getReadinessStatus(overallScore);

  // 2. Strengths & Improvement Areas
  const strengths = useMemo(() => {
    const s = [];
    if (technicalScore >= 80) s.push("Strong Technical Skills");
    if (portfolio.stats.projects >= 3) s.push("Excellent Project Portfolio");
    if (portfolio.stats.certificates >= 1) s.push("Multiple Certifications");
    if (atsScore >= 80) s.push("ATS-Optimized Resume");
    if (portfolio.completedRoadmaps.length > 0) s.push("Completed Career Roadmap");
    if (portfolio.skills.some((sk: any) => sk.verified)) s.push("Platform Verified Skills");
    return s;
  }, [technicalScore, portfolio.stats, atsScore, portfolio.completedRoadmaps, portfolio.skills]);

  const improvements = useMemo(() => {
    const i = [];
    if (!portfolio.profile?.resume_url) {
      i.push({ title: "Upload Resume", priority: "High", impact: "+15% ATS Score", action: "Upload your resume in Profile settings." });
    }
    if (!portfolio.profile?.github) {
      i.push({ title: "Link GitHub", priority: "High", impact: "+10% Portfolio Score", action: "Add your GitHub URL to your profile." });
    }
    if (!portfolio.profile?.linkedin) {
      i.push({ title: "Link LinkedIn", priority: "High", impact: "+10% Profile Score", action: "Add your LinkedIn URL to your profile." });
    }
    if (portfolio.stats.projects === 0) {
      i.push({ title: "Add Projects", priority: "High", impact: "+20% Technical Score", action: "Build and add a project to your portfolio." });
    }
    if (portfolio.stats.certificates === 0) {
      i.push({ title: "Earn Certifications", priority: "Medium", impact: "+15% Recruiter Score", action: "Complete a career roadmap to earn a certificate." });
    }
    if (aptitudeScore === 0) {
      i.push({ title: "Take Aptitude Test", priority: "Medium", impact: "Unlocks Aptitude Score", action: "Complete an aptitude assessment." });
    }
    return i;
  }, [portfolio.profile, portfolio.stats, aptitudeScore]);

  // 3. Placement Checklist
  const checklist = useMemo(() => {
    return [
      { id: "resume", label: "Resume uploaded", done: !!portfolio.profile?.resume_url },
      { id: "profile", label: "Profile completed", done: linkedinScore >= 80 },
      { id: "portfolio", label: "Portfolio completed", done: portfolio.stats.projects > 0 && !!portfolio.profile?.bio },
      { id: "github", label: "GitHub linked", done: !!portfolio.profile?.github },
      { id: "linkedin", label: "LinkedIn linked", done: !!portfolio.profile?.linkedin },
      { id: "cert", label: "Certificates Added", done: portfolio.stats.certificates > 0 },
      { id: "skills", label: "Skills Verified", done: portfolio.skills.some((s: any) => s.verified) }
    ];
  }, [portfolio.profile, linkedinScore, portfolio.stats, portfolio.skills]);

  const checklistProgress = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  // 4. Industry Readiness (Domains)
  const industryReadiness = useMemo(() => {
    const domains = [];
    
    // Check specific domains based on CAREER_PATHS or keywords
    const hasData = portfolio.skills.some((s: any) => ['python', 'sql', 'data', 'pandas', 'machine learning'].includes(s.skill?.name?.toLowerCase()));
    const hasFrontend = portfolio.skills.some((s: any) => ['react', 'html', 'css', 'javascript', 'frontend'].includes(s.skill?.name?.toLowerCase()));
    const hasBackend = portfolio.skills.some((s: any) => ['node', 'express', 'python', 'java', 'backend', 'sql'].includes(s.skill?.name?.toLowerCase()));
    
    domains.push({ name: "Software Engineer", score: Math.max(overallScore - 5, 0) });
    domains.push({ name: "Data Analyst", score: hasData ? Math.max(overallScore + 5, 50) : Math.max(overallScore - 20, 10) });
    domains.push({ name: "Frontend Developer", score: hasFrontend ? Math.max(overallScore + 10, 60) : Math.max(overallScore - 15, 20) });
    domains.push({ name: "Backend Developer", score: hasBackend ? Math.max(overallScore + 10, 60) : Math.max(overallScore - 15, 20) });
    domains.push({ name: "Full Stack Developer", score: (hasFrontend && hasBackend) ? Math.max(overallScore + 15, 70) : Math.max(overallScore - 10, 30) });

    return domains;
  }, [overallScore, portfolio.skills]);

  // 5. Company Eligibility Checker
  const companyEligibility = useMemo(() => {
    const companies: CompanyEligibility[] = [];
    
    // Example logic based on scores
    companies.push({
      company: "Top Tech (FAANG)",
      role: "SDE I",
      status: overallScore >= 90 && portfolio.stats.projects >= 2 ? "Eligible" : overallScore >= 75 ? "Nearly Eligible" : "Not Eligible",
      reasons: overallScore < 90 ? ["Requires 90%+ Overall Readiness", "Needs strong DSA/Projects"] : []
    });

    companies.push({
      company: "Startups",
      role: "Full Stack Developer",
      status: portfolio.stats.projects >= 3 && technicalScore >= 70 ? "Eligible" : portfolio.stats.projects >= 1 ? "Nearly Eligible" : "Not Eligible",
      reasons: portfolio.stats.projects < 3 ? ["Needs minimum 3 portfolio projects"] : []
    });

    companies.push({
      company: "Service Based IT",
      role: "Systems Engineer",
      status: overallScore >= 60 && !!portfolio.profile?.resume_url ? "Eligible" : "Not Eligible",
      reasons: overallScore < 60 ? ["Requires 60%+ Overall Readiness"] : !portfolio.profile?.resume_url ? ["Resume upload required"] : []
    });

    return companies;
  }, [overallScore, portfolio.stats, technicalScore, portfolio.profile]);

  // 6. Placement Timeline
  const placementTimeline = useMemo(() => {
    return [
      { id: "t1", title: "Profile Created", status: "completed" },
      { id: "t2", title: "Resume Uploaded", status: portfolio.profile?.resume_url ? "completed" : "pending" },
      { id: "t3", title: "Skill Assessment", status: assessmentHistory.length > 0 ? "completed" : "pending" },
      { id: "t4", title: "Project Added", status: portfolio.stats.projects > 0 ? "completed" : "pending" },
      { id: "t5", title: "Certification Earned", status: portfolio.stats.certificates > 0 ? "completed" : "pending" },
      { id: "t6", title: "Mock Interview", status: "pending" }, // Future feature placeholder
      { id: "t7", title: "Placement Ready", status: overallScore >= 80 ? "completed" : "in-progress" },
    ];
  }, [portfolio.profile, assessmentHistory.length, portfolio.stats, overallScore]);

  // 7. AI Insights (Dynamic based on data)
  const placementInsights = useMemo(() => {
    const insights = [];
    if (technicalScore > softSkillsScore + 20) {
      insights.push("Your technical skills are strong, but improving communication and soft skills will dramatically increase your hiring chances.");
    } else if (softSkillsScore > technicalScore + 20) {
      insights.push("You have great soft skills. Focus on building more technical projects to balance your profile.");
    }
    
    if (overallScore >= 80) {
      insights.push("Recruiters are highly likely to shortlist your profile. Keep your resume updated and start applying!");
    } else if (overallScore >= 60) {
      insights.push("You are on the right track. Focus on your improvement areas to reach the 'Excellent' readiness tier.");
    } else {
      insights.push("You have just started your placement journey. Follow the checklist and timeline to build a strong profile.");
    }

    if (portfolio.stats.projects > 0 && portfolio.stats.certificates === 0) {
      insights.push("You have practical experience through projects. Earning a certificate will validate those skills for recruiters.");
    }

    return insights;
  }, [technicalScore, softSkillsScore, overallScore, portfolio.stats]);

  return {
    ...portfolio, // inherit all portfolio stuff
    readiness: {
      overallScore,
      status,
      technicalScore,
      softSkillsScore,
      aptitudeScore,
      atsScore,
      githubScore,
      linkedinScore,
      strengths,
      improvements,
      checklist,
      checklistProgress,
      industryReadiness,
      companyEligibility,
      placementTimeline,
      placementInsights,
      probability: Math.min(overallScore + (portfolio.stats.projects * 2), 98) // e.g. 87%
    }
  };
}
