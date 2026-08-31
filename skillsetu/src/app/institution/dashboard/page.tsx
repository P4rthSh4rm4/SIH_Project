"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Award, TrendingUp, FileCheck, ArrowRight } from "lucide-react";

const stats = [
  { label: "Total Students", value: "2,450", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Placed Students", value: "1,820", icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Placement Rate", value: "74.3%", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Pending Verifications", value: "18", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
];

const recentPlacements = [
  { student: "Aarav Patel", company: "Google", role: "SDE Intern", package: "₹45 LPA" },
  { student: "Priya Singh", company: "Microsoft", role: "PM Intern", package: "₹38 LPA" },
  { student: "Rohan Mehta", company: "Amazon", role: "Data Engineer", package: "₹32 LPA" },
];

export default function InstitutionDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Institution <span className="gradient-text">Dashboard</span></h1>
        <p className="text-muted-foreground mt-1">Placement analytics and student management</p>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Recent Placements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentPlacements.map((p) => (
              <div key={p.student} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">{p.student[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.student}</div>
                  <div className="text-xs text-muted-foreground">{p.company} — {p.role}</div>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">{p.package}</Badge>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">View All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Pending Verifications</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileCheck className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">18 certificates awaiting your review</p>
              <Button className="mt-4 bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90" size="sm">
                Start Reviewing <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
