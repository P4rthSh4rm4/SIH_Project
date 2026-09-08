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
  AlertCircle, ChevronRight, Zap, TargetIcon
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useGamification } from "@/lib/hooks/useGamification";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useActivityLog } from "@/lib/hooks/useActivityLog";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";

import { GamificationBar } from "@/components/dashboard/gamification-bar";
import { OnboardingStrip } from "@/components/dashboard/onboarding-strip";
import { SkillRings } from "@/components/dashboard/skill-rings";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget";

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
  const targetRole = profile?.career_objective || "Software Engineer";

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
            <div className="shrink-0 relative">
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
                <span className="text-3xl font-extrabold">{stats.matchScore || 45}<span className="text-xl text-muted-foreground">%</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Ready</span>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <TargetIcon className="w-3.5 h-3.5" /> Target Role: {targetRole}
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
                  <span className="text-sm font-medium">Complete the System Design module</span>
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
                <CardTitle>Your Weekly Plan</CardTitle>
                <CardDescription>Small consistent steps lead to big wins</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">1</span><span className="text-muted-foreground text-sm">/3</span>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Completed</div>
              </div>
            </div>
            <Progress value={33} className="h-2 mt-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium line-through opacity-70">Update your resume</p>
                <Badge variant="secondary" className="text-[10px] mt-1 bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20">+50 XP</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Take a mock interview for Python</p>
                <Badge variant="secondary" className="text-[10px] mt-1">+100 XP</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Apply to 2 recommended internships</p>
                <Badge variant="secondary" className="text-[10px] mt-1">+150 XP</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="w-4 h-4" /></Button>
            </div>
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">System Design</h4>
                  <p className="text-xs text-muted-foreground">Missing completely</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">+8% Match</Badge>
                <Link href="/student/learning-hub" className="block mt-2">
                  <span className="text-xs font-bold text-primary hover:underline">Learn &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">React.js</h4>
                  <p className="text-xs text-muted-foreground">Needs improvement (45%)</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">+5% Match</Badge>
                <Link href="/student/learning-hub" className="block mt-2">
                  <span className="text-xs font-bold text-primary hover:underline">Practice &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Docker</h4>
                  <p className="text-xs text-muted-foreground">Needs improvement (30%)</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">+4% Match</Badge>
                <Link href="/student/learning-hub" className="block mt-2">
                  <span className="text-xs font-bold text-primary hover:underline">Practice &rarr;</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Opportunities */}
        <RecommendedSection />
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
        <div className="mt-6">
          <AnalyticsCharts skills={skills} growth={growth} loading={skillsLoading} />
        </div>

        {/* Activity Heatmap */}
        <div className="mt-6">
          <ActivityHeatmap heatmap={heatmap} loading={activityLoading} />
        </div>

        {/* Badges Section */}
        <Card className="border-border/40 mt-6">
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

function RecommendedSection() {
  const [opps, setOpps] = useState<
    { id: string; title: string; type: string; deadline: string | null }[]
  >([]);

  useEffect(() => {
    async function fetchOpps() {
      const supabase = createClient();
      const { data } = await supabase
        .from("opportunities")
        .select("id, title, type, deadline")
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
            (opp: {
              id: string;
              title: string;
              type: string;
              deadline: string | null;
            }, i: number) => {
              // Mock reasons based on index to show the UI
              const reasons = [
                "Strong match with your Python and React skills.",
                "Your assessment scores place you in the top 10% for this role.",
                "Great fit for your career objective in software engineering."
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
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 font-semibold capitalize">
                          {opp.type}
                        </Badge>
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
                
                <div className="bg-secondary/30 rounded-lg p-2.5 text-xs text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{reasons[i % reasons.length]}</span>
                </div>
                
                <div className="pt-1">
                  <Link href={`/student/opportunities`} className="block">
                    <Button size="sm" className="w-full h-8 text-xs font-semibold">Apply Now</Button>
                  </Link>
                </div>
              </div>
            )})
        )}
      </CardContent>
      <div className="px-6 pb-6 mt-auto">
        <Link href="/student/opportunities">
          <Button variant="ghost" size="sm" className="w-full border border-border hover:bg-secondary/50">
            View All Matches <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
