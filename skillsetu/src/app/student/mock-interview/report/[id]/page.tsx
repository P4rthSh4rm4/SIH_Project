"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMockInterview, MockInterviewRecord } from "@/lib/hooks/useMockInterview";
import { AIInterviewReport } from "@/lib/services/evaluators/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ArrowLeft, Download, Award, TrendingUp, AlertTriangle, Target, MessageSquare, Video, Mic, CheckCircle2, ChevronRight, Activity, Code, Star, Briefcase, Printer, Share2 } from "lucide-react";
import Link from "next/link";

const CircularProgress = ({ value, label, size = 120, strokeWidth = 10, colorClass = "text-primary" }: { value: number, label: string, size?: number, strokeWidth?: number, colorClass?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-secondary/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold">{value}</span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
};

export default function MockInterviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { interviews, fetchInterviews } = useMockInterview();
  const [interview, setInterview] = useState<MockInterviewRecord | null>(null);
  const [report, setReport] = useState<AIInterviewReport | null>(null);

  useEffect(() => {
    const inv = interviews.find(i => i.id === id);
    if (inv) {
      setInterview(inv);
      if (inv.ai_feedback) {
        setReport(inv.ai_feedback as AIInterviewReport);
      }
    } else {
      fetchInterviews();
    }
  }, [id, interviews, fetchInterviews]);

  if (!interview || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Analyzing your interview...</h2>
        <p className="text-muted-foreground">Our AI engine is evaluating your responses.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10";
    if (score >= 60) return "bg-amber-500/10";
    return "bg-destructive/10";
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 animate-fade-in pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" asChild className="hover:bg-transparent -ml-4">
          <Link href="/student/mock-interview">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="default" className="gap-2">
            <Share2 className="w-4 h-4" /> Share Report
          </Button>
        </div>
      </div>

      {/* Hero Overview */}
      <Card className="border-primary/20 overflow-hidden relative shadow-2xl shadow-primary/5">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10">
          <div className="shrink-0 flex flex-col items-center">
            <CircularProgress value={report.overallScore} label="Overall Score" size={180} strokeWidth={14} colorClass={getScoreColor(report.overallScore)} />
            <Badge variant="outline" className={`mt-4 px-4 py-1 text-sm font-bold uppercase tracking-wider ${getScoreBg(report.overallScore)} ${getScoreColor(report.overallScore)} border-${getScoreColor(report.overallScore).split('-')[1]}-500/50`}>
              {report.overallScore >= 80 ? "Excellent" : report.overallScore >= 60 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-2">
                <Badge variant="secondary">{interview.career_path}</Badge>
                <Badge variant="secondary">{interview.interview_type} Interview</Badge>
                <Badge variant="secondary">{interview.difficulty}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Interview Evaluation</h1>
              <p className="text-muted-foreground text-lg mt-3 leading-relaxed">
                {report.interviewSummary}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Hiring Prob.</p>
                <p className="text-2xl font-black text-primary">{report.hiringProbability}%</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Readiness</p>
                <p className="text-base font-bold text-foreground mt-1 truncate">{report.jobReadiness}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                <p className={`text-base font-bold mt-1 ${report.overallScore >= 65 ? 'text-emerald-500' : 'text-amber-500'}`}>{report.hiringRecommendation}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Questions</p>
                <p className="text-2xl font-black text-foreground">{interview.questions.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-secondary/20">
          <TabsTrigger value="metrics" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Core Metrics</TabsTrigger>
          <TabsTrigger value="answers" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Answer Quality</TabsTrigger>
          <TabsTrigger value="roadmap" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Roadmap</TabsTrigger>
          <TabsTrigger value="media" className="py-3 text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Media Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Technical Knowledge" score={report.technicalScore} icon={Code} desc="Relevance, keyword coverage, and depth." />
            <MetricCard title="Communication" score={report.communicationScore} icon={MessageSquare} desc="Grammar, vocabulary, and conciseness." />
            <MetricCard title="Problem Solving" score={report.problemSolvingScore} icon={Activity} desc="Reasoning, approach, and optimization." />
            <MetricCard title="Confidence" score={report.confidenceScore} icon={Star} desc="Hesitation detection and action-language." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Top Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.topStrengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{str}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.improvementAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                      <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="answers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Answer Breakdown</CardTitle>
              <CardDescription>Review each question, your answer, and specific AI feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {report.questionEvaluations.map((qe, index) => (
                  <AccordionItem key={qe.questionId} value={`item-${index}`} className="border-border/50">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:bg-secondary/10 rounded-t-lg transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center text-left w-full gap-4 pr-4">
                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          Q{index + 1}
                        </div>
                        <div className="flex-1 font-semibold text-base leading-snug">{qe.questionText}</div>
                        <div className="shrink-0">
                          <Badge variant="outline" className={`${getScoreColor(qe.score)} border-current font-bold`}>Score: {qe.score}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-4 pb-6 border-x border-b border-border/50 rounded-b-lg space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Answer</h4>
                          <div className="p-4 bg-secondary/20 rounded-xl text-[15px] leading-relaxed border border-border/50 min-h-[120px]">
                            {qe.candidateAnswer || <span className="italic opacity-50">No answer provided.</span>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <SparklesIcon /> Ideal AI Approach
                          </h4>
                          <div className="p-4 bg-primary/5 rounded-xl text-[15px] leading-relaxed border border-primary/10 min-h-[120px]">
                            {qe.idealAnswer}
                          </div>
                        </div>
                      </div>

                      <div className="bg-background rounded-xl border p-4 shadow-sm">
                        <h4 className="font-bold text-sm mb-3">Feedback Summary</h4>
                        <p className="text-sm text-muted-foreground mb-4">{qe.improvementSuggestion}</p>
                        <div className="flex flex-wrap gap-2">
                          {qe.strengths.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">{s}</Badge>
                          ))}
                          {qe.weaknesses.map((w, i) => (
                            <Badge key={i} variant="secondary" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">{w}</Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Improvement Roadmap</CardTitle>
              <CardDescription>Generated based on your weaknesses and score gaps.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {report.roadmap.map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                      {step.week}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-lg text-primary">{step.title}</h4>
                        <Badge variant="outline">Week {step.week}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {report.recommendedCourses.map((c, i) => (
                  <Badge key={i} className="py-1.5 px-3">{c}</Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Skills to Map</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {report.recommendedSkills.map((c, i) => (
                  <Badge key={i} variant="outline" className="py-1.5 px-3 border-primary text-primary">{c}</Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="opacity-80 border-dashed border-2">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Body Language Analysis</CardTitle>
                  <CardDescription>Eye contact, posture, and expressions.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 bg-secondary/10 rounded-xl">
                  <p className="font-semibold text-muted-foreground">Requires webcam analysis in future version.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-80 border-dashed border-2">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Voice Analysis</CardTitle>
                  <CardDescription>Pace, volume, and clarity.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 bg-secondary/10 rounded-xl">
                  <p className="font-semibold text-muted-foreground">Voice analysis unavailable for text-only sessions.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ title, score, icon: Icon, desc }: { title: string, score: number, icon: any, desc: string }) {
  return (
    <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-sm mb-1 text-muted-foreground uppercase tracking-wider">{title}</h4>
        <p className="text-3xl font-black text-foreground mb-2">{score}<span className="text-sm font-medium text-muted-foreground">/100</span></p>
        <Progress value={score} className="h-1.5 w-full mb-3" />
        <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
      </CardContent>
    </Card>
  );
}

// Just an icon wrapper since Sparkles isn't natively exported cleanly in lucide sometimes, or we can use Zap
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
