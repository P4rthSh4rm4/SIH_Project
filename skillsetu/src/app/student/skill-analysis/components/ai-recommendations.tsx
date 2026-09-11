"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Sparkles, TrendingUp, BookOpen, Award, Target, 
  Map, Lightbulb, CheckCircle2, ChevronRight, Zap, 
  Clock, ArrowRight, PlayCircle, BarChart3, Star
} from "lucide-react";
import Link from "next/link";
import { getRecommendations, generateWeeklyRoadmap, SkillGap } from "@/lib/data/learning-recommendations";

export function AiRecommendations({ 
  gapData, 
  matchPct, 
  role,
  portfolioSkills = [],
  completedCourses = []
}: { 
  gapData: SkillGap[], 
  matchPct: number, 
  role: { label: string, requiredSkills: any[] },
  portfolioSkills?: any[],
  completedCourses?: any[]
}) {
  const { courses, certifications, platforms, weakestSkills } = useMemo(() => 
    getRecommendations(gapData, portfolioSkills, completedCourses), 
  [gapData, portfolioSkills, completedCourses]);

  const topSkill = weakestSkills[0]?.skill || "General Skills";
  const weeklyRoadmap = useMemo(() => generateWeeklyRoadmap(topSkill), [topSkill]);

  const estimatedTotalImprovement = courses.reduce((acc, c) => acc + c.expectedImprovement, 0);
  const estimatedReadiness = Math.min(100, matchPct + estimatedTotalImprovement);

  const completedRequired = gapData.filter(g => g.current >= g.target).length;
  const totalRequired = gapData.length;
  const pathProgress = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

  if (gapData.length === 0) return null;

  return (
    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Learning Recommendations</h2>
          <p className="text-muted-foreground">Personalized roadmap based on your assessment and target role</p>
        </div>
      </div>

      {/* Section 0: Recommended Next Action */}
      {weakestSkills.length > 0 && (
        <Card className="border-primary/50 bg-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-32 h-32" />
          </div>
          <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-background rounded-full shadow-sm shrink-0">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Recommended Next Action</h3>
              <p className="text-lg font-medium leading-relaxed">
                Improve <strong className="text-foreground">{topSkill}</strong> to increase your {role.label} readiness from <span className="text-destructive font-bold">{matchPct}%</span> to approximately <span className="text-emerald-500 font-bold">{Math.min(100, matchPct + (courses[0]?.expectedImprovement || 5))}%</span>.
              </p>
            </div>
            <Button className="shrink-0 rounded-full" size="lg" asChild>
              <Link href="/student/learning-hub">
                Start Learning <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1 & 8: AI Summary & Career Advice */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" /> Career Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Based on your assessment, your strongest areas are <span className="text-foreground font-medium">{gapData.filter(g => g.gap === 0).map(g => g.skill).join(", ") || "developing"}</span>. 
                However, your <span className="text-foreground font-medium">{weakestSkills.map(w => w.skill).join(" and ")}</span> scores are below the industry expectation for a {role.label}. 
                Completing the following learning path can significantly improve your placement readiness and help you stand out to top recruiters. Focus heavily on your weak areas before your next real interview.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Learning Path Progress */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="w-5 h-5 text-indigo-500" /> Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-muted-foreground">Required Skills Met</span>
                    <span className="font-bold">{completedRequired} / {totalRequired}</span>
                  </div>
                  <Progress value={pathProgress} className="h-3" />
                </div>
                
                <div className="space-y-2 mt-4">
                  {gapData.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {g.gap === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground shrink-0" />
                      )}
                      <span className={g.gap === 0 ? "text-foreground" : "text-muted-foreground"}>{g.skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Placement Impact */}
      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Placement Impact Projection
              </h3>
              <p className="text-sm text-muted-foreground">Estimated readiness after completing the high-priority roadmap.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-center px-6 py-3 bg-background rounded-xl border shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                <p className="text-3xl font-black">{matchPct}%</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center px-6 py-3 bg-emerald-500/10 border-emerald-500/20 rounded-xl border shadow-sm relative">
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Projected</p>
                <p className="text-3xl font-black text-emerald-600">{estimatedReadiness}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Priority Learning Roadmap */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Priority Learning Roadmap
        </h3>
        
        {courses.length === 0 ? (
          <p className="text-muted-foreground italic">You are currently fully prepared or no specific courses match your gaps.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, idx) => (
              <Card key={idx} className="group hover:border-primary/50 transition-colors flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={course.priority === 'High Priority' ? 'destructive' : course.priority === 'Medium Priority' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider font-bold">
                      {course.priority}
                    </Badge>
                    <Badge variant="outline" className="bg-background text-[10px] font-semibold text-muted-foreground">
                      +{course.expectedImprovement} Readiness
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">{course.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary/80 mt-1">Improves: {course.skillImproved}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex-1 flex flex-col">
                  <p className="line-clamp-2 mb-4">{course.reason}</p>
                  
                  <div className="flex items-center gap-4 mt-auto mb-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> {course.difficulty}</span>
                  </div>

                  <Button className="w-full mt-auto" variant={course.priority === 'High Priority' ? 'default' : 'secondary'} asChild>
                    <Link href={course.url}>Start Course <PlayCircle className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 6: Weekly Learning Plan */}
      {weeklyRoadmap && weeklyRoadmap.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Structured Weekly Plan: {topSkill}</CardTitle>
            <CardDescription>Follow this AI-generated roadmap to rapidly close your biggest skill gap.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
              {weeklyRoadmap.map((week, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                  <div className="mb-1">
                    <Badge variant="outline" className="text-xs font-bold uppercase text-muted-foreground mb-2">Week {week.week} • {week.focus}</Badge>
                    <h4 className="text-base font-bold">{week.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{week.task}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 5: Recommended Certifications */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" /> Recommended Certifications
        </h3>
        
        {certifications.length === 0 ? (
          <p className="text-muted-foreground italic text-sm">Focus on foundational skills before pursuing advanced certifications.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, idx) => (
              <Card key={idx} className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Award className="w-24 h-24" />
                </div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-bold text-[10px]">
                      {cert.provider}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug">{cert.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm flex-1 flex flex-col relative z-10">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cert.skillsCovered?.map((s, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">{s}</span>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mb-4 mt-auto">
                    <p className="text-xs text-muted-foreground italic">"{cert.careerValue}"</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {cert.duration}</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> {cert.difficulty}</span>
                  </div>

                  <Button variant="outline" className="w-full mt-auto" asChild>
                    <a href={cert.url} target="_blank" rel="noopener noreferrer">View Certificate <ChevronRight className="w-4 h-4 ml-2" /></a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: Learning Sources */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Curated Learning Platforms
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Recommended external platforms based on your missing skills.</p>
        <div className="flex flex-wrap gap-3">
          {platforms.map((platform, idx) => (
            <a key={idx} href={platform.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl hover:bg-accent hover:border-primary/30 transition-all group">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                {platform.name.charAt(0)}
              </div>
              <span className="font-semibold text-sm">{platform.name}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
