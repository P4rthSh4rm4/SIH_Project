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
import { AiRecommendations } from "./components/ai-recommendations";
import { useDigitalPortfolio } from "@/lib/hooks/useDigitalPortfolio";
import { useLearningHub } from "@/lib/hooks/useLearningHub";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const GET_TARGET_ROLES = (dept: string) => {
  if (dept === "Ayurveda") {
    return [
      {
        id: "clinical",
        label: "Clinical Practitioner",
        requiredSkills: [
          { name: "Clinical Knowledge", target: 85 },
          { name: "Communication Skills", target: 80 },
          { name: "Documentation", target: 75 },
          { name: "Research Skills", target: 70 },
          { name: "Industry Awareness", target: 65 },
        ],
      },
      {
        id: "pharma",
        label: "Ayurvedic Pharma Specialist",
        requiredSkills: [
          { name: "Ayurvedic Pharmacy", target: 85 },
          { name: "Research Skills", target: 80 },
          { name: "Documentation", target: 75 },
          { name: "Clinical Knowledge", target: 70 },
          { name: "Communication Skills", target: 60 },
        ],
      },
      {
        id: "wellness",
        label: "Wellness Consultant",
        requiredSkills: [
          { name: "Communication Skills", target: 85 },
          { name: "Clinical Knowledge", target: 80 },
          { name: "Industry Awareness", target: 75 },
          { name: "Documentation", target: 70 },
          { name: "Digital Skills", target: 65 },
        ],
      },
    ];
  }

  if (dept === "CSE") {
    return [
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
  }

  // Safe fallback for BPharma or unknown departments
  return [];
};

export default function SkillAnalysisPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { skills, growth, loading: analyticsLoading } = useSkillAnalytics();
  const portfolio = useDigitalPortfolio();
  const { enrollments, loading: learningLoading } = useLearningHub();
  const loading = analyticsLoading || learningLoading || profileLoading;

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

  if (!profile?.department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <h2 className="text-xl font-semibold">Department Information Missing</h2>
        <p className="text-muted-foreground max-w-md">
          Please update your profile with your department to view your skill analysis.
        </p>
      </div>
    );
  }

  const targetRoles = GET_TARGET_ROLES(profile.department);
  const selectedRole = targetRoles[0];

  // Build radar chart data from categories
  const defaultCategories = profile?.department === "Ayurveda" 
    ? ["Clinical Knowledge", "Ayurvedic Pharmacy", "Documentation", "Logical Reasoning", "Quantitative Aptitude", "Research Skills", "Communication Skills", "Industry Awareness"]
    : ["Coding", "Aptitude", "Soft Skills"];
    
  const categoryMap: Record<string, { total: number; count: number }> = {};
  defaultCategories.forEach(c => categoryMap[c] = { total: 0, count: 0 });

  // Determine grouping key depending on department.
  // For Ayurveda, we want to group exactly by the specific 5 competency names (which we mapped as skill names).
  // For CSE, it uses the traditional category fields (Coding, Aptitude, Soft Skills).
  skills.forEach((s) => {
    const key = profile?.department === "Ayurveda" 
      ? s.name // Our synthesized skills use the exact competency name (e.g., "Clinical Knowledge")
      : s.category;
      
    if (!categoryMap[key]) {
      // If the key is not in defaultCategories for Ayurveda, we DO NOT add it to the radar chart!
      if (profile?.department === "Ayurveda" && !defaultCategories.includes(key)) {
        return; // Skip adding unintended radar categories
      }
      categoryMap[key] = { total: 0, count: 0 };
    }
    categoryMap[key].total += s.score;
    categoryMap[key].count++;
  });

  const radarData = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    score: data.count > 0 ? Math.round(data.total / data.count) : 0,
    fullMark: 100,
  }));

  // Overall match % for selected role
  const roleSkillNames = selectedRole?.requiredSkills.map((s) => s.name.toLowerCase()) || [];
  const matchingSkills = skills.filter((s) =>
    roleSkillNames.includes(s.name.toLowerCase())
  );
  const matchPct =
    selectedRole && selectedRole.requiredSkills.length > 0
      ? Math.round((matchingSkills.length / selectedRole.requiredSkills.length) * 100)
      : 0;

  // Gap analysis
  const gapData = selectedRole?.requiredSkills.map((req) => {
    const found = skills.find(
      (s) => s.name.toLowerCase() === req.name.toLowerCase()
    );
    return {
      skill: req.name,
      current: found?.score ?? 0,
      target: req.target,
      gap: Math.max(0, req.target - (found?.score ?? 0)),
    };
  }) || [];


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
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
          {selectedRole ? (
            <>
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
              <AiRecommendations 
                gapData={gapData} 
                matchPct={matchPct} 
                role={selectedRole}
                portfolioSkills={portfolio?.skills || []}
                completedCourses={enrollments?.filter((e: any) => e.status === 'Completed' || e.progress === 100) || []}
                department={profile.department}
              />
            </>
          ) : (
            <Card className="border-border/50 col-span-1 lg:col-span-2 mt-6">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Target Roles Defined</h3>
                <p className="text-sm text-muted-foreground">
                  We currently do not have specific career paths mapped for your department ({profile.department}).
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
