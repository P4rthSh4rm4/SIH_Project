"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass, Map, Briefcase, ChevronRight, CheckCircle2,
  Circle, Star, ArrowRight, Zap, PlayCircle, Trophy,
  Search, Lock, Award, Flag, Shield
} from "lucide-react";
import Link from "next/link";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";
import { useLearningHub } from "@/lib/hooks/useLearningHub";
import { useCareerAssessment, type CareerCertificate } from "@/lib/hooks/useCareerAssessment";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function CareerGuidancePage() {
  const { skills, loading } = useSkillAnalytics();
  const { enrollments, loading: enrollmentsLoading } = useLearningHub();
  const { getCertificates } = useCareerAssessment();
  const [selectedPath, setSelectedPath] = useState(CAREER_PATHS[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pathStatuses, setPathStatuses] = useState<Record<string, "in_progress" | "assessment_unlocked" | "certified">>({});
  const [certificates, setCertificates] = useState<CareerCertificate[]>([]);

  // Calculate path statuses once enrollments load
  useEffect(() => {
    if (enrollmentsLoading) return;
    const statuses: Record<string, "in_progress" | "assessment_unlocked" | "certified"> = {};
    for (const path of CAREER_PATHS) {
      // Find completed phases using stable program IDs
      const completedPhases = path.phases.filter((phase) => {
        // If phase has a program_id, use it for robust matching. Otherwise it's incomplete.
        if (!("program_id" in phase)) return false;
        return enrollments.some(
          (e) => e.program_id === (phase as any).program_id && e.progress_pct === 100
        );
      });
      
      const completedCount = completedPhases.length;
      
      if (completedCount === path.phases.length && path.phases.length > 0) {
        statuses[path.id] = "assessment_unlocked";
      } else {
        statuses[path.id] = "in_progress";
      }

      // Temporary debug logs for this path
      if (path.id === selectedPath.id) {
        console.log(`[Path Completion Debug] Path: ${path.title}`);
        console.log(`- Total Phases: ${path.phases.length}`);
        console.log(`- Completed Phases: ${completedCount}`);
        console.log(`- Completed Programs (100%):`, enrollments.filter(e => e.progress_pct === 100).map(e => e.program_id));
        console.log(`- Incomplete Programs (<100%):`, enrollments.filter(e => e.progress_pct < 100).map(e => e.program_id));
        console.log(`- Assessment Unlocked:`, completedCount === path.phases.length);
        if (completedCount < path.phases.length) {
          const incompletePhases = path.phases.filter(p => !completedPhases.includes(p));
          console.log(`- Reason Locked: Missing completions for phases:`, incompletePhases.map(p => p.title));
        }
      }
    }
    // Check certificates
    getCertificates().then((certs) => {
      setCertificates(certs);
      for (const cert of certs) {
        if (statuses[cert.career_path_id] === "assessment_unlocked") {
          statuses[cert.career_path_id] = "certified";
        }
      }
      setPathStatuses({ ...statuses });
    });
  }, [enrollments, enrollmentsLoading, getCertificates, selectedPath.id]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Calculate suitability score for each path based on student skills
  const getSuitability = (path: typeof CAREER_PATHS[0]) => {
    if (skills.length === 0) return 0;
    const reqLower = path.requiredSkills.map((s) => s.toLowerCase());
    const matched = skills.filter((s) => reqLower.includes(s.name.toLowerCase()));
    return Math.round((matched.length / reqLower.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
          <p className="text-muted-foreground mt-1">Loading career paths...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
          <p className="text-muted-foreground mt-1">
            Explore career paths, map your skills, and get AI-driven advice.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none justify-start text-muted-foreground bg-muted/20 backdrop-blur-sm border-border/50 hover:bg-muted/40"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Find Career Paths...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:ml-6">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
            <Link href="/student/copilot">
              <SparklesIcon className="w-4 h-4 mr-2" /> Ask AI Mentor
            </Link>
          </Button>
        </div>
      </div>

      {/* Career Paths Grid (Featured) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAREER_PATHS.slice(0, 3).map((path) => {
          const suitability = getSuitability(path);
          const isSelected = selectedPath.id === path.id;

          return (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all duration-200 border-border/50 ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-lg hover:border-primary/30"
              }`}
              onClick={() => setSelectedPath(path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${path.bg}`}>
                    <path.icon className={`w-5 h-5 ${path.color}`} />
                  </div>
                  <Badge variant={suitability >= 70 ? "default" : "secondary"}>
                    {suitability}% Match
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{path.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {path.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Path Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" /> Roadmap: {selectedPath.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {selectedPath.demand} Demand
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> {selectedPath.salary}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent before:rounded-full">
                {selectedPath.phases.map((phase, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-background bg-secondary text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 transition-transform duration-300 group-hover:scale-110">
                      {phase.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <Circle className="w-7 h-7 text-primary/40" />
                      )}
                    </div>
                    {/* Card */}
                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3.5rem)] p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <span className="text-sm font-bold uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit">
                          Phase {i + 1}
                        </span>
                        {phase.completed && (
                          <Badge variant="outline" className="text-[10px] uppercase text-emerald-600 border-emerald-500/30 bg-emerald-500/10 py-1 px-3">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{phase.title}</h4>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                        {phase.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {phase.skills?.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-secondary/60 hover:bg-secondary border-none">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {!phase.completed && (
                        <Button variant="default" size="sm" className="w-full sm:w-auto bg-primary/90 hover:bg-primary shadow-md hover:shadow-primary/25 transition-all" asChild>
                          <Link href={`/student/learning-hub?phase=${encodeURIComponent(phase.title)}&skills=${encodeURIComponent(phase.skills?.join(",") || "")}`}>
                            Find Courses <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final Assessment Card */}
          {(() => {
            const status = pathStatuses[selectedPath.id];
            const cert = certificates.find((c) => c.career_path_id === selectedPath.id);
            if (!status) return null;

            return (
              <Card className={`border-border/50 overflow-hidden ${
                status === "certified"
                  ? "ring-1 ring-emerald-500/30"
                  : status === "assessment_unlocked"
                  ? "ring-1 ring-primary/30"
                  : ""
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      status === "certified"
                        ? "bg-emerald-500/10"
                        : status === "assessment_unlocked"
                        ? "bg-primary/10"
                        : "bg-secondary/30"
                    }`}>
                      {status === "certified" ? (
                        <Award className="w-6 h-6 text-emerald-500" />
                      ) : status === "assessment_unlocked" ? (
                        <Flag className="w-6 h-6 text-primary" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">Final Assessment</h4>
                        <Badge className={`text-xs ${
                          status === "certified"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : status === "assessment_unlocked"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary/30 text-muted-foreground border-border/50"
                        }`}>
                          {status === "certified" ? "✓ Certified" : status === "assessment_unlocked" ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>

                      {status === "in_progress" && (
                        <p className="text-sm text-muted-foreground">
                          Complete all modules to unlock the final assessment.
                        </p>
                      )}

                      {status === "assessment_unlocked" && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            All modules complete! Pass the final assessment (30 questions, 75% to pass) to earn your career certificate.
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> 30 Questions</span>
                            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 35 Min Timer</span>
                            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> 75% to Pass</span>
                          </div>
                          <Button asChild className="mt-1">
                            <Link href={`/student/career-assessment/${selectedPath.id}`}>
                              Start Final Assessment <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </>
                      )}

                      {status === "certified" && cert && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Certificate earned! Score: <span className="font-semibold text-emerald-600">{cert.score}%</span> • ID: {cert.certificate_id}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href="/student/certifications">
                                <Award className="w-3.5 h-3.5 mr-1.5" /> View Certificate
                              </Link>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/student/career-assessment/${selectedPath.id}`}>
                                Retake
                              </Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> AI Career Mentor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-sm leading-relaxed text-muted-foreground">
                <p className="mb-3">
                  Based on your current skills, you have a <strong className="text-foreground">{getSuitability(selectedPath)}% match</strong> for <strong>{selectedPath.title}</strong>.
                </p>
                <p className="mb-3">
                  <strong>Strengths:</strong> You have verified experience in some of the core frontend technologies.
                </p>
                <p>
                  <strong>Next Steps:</strong> Focus on completing Phase 3. Consider taking the Node.js assessment or enrolling in a backend development course.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/student/copilot">
                  Discuss Career Plan <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Key Skills Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedPath.requiredSkills.map((skill) => {
                  const hasSkill = skills.some(
                    (s) => s.name.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <Badge
                      key={skill}
                      variant={hasSkill ? "default" : "secondary"}
                      className={hasSkill ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" : ""}
                    >
                      {skill} {hasSkill && <CheckCircle2 className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} modal={true} className="sm:max-w-3xl">
        <Command className="bg-card/70 backdrop-blur-2xl border-none h-full">
          <CommandInput placeholder="Type a career path or skill to search..." className="border-none focus:ring-0 text-base py-4" />
          <CommandList className="bg-transparent pb-2 max-h-[60vh]">
            <CommandEmpty>No career path found.</CommandEmpty>
            <CommandGroup heading="All Paths" className="text-foreground">
              {CAREER_PATHS.map((path) => {
                const suitability = getSuitability(path);
                return (
                  <CommandItem
                    key={path.id}
                    value={`${path.title} ${path.requiredSkills.join(" ")}`}
                    onSelect={() => {
                      setSelectedPath(path);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 px-4 cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                  >
                    <div className={`p-2 rounded-lg ${path.bg}`}>
                      <path.icon className={`w-4 h-4 ${path.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{path.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{path.description}</div>
                    </div>
                    <Badge variant={suitability >= 70 ? "default" : "secondary"} className="shrink-0">
                      {suitability}% Match
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
