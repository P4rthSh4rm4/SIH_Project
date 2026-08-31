"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, TrendingUp, Briefcase, Award, ArrowRight,
  BookOpen, Sparkles, Clock, CheckCircle2, Star,
} from "lucide-react";
import Link from "next/link";

// Demo data — will be replaced with Supabase queries
const stats = [
  { label: "Skills Mapped", value: "24", icon: Target, trend: "+3 this week", color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Match Score", value: "87%", icon: TrendingUp, trend: "+5% vs last month", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Applications", value: "12", icon: Briefcase, trend: "3 in progress", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Certifications", value: "6", icon: Award, trend: "2 pending verify", color: "text-amber-500", bg: "bg-amber-500/10" },
];

const recentOpportunities = [
  { title: "ML Intern at Google", type: "Internship", match: 92, deadline: "Sep 15, 2024" },
  { title: "Frontend Dev — Flipkart", type: "Job", match: 85, deadline: "Sep 20, 2024" },
  { title: "Data Pipeline Bounty", type: "Bounty", match: 78, deadline: "Oct 1, 2024" },
];

const topSkills = [
  { name: "Python", score: 88 },
  { name: "Machine Learning", score: 76 },
  { name: "React", score: 82 },
  { name: "SQL", score: 70 },
  { name: "Data Analysis", score: 65 },
];

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">Parth</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your skill development overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Top Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSkills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-700"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
            <Link href="/student/profile">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Full Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recommended Opportunities */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recommended For You</CardTitle>
              <Badge variant="secondary" className="text-xs">AI Matched</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOpportunities.map((opp) => (
              <div key={opp.title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{opp.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{opp.type}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{opp.deadline}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">{opp.match}%</span>
                </div>
              </div>
            ))}
            <Link href="/student/opportunities">
              <Button variant="outline" size="sm" className="w-full">
                See All Opportunities <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
