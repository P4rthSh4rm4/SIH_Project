"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Briefcase, GraduationCap, Award, Building, Target, Trophy, PieChart as PieChartIcon } from "lucide-react";
import { useInstitutionStudents } from "@/lib/hooks/useInstitutionStudents";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = {
  placed: '#10b981', // emerald-500
  inProcess: '#3b82f6', // blue-500
  notPlaced: '#94a3b8' // slate-400
};

export default function InstitutionAnalyticsPage() {
  const { loading, error, students } = useInstitutionStudents();

  // Basic KPIs
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placementStatus === 'Placed');
  const inProcessStudents = students.filter(s => s.placementStatus === 'In Process');
  const notPlacedStudents = students.filter(s => s.placementStatus === 'Not Placed');
  const placementRate = totalStudents > 0 ? ((placedStudents.length / totalStudents) * 100).toFixed(1) : "0.0";

  // Insights Calculations
  const totalApplications = students.reduce((sum, s) => sum + s.applicationCount, 0);
  const studentsWithActiveApps = inProcessStudents.length;

  // Average Package Parsing (heuristic for LPA)
  let parsedPackages: number[] = [];
  placedStudents.forEach(s => {
    const pkgStr = s.placementDetails?.package;
    if (pkgStr && typeof pkgStr === 'string') {
      const upper = pkgStr.toUpperCase();
      if (upper.includes('LPA')) {
        const num = parseFloat(pkgStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0 && num < 100) {
          parsedPackages.push(num);
        }
      } else if (upper.includes('/MONTH') || upper.includes('PM') || pkgStr.includes('₹')) {
        // Handle cases like ₹25,000/month
        const numStr = pkgStr.replace(/[^0-9.]/g, '');
        const num = parseFloat(numStr);
        if (!isNaN(num) && num > 0) {
          // Assume monthly stipend in INR
          const lpa = (num * 12) / 100000;
          if (lpa > 0 && lpa < 100) {
            parsedPackages.push(lpa);
          }
        }
      }
    }
  });
  
  const avgPackage = parsedPackages.length > 0 
    ? (parsedPackages.reduce((a, b) => a + b, 0) / parsedPackages.length).toFixed(1) + ' LPA'
    : 'Not enough data';

  // Pie Chart Data
  const statusData = [
    { name: 'Placed', value: placedStudents.length, color: COLORS.placed },
    { name: 'In Process', value: inProcessStudents.length, color: COLORS.inProcess },
    { name: 'Not Placed', value: notPlacedStudents.length, color: COLORS.notPlaced },
  ].filter(d => d.value > 0);

  // Company-wise Bar Chart Data
  const companyCounts: Record<string, number> = {};
  placedStudents.forEach(s => {
    if (s.placementDetails && s.placementDetails.company) {
      const comp = s.placementDetails.company;
      // Don't chart fallback text as a company
      if (comp !== 'Company not specified') {
        companyCounts[comp] = (companyCounts[comp] || 0) + 1;
      }
    }
  });

  const companyData = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, placements: count }))
    .sort((a, b) => b.placements - a.placements)
    .slice(0, 5); // Top 5 companies

  // Skills Comparison
  const getTopSkills = (studentList: typeof students) => {
    const skillCounts: Record<string, number> = {};
    studentList.forEach(s => {
      s.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topPlacedSkills = getTopSkills(placedStudents);
  const cohortStudents = students.filter(s => s.placementStatus !== 'Placed');
  const topCohortSkills = getTopSkills(cohortStudents);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Analyzing institution data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <PieChartIcon className="w-6 h-6 text-red-500" />
        </div>
        <p className="font-medium text-red-500">Failed to load analytics</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep insights into student placement performance.</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Placed</CardTitle>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placedStudents.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Process</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProcessStudents.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Not Placed</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notPlacedStudents.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <PieChartIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{`${placementRate}%`}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Status Breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Placement Status</CardTitle>
            <CardDescription>Current state of the entire student cohort</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Actionable Insights */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Metrics derived from active placement operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Active Applications</h4>
                <div className="text-2xl font-bold">{totalApplications}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Students in Hiring Pipelines</h4>
                <div className="text-2xl font-bold">{studentsWithActiveApps}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Average Verified Package</h4>
                <div className="text-xl font-bold">{avgPackage}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top Hiring Companies</CardTitle>
            <CardDescription>Organizations with the most accepted offers</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                  />
                  <Bar dataKey="placements" fill={COLORS.placed} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Building className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No company data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Analysis */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Skills Analysis</CardTitle>
            <CardDescription>Top skills mapped to placement success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-500" /> Placed Students
              </h4>
              {topPlacedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topPlacedSkills.map(skill => (
                    <Badge key={skill.name} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-none">
                      {skill.name} ({skill.count})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No skills data available for placed students.</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" /> Remaining Cohort
              </h4>
              {topCohortSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topCohortSkills.map(skill => (
                    <Badge key={skill.name} variant="outline" className="text-muted-foreground">
                      {skill.name} ({skill.count})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No skills data available for remaining students.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
