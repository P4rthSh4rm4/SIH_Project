"use client";

import { useState } from "react";
import { usePlacementReadiness } from "@/lib/hooks/usePlacementReadiness";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, CheckCircle2, XCircle, AlertCircle, Briefcase, 
  Code, FileText, Award, Target, Cpu, MessageSquare, 
  Star, CheckSquare, BrainCircuit, Clock, Building2,
  ChevronRight, ChevronDown, ChevronUp, ArrowRight, Lightbulb, Zap, ShieldCheck,
  FolderOpen, GraduationCap
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

export default function PlacementReadinessDashboard() {
  const { readiness, loading } = usePlacementReadiness();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[200px] w-full rounded-2xl bg-secondary/50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-32 w-full rounded-xl bg-secondary/50" />
          <div className="h-32 w-full rounded-xl bg-secondary/50" />
          <div className="h-32 w-full rounded-xl bg-secondary/50" />
          <div className="h-32 w-full rounded-xl bg-secondary/50" />
        </div>
      </div>
    );
  }

  const {
    overallScore, status, metrics, weights,
    strengths, improvements,
    checklist, checklistProgress, industryReadiness, companyEligibility,
    placementTimeline, placementInsights, probability
  } = readiness;

  const scoreColor = overallScore >= 80 ? "text-emerald-500" : overallScore >= 60 ? "text-amber-500" : "text-rose-500";
  const strokeColor = overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* 1. Header & Overall Readiness */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" /> Placement Readiness
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Comprehensive analysis of your career profile, skills, and industry readiness.
            </p>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Target className="w-48 h-48" />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative shrink-0 w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                  <circle 
                    cx="50" cy="50" r="44" fill="transparent" stroke={strokeColor} strokeWidth="8" 
                    strokeDasharray={`${overallScore * 2.76} 276`} 
                    strokeLinecap="round" className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="text-center flex flex-col items-center justify-center bg-background rounded-full w-32 h-32 shadow-sm border border-border/50">
                  <span className={`text-4xl font-extrabold ${scoreColor}`}>{overallScore}%</span>
                </div>
              </div>
              <div className="space-y-3 text-center md:text-left">
                <Badge className={`px-3 py-1 text-sm ${
                  status === 'Excellent' ? 'bg-emerald-500 hover:bg-emerald-600' :
                  status === 'Good' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}>
                  {status} Status
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight">You are {overallScore >= 80 ? 'Placement Ready!' : 'on your way to Placement!'}</h2>
                <p className="text-muted-foreground max-w-md">
                  Your estimated placement probability is <strong className="text-foreground">{probability}%</strong> based on your current profile strength, verified skills, and projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2 to 11. Detailed Score Breakdown */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" /> Readiness Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { key: "technical", label: "Technical Skills", icon: Code, desc: "Verified coding & domain skills", metric: metrics.technical, weight: weights.technical },
            { key: "softSkills", label: "Soft Skills", icon: MessageSquare, desc: "Communication & collaboration", metric: metrics.softSkills, weight: weights.softSkills },
            { key: "aptitude", label: "Aptitude Readiness", icon: BrainCircuit, desc: "Quantitative & logical reasoning", metric: metrics.aptitude, weight: weights.aptitude },
            { key: "resume", label: "Resume ATS Score", icon: FileText, desc: "Format, keywords & completeness", metric: metrics.resume, weight: weights.resume },
            { key: "portfolio", label: "Portfolio Quality", icon: FolderOpen, desc: "Project count, quality & completeness", metric: metrics.portfolio, weight: weights.portfolio },
            { key: "github", label: "GitHub Readiness", icon: FaGithub, desc: "GitHub repos & open source activity", metric: metrics.github, weight: weights.github },
            { key: "linkedin", label: "LinkedIn Profile", icon: FaLinkedin, desc: "Professional profile completeness", metric: metrics.linkedin, weight: weights.linkedin },
            { key: "experience", label: "Experience & Certs", icon: GraduationCap, desc: "Internships, courses & certifications", metric: metrics.experience, weight: weights.experience },
          ] as const).map((item) => {
            const isExpanded = expandedCards[item.key];
            const m = item.metric;
            return (
              <Card key={item.key} className="hover:border-primary/50 transition-colors flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-secondary rounded-lg text-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                    {m.attempted ? (
                      <span className={`text-xl font-bold ${m.score >= 70 ? 'text-emerald-500' : m.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {m.score}%
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Not Attempted</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{Math.round(item.weight * 100)}% of overall score</p>

                  <Progress value={m.score} className="h-1.5 mt-3" />

                  {/* View Breakdown Toggle */}
                  <button
                    onClick={() => toggleCard(item.key)}
                    className="mt-3 text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? "Hide Breakdown" : "View Breakdown"}
                  </button>

                  {/* Expandable Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t pt-3 border-border/50 animate-in slide-in-from-top-1 duration-200">
                      {/* Score Breakdown */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Calculation Breakdown</p>
                        {m.breakdown.map((b, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              {b.status === "present" ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              ) : b.status === "partial" ? (
                                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                              )}
                              <span className="text-muted-foreground">{b.label}</span>
                            </span>
                            <span className="font-mono font-semibold tabular-nums">
                              {b.value !== null ? b.value : "—"}<span className="text-muted-foreground/50">/{b.maxValue}</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Improvement Tips */}
                      {m.recommendations.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">How to Improve</p>
                          {m.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 13. Company Eligibility & 12. Industry Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Company Eligibility Checker */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Company Eligibility Checker
            </CardTitle>
            <CardDescription>Based on your current profile strength against standard requirements.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {companyEligibility.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card hover:bg-secondary/20 transition-colors">
                <div>
                  <h4 className="font-bold">{comp.company}</h4>
                  <p className="text-sm text-muted-foreground">{comp.role}</p>
                  {comp.reasons.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {comp.reasons.map((r, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500" /> {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Badge variant={comp.status === 'Eligible' ? 'default' : comp.status === 'Nearly Eligible' ? 'secondary' : 'outline'}
                  className={comp.status === 'Eligible' ? 'bg-emerald-500 hover:bg-emerald-600' : comp.status === 'Nearly Eligible' ? 'text-amber-600 border-amber-500/50 bg-amber-500/10' : 'text-rose-500 border-rose-500/50 bg-rose-500/10'}>
                  {comp.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Industry Domain Readiness */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Domain Readiness
            </CardTitle>
            <CardDescription>Your match percentage for specific industry roles.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            {industryReadiness.map((domain, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{domain.name}</span>
                  <span className={domain.score >= 70 ? 'text-emerald-500' : 'text-muted-foreground'}>{domain.score}%</span>
                </div>
                <Progress value={domain.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 3 & 4 & 14. Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20 shadow-sm shadow-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="w-5 h-5" /> Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strengths.map((s, i) => (
                  <Badge key={i} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1.5 shadow-sm text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Complete more assessments to unlock strengths.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 shadow-sm shadow-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
              <Lightbulb className="w-5 h-5" /> Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvements.length > 0 ? improvements.map((imp, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-secondary/20 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm">{imp.title}</h4>
                  <Badge variant="outline" className={`text-[10px] ${imp.priority === 'High' ? 'text-rose-500 border-rose-500/30' : 'text-amber-500 border-amber-500/30'}`}>
                    {imp.priority} Priority
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{imp.action}</p>
                <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> {imp.impact}
                </span>
              </div>
            )) : (
              <div className="p-4 bg-emerald-500/10 rounded-lg text-emerald-600 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Your profile is fully optimized!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Placement Checklist & 15. Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Checklist */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Placement Checklist
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <Progress value={checklistProgress} className="h-1.5 flex-1" />
              <span className="text-xs font-bold text-muted-foreground">{checklistProgress}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Placement Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-border/50 ml-2">
              {placementTimeline.map((step, i) => (
                <div key={step.id} className="relative flex items-center gap-4 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-card shrink-0 z-10 transition-colors ${
                    step.status === 'completed' ? 'bg-emerald-500 text-white' : 
                    step.status === 'in-progress' ? 'bg-amber-500 text-white' : 'bg-muted border-border/50 text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                     step.status === 'in-progress' ? <Zap className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>{step.title}</h4>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{step.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 13. AI Insights */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
            <Star className="w-5 h-5" /> Career AI Insights
          </h3>
          <div className="space-y-3">
            {placementInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-3">
                <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
