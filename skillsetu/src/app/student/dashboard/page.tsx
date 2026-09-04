"use client";

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
      color: "text-violet-500", bg: "bg-violet-500/10",
    },
    {
      label: "Match Score", value: stats.matchScore > 0 ? `${stats.matchScore}%` : "—",
      icon: TrendingUp, trend: stats.matchTrend,
      color: "text-emerald-500", bg: "bg-emerald-500/10",
    },
    {
      label: "Applications", value: stats.applications.toString(),
      icon: Briefcase, trend: stats.appsTrend,
      color: "text-blue-500", bg: "bg-blue-500/10",
    },
    {
      label: "Certifications", value: stats.certifications.toString(),
      icon: Award, trend: stats.certsTrend,
      color: "text-amber-500", bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back,{" "}
          {isLoading ? (
            <span className="inline-block h-8 w-28 rounded-lg bg-muted animate-pulse align-middle" />
          ) : (
            <span className="gradient-text">{firstName || "there"}</span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
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
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? (
                      <span className="inline-block h-8 w-12 rounded bg-muted animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill Assessment CTA */}
        <Card className="lg:col-span-2 border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg animate-pulse-glow">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Take Your Skill Assessment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete an AI-powered assessment to map your skills and unlock personalised recommendations.
                </p>
              </div>
              <Link href="/student/assessment">
                <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20">
                  Start Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/student/copilot" className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-colors group">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium flex-1">Career Copilot</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/student/opportunities" className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-colors group">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium flex-1">Browse Jobs</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/student/portfolio" className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-colors group">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium flex-1">My Portfolio</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Skill Rings + Leaderboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRings skills={skills} loading={skillsLoading} />
            <Link href="/student/profile" className="block mt-4">
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
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Badges</CardTitle>
            <span className="text-xs text-muted-foreground">
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                    earned
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "border-border/30 opacity-40 grayscale"
                  }`}
                  title={
                    earned
                      ? `Earned on ${new Date(earned.earned_at).toLocaleDateString()}`
                      : badge.description
                  }
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      earned ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Award
                      className={`w-4 h-4 ${earned ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">
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
  // This imports live data inside the component to keep the main export clean
  const { useState, useEffect } = require("react");
  const { createClient } = require("@/lib/supabase/client");

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
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recommended For You</CardTitle>
          <Badge variant="secondary" className="text-xs">AI Matched</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {opps.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
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
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{opp.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {opp.type}
                    </Badge>
                    {opp.deadline && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
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
