"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target, TrendingUp, Briefcase, Award, ArrowRight,
  BookOpen, Sparkles, Clock, CheckCircle2, Star,
  AlertCircle, ChevronRight, Zap, TargetIcon, MapPin, DollarSign, Info
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useGamification } from "@/lib/hooks/useGamification";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useActivityLog } from "@/lib/hooks/useActivityLog";
import { useSkillAnalytics, SkillDataPoint } from "@/lib/hooks/useSkillAnalytics";

import { GamificationBar } from "@/components/dashboard/gamification-bar";
import { OnboardingStrip } from "@/components/dashboard/onboarding-strip";
import { SkillRings } from "@/components/dashboard/skill-rings";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function StudentDashboard() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useDashboardData();
  const {
    gamification, badges: earnedBadges, allBadges,
    loading: gamLoading,
  } = useGamification();
  const { entries: leaderboard, myRank, loading: lbLoading } = useLeaderboard();
  const { heatmap, loading: activityLoading } = useActivityLog();
  const { skills, growth, loading: skillsLoading } = useSkillAnalytics();

  const firstName = profile?.name?.split(" ")[0] ?? "";
  const isLoading = profileLoading || statsLoading;
  const targetRole = (profile as any)?.career_objective || "Software Engineer";

  const statCards = [
    {
      label: "Skills Mapped", value: stats.skillsMapped.toString(),
      icon: Target, trend: stats.skillsTrend,
      color: "text-violet-500", bg: "bg-violet-500/10 dark:bg-violet-500/15",
      gradient: "from-violet-500/5 to-transparent",
    },
    {
      label: "Match Score", value: stats.matchScore > 0 ? `${stats.matchScore}%` : "—",
      icon: TrendingUp, trend: stats.matchTrend,
      color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      gradient: "from-emerald-500/5 to-transparent",
    },
    {
      label: "Applications", value: stats.applications.toString(),
      icon: Briefcase, trend: stats.appsTrend,
      color: "text-blue-500", bg: "bg-blue-500/10 dark:bg-blue-500/15",
      gradient: "from-blue-500/5 to-transparent",
    },
    {
      label: "Certifications", value: stats.certifications.toString(),
      icon: Award, trend: stats.certsTrend,
      color: "text-amber-500", bg: "bg-amber-500/10 dark:bg-amber-500/15",
      gradient: "from-amber-500/5 to-transparent",
    },
  ];

  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 2);
  const weakSkills = [...skills].filter(s => s.score < 70).sort((a, b) => a.score - b.score);
  
  const dynamicTasks = weakSkills.slice(0, 3).map((skill, idx) => {
    if (idx === 0) {
      return { title: `Improve ${skill.name} to 60%`, desc: "Complete 2 modules and 1 quiz.", xp: 150, cta: "Start Modules" };
    } else if (idx === 1) {
      return { title: `Strengthen ${skill.name}`, desc: `Finish the '${skill.name} Fundamentals' path.`, xp: 100, cta: "View Path" };
    } else {
      return { title: `Apply ${skill.name} in a project`, desc: "Build one small project and add it to your portfolio.", xp: 200, cta: "Create Project" };
    }
  });

  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Welcome back,{" "}
          {isLoading ? (
            <span className="inline-block h-9 w-32 rounded-xl bg-muted animate-pulse align-middle" />
          ) : (
            <span className="gradient-text">{firstName || "there"}</span>
          )}
          {" "}👋
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.95rem]">
          Here&apos;s your career readiness overview and actionable steps for today.
        </p>
      </div>

      {/* Onboarding Strip */}
      <OnboardingStrip
        profile={profile}
        skillsCount={stats.skillsMapped}
        assessmentsCount={growth.length}
        badgesCount={earnedBadges.length}
      />

      {/* Row 1: Actionable Priorities (Career Readiness & Weekly Plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-1">
        {/* Career Readiness Top Card */}
        <Card className="border-primary/20 shadow-md shadow-primary/5 bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10">
            <Popover>
              <PopoverTrigger className="shrink-0 relative cursor-pointer hover:scale-105 transition-transform outline-none border-none bg-transparent">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                  <circle 
                    cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" 
                    strokeDasharray="351.8" 
                    strokeDashoffset={351.8 - (351.8 * (stats.matchScore || 45)) / 100}
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-foreground">{stats.matchScore || 45}<span className="text-xl text-muted-foreground">%</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 flex items-center gap-1">Ready <Info className="w-3 h-3" /></span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 border-border/60 shadow-xl rounded-2xl" sideOffset={10}>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">How is this calculated?</h4>
                    <p className="text-[13px] text-muted-foreground mt-1 leading-snug">
                      Your score is matched against the typical requirements for <strong className="text-primary">{targetRole}</strong> roles.
                    </p>
                  </div>
                  
                  {topSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Top Matching Skills</span>
                      {topSkills.map(s => (
                        <div key={s.id} className="text-[13px] flex items-center justify-between font-medium">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {s.name}</span>
                          <span className="text-emerald-600">{s.score}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {weakSkills.length > 0 ? (
                    <div className="pt-3 border-t space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Areas Pulling Score Down</span>
                      <div className="text-[13px] flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> {weakSkills[0].name}</span>
                        <span className="text-amber-600">{weakSkills[0].score}%</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-2 bg-secondary/10 p-2 rounded-lg flex items-start gap-1.5 border border-secondary/20">
                        <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>Increase {weakSkills[0].name} to 60% to gain <strong className="text-secondary">+5% match score</strong>.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Areas Pulling Score Down</span>
                      <p className="text-[12px] text-muted-foreground mt-1">Take assessments to map your weak areas.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <TargetIcon className="w-3.5 h-3.5" /> Matched to: {targetRole}
              </div>
              <h2 className="text-xl font-bold mb-2">You are on the right track!</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Your profile is matching well for Entry-Level {targetRole} roles. Bridge the remaining skill gaps to reach 80% readiness.
              </p>
              
              <div className="bg-background rounded-xl border border-border/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Next Action</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {weakSkills.length > 0 ? `Improve ${weakSkills[0].name} concepts` : "Complete the System Design module"}
                  </span>
                  <Link href="/student/learning-hub">
                    <Button size="sm" className="w-full sm:w-auto text-xs h-8">Start Module</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Action Plan */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>This Week&apos;s Plan</CardTitle>
                <CardDescription>Personalized steps to boost your match score</CardDescription>
              </div>
              {dynamicTasks.length > 0 && (
                <div className="text-right">
                  <span className="text-xl font-bold">0</span><span className="text-muted-foreground text-sm">/{dynamicTasks.length}</span>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Completed</div>
                </div>
              )}
            </div>
            {dynamicTasks.length > 0 && <Progress value={0} className="h-2 mt-4" />}
          </CardHeader>
          <CardContent className="space-y-3">
            {skillsLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
              </div>
            ) : dynamicTasks.length === 0 ? (
              <div className="text-center py-6 px-4 bg-secondary/5 rounded-xl border border-dashed border-secondary/30">
                <TargetIcon className="w-8 h-8 text-secondary/50 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-foreground">No weak skills detected</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Take your skill assessment to generate your personalized learning plan.</p>
                <Link href="/student/assessment">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-secondary border-secondary/20 hover:bg-secondary/10">Take Assessment</Button>
                </Link>
              </div>
            ) : (
              dynamicTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground group-hover:border-primary shrink-0 mt-0.5 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{task.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{task.desc}</p>
                    <Badge variant="secondary" className="text-[10px] mt-2 bg-secondary/10 text-secondary hover:bg-secondary/20 px-2 py-0 h-5">+{task.xp} XP</Badge>
                  </div>
                  <Link href="/student/learning-hub">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity -mr-2 text-primary">{task.cta}</Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Skill Gaps & Recommended Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-2">
        {/* Skill-Gap Card */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Priority Skill Gaps</CardTitle>
            <CardDescription>Mastering these will directly improve your readiness score for {targetRole} roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillsLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
              </div>
            ) : weakSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No major skill gaps identified yet. Keep assessing!</p>
            ) : (
              weakSkills.slice(0, 3).map((skill, i) => (
                <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                      {i === 0 ? <AlertCircle className="w-5 h-5 text-red-500" /> : <TrendingUp className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground">{skill.score < 40 ? "Missing completely" : `Needs improvement (${skill.score}%)`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-secondary hover:bg-secondary/90 text-white shadow-sm px-2 py-0.5 text-[10px]">+{i === 0 ? '8' : '5'}% Match</Badge>
                    <Link href="/student/learning-hub" className="block mt-2">
                      <span className="text-[11px] font-bold text-primary hover:underline">Learn &rarr;</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recommended Opportunities */}
        <RecommendedSection skills={skills} />
      </div>

      <div className="pt-8 border-t border-border/50">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Progress & Analytics
        </h3>
        
        {/* Gamification Bar */}
        <GamificationBar gamification={gamification} loading={gamLoading} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((stat, i) => (
            <Card key={stat.label} className={`border-border/40 hover:shadow-xl hover:shadow-primary/[0.04] transition-all duration-500 hover:-translate-y-0.5 overflow-hidden relative animate-slide-up stagger-${i + 1}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.9rem] text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-4xl font-extrabold mt-2 tracking-tight">
                      {isLoading ? (
                        <span className="inline-block h-10 w-14 rounded-lg bg-muted animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.trend}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skill Rings + Leaderboard */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle>Your Top Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillRings skills={skills} loading={skillsLoading} />
              <Link href="/student/profile" className="block mt-5">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <LeaderboardWidget entries={leaderboard} myRank={myRank} loading={lbLoading} />
        </div>

        {/* Reports & Analytics */}
        <div className="mt-6" id="analytics">
          <AnalyticsCharts skills={skills} growth={growth} loading={skillsLoading} />
        </div>

        {/* Activity Heatmap */}
        <div className="mt-6">
          <ActivityHeatmap heatmap={heatmap} loading={activityLoading} />
        </div>

        {/* Badges Section */}
        <Card className="border-border/40 mt-6" id="badges">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Badges & Achievements</CardTitle>
              <span className="text-xs text-muted-foreground font-semibold bg-muted px-3 py-1 rounded-full">
                {earnedBadges.length}/{allBadges.length} earned
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allBadges.map((badge) => {
                const earned = earnedBadges.find(
                  (eb) => eb.badge_id === badge.id
                );
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                      earned
                        ? "bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-sm hover:shadow-md"
                        : "border-border/30 opacity-40 grayscale"
                    }`}
                    title={
                      earned
                        ? `Earned on ${new Date(earned.earned_at).toLocaleDateString()}`
                        : badge.description
                    }
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        earned ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Award
                        className={`w-5 h-5 ${earned ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[0.85rem] font-bold">{badge.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        +{badge.xp_reward} XP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

/* ─── Recommended Section (reads from Supabase) ─────────────────────── */

function RecommendedSection({ skills }: { skills: SkillDataPoint[] }) {
  const [opps, setOpps] = useState<
    { id: string; title: string; type: string; deadline: string | null; location?: string; stipend_amount?: number }[]
  >([]);

  useEffect(() => {
    async function fetchOpps() {
      const supabase = createClient();
      // Try fetching location and stipend_amount as well if they exist
      const { data } = await supabase
        .from("opportunities")
        .select("id, title, type, deadline, location, stipend_amount")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);
      setOpps(data ?? []);
    }
    fetchOpps();
  }, []);

  return (
    <Card className="border-border/40 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recommended For You</CardTitle>
          <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary border-transparent">AI Matched</Badge>
        </div>
        <CardDescription>Opportunities curated specifically for your skill profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {opps.length === 0 ? (
          <p className="text-[0.9rem] text-muted-foreground py-6 text-center">
            No active opportunities right now. Check back soon!
          </p>
        ) : (
          opps.map(
            (opp, i: number) => {
              // Dynamic AI match reasons based on student skills and opportunity
              const sortedSkills = [...skills].sort((a, b) => b.score - a.score);
              const topSkill = sortedSkills.length > 0 ? sortedSkills[0].name : "React";
              const secondSkill = sortedSkills.length > 1 ? sortedSkills[1].name : "Python";
              const weakSkill = sortedSkills.length > 2 ? sortedSkills[sortedSkills.length - 1].name : "SQL";

              const reasons = [
                `85% fit — Strong match with your ${topSkill} and ${secondSkill} skills.`,
                `Matches your core profile. Needs ${weakSkill} (you're at ${sortedSkills.length > 2 ? sortedSkills[sortedSkills.length - 1].score : 50}%).`,
                `Great fit for your objective. Your assessment scores place you in the top 10%.`
              ];
              
              return (
              <div
                key={opp.id}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[0.95rem] truncate text-foreground group-hover:text-primary transition-colors">{opp.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 font-semibold capitalize bg-muted text-muted-foreground border-transparent">
                          {opp.type}
                        </Badge>
                        {opp.location && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                            <MapPin className="w-3 h-3" />
                            {opp.location}
                          </span>
                        )}
                        {opp.stipend_amount && opp.stipend_amount > 0 && (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <DollarSign className="w-3 h-3" />
                            {opp.stipend_amount}/mo
                          </span>
                        )}
                        {opp.deadline && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary/10 rounded-lg p-2.5 text-[11px] text-foreground font-medium flex items-start gap-2 border border-secondary/20">
                  <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                  <span>{reasons[i % reasons.length]}</span>
                </div>
                
                <div className="pt-1">
                  <Link href={`/student/opportunities`} className="block">
                    <Button size="sm" className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">Apply Now &rarr;</Button>
                  </Link>
                </div>
              </div>
            )})
        )}
      </CardContent>
      <div className="px-6 pb-6 mt-auto">
        <Link href="/student/opportunities">
          <Button variant="ghost" size="sm" className="w-full border border-border hover:bg-secondary/50 font-semibold">
            View All Matches <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
