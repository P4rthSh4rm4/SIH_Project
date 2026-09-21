"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Handshake, Presentation, ArrowRight, Calendar, Loader2, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Link from "next/link";
import { useAcademicianDashboard } from "@/lib/hooks/useAcademicianDashboard";
import { useAcademicianSkillGaps } from "@/lib/hooks/useAcademicianSkillGaps";
import { StudentPlacementOverview } from "@/components/dashboard/student-placement-overview";

const statsConfig = [
  { key: "fdpsAvailable", label: "FDPs Available", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "researchProjects", label: "Research Projects", icon: FlaskConical, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "consultancy", label: "Consultancy", icon: Handshake, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "activeMentees", label: "Active Mentees", icon: Presentation, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const ZeroGapMarker = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value > 0) return null;
  return (
    <circle cx={x + 8} cy={y + height / 2} r={3} fill="#94a3b8" />
  );
};

export default function AcademicianDashboard() {
  const { stats, skillDistribution, latestOpportunities, upcomingActivities, loading: dashboardLoading } = useAcademicianDashboard();
  const { skillGaps, loading: gapsLoading } = useAcademicianSkillGaps();


  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academician <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">Discover FDPs, research, and manage your students.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 bg-background hover:bg-muted text-foreground" asChild>
            <Link href="/academician/research">
              <FlaskConical className="w-4 h-4 mr-2" /> Post Research
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1 text-foreground">
                    {dashboardLoading ? <Loader2 className="w-5 h-5 animate-spin mt-2" /> : stats[s.key as keyof typeof stats]}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Industry Skill Gap Alerts */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Industry Skill Gap Alerts
            </CardTitle>
            <Button variant="outline" size="sm" className="bg-background" asChild>
              <Link href="/academician/intelligence">View Intelligence <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gapsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : skillGaps.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No significant skill gaps detected at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillGaps.slice(0, 3).map(gap => (
                <div key={gap.skill_id} className="p-3 bg-background rounded-lg border border-border/50 shadow-sm flex items-start gap-3">
                  <div className={`w-2 h-full rounded-full ${gap.gapSeverity > 60 ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{gap.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={gap.gapSeverity > 60 ? 'destructive' : 'secondary'} className="text-[10px] leading-none px-1.5 py-0.5">
                        {gap.gapSeverity.toFixed(0)}% Gap
                      </Badge>
                      <span className="text-xs text-muted-foreground">{gap.gapCount} affected {gap.gapCount === 1 ? 'student' : 'students'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mid Section: Chart and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Industry Skill Gap Overview Chart */}
        <Card className={`${skillDistribution.length === 0 ? 'lg:col-span-2' : 'lg:col-span-1'} border-border/50`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" /> Industry Skill Gaps
                </CardTitle>
                <CardDescription>Skills where students need improvement based on recruiter feedback</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {gapsLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : skillGaps.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
                No skill gap data available.
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillGaps.slice(0, 5)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333333" opacity={0.2} />
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={180} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: any, name: any, props: any) => [`${Number(value || 0).toFixed(0)}% Gap`, `Affected Students: ${props.payload.gapCount}`]}
                    />
                    <Bar dataKey="gapSeverity" radius={[0, 4, 4, 0]} label={<ZeroGapMarker />}>
                      {skillGaps.slice(0, 5).map((entry, index) => {
                        let color = "#3b82f6"; // Default Blue
                        if (entry.name === "SQL") color = "#3b82f6"; // Blue
                        else if (entry.name === "Data Structures & Algorithms") color = "#10b981"; // Emerald Green
                        else if (entry.name === "Problem Solving") color = "#8b5cf6"; // Purple
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Placement Overview */}
        <div className="lg:col-span-1 h-full">
          <StudentPlacementOverview />
        </div>

        {/* Existing Mentee Skill Distribution */}
        <Card className={`${skillDistribution.length === 0 ? 'hidden' : 'lg:col-span-1'} border-border/50`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Mentee Skill Distribution
                </CardTitle>
                <CardDescription>Average proficiency scores across your active mentees</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : skillDistribution.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                No skill data available for active mentees.
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={skillDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="skillName" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="avgScore" name="Avg Proficiency" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" /> Upcoming Academic Activities
            </CardTitle>
            <CardDescription>Your next FDPs, Research, and Consultancy deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingActivities.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No upcoming sessions scheduled.
              </div>
            ) : (
              upcomingActivities.map((item, i) => (
                <div key={item.id} className={`pl-4 border-l-4 ${item.type === 'FDP' ? 'border-emerald-500' : item.type === 'research' ? 'border-violet-500' : 'border-blue-500'} py-1 relative hover:bg-muted/30 transition-colors cursor-pointer rounded-r-lg`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.host}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize ml-2 shrink-0">{item.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">{item.date}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Opportunities */}
      <div className="grid grid-cols-1 gap-6">
        {/* Latest Academic Opportunities */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Latest Academic Opportunities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : latestOpportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No academic opportunities available.
              </div>
            ) : (
              latestOpportunities.map((o) => (
                <div key={o.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    {o.type === "FDP" ? <BookOpen className="w-5 h-5 text-emerald-500" /> : o.type === "research" ? <FlaskConical className="w-5 h-5 text-violet-500" /> : <Handshake className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.host_industry_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="text-[10px] bg-secondary/80 capitalize">{o.type}</Badge>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1"><Calendar className="w-3 h-3" />{o.date}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
