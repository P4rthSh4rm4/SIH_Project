"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface AnalyticsChartsProps {
  skills: SkillDataPoint[];
  growth: SkillGrowthPoint[];
  loading?: boolean;
}

export function AnalyticsCharts({ skills, growth, loading }: AnalyticsChartsProps) {
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

  // Prepare radar data — show top 8 skills with target comparison
  const radarData = [...skills]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((skill) => ({
      subject: skill.name.length > 12 ? skill.name.slice(0, 12) + "…" : skill.name,
      current: skill.score,
      target: Math.min(100, skill.score + 15 + Math.floor(Math.random() * 10)),
    }));

  // Growth chart data
  const growthData =
    growth.length > 0
      ? growth
      : [
          { date: "No data", avgScore: 0 },
        ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Skill Growth Over Time */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle>Skill Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {growth.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-[0.9rem] text-muted-foreground">
              Complete assessments to see your progress chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="skillGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.15 245)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.15 245)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid oklch(0.925 0.015 268)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="oklch(0.55 0.15 245)"
                  strokeWidth={3}
                  fill="url(#skillGrowthGrad)"
                  name="Avg Score"
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
            <div className="h-[400px] flex items-center justify-center text-[0.9rem] text-muted-foreground">
              Map skills to see your radar chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="oklch(0.925 0.015 268 / 0.5)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid oklch(0.925 0.015 268)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
                  }}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="oklch(0.55 0.15 245)"
                  fill="oklch(0.55 0.15 245)"
                  fillOpacity={0.25}
                  strokeWidth={3}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="oklch(0.68 0.15 190)"
                  fill="oklch(0.68 0.15 190)"
                  fillOpacity={0.1}
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
