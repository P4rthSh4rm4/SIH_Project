"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLearningHub, MOCK_PROGRAMS } from "@/lib/hooks/useLearningHub";
import { getCurriculum, getFlatLessons } from "@/lib/data/curriculums";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, PlayCircle, CheckCircle2, Clock, BookOpen, Award, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";

export default function CourseViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { programs, enrollments, loading, updateProgress } = useLearningHub();
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleModule = (moduleId: string) => {
    setCollapsedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  // Find program and enrollment
  const allPrograms = programs.length > 0 ? programs : (MOCK_PROGRAMS as any[]);
  const program = allPrograms.find((p) => p.id === id);
  const enrollment = enrollments.find((e) => e.program_id === id);

  // Curriculum setup
  const curriculum = program ? getCurriculum(program.title) : getCurriculum("");
  
  const flatLessons = getFlatLessons(curriculum);
  const totalLessons = flatLessons.length;
  
  // Calculate completion state
  const progressPct = enrollment?.progress_pct || 0;
  // Use Math.round to avoid floating point precision issues when checking boundaries
  const completedLessons = progressPct === 100 ? totalLessons : Math.floor((progressPct / 100) * totalLessons);

  // On mount or data load, set active lesson to the first uncompleted lesson
  useEffect(() => {
    if (completedLessons < totalLessons) {
      setActiveLessonIndex(completedLessons);
    } else {
      setActiveLessonIndex(totalLessons - 1);
    }
  }, [completedLessons, totalLessons]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-6 text-center py-20">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <p className="text-muted-foreground">The course you are looking for does not exist.</p>
        <Button asChild><Link href="/student/learning-hub">Return to Learning Hub</Link></Button>
      </div>
    );
  }

  const activeLessonData = flatLessons[activeLessonIndex];
  const activeModule = curriculum.modules[activeLessonData?.moduleIndex];
  const isCurrentlyCompleted = activeLessonIndex < completedLessons;
  const isCourseComplete = progressPct === 100;

  // Shared completion estimate used by both Course Overview and Course Content sidebar
  const completionDays = (() => {
    if (!curriculum.estimated_duration) return 2;
    let hours = 0;
    let mins = 0;
    const hrMatch = curriculum.estimated_duration.match(/(\d+)\s*hr/);
    if (hrMatch) hours = parseInt(hrMatch[1], 10);
    const minMatch = curriculum.estimated_duration.match(/(\d+)\s*min/);
    if (minMatch) mins = parseInt(minMatch[1], 10);
    const totalHours = hours + (mins / 60);
    if (totalHours < 2) return 2;
    if (totalHours <= 4) return 3;
    if (totalHours <= 6) return 5;
    return 7;
  })();

  const handleMarkComplete = async () => {
    if (!enrollment || isUpdating || isCurrentlyCompleted) return;
    
    setIsUpdating(true);
    try {
      const nextCompletedCount = completedLessons + 1;
      let newPct = Math.round((nextCompletedCount / totalLessons) * 100);
      
      // Ensure we hit exactly 100% when all lessons are done
      if (nextCompletedCount >= totalLessons) {
        newPct = 100;
      }
      
      const { success, error } = await updateProgress(enrollment.id, newPct);
      
      if (success) {
        toast.success("Lesson completed!");
        if (newPct === 100) {
          toast.success("🎉 Module complete! Check Career Guidance to see if your career path assessment is unlocked.", { duration: 6000 });
          await awardXp("course_completed", { program_id: program.id });
        } else if (activeLessonIndex < totalLessons - 1) {
          // Auto advance to next lesson
          setActiveLessonIndex(activeLessonIndex + 1);
        }
      } else {
        toast.error(error || "Failed to save progress");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/student/learning-hub">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{program.provider || curriculum.instructor}</Badge>
            {isCourseComplete && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white">
                <Award className="w-3 h-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{program.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Video & Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden border-border/50 bg-black">
            <div className="aspect-video w-full relative">
              {activeLessonData ? (
                <iframe 
                  key={activeLessonData.lesson.id}
                  width="100%" 
                  height="100%" 
                  src={`${activeLessonData.lesson.youtube_url}?autoplay=1&rel=0`}
                  title={activeLessonData.lesson.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Video not available
                </div>
              )}
            </div>
            
            <CardContent className="p-4 sm:p-6 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Module {activeLessonData?.moduleIndex + 1}: {activeModule?.title}
                </p>
                <h2 className="text-lg font-semibold">{activeLessonData?.lesson.title}</h2>
                {activeLessonData?.lesson.description && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                    {activeLessonData.lesson.description}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleMarkComplete} 
                disabled={isUpdating || isCurrentlyCompleted || !enrollment}
                className={isCurrentlyCompleted ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}
                variant={isCurrentlyCompleted ? "secondary" : "default"}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isCurrentlyCompleted ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {isCurrentlyCompleted ? "Completed" : "Mark Lesson Complete"}
              </Button>
            </CardContent>
          </Card>

          {/* Course Information Tabs/Details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>{curriculum.overview}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Time to Complete</span>
                  </div>
                  <p className="text-sm font-semibold">{completionDays} Days</p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium">Lessons</span>
                  </div>
                  <p className="text-sm font-semibold">{totalLessons} Modules</p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Level</span>
                  </div>
                  <p className="text-sm font-semibold">{curriculum.difficulty}</p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Certificate</span>
                  </div>
                  <p className="text-sm font-semibold">Yes</p>
                </div>
              </div>

              {program.skills_covered && program.skills_covered.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Skills you'll learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {program.skills_covered.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Curriculum) */}
        <div className="space-y-6">
          <Card className="border-border/50 sticky top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Course Content</CardTitle>
                {curriculum.estimated_duration && (
                  <Badge variant="outline" className="text-xs font-normal bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {`Complete in ${completionDays} Days`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm mt-2 mb-1">
                <span className="text-muted-foreground">{completedLessons} of {totalLessons} completed</span>
                <span className="font-medium text-primary">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full flex flex-col">
                {curriculum.modules.map((module, mIdx) => {
                  const isCollapsed = collapsedModules.includes(module.id);
                  return (
                    <div key={module.id} className="border-b border-border/30 last:border-0 flex flex-col">
                      <button 
                        onClick={() => toggleModule(module.id)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary/10 transition-colors text-left"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-sm font-semibold">{module.title}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {module.lessons.length} lessons
                          </span>
                        </div>
                        {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      
                      {!isCollapsed && (
                        <div className="flex flex-col pb-1">
                          {module.lessons.map((lesson, lIdx) => {
                            // Find flat index
                            const flatIndex = flatLessons.findIndex(
                              (f) => f.moduleIndex === mIdx && f.lessonIndex === lIdx
                            );
                            const isActive = flatIndex === activeLessonIndex;
                            const isCompleted = flatIndex < completedLessons;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLessonIndex(flatIndex)}
                                className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                                  isActive 
                                    ? "bg-primary/5 border-l-2 border-primary" 
                                    : "hover:bg-secondary/20 border-l-2 border-transparent"
                                }`}
                              >
                                <div className="shrink-0 mt-0.5">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : isActive ? (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-muted-foreground/50" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`truncate ${isActive ? "font-medium text-primary" : "text-foreground/80"}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
