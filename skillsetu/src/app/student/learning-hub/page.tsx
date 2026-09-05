"use client";

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
import { useLearningHub } from "@/lib/hooks/useLearningHub";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";

const MOCK_PROGRAMS = [
  {
    id: "mock-tech-1",
    title: "Full Stack Web Development with Next.js",
    provider: "Sheryians Coding School",
    type: "tech",
    skills_covered: ["React", "Next.js", "Node.js", "MongoDB"],
    url: "https://www.youtube.com/watch?v=8hly31xKli0"
  },
  {
    id: "mock-apti-1",
    title: "Quantitative Aptitude Mastery",
    provider: "SkillSetu Prep",
    type: "aptitude",
    skills_covered: ["Problem Solving", "Mathematics", "Speed Math"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "mock-comm-1",
    title: "Business Communication & Soft Skills",
    provider: "Corporate Trainers Inc",
    type: "communication",
    skills_covered: ["Public Speaking", "Email Etiquette", "Negotiation"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

export default function LearningHubPage() {
  const { programs, enrollments, loading, enroll, updateProgress } = useLearningHub();
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Group enrollments by status
  const activeEnrollments = enrollments.filter((e) => e.progress_pct < 100);
  const completedEnrollments = enrollments.filter((e) => e.progress_pct === 100);

  // Filter programs that aren't enrolled in (mix in mocks)
  const enrolledIds = new Set(enrollments.map((e) => e.program_id));
  const allPrograms = [...programs, ...MOCK_PROGRAMS as any[]];
  
  const availablePrograms = allPrograms.filter(
    (p) => !enrolledIds.has(p.id) && (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const handleEnroll = async (programId: string) => {
    setEnrollingId(programId);
    try {
      const { success, error } = await enroll(programId);
      if (success) {
        toast.success("Successfully enrolled in program!");
        await awardXp("course_enrolled", { program_id: programId });
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
                    <Button variant="outline" size="sm" asChild>
                      <a href={program.url || "#"} target="_blank" rel="noopener noreferrer">
                        Resume Course
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteProgram(enrollment.id, program.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Mark Completed
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
            <BookOpen className="w-5 h-5 text-primary" /> Program Catalog
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePrograms.map((program) => {
            const isEnrolling = enrollingId === program.id;
            
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
                      {program.skills_covered.slice(0, 3).map((skill, i) => (
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
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Enroll Now"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
          
          {availablePrograms.length === 0 && (
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
