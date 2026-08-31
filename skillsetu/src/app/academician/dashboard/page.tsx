"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Handshake, Presentation, ArrowRight, Calendar } from "lucide-react";

const stats = [
  { label: "FDPs Available", value: "12", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Research Projects", value: "5", icon: FlaskConical, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Consultancy", value: "3", icon: Handshake, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Mentorships", value: "8", icon: Presentation, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const opportunities = [
  { title: "AI/ML Faculty Development Program", host: "Google India", type: "FDP", date: "Oct 5-12, 2024" },
  { title: "Collaborative Research: NLP in Healthcare", host: "Microsoft Research", type: "Research", date: "Rolling" },
  { title: "Industry Consulting — Fintech Risk Models", host: "Paytm", type: "Consultancy", date: "Nov 1, 2024" },
];

export default function AcademicianDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academician <span className="gradient-text">Dashboard</span></h1>
        <p className="text-muted-foreground mt-1">Discover FDPs, research, and industry collaborations</p>
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
        <CardHeader><CardTitle className="text-base">Latest Opportunities</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((o) => (
            <div key={o.title} className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                {o.type === "FDP" ? <BookOpen className="w-5 h-5 text-emerald-500" /> : o.type === "Research" ? <FlaskConical className="w-5 h-5 text-violet-500" /> : <Handshake className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{o.title}</div>
                <div className="text-xs text-muted-foreground">{o.host}</div>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="secondary" className="text-[10px]">{o.type}</Badge>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{o.date}</div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2">Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
        </CardContent>
      </Card>
    </div>
  );
}
