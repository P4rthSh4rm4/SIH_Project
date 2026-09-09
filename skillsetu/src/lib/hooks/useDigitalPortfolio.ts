"use client";

import { useMemo, useState, useEffect } from "react";
import { usePortfolio } from "./usePortfolio";
import { useLearningHub } from "./useLearningHub";
import { useCareerAssessment, CareerCertificate } from "./useCareerAssessment";
import { useProfileSkills } from "./useProfileSkills";
import { useProfileData } from "./useProfileData";
import { CAREER_PATHS } from "@/lib/data/career-paths";

export function useDigitalPortfolio() {
  const { items: portfolioItems, loading: portfolioLoading, addItem, deleteItem } = usePortfolio();
  const { enrollments, loading: learningLoading } = useLearningHub();
  const { skills, loading: skillsLoading } = useProfileSkills();
  const { profile, loading: profileLoading } = useProfileData();
  const { getCertificates } = useCareerAssessment();

  const [certificates, setCertificates] = useState<CareerCertificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);

  useEffect(() => {
    getCertificates().then(data => {
      setCertificates(data);
      setCertsLoading(false);
    });

    // Fetch slug
    if (profile?.id) {
      const fetchSlug = async () => {
        const supabase = (await import("@/lib/supabase/client")).createClient();
        const { data } = await supabase.from("student_profiles").select("portfolio_slug").eq("user_id", profile.id).single();
        if (data?.portfolio_slug) {
          setPortfolioSlug(data.portfolio_slug);
        }
      };
      fetchSlug();
    }
  }, [getCertificates, profile?.id]);

  const generateSlug = async () => {
    if (!profile?.id) return null;
    const supabase = (await import("@/lib/supabase/client")).createClient();
    // Generate a random 7 char alphanumeric string
    const newSlug = Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Try updating first
    const { data, error } = await supabase
      .from("student_profiles")
      .update({ portfolio_slug: newSlug })
      .eq("user_id", profile.id)
      .select();
    
    if (!error && data && data.length > 0) {
      setPortfolioSlug(newSlug);
      return newSlug;
    }
    
    // If update failed (0 rows), try inserting
    const { data: insertData, error: insertError } = await supabase
      .from("student_profiles")
      .insert({ user_id: profile.id, portfolio_slug: newSlug })
      .select();
      
    if (!insertError && insertData && insertData.length > 0) {
      setPortfolioSlug(newSlug);
      return newSlug;
    }
    
    console.error("[generateSlug] Failed:", error || insertError);
    return null;
  };

  const loading = portfolioLoading || learningLoading || skillsLoading || profileLoading || certsLoading;

  // 1. Calculate Completed Courses
  const completedCourses = useMemo(() => {
    return enrollments.filter(e => e.progress_pct >= 100).map(e => ({
      id: e.program_id,
      title: (e as any).program?.title || "Unknown Course",
      date: new Date(e.completed_at || e.enrolled_at),
      type: "course"
    }));
  }, [enrollments]);

  // 2. Calculate Completed Roadmaps
  const completedRoadmaps = useMemo(() => {
    const roadmaps = [];
    for (const path of CAREER_PATHS) {
      const completedPhases = path.phases.filter(phase => {
        if (!("program_id" in phase)) return false;
        const match = enrollments.find(
          e => (e.program_id === (phase as any).program_id || (e as any).program?.title === phase.title) && e.progress_pct >= 100
        );
        return !!match;
      });
      if (completedPhases.length === path.phases.length && path.phases.length > 0) {
        roadmaps.push(path);
      }
    }
    return roadmaps;
  }, [enrollments]);

  // 3. Achievements
  const achievements = useMemo(() => {
    const list: Array<{id: string, title: string, description: string, date: Date, category: string, icon: string}> = [];
    
    // Manual achievements from portfolioItems
    portfolioItems.filter(p => p.type === "achievement").forEach(a => {
      list.push({
        id: `man-ach-${a.id}`,
        title: a.title,
        description: a.description || "Manual Achievement",
        date: new Date(a.created_at),
        category: "achievement",
        icon: "Trophy"
      });
    });

    // Certificates
    certificates.forEach(c => {
      list.push({
        id: `cert-ach-${c.id}`,
        title: `${CAREER_PATHS.find(p => p.id === c.career_path_id)?.title || 'Career Path'} Certified`,
        description: `Passed the final assessment with score ${c.score}%`,
        date: new Date(c.issued_at),
        category: "certificate",
        icon: "Award"
      });
    });

    // Roadmaps
    completedRoadmaps.forEach(r => {
      list.push({
        id: `roadmap-ach-${r.id}`,
        title: `Completed ${r.title} Roadmap`,
        description: "Finished all modules within this career path",
        date: new Date(), // using now since we don't have exact roadmap completion date without digging into latest course
        category: "roadmap",
        icon: "Briefcase"
      });
    });

    // Verified Skills
    skills.filter(s => s.verified || s.proficiency_score >= 100).forEach(s => {
      list.push({
        id: `skill-ach-${s.skill_id}`,
        title: `Verified ${s.skill?.name || 'Skill'}`,
        description: `Achieved verified proficiency in ${s.skill?.name || 'Skill'}`,
        date: new Date(), 
        category: "skill",
        icon: "ShieldCheck"
      });
    });

    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [portfolioItems, certificates, completedRoadmaps, skills]);

  // 3b. Milestones (Progress-based achievements)
  const milestones = useMemo(() => {
    const list = [];
    const coursesCount = completedCourses.length;
    const certCount = certificates.length;
    const projectCount = portfolioItems.filter(p => p.type === 'project').length;
    const isShared = !!portfolioSlug;
    const hasTopScore = certificates.some(c => c.score >= 90);
    const verifiedSkillsCount = skills.filter(s => s.verified || s.proficiency_score >= 100).length;
    
    // Calculate Profile Completion
    let profileFields = 0;
    if (profile?.avatar_url) profileFields++;
    if (profile?.bio) profileFields++;
    if (profile?.career_objective) profileFields++;
    if (profile?.github || profile?.linkedin || profile?.portfolio_website) profileFields++;
    const profileProgress = Math.min(Math.round((profileFields / 4) * 100), 100);

    // 1. First Course Completed
    list.push({
      id: 'm-first-course', title: 'First Course Completed', description: 'Complete your first learning program.',
      current: Math.min(coursesCount, 1), target: 1, isUnlocked: coursesCount >= 1, icon: 'BookOpen', category: 'Learning'
    });
    // 2. 5 Courses Completed
    list.push({
      id: 'm-5-courses', title: '5 Courses Completed', description: 'Complete 5 learning programs.',
      current: Math.min(coursesCount, 5), target: 5, isUnlocked: coursesCount >= 5, icon: 'BookOpen', category: 'Learning'
    });
    // 3. 10 Courses Completed
    list.push({
      id: 'm-10-courses', title: '10 Courses Completed', description: 'Complete 10 learning programs.',
      current: Math.min(coursesCount, 10), target: 10, isUnlocked: coursesCount >= 10, icon: 'BookOpen', category: 'Learning'
    });
    // 4. First Certificate Earned
    list.push({
      id: 'm-first-cert', title: 'First Certificate Earned', description: 'Pass an assessment and earn a certificate.',
      current: Math.min(certCount, 1), target: 1, isUnlocked: certCount >= 1, icon: 'Award', category: 'Certification'
    });
    // 5. Top Assessment Score
    list.push({
      id: 'm-top-score', title: 'Top Assessment Score', description: 'Score 90% or higher on an assessment.',
      current: hasTopScore ? 1 : 0, target: 1, isUnlocked: hasTopScore, icon: 'Star', category: 'Assessment'
    });
    // 6. First Portfolio Project Added
    list.push({
      id: 'm-first-project', title: 'First Portfolio Project', description: 'Add your first project to your portfolio.',
      current: Math.min(projectCount, 1), target: 1, isUnlocked: projectCount >= 1, icon: 'Code', category: 'Portfolio'
    });
    // 7. Portfolio Shared
    list.push({
      id: 'm-portfolio-shared', title: 'Portfolio Shared', description: 'Generate a public link and share your portfolio.',
      current: isShared ? 1 : 0, target: 1, isUnlocked: isShared, icon: 'Share2', category: 'Profile'
    });
    // 8. 100% Profile Completion
    list.push({
      id: 'm-profile-complete', title: '100% Profile Completion', description: 'Complete your bio, objective, links, and avatar.',
      current: profileProgress, target: 100, isUnlocked: profileProgress >= 100, icon: 'User', category: 'Profile'
    });
    // 9. Verified Skill Earned
    list.push({
      id: 'm-verified-skill', title: 'Verified Skill Earned', description: 'Earn your first verified skill badge.',
      current: Math.min(verifiedSkillsCount, 1), target: 1, isUnlocked: verifiedSkillsCount >= 1, icon: 'ShieldCheck', category: 'Skills'
    });

    return list;
  }, [completedCourses, certificates, portfolioItems, portfolioSlug, profile, skills]);

  // 4. Timeline Items (Merge courses, projects, internships, achievements, and certs)
  const timeline = useMemo(() => {
    const events: Array<{id: string, title: string, description: string, date: Date, type: string, url?: string, icon: string}> = [];
    
    completedCourses.forEach(c => {
      events.push({
        id: `course-${c.id}`,
        title: c.title,
        description: "Completed learning program",
        date: c.date,
        type: "course",
        icon: "BookOpen"
      });
    });

    portfolioItems.forEach(p => {
      events.push({
        id: `port-${p.id}`,
        title: p.title,
        description: p.description?.substring(0, 50) || (p.type === "project" ? "Built a new project" : p.type === "internship" ? "Completed internship" : "Added achievement"),
        date: new Date(p.created_at),
        type: p.type,
        url: p.url || undefined,
        icon: p.type === "project" ? "Code" : p.type === "internship" ? "Briefcase" : "Trophy"
      });
    });

    certificates.forEach(c => {
      events.push({
        id: `cert-${c.id}`,
        title: "Earned Career Certificate",
        description: `Passed the assessment for ${CAREER_PATHS.find(p => p.id === c.career_path_id)?.title || 'Career Path'}`,
        date: new Date(c.issued_at),
        type: "certificate",
        icon: "Award"
      });
    });

    // Sort descending by date
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [completedCourses, portfolioItems, certificates]);

  // 4. Statistics
  const stats = useMemo(() => {
    return {
      courses: completedCourses.length,
      skills: skills.length,
      projects: portfolioItems.filter(p => p.type === "project").length,
      roadmaps: completedRoadmaps.length,
      certificates: certificates.length
    };
  }, [completedCourses, skills, portfolioItems, completedRoadmaps, certificates]);

  // 5. Recruiter Score
  const recruiterScore = useMemo(() => {
    let score = 20; // base score
    score += Math.min(stats.courses * 2, 20); // up to 20 pts for courses
    score += Math.min(stats.skills * 1.5, 15); // up to 15 pts for skills
    score += Math.min(stats.projects * 5, 20); // up to 20 pts for projects
    score += Math.min(stats.roadmaps * 10, 10); // 10 pts for roadmaps
    score += Math.min(stats.certificates * 15, 15); // 15 pts for certificates
    return Math.min(Math.round(score), 100);
  }, [stats]);

  // 6. Resume Summary
  const resumeSummary = useMemo(() => {
    const topSkills = skills.slice(0, 3).map(s => s.skill?.name || "various technologies").join(", ");
    if (stats.projects > 0 && stats.skills > 0) {
      return `Passionate developer with hands-on experience building ${stats.projects} projects. Proficient in ${topSkills}. Committed to continuous learning with ${stats.courses} completed courses and ${stats.certificates} certificates.`;
    }
    if (stats.skills > 0) {
      return `Dedicated learner focusing on ${topSkills}. Actively upskilling through practical courses and assessments.`;
    }
    return "Aspiring professional actively building foundational skills and completing learning programs.";
  }, [skills, stats]);

  // 7. AI Insights
  const aiInsights = useMemo(() => {
    if (certificates.length > 0) {
      return `Your certification in ${CAREER_PATHS.find(p => p.id === certificates[0].career_path_id)?.title} shows you are highly ready for junior roles. Apply for jobs with confidence!`;
    }
    if (completedRoadmaps.length > 0) {
      return `You have completed a career roadmap! Take the final assessment to earn your certificate and boost your recruiter score.`;
    }
    if (stats.projects >= 2) {
      return `You have a solid portfolio. Continue matching skills from courses to show versatility.`;
    }
    if (stats.courses > 0) {
      return `You are making steady progress! Complete a full roadmap to unlock assessments and certifications.`;
    }
    return `Start your journey by enrolling in a career path and completing courses.`;
  }, [certificates, completedRoadmaps, stats]);

  return {
    profile,
    portfolioItems,
    certificates,
    completedCourses,
    completedRoadmaps,
    achievements,
    milestones,
    timeline,
    stats,
    skills,
    recruiterScore,
    resumeSummary,
    aiInsights,
    loading,
    portfolioSlug,
    generateSlug,
    addItem,
    deleteItem
  };
}
