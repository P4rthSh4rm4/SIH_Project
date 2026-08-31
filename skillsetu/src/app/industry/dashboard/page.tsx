"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, TrendingUp, Eye, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Listings", value: "8", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Total Applicants", value: "156", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Shortlisted", value: "23", icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Avg Match Score", value: "81%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const recentApplicants = [
  { name: "Aarav Patel", role: "ML Intern", match: 94, status: "shortlisted" },
  { name: "Priya Singh", role: "Frontend Dev", match: 89, status: "applied" },
  { name: "Rohan Mehta", role: "Data Analyst", match: 85, status: "interview" },
  { name: "Sneha Gupta", role: "ML Intern", match: 82, status: "applied" },
];

export default function IndustryDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Industry <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">Manage opportunities and find top talent</p>
        </div>
        <Link href="/industry/post">
          <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Post Opportunity
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Recent Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplicants.map((a) => (
              <div key={a.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center text-sm font-bold text-primary">{a.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.role}</div>
                </div>
                <Badge variant={a.status === "shortlisted" ? "default" : a.status === "interview" ? "secondary" : "outline"} className="text-xs capitalize">{a.status}</Badge>
                <span className="text-sm font-semibold text-emerald-500">{a.match}%</span>
              </div>
            ))}
          </div>
          <Link href="/industry/candidates">
            <Button variant="outline" size="sm" className="w-full mt-4">View All Candidates <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
