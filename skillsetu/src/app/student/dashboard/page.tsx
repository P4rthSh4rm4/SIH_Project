"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, TrendingUp, Briefcase, Award, ArrowRight,
  BookOpen, Sparkles, Clock, CheckCircle2, Star,
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
    <div className="space-y-7">
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
          Here&apos;s your skill development overview
        </p>
      </div>

      {/* Gamification Bar */}
      <GamificationBar gamification={gamification} loading={gamLoading} />

      {/* Onboarding Strip */}
      <OnboardingStrip
        profile={profile}
        skillsCount={stats.skillsMapped}
        assessmentsCount={growth.length}
        badgesCount={earnedBadges.length}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill Assessment CTA */}
        <Card className="lg:col-span-2 border-border/40 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
          <CardContent className="relative p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-xl animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Take Your Skill Assessment</h3>
                <p className="text-[0.9rem] text-muted-foreground mt-1.5 leading-relaxed">
                  Complete an AI-powered assessment to map your skills and unlock personalised recommendations.
                </p>
              </div>
              <Link href="/student/assessment">
                <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20 shimmer-hover h-11 px-6 text-[0.9rem]">
                  Start Now <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/student/copilot" className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent/60 transition-all duration-200 group">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="text-[0.9rem] font-semibold flex-1">Career Copilot</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/student/opportunities" className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent/60 transition-all duration-200 group">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="text-[0.9rem] font-semibold flex-1">Browse Jobs</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/student/portfolio" className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent/60 transition-all duration-200 group">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <span className="text-[0.9rem] font-semibold flex-1">My Portfolio</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Skill Rings + Leaderboard */}
      <div className="grid lg:grid-cols-2 gap-6">
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
      <AnalyticsCharts skills={skills} growth={growth} loading={skillsLoading} />

      {/* Activity Heatmap */}
      <ActivityHeatmap heatmap={heatmap} loading={activityLoading} />

      {/* Badges Section */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Badges</CardTitle>
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

      {/* Recommended Opportunities */}
      <RecommendedSection />
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
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recommended For You</CardTitle>
          <Badge variant="secondary" className="text-xs font-bold">AI Matched</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
            }) => (
              <div
                key={opp.id}
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[0.9rem] truncate">{opp.title}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 font-bold">
                      {opp.type}
                    </Badge>
                    {opp.deadline && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          )
        )}
        <Link href="/student/opportunities">
          <Button variant="outline" size="sm" className="w-full">
            See All Opportunities <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
