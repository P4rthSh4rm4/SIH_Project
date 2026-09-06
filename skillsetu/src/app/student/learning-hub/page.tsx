"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, PlayCircle, CheckCircle2, Clock, 
  Award, TrendingUp, Search, Filter, Loader2,
  ExternalLink, Layers
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLearningHub, MOCK_PROGRAMS } from "@/lib/hooks/useLearningHub";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";

export default function LearningHubPage() {
  return (
    <Suspense fallback={<LearningHubSkeleton />}>
      <LearningHubContent />
    </Suspense>
  );
}

function LearningHubSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-muted-foreground mt-1">Loading your learning dashboard...</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function LearningHubContent() {
  const { programs, enrollments, loading, enroll, updateProgress } = useLearningHub();
  const searchParams = useSearchParams();
  const phaseQuery = searchParams.get("phase");
  const skillsQuery = searchParams.get("skills");

  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Group enrollments by status
  const activeEnrollments = enrollments.filter((e) => e.progress_pct < 100);
  const completedEnrollments = enrollments.filter((e) => e.progress_pct === 100);

  const enrolledIds = new Set(enrollments.map((e) => e.program_id));
  const allPrograms = programs.length > 0 ? programs : (MOCK_PROGRAMS as any[]);
  
  let exactMatches: any[] = [];
  let similarMatches: any[] = [];

  if (phaseQuery && !searchQuery) {
    exactMatches = allPrograms.filter(p => p.title.toLowerCase().includes(phaseQuery.toLowerCase()));
    
    if (exactMatches.length === 0 && skillsQuery) {
      const phaseSkills = skillsQuery.toLowerCase().split(',');
      similarMatches = allPrograms.filter(p => {
        if (!p.skills_covered) return false;
        return p.skills_covered.some((s: string) => phaseSkills.includes(s.toLowerCase()));
      });
    }
  }

  const isPhaseSearchActive = !!phaseQuery && !searchQuery;
  let availablePrograms = allPrograms;
  
  if (searchQuery) {
    availablePrograms = allPrograms.filter(
      (p) => (
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  } else if (isPhaseSearchActive) {
    availablePrograms = exactMatches.length > 0 ? exactMatches : similarMatches;
  }

  const showPhaseEmptyState = isPhaseSearchActive && availablePrograms.length === 0;

  console.log("[LearningHubPage] programs.length:", programs.length);
  console.log("[LearningHubPage] availablePrograms.length:", availablePrograms.length);

  const handleEnroll = async (programId: string) => {
    setEnrollingId(programId);
    try {
      const { success, error } = await enroll(programId);
      if (success) {
        toast.success("Successfully enrolled in program!");
        try {
          await awardXp("course_enrolled", { program_id: programId });
        } catch (xpErr) {
          console.error("Failed to award XP:", xpErr);
        }
      } else {
        toast.error(error || "Failed to enroll");
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const handleCompleteProgram = async (enrollmentId: string, programId: string) => {
    setUpdatingId(enrollmentId);
    try {
      const { success, error } = await updateProgress(enrollmentId, 100);
      if (success) {
        toast.success("Congratulations! Program completed.");
        await awardXp("course_completed", { program_id: programId });
      } else {
        toast.error(error || "Failed to update progress");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LearningHubSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-muted-foreground mt-1">
          Upskill with curated programs, track your progress, and earn XP.
        </p>
      </div>

      {/* Active Learning */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <PlayCircle className="w-5 h-5 text-primary" /> Active Programs & Recommended
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Embedded Sheryians AI School Video */}
          <Card className="border-border/50 hover:border-primary/30 transition-colors overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-2">
                    Sheryians AI School
                  </Badge>
                  <CardTitle className="text-lg leading-tight">Mastering React JS - Full Course</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/E6tAtRi82QY" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end gap-2">
              <Button size="sm" variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
              </Button>
            </CardFooter>
          </Card>

          {/* Shared by Faculty */}
          <Card className="border-red-500 border-2 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg z-10 shadow-sm">
              Shared by Faculty
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-2 border-red-200 text-red-600 bg-red-50">
                    Dr. Smith
                  </Badge>
                  <CardTitle className="text-lg leading-tight mt-1">Data Structures in C++</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/8hly31xKli0" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>



          {/* Existing Active Enrollments */}
          {activeEnrollments.map((enrollment) => {
              const program = enrollment.program as any; // Type assertion since it's joined
              if (!program) return null;
              
              const isUpdating = updatingId === enrollment.id;

              return (
                <Card key={enrollment.id} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline" className="mb-2">
                          {program.provider}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">{program.title}</CardTitle>
                      </div>
                      {program.url && (
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <a href={program.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-primary">{enrollment.progress_pct}% Completed</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={enrollment.progress_pct} className="h-2" />
                  </CardContent>
                  <CardFooter className="pt-0 justify-end gap-2">
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/student/learning-hub/course/${program.id}`}>
                        Resume Course
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
      </div>

      {/* Course Catalog */}
      <div className="space-y-4 pt-4 border-t border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="w-5 h-5 text-primary" /> 
            {isPhaseSearchActive ? `Recommended for: ${phaseQuery}` : "Program Catalog"}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search programs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {showPhaseEmptyState && (
          <div className="bg-muted/30 border border-border/50 rounded-xl p-8 text-center my-4">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Dedicated Course Found</h3>
            <p className="text-muted-foreground text-sm">
              No dedicated course is available for the <span className="font-semibold">"{phaseQuery}"</span> roadmap phase yet. 
              Browse our full catalog below for alternative learning options.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showPhaseEmptyState ? allPrograms : availablePrograms).map((program) => {
            const isEnrolling = enrollingId === program.id;
            const isAlreadyEnrolled = enrolledIds.has(program.id);
            
            return (
              <Card key={program.id} className="border-border/50 hover:shadow-md transition-all flex flex-col h-full">
                <CardHeader>
                  <div className="flex flex-col gap-1 items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-secondary/50">
                        {program.provider}
                      </Badge>
                      {program.type && (
                        <Badge variant="outline" className="capitalize">
                          {program.type}
                        </Badge>
                      )}
                    </div>
                    {program.skills_covered && program.skills_covered.length > 0 && (
                      <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5 text-primary mt-1">
                        +{program.skills_covered.length} Skills
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base line-clamp-2 leading-snug">{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4"></div>
                  {program.skills_covered && program.skills_covered.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {program.skills_covered.slice(0, 3).map((skill: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {skill}
                        </span>
                      ))}
                      {program.skills_covered.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                          +{program.skills_covered.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border/30 pt-4 bg-muted/20">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-primary" /> Certificate
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleEnroll(program.id)}
                      disabled={isEnrolling || isAlreadyEnrolled}
                    >
                      {isEnrolling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isAlreadyEnrolled ? "Enrolled" : "Enroll Now"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
          
          {availablePrograms.length === 0 && !showPhaseEmptyState && (
             <div className="col-span-full py-12 text-center text-muted-foreground">
               <p>No programs found matching "{searchQuery}"</p>
             </div>
          )}
        </div>
      </div>

      {/* Completed Programs (Compact) */}
      {completedEnrollments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Award className="w-5 h-5 text-emerald-500" /> Completed Programs
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedEnrollments.map((enrollment) => {
              const program = enrollment.program as any;
              if (!program) return null;
              
              return (
                <div key={enrollment.id} className="p-3 rounded-xl border border-border/50 bg-secondary/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{program.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(enrollment.completed_at || enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
