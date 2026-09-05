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
      { name: "Web Development", target: 85 },
      { name: "Data Structures & Algorithms", target: 80 },
      { name: "SQL", target: 75 },
      { name: "Problem Solving", target: 80 },
      { name: "Logical Reasoning", target: 70 },
      { name: "Communication Skills", target: 65 },
    ],
  },
  {
    id: "datascience",
    label: "Data Scientist",
    requiredSkills: [
      { name: "SQL", target: 85 },
      { name: "Quantitative Aptitude", target: 80 },
      { name: "Logical Reasoning", target: 75 },
      { name: "Problem Solving", target: 75 },
      { name: "Communication Skills", target: 70 },
      { name: "Data Structures & Algorithms", target: 60 },
    ],
  },
  {
    id: "frontend",
    label: "Frontend Specialist",
    requiredSkills: [
      { name: "Web Development", target: 90 },
      { name: "Problem Solving", target: 80 },
      { name: "Communication Skills", target: 75 },
      { name: "Data Structures & Algorithms", target: 60 },
      { name: "Logical Reasoning", target: 65 },
      { name: "Teamwork", target: 70 },
    ],
  },
];

export default function SkillAnalysisPage() {
  const { skills, growth, loading } = useSkillAnalytics();

  const selectedRole = TARGET_ROLES[0];

  // Build radar chart data from categories
  // Pre-fill with core categories to ensure the RadarChart always forms at least a triangle
  const categoryMap: Record<string, { total: number; count: number }> = {
    "Coding": { total: 0, count: 0 },
    "Aptitude": { total: 0, count: 0 },
    "Soft Skills": { total: 0, count: 0 },
  };

  skills.forEach((s) => {
    if (!categoryMap[s.category]) categoryMap[s.category] = { total: 0, count: 0 };
    categoryMap[s.category].total += s.score;
    categoryMap[s.category].count++;
  });

  const radarData = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    score: data.count > 0 ? Math.round(data.total / data.count) : 0,
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
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
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
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
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
                      <Bar 
                        dataKey="score" 
                        fill="#3b82f6" 
                        radius={[0, 6, 6, 0]} 
                        maxBarSize={32} 
                      />
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
                    <LineChart data={growth} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#10b981" }}
                        activeDot={{ r: 6 }}
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
