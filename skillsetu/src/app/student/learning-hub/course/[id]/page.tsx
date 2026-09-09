"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import YouTube from "react-youtube";

// Helpers
function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push([...current] as [number, number]);
    }
  }
  return merged;
}

function calculateTotalWatched(intervals: [number, number][]) {
  return intervals.reduce((acc, curr) => acc + (curr[1] - curr[0]), 0);
}

function extractVideoId(url: string) {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export default function CourseViewerPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { programs, enrollments, loading, updateProgress } = useLearningHub();
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tracking state & refs
  const playerRef = useRef<any>(null);
  const trackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentRangesRef = useRef<[number, number][]>([]);
  const activeLessonIdRef = useRef<string | null>(null);
  
  const [lessonDuration, setLessonDuration] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  // Find program and enrollment
  const allPrograms = [...programs];
  MOCK_PROGRAMS.forEach(mock => {
    if (!allPrograms.some(p => p.id === mock.id || p.title === mock.title)) {
      allPrograms.push(mock as any);
    }
  });
  
  const program = allPrograms.find((p) => p.id === id);
  const enrollment = enrollments.find((e) => e.program_id === id);
  const lessonProgressMap = enrollment?.lesson_progress_json || {};

  // Curriculum setup
  const curriculum = program ? getCurriculum(program.title) : getCurriculum("");
  const flatLessons = getFlatLessons(curriculum);
  const totalLessons = flatLessons.length;
  
  // Refs for stable saveProgress
  const enrollmentRef = useRef(enrollment);
  const lessonProgressMapRef = useRef(lessonProgressMap);
  const flatLessonsRef = useRef(flatLessons);
  const updateProgressRef = useRef(updateProgress);
  const lessonDurationRef = useRef(lessonDuration);

  useEffect(() => {
    enrollmentRef.current = enrollment;
    lessonProgressMapRef.current = lessonProgressMap;
    flatLessonsRef.current = flatLessons;
    updateProgressRef.current = updateProgress;
    lessonDurationRef.current = lessonDuration;
  }, [enrollment, lessonProgressMap, flatLessons, updateProgress, lessonDuration]);

  // Overall Course Progress Calculation
  let completedLessonsCount = 0;
  let totalPctSum = 0;

  flatLessons.forEach(f => {
    const lp = lessonProgressMap[f.lesson.id];
    if (lp?.completed) {
      completedLessonsCount++;
      totalPctSum += 100;
    } else if (lp?.duration > 0) {
      const wSecs = calculateTotalWatched(lp.watched_ranges || []);
      let pct = (wSecs / lp.duration) * 100;
      if (pct > 100) pct = 100;
      totalPctSum += pct;
    }
  });

  const progressPct = totalLessons > 0 ? Math.round(totalPctSum / totalLessons) : 0;
  const isCourseComplete = progressPct === 100;

  // On mount or data load, set active lesson to the first uncompleted lesson
  useEffect(() => {
    if (flatLessons.length === 0) return;
    const firstUncompletedIndex = flatLessons.findIndex(f => !lessonProgressMap[f.lesson.id]?.completed);
    if (firstUncompletedIndex !== -1) {
      setActiveLessonIndex(firstUncompletedIndex);
    } else {
      setActiveLessonIndex(totalLessons - 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalLessons]); // Only run when totalLessons loads

  const activeLessonData = flatLessons[activeLessonIndex];
  const activeModule = curriculum.modules[activeLessonData?.moduleIndex];
  
  // Track currently active lesson ID for ref
  useEffect(() => {
    if (activeLessonData) {
      activeLessonIdRef.current = activeLessonData.lesson.id;
      const lp = lessonProgressMap[activeLessonData.lesson.id];
      currentRangesRef.current = lp?.watched_ranges ? [...lp.watched_ranges] : [];
      lastTimeRef.current = 0;
      setLessonDuration(lp?.duration || 0);
      setWatchedSeconds(calculateTotalWatched(currentRangesRef.current));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonIndex, activeLessonData?.lesson.id]); // Prevent infinite loop by using stable string ID instead of object reference

  const saveProgress = useCallback(async (forcedComplete = false) => {
    const curEnrollment = enrollmentRef.current;
    if (!curEnrollment || !activeLessonIdRef.current) return;
    
    const lId = activeLessonIdRef.current;
    const dur = playerRef.current ? playerRef.current.getDuration() : lessonDurationRef.current;
    const cTime = playerRef.current ? playerRef.current.getCurrentTime() : lastTimeRef.current;
    const ranges = [...currentRangesRef.current]; // clone
    
    const curMap = lessonProgressMapRef.current;
    const lp = curMap[lId] || { completed: false };
    
    // Don't un-complete a lesson
    const isNowCompleted = forcedComplete || lp.completed;
    
    const newLp = {
      ...lp,
      duration: dur,
      last_position: cTime,
      watched_ranges: ranges,
      completed: isNowCompleted
    };
    
    const updatedMap = {
      ...curMap,
      [lId]: newLp
    };
    
    // Recalculate course percentage
    let completedCount = 0;
    let pctSum = 0;
    const fLessons = flatLessonsRef.current;
    fLessons.forEach(f => {
      const p = updatedMap[f.lesson.id];
      if (p?.completed) {
        completedCount++;
        pctSum += 100;
      } else if (p?.duration > 0) {
        let pct = (calculateTotalWatched(p.watched_ranges || []) / p.duration) * 100;
        if (pct > 100) pct = 100;
        pctSum += pct;
      }
    });
    
    const newCoursePct = fLessons.length > 0 ? Math.round(pctSum / fLessons.length) : 0;
    
    // Fire and forget
    updateProgressRef.current(curEnrollment.id, newCoursePct, updatedMap);
  }, []);

  // Handle Mark Complete manually or automatically
  const handleMarkComplete = useCallback(async () => {
    if (isUpdating) return;
    const lId = activeLessonIdRef.current;
    if (!lId || lessonProgressMapRef.current[lId]?.completed) return;
    
    setIsUpdating(true);
    try {
      await saveProgress(true); // force complete
      toast.success("Lesson completed!");
      
      const newCompletedCount = completedLessonsCount + 1;
      if (newCompletedCount >= totalLessons) {
        toast.success("🎉 Course complete! Check Career Guidance to see if your career path assessment is unlocked.", { duration: 6000 });
        await awardXp("course_completed", { program_id: program!.id });
      } else if (activeLessonIndex < totalLessons - 1) {
        setActiveLessonIndex(activeLessonIndex + 1);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, saveProgress, completedLessonsCount, totalLessons, activeLessonIndex, program]);

  // Tracking loop
  const startTracking = () => {
    if (trackIntervalRef.current) clearInterval(trackIntervalRef.current);
    trackIntervalRef.current = setInterval(() => {
      if (!playerRef.current || !activeLessonIdRef.current) return;
      const cTime = playerRef.current.getCurrentTime();
      
      if (lastTimeRef.current > 0 && Math.abs(cTime - lastTimeRef.current) <= 2) {
         currentRangesRef.current = mergeIntervals([
           ...currentRangesRef.current, 
           [lastTimeRef.current, cTime]
         ]);
      }
      lastTimeRef.current = cTime;
      
      const currentDur = playerRef.current.getDuration() || lessonDurationRef.current;
      if (currentDur > 0 && currentDur !== lessonDurationRef.current) {
         setLessonDuration(currentDur);
      }
      
      const totalW = calculateTotalWatched(currentRangesRef.current);
      setWatchedSeconds(totalW);
      
      // Auto complete
      const lp = lessonProgressMapRef.current[activeLessonIdRef.current];
      if (currentDur > 0 && !lp?.completed && totalW >= currentDur * 0.95) {
         handleMarkComplete();
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (trackIntervalRef.current) clearInterval(trackIntervalRef.current);
  };

  // Auto-Save Loop & Unload
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) {
        saveProgress();
      }
    }, 5000); // 5 seconds

    const handleBeforeUnload = () => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) {
        saveProgress();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      if (playerRef.current && playerRef.current.getPlayerState() === 1) {
        saveProgress();
      }
      stopTracking();
    };
  }, [saveProgress]);

  const toggleModule = (moduleId: string) => {
    setCollapsedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!program || !activeLessonData) {
    return (
      <div className="space-y-6 text-center py-20">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <p className="text-muted-foreground">The course you are looking for does not exist.</p>
        <Button asChild><Link href="/student/learning-hub">Return to Learning Hub</Link></Button>
      </div>
    );
  }

  const currentLessonProgress = lessonProgressMapRef.current[activeLessonData.lesson.id];
  const isCurrentlyCompleted = currentLessonProgress?.completed || false;
  
  const calcRawPct = lessonDuration > 0 ? (watchedSeconds / lessonDuration) * 100 : 0;
  // If it's greater than 0 but rounds to 0, show <1 so the user knows it's tracking
  const displayPct = isCurrentlyCompleted 
    ? 100 
    : calcRawPct > 0 && calcRawPct < 1 
      ? 1 // show 1% minimum if they've watched something
      : Math.min(100, Math.round(calcRawPct));

  // Shared completion estimate (Dynamically read from the stored curriculum estimated_duration)
  const completionDays = (() => {
    if (!curriculum.estimated_duration) return 5;
    const match = curriculum.estimated_duration.match(/\d+/);
    if (match) return parseInt(match[0], 10);
    return 5;
  })();

  const videoId = extractVideoId(activeLessonData.lesson.youtube_url);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0" onClick={() => saveProgress()}>
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
            <div className="aspect-video w-full relative group">
              {videoId ? (
                <YouTube
                  videoId={videoId}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      rel: 0,
                      modestbranding: 1,
                    },
                  }}
                  className="absolute inset-0 w-full h-full"
                  onReady={(e) => {
                    playerRef.current = e.target;
                    const dur = e.target.getDuration();
                    setLessonDuration(dur);
                    if (currentLessonProgress?.last_position > 0) {
                      e.target.seekTo(currentLessonProgress.last_position, true);
                    }
                  }}
                  onStateChange={(e) => {
                    // 1 = PLAYING
                    if (e.data === 1) {
                      startTracking();
                    } else {
                      stopTracking();
                      saveProgress();
                    }
                    // 0 = ENDED
                    if (e.data === 0 && !isCurrentlyCompleted) {
                      handleMarkComplete();
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Invalid Video URL
                </div>
              )}
            </div>
            
            <CardContent className="p-4 sm:p-6 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    Module {activeLessonData.moduleIndex + 1}: {activeModule?.title}
                  </p>
                  <span className="text-sm font-medium text-primary ml-4">
                    {isCurrentlyCompleted ? 100 : displayPct}% Watched
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{activeLessonData.lesson.title}</h2>
                {activeLessonData.lesson.description && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                    {activeLessonData.lesson.description}
                  </p>
                )}
                <div className="mt-4">
                   <Progress value={isCurrentlyCompleted ? 100 : displayPct} className="h-2" />
                </div>
              </div>
              
              <Button 
                onClick={handleMarkComplete} 
                disabled={isUpdating || isCurrentlyCompleted || !enrollment}
                className={`shrink-0 mt-4 sm:mt-0 ${isCurrentlyCompleted ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}`}
                variant={isCurrentlyCompleted ? "secondary" : "default"}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isCurrentlyCompleted ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {isCurrentlyCompleted ? "Completed" : "Mark Complete"}
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
                <span className="text-muted-foreground">{completedLessonsCount} of {totalLessons} completed</span>
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
                            const flatIndex = flatLessons.findIndex(
                              (f) => f.moduleIndex === mIdx && f.lessonIndex === lIdx
                            );
                            const isActive = flatIndex === activeLessonIndex;
                            const lp = lessonProgressMap[lesson.id];
                            const isCompleted = lp?.completed;
                            
                            // Calculate local pct
                            const lPct = lp?.duration > 0 
                              ? Math.min(100, Math.round((calculateTotalWatched(lp.watched_ranges || []) / lp.duration) * 100))
                              : 0;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLessonIndex(flatIndex)}
                                className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors relative overflow-hidden ${
                                  isActive 
                                    ? "bg-primary/5 border-l-2 border-primary" 
                                    : "hover:bg-secondary/20 border-l-2 border-transparent"
                                }`}
                              >
                                {isActive && !isCompleted && lPct > 0 && (
                                  <div 
                                    className="absolute bottom-0 left-0 h-0.5 bg-primary/40" 
                                    style={{ width: `${lPct}%` }}
                                  />
                                )}
                                <div className="shrink-0 mt-0.5 z-10">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : isActive ? (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-muted-foreground/50" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 z-10">
                                  <p className={`truncate ${isActive ? "font-medium text-primary" : "text-foreground/80"}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                                {!isCompleted && !isActive && lPct > 0 && (
                                  <div className="text-[10px] font-medium text-muted-foreground z-10">
                                    {lPct}%
                                  </div>
                                )}
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
