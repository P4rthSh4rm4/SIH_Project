import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Code, ShieldCheck, Award, Map, Link as LinkIcon, Mail, Globe, FileText, Star, User, Trophy, BookOpen, Zap, ExternalLink } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { QRCodeSVG } from "qrcode.react";

// Server Component fetching from the DB securely
export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  // We use the anon client. The RPC function `get_public_portfolio` is SECURITY DEFINER,
  // meaning it safely bypasses RLS inside Postgres to return only the public JSON.
  const resolvedParams = await params;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_public_portfolio", { p_slug: resolvedParams.slug });

  if (error || !data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 text-center p-4">
        <h1 className="text-3xl font-bold">Portfolio Not Found</h1>
        <p className="text-muted-foreground">This portfolio link is invalid or the portfolio is set to private.</p>
      </div>
    );
  }

  // data is the JSON returned by the RPC function
  const profile = data.profile;
  const skills = data.skills || [];
  const certs = data.certificates || [];
  const projects = data.projects || [];
  const enrollments = data.enrollments || [];

  // Recalculate stats for UI
  const completedCoursesCount = enrollments.filter((e: any) => e.progress_pct >= 100).length;
  
  // Roadmap logic
  const completedRoadmaps = CAREER_PATHS.filter(path => {
    const completedPhases = path.phases.filter(phase => {
      if (!("program_id" in phase)) return false;
      return enrollments.some((e: any) => 
        (e.program_id === (phase as any).program_id || e.program?.title === phase.title) && e.progress_pct >= 100
      );
    });
    return completedPhases.length === path.phases.length && path.phases.length > 0;
  });

  // Calculate readiness score
  let score = 20;
  score += Math.min(completedCoursesCount * 2, 20);
  score += Math.min(skills.length * 1.5, 15);
  score += Math.min(projects.length * 5, 20);
  score += Math.min(completedRoadmaps.length * 10, 10);
  score += Math.min(certs.length * 15, 15);
  const recruiterScore = Math.min(Math.round(score), 100);

  // Resume Summary
  const topSkills = skills.slice(0, 3).map((s: any) => s.skill?.name || "various technologies").join(", ");
  let resumeSummary = "Aspiring professional actively building foundational skills and completing learning programs.";
  if (projects.length > 0 && skills.length > 0) {
    resumeSummary = `Passionate developer with hands-on experience building ${projects.length} projects. Proficient in ${topSkills}. Committed to continuous learning with ${completedCoursesCount} completed courses and ${certs.length} certificates.`;
  } else if (skills.length > 0) {
    resumeSummary = `Dedicated learner focusing on ${topSkills}. Actively upskilling through practical courses and assessments.`;
  }

  // Calculate Achievements
  const achievements: Array<{id: string, title: string, description: string, date: Date, category: string, icon: string}> = [];
  
  projects.filter((p: any) => p.type === "achievement").forEach((a: any) => {
    achievements.push({
      id: `man-ach-${a.id}`, title: a.title, description: a.description || "Manual Achievement",
      date: new Date(a.created_at), category: "achievement", icon: "Trophy"
    });
  });

  certs.forEach((c: any) => {
    achievements.push({
      id: `cert-ach-${c.id}`, title: `${CAREER_PATHS.find(p => p.id === c.career_path_id)?.title || 'Career Path'} Certified`,
      description: `Passed the final assessment with score ${c.score}%`,
      date: new Date(c.issued_at), category: "certificate", icon: "Award"
    });
  });

  completedRoadmaps.forEach(r => {
    achievements.push({
      id: `roadmap-ach-${r.id}`, title: `Completed ${r.title} Roadmap`, description: "Finished all modules within this career path",
      date: new Date(), category: "roadmap", icon: "Briefcase" // Using current date for dynamic items without precise dates
    });
  });

  skills.filter((s: any) => s.verified || s.proficiency_score >= 100).forEach((s: any) => {
    achievements.push({
      id: `skill-ach-${s.skill?.id || s.skill_id}`, title: `Verified ${s.skill?.name || 'Skill'}`,
      description: `Achieved verified proficiency in ${s.skill?.name || 'Skill'}`,
      date: new Date(), category: "skill", icon: "ShieldCheck"
    });
  });
  
  achievements.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate Milestones
  const milestones = [];
  const coursesCount = completedCoursesCount;
  const certCount = certs.length;
  const projectCount = projects.filter((p: any) => p.type === 'project').length;
  const isShared = true; // By definition, if we are viewing the public portfolio, it is shared.
  const hasTopScore = certs.some((c: any) => c.score >= 90);
  const verifiedSkillsCount = skills.filter((s: any) => s.verified || s.proficiency_score >= 100).length;

  let profileFields = 0;
  if (profile?.avatar_url) profileFields++;
  if (profile?.bio) profileFields++;
  if (profile?.career_objective) profileFields++;
  if (profile?.github || profile?.linkedin || profile?.portfolio_website) profileFields++;
  const profileProgress = Math.min(Math.round((profileFields / 4) * 100), 100);

  milestones.push({ id: 'm-first-course', title: 'First Course Completed', description: 'Complete your first learning program.', current: Math.min(coursesCount, 1), target: 1, isUnlocked: coursesCount >= 1, icon: 'BookOpen', category: 'Learning' });
  milestones.push({ id: 'm-5-courses', title: '5 Courses Completed', description: 'Complete 5 learning programs.', current: Math.min(coursesCount, 5), target: 5, isUnlocked: coursesCount >= 5, icon: 'BookOpen', category: 'Learning' });
  milestones.push({ id: 'm-10-courses', title: '10 Courses Completed', description: 'Complete 10 learning programs.', current: Math.min(coursesCount, 10), target: 10, isUnlocked: coursesCount >= 10, icon: 'BookOpen', category: 'Learning' });
  milestones.push({ id: 'm-first-cert', title: 'First Certificate Earned', description: 'Pass an assessment and earn a certificate.', current: Math.min(certCount, 1), target: 1, isUnlocked: certCount >= 1, icon: 'Award', category: 'Certification' });
  milestones.push({ id: 'm-top-score', title: 'Top Assessment Score', description: 'Score 90% or higher on an assessment.', current: hasTopScore ? 1 : 0, target: 1, isUnlocked: hasTopScore, icon: 'Star', category: 'Assessment' });
  milestones.push({ id: 'm-first-project', title: 'First Portfolio Project', description: 'Add your first project to your portfolio.', current: Math.min(projectCount, 1), target: 1, isUnlocked: projectCount >= 1, icon: 'Code', category: 'Portfolio' });
  milestones.push({ id: 'm-portfolio-shared', title: 'Portfolio Shared', description: 'Generate a public link and share your portfolio.', current: isShared ? 1 : 0, target: 1, isUnlocked: isShared, icon: 'Share2', category: 'Profile' });
  milestones.push({ id: 'm-profile-complete', title: '100% Profile Completion', description: 'Complete your bio, objective, links, and avatar.', current: profileProgress, target: 100, isUnlocked: profileProgress >= 100, icon: 'User', category: 'Profile' });
  milestones.push({ id: 'm-verified-skill', title: 'Verified Skill Earned', description: 'Earn your first verified skill badge.', current: Math.min(verifiedSkillsCount, 1), target: 1, isUnlocked: verifiedSkillsCount >= 1, icon: 'ShieldCheck', category: 'Skills' });

  // Helper for timeline icon
  const getTimelineIcon = (iconStr: string) => {
    switch (iconStr) {
      case "BookOpen": return BookOpen;
      case "Code": return Code;
      case "Award": return Award;
      case "Briefcase": return Briefcase;
      case "Trophy": return Trophy;
      case "ShieldCheck": return ShieldCheck;
      case "Star": return Star;
      case "User": return User;
      default: return Zap;
    }
  };

  // Timeline
  const events: Array<{id: string, title: string, description: string, date: Date, type: string, url?: string}> = [];
  enrollments.filter((e: any) => e.progress_pct >= 100).forEach((c: any) => {
    events.push({
      id: `course-${c.program_id}`,
      title: c.program?.title || "Unknown Course",
      description: "Completed learning program",
      date: new Date(c.completed_at || c.enrolled_at),
      type: "course",
    });
  });
  projects.forEach((p: any) => {
    events.push({
      id: `proj-${p.id}`,
      title: p.title,
      description: p.type === "project" ? "Built a new project" : p.description?.substring(0, 50) || "Added achievement",
      date: new Date(p.created_at),
      type: "project",
      url: p.url,
    });
  });
  certs.forEach((c: any) => {
    events.push({
      id: `cert-${c.id}`,
      title: "Earned Career Certificate",
      description: `Passed the assessment for ${CAREER_PATHS.find(p => p.id === c.career_path_id)?.title || 'Career Path'}`,
      date: new Date(c.issued_at),
      type: "certificate",
    });
  });
  const timeline = events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Public URL for QR Code
  // Note: headers() could be used to get origin, but we can't always rely on it. We'll use a relative path trick or placeholder.
  const publicUrl = `https://skillsetu.com/p/${resolvedParams.slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 print:py-0 print:bg-white portfolio-container">
      <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-4 sm:pt-8">
        
        {/* 1. Premium Hero Header */}
        <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] p-8 sm:p-12 overflow-hidden print:shadow-none print:border-none print:p-0 print:bg-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none print:hidden"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none print:hidden"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 sm:gap-12">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
              {/* Readiness Ring + Avatar */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-muted/50" />
                  <circle 
                    cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="4" 
                    strokeDasharray={`${recruiterScore * 2.89} 289`} 
                    strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-background shadow-xl z-10 relative bg-secondary">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground bg-secondary">
                      {profile.name?.[0]?.toUpperCase() || "S"}
                    </div>
                  )}
                </div>
                <Badge className="absolute -bottom-3 z-20 bg-primary text-primary-foreground shadow-lg px-3 py-1 font-semibold border-2 border-background">
                  {recruiterScore}% Ready
                </Badge>
              </div>

              {/* Identity & Links */}
              <div className="text-center sm:text-left flex-1 mt-2 sm:mt-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">{profile.name}</h1>
                <p className="text-xl text-primary/80 font-medium mt-2 capitalize tracking-wide">Verified SkillSetu Portfolio</p>
                <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
                  {profile.career_objective || profile.bio || "Passionate about building scalable applications and intuitive user experiences. Continuously learning and solving real-world problems."}
                </p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6 print:mt-4">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-primary/10 rounded-full transition-all" title="Email">
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-[#0A66C2]/10 rounded-full transition-all" title="LinkedIn">
                      <FaLinkedin className="w-4 h-4 text-muted-foreground group-hover:text-[#0A66C2]" />
                    </a>
                  )}
                  {profile.github && (
                    <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-foreground/10 rounded-full transition-all" title="GitHub">
                      <FaGithub className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    </a>
                  )}
                  {profile.portfolio_website && (
                    <a href={profile.portfolio_website.startsWith('http') ? profile.portfolio_website : `https://${profile.portfolio_website}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-emerald-500/10 rounded-full transition-all" title="Website">
                      <Globe className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500" />
                    </a>
                  )}
                  {profile.resume_url && (
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-orange-500/10 rounded-full transition-all" title="Resume">
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-orange-500" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 print:hidden bg-white/80 p-3 rounded-2xl shadow-sm border border-border/50 backdrop-blur-sm shrink-0">
              <QRCodeSVG value={publicUrl} size={100} className="rounded-lg" />
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Scan Profile</span>
            </div>
          </div>
        </div>

        {/* 2. Professional Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          {[
            { label: "Completed Courses", value: completedCoursesCount, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Verified Skills", value: verifiedSkillsCount, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Certifications", value: certs.length, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Projects Built", value: projectCount, icon: Code, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="group border-border/50 bg-card/40 hover:bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Summary & Skills */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Executive Summary */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Executive Overview</h4>
                  <p className="text-base leading-relaxed text-foreground/90">
                    {resumeSummary}
                  </p>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group hover:bg-primary/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Zap className="w-24 h-24" />
                  </div>
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" /> AI Career Insight
                  </h4>
                  <p className="text-sm text-foreground/80 relative z-10 italic">
                    "Highly engaged learner showing strong potential in core tech stacks with consistent progression across learning modules."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categorized Skills */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Core Competencies
              </h2>
              
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No skills mapped yet.</p>
              ) : (
                <div className="space-y-6">
                  {/* Verified Skills */}
                  {skills.some((s: any) => s.verified || s.proficiency_score >= 100) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Platform Verified
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.filter((s: any) => s.verified || s.proficiency_score >= 100).map((s: any) => (
                          <Badge key={`v-${s.skill_id || s.skill?.id}`} className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1.5 shadow-sm">
                            {s.skill?.name || "Skill"} <ShieldCheck className="w-3 h-3 ml-1.5 inline" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Technical / Other Skills */}
                  {skills.some((s: any) => !s.verified && (s.proficiency_score || 0) < 100) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessed Skills</h4>
                      <div className="space-y-3">
                        {skills.filter((s: any) => !s.verified && (s.proficiency_score || 0) < 100).map((s: any) => (
                          <div key={`u-${s.skill_id || s.skill?.id}`} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span>{s.skill?.name || "Skill"}</span>
                              <span className="text-muted-foreground text-xs">{s.proficiency_score || 20}%</span>
                            </div>
                            <Progress value={s.proficiency_score || 20} className="h-1.5 bg-secondary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Achievements, Projects & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Achievements & Milestones */}
            {(achievements.length > 0 || milestones.length > 0) && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> Achievements & Milestones
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Progress Milestones (Combined) */}
                  {milestones.map((m) => {
                    const Icon = getTimelineIcon(m.icon) || Trophy;
                    const isComplete = m.isUnlocked;
                    return (
                      <div key={m.id} className={`group relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${isComplete ? 'bg-card border-primary/20 shadow-lg shadow-primary/5 hover:-translate-y-1 hover:shadow-primary/10' : 'bg-muted/30 border-transparent opacity-70 grayscale-[50%]'}`}>
                        {isComplete && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />}
                        
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative z-10 ${isComplete ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                          <Icon className="w-6 h-6" />
                          {isComplete && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />}
                        </div>
                        
                        <h3 className={`font-bold text-sm leading-tight mb-1 relative z-10 ${!isComplete && 'text-muted-foreground'}`}>{m.title}</h3>
                        
                        {isComplete ? (
                          <Badge variant="outline" className="mt-auto text-[10px] uppercase bg-background border-primary/20 text-primary">Unlocked</Badge>
                        ) : (
                          <div className="w-full mt-auto pt-2">
                            <Progress value={(m.current / m.target) * 100} className="h-1" />
                            <span className="text-[10px] text-muted-foreground mt-1 block">{m.current}/{m.target}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Premium Projects Showcase */}
            {projects.length > 0 && (
              <div className="mt-12 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" /> Projects Showcase
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((item: any) => {
                    const type = item.type || "project";
                    const Icon = getTimelineIcon(type === "project" ? "Code" : type === "internship" ? "Briefcase" : "FolderGit2");
                    return (
                      <Card key={item.id} className="overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card border-border/50 flex flex-col">
                        <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
                          {item.image_url ? (
                            <Image 
                              src={item.image_url} 
                              alt={item.title} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/50 group-hover:bg-secondary transition-colors">
                              <Icon className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/30 transition-colors duration-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                          
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background border-none capitalize shadow-sm">
                              <Icon className="w-3 h-3 mr-1.5" /> {type}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-5 flex-grow flex flex-col">
                          <h3 className="font-bold text-xl line-clamp-1 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</span>
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                View Details <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Premium Learning Roadmap */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" /> Career Roadmap
              </h2>
              {timeline.length === 0 ? (
                <Card className="border-dashed bg-secondary/20">
                  <CardContent className="p-12 text-center flex flex-col items-center">
                    <Map className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Learning journey is just beginning.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative border-l-2 border-border/60 ml-4 md:ml-6 space-y-8 pb-4">
                  {timeline.map((event, i) => {
                    const Icon = getTimelineIcon(event.type === 'certificate' ? 'Award' : event.type === 'project' ? 'Code' : 'BookOpen');
                    const isCert = event.type === 'certificate';
                    const isProject = event.type === 'project';
                    
                    return (
                      <div key={event.id} className="relative pl-8 md:pl-10 group">
                        {/* Node */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-background shadow-sm transition-all duration-300 group-hover:scale-110 ${isCert ? 'bg-amber-500 text-white' : isProject ? 'bg-indigo-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        
                        {/* Content Card */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 ${isCert ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30' : isProject ? 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10' : 'bg-card border-border/50 hover:border-primary/30 hover:shadow-md'}`}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-lg leading-tight">{event.title}</h4>
                            <Badge variant="outline" className="w-fit text-[10px] uppercase font-semibold bg-background shrink-0">
                              {event.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .portfolio-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .card, [class*="bg-card"], [class*="bg-primary/5"] { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}} />
    </div>
  );
}
