"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

// Mock Data
const volumeData = [
  { name: 'Jan', applicants: 400, hires: 24 },
  { name: 'Feb', applicants: 300, hires: 13 },
  { name: 'Mar', applicants: 550, hires: 38 },
  { name: 'Apr', applicants: 480, hires: 29 },
  { name: 'May', applicants: 600, hires: 45 },
  { name: 'Jun', applicants: 750, hires: 60 },
];

const funnelData = [
  { stage: 'Applied', count: 1200 },
  { stage: 'Screened', count: 850 },
  { stage: 'Interviewed', count: 320 },
  { stage: 'Offered', count: 85 },
  { stage: 'Hired', count: 72 },
];

const skillsData = [
  { name: 'React', value: 400 },
  { name: 'Python', value: 300 },
  { name: 'Node.js', value: 300 },
  { name: 'AWS', value: 200 },
  { name: 'Figma', value: 150 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Hiring Analytics
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Track your recruitment funnel, analyze applicant volume, and identify top skill demands.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applicants", value: "3,080", change: "+12%", icon: Users, color: "text-blue-500" },
          { label: "Conversion Rate", value: "6.4%", change: "+1.2%", icon: Target, color: "text-emerald-500" },
          { label: "Time to Hire", value: "18 Days", change: "-2 Days", icon: BarChart3, color: "text-violet-500" },
          { label: "Offer Acceptance", value: "85%", change: "+5%", icon: TrendingUp, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">{stat.change} from last quarter</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trend */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Applicant Volume Trends</CardTitle>
            <CardDescription>Total applications vs actual hires over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.1} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="applicants" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  <Area type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Candidate drop-off across hiring stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Distribution */}
        <Card className="border-border/50 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Skills in Applicant Pool</CardTitle>
            <CardDescription>Distribution of verified skills among your applicants</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Industry Feedback & Skill Gap Insights */}
        <Card className="border-border/50 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Industry Feedback & Skill Gap Insights</CardTitle>
            <CardDescription>
              Identify recurring skill and competency gaps observed during candidate interviews and recruitment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No feedback data yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Insufficient data to generate meaningful skill gap insights. Begin leaving structured feedback on candidates during the interview and selection phases to populate this report.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
