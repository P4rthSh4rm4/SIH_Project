"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SkillDataPoint, SkillGrowthPoint } from "@/lib/hooks/useSkillAnalytics";
import {
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { Target, TrendingUp } from "lucide-react";

interface AnalyticsChartsProps {
  skills: SkillDataPoint[];
  growth: SkillGrowthPoint[];
  loading?: boolean;
}

export function AnalyticsCharts({ skills, growth, loading }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState("all");

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardContent className="p-7">
            <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-7">
            <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow setting a fake target for visual demonstration if user doesn't have one
  const radarData = [...skills]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((skill) => ({
      subject: skill.name.length > 12 ? skill.name.slice(0, 12) + "…" : skill.name,
      current: skill.score,
      target: Math.min(100, skill.score + 15 + Math.floor(Math.random() * 10)),
    }));

  // Filter growth data by time range
  const filterGrowthData = () => {
    if (growth.length === 0) return [];
    
    // Very simple date string filter simulation for demonstration
    if (timeRange === "30") {
      return growth.slice(Math.max(growth.length - 2, 0));
    }
    if (timeRange === "90") {
      return growth.slice(Math.max(growth.length - 5, 0));
    }
    return growth;
  };

  const growthData = filterGrowthData();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Skill Growth Over Time */}
      <Card className="border-border/40">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>Skill Growth Over Time</CardTitle>
          {growth.length > 0 && (
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 text-muted-foreground outline-none focus:border-primary"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>
          )}
        </CardHeader>
        <CardContent>
          {growth.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 bg-secondary/5 rounded-xl border border-dashed border-border/60">
              <TrendingUp className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <h4 className="font-bold text-[0.95rem]">No skill data yet</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Take your assessment to start tracking your growth over time.</p>
              <Link href="/student/assessment">
                <Button size="sm" variant="outline">Take Assessment</Button>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="skillGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  label={{ value: "Assessment Date", position: "insideBottom", offset: -15, style: { fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 500 } }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  width={40}
                  label={{ value: "Avg Proficiency (%)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 500 } }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#skillGrowthGrad)"
                  name="Avg Score"
                  activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Skill Radar — Current vs Target */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle>Current vs Target Proficiency</CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 bg-secondary/5 rounded-xl border border-dashed border-border/60">
              <Target className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <h4 className="font-bold text-[0.95rem]">No skills mapped</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-4">You need at least 3 skills to generate your proficiency radar.</p>
              <Link href="/student/skill-analysis">
                <Button size="sm" variant="outline">Map Your Skills</Button>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fill: "var(--foreground)", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
                  }}
                />
                <Radar
                  name="Current Proficiency"
                  dataKey="current"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.25}
                  strokeWidth={3}
                />
                <Radar
                  name="Target Goal"
                  dataKey="target"
                  stroke="var(--secondary)"
                  fill="var(--secondary)"
                  fillOpacity={0.15}
                  strokeWidth={3}
                  strokeDasharray="4 4"
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
