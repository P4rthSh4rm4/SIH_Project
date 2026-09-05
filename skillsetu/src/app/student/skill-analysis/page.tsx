"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Target, TrendingUp, ArrowRight, Zap,
} from "lucide-react";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line,
} from "recharts";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";

const TARGET_ROLES = [
  {
    id: "fullstack",
    label: "Full-Stack Developer",
    requiredSkills: [
      { name: "JavaScript", target: 85 },
      { name: "React", target: 80 },
      { name: "Node.js", target: 75 },
      { name: "SQL Queries", target: 70 },
      { name: "System Design", target: 60 },
      { name: "Git & DevOps", target: 65 },
    ],
  },
  {
    id: "datascience",
    label: "Data Scientist",
    requiredSkills: [
      { name: "Python", target: 85 },
      { name: "Statistics", target: 80 },
      { name: "Machine Learning", target: 75 },
      { name: "SQL Queries", target: 75 },
      { name: "Data Visualization", target: 70 },
      { name: "Deep Learning", target: 60 },
    ],
  },
  {
    id: "frontend",
    label: "Frontend Specialist",
    requiredSkills: [
      { name: "HTML/CSS", target: 90 },
      { name: "JavaScript", target: 85 },
      { name: "React", target: 85 },
      { name: "TypeScript", target: 75 },
      { name: "UI/UX Design", target: 70 },
      { name: "Performance", target: 65 },
    ],
  },
];

export default function SkillAnalysisPage() {
  const { skills, growth, loading } = useSkillAnalytics();

  const selectedRole = TARGET_ROLES[0];

  // Build radar chart data from categories
  const categoryMap: Record<string, { total: number; count: number }> = {};
  skills.forEach((s) => {
    if (!categoryMap[s.category]) categoryMap[s.category] = { total: 0, count: 0 };
    categoryMap[s.category].total += s.score;
    categoryMap[s.category].count++;
  });
  const radarData = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    score: Math.round(data.total / data.count),
    fullMark: 100,
  }));

  // Overall match % for selected role
  const roleSkillNames = selectedRole.requiredSkills.map((s) => s.name.toLowerCase());
  const matchingSkills = skills.filter((s) =>
    roleSkillNames.includes(s.name.toLowerCase())
  );
  const matchPct =
    selectedRole.requiredSkills.length > 0
      ? Math.round((matchingSkills.length / selectedRole.requiredSkills.length) * 100)
      : 0;

  // Gap analysis
  const gapData = selectedRole.requiredSkills.map((req) => {
    const found = skills.find(
      (s) => s.name.toLowerCase() === req.name.toLowerCase()
    );
    return {
      skill: req.name,
      current: found?.score ?? 0,
      target: req.target,
      gap: Math.max(0, req.target - (found?.score ?? 0)),
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Analysis & Gap</h1>
          <p className="text-muted-foreground mt-1">Loading your skill data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Analysis & Gap</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into your strengths and areas for improvement
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/student/assessment">
            <Target className="w-4 h-4 mr-2" /> Take Assessment
          </Link>
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Skills Data Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete a skill assessment to see your analysis and gap report.
            </p>
            <Button asChild>
              <Link href="/student/assessment">
                <Zap className="w-4 h-4 mr-2" /> Start Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Radar & Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Competency Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Proficiency Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Proficiency by Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skills.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Growth */}
          {growth.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Skill Growth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Gap Analysis */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Target Role: {selectedRole.label}</CardTitle>
                <Badge
                  variant={matchPct >= 70 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {matchPct}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {gapData.map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-muted-foreground">
                      {item.current} / {item.target}
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                    {/* Target marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-muted-foreground/50 z-10"
                      style={{ left: `${item.target}%` }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.current >= item.target
                          ? "bg-emerald-500"
                          : item.current >= item.target * 0.5
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${item.current}%` }}
                    />
                  </div>
                  {item.gap > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Gap: {item.gap} points — 
                      <Link
                        href="/student/assessment"
                        className="text-primary hover:underline ml-1"
                      >
                        Take assessment <ArrowRight className="w-3 h-3 inline" />
                      </Link>
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
