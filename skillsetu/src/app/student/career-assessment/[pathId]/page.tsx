"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock, ChevronRight, ChevronLeft, CheckCircle2,
  XCircle, Trophy, RotateCcw, Lock, ArrowLeft,
  AlertTriangle, Loader2, Award, Sparkles, BarChart3,
  Shield, BookOpen, Flag
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { getQuestionsForPath, type AssessmentQuestionData } from "@/lib/data/career-assessment-questions";
import { useCareerAssessment, type CareerAssessmentAttempt } from "@/lib/hooks/useCareerAssessment";
import { useLearningHub } from "@/lib/hooks/useLearningHub";

type ViewState = "loading" | "locked" | "ready" | "quiz" | "results";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const TIMER_MINUTES = 35;

export default function CareerAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.pathId as string;

  const careerPath = CAREER_PATHS.find((p) => p.id === pathId);
  const { checkPathCompletion, getAttempts, submitAttempt, loading: hookLoading } = useCareerAssessment();
  const { enrollments, loading: enrollmentsLoading } = useLearningHub();

  // State
  const [view, setView] = useState<ViewState>("loading");
  const [questions, setQuestions] = useState<AssessmentQuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(TIMER_MINUTES * 60);
  const [startedAt, setStartedAt] = useState<string>("");
  const [pastAttempts, setPastAttempts] = useState<CareerAssessmentAttempt[]>([]);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    certificateId: string | null;
    correctCount: number;
    totalCount: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmitRef = useRef(false);

  // ── Init: check path completion ──
  useEffect(() => {
    if (!careerPath || enrollmentsLoading) return;

    const init = async () => {
      const phases = careerPath.phases;

      // Check which phases are complete using enrollments from hook
      const completed: string[] = [];
      for (const phase of phases) {
        const enrollment = enrollments.find(
          (e) => (e.program as any)?.title === phase.title && e.progress_pct === 100
        );
        if (enrollment) completed.push(phase.title);
      }
      setCompletedPhases(completed);

      const allComplete = completed.length === phases.length;

      if (!allComplete) {
        setView("locked");
        return;
      }

      // Load past attempts
      const attempts = await getAttempts(pathId);
      setPastAttempts(attempts);
      setView("ready");
    };

    init();
  }, [careerPath, enrollmentsLoading, enrollments, getAttempts, pathId]);

  // ── Timer ──
  useEffect(() => {
    if (view !== "quiz") return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (!autoSubmitRef.current) {
            autoSubmitRef.current = true;
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── Start Quiz ──
  const handleStart = useCallback(() => {
    const allQuestions = getQuestionsForPath(pathId);
    const shuffled = shuffleArray(allQuestions).slice(0, 30);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setTimeRemaining(TIMER_MINUTES * 60);
    setStartedAt(new Date().toISOString());
    setResult(null);
    autoSubmitRef.current = false;
    setView("quiz");
  }, [pathId]);

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const res = await submitAttempt(pathId, startedAt, answers);

    if (res.success) {
      setResult({
        score: res.score!,
        passed: res.passed!,
        certificateId: res.certificateId || null,
        correctCount: Math.round((res.score! / 100) * questions.length),
        totalCount: questions.length,
      });
      setView("results");
      if (res.passed) {
        toast.success("🎉 Congratulations! You passed the assessment!");
      } else {
        toast.error("You didn't meet the passing score. You can retake the assessment.");
      }
    } else {
      toast.error("Failed to submit assessment. Please try again.");
    }
    setSubmitting(false);
  }, [submitting, submitAttempt, pathId, startedAt, answers, questions.length]);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const timerDanger = timeRemaining < 300; // less than 5 min

  // ── Not found ──
  if (!careerPath) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Career Path Not Found</h1>
        <Button asChild><Link href="/student/career-guidance"><ArrowLeft className="w-4 h-4 mr-2" />Back to Career Guidance</Link></Button>
      </div>
    );
  }

  const PathIcon = careerPath.icon;

  // ── Loading ──
  if (view === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking your progress...</p>
        </div>
      </div>
    );
  }

  // ── Locked ──
  if (view === "locked") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/student/career-guidance"><ArrowLeft className="w-4 h-4 mr-2" />Back to Career Guidance</Link>
        </Button>

        <Card className="border-border/50 overflow-hidden">
          <div className={`h-2 ${careerPath.bg}`} />
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 rounded-2xl ${careerPath.bg} flex items-center justify-center mx-auto mb-4`}>
              <Lock className={`w-8 h-8 ${careerPath.color}`} />
            </div>
            <CardTitle className="text-2xl">Assessment Locked</CardTitle>
            <p className="text-muted-foreground mt-2">
              Complete all modules in the <span className="font-semibold text-foreground">{careerPath.title}</span> career path to unlock the final assessment.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pb-8">
            <p className="text-sm font-medium text-muted-foreground mb-4">Module Completion Status:</p>
            {careerPath.phases.map((phase) => {
              const isComplete = completedPhases.includes(phase.title);
              return (
                <div key={phase.title} className={`flex items-center gap-3 p-3 rounded-lg border ${isComplete ? "bg-emerald-500/5 border-emerald-500/20" : "bg-secondary/20 border-border/50"}`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>{phase.title}</span>
                  {isComplete && <Badge className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Complete</Badge>}
                </div>
              );
            })}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{completedPhases.length} of {careerPath.phases.length} modules completed</p>
              <Button asChild className="mt-4">
                <Link href="/student/learning-hub">Go to Learning Hub</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Ready to Start ──
  if (view === "ready") {
    const bestAttempt = pastAttempts.length > 0
      ? pastAttempts.reduce((best, a) => (a.score > best.score ? a : best), pastAttempts[0])
      : null;
    const alreadyPassed = pastAttempts.some((a) => a.passed);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/student/career-guidance"><ArrowLeft className="w-4 h-4 mr-2" />Back to Career Guidance</Link>
        </Button>

        <Card className="border-border/50 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${careerPath.color === "text-blue-500" ? "from-blue-500 to-cyan-500" : careerPath.color === "text-emerald-500" ? "from-emerald-500 to-teal-500" : careerPath.color === "text-amber-500" ? "from-amber-500 to-orange-500" : careerPath.color === "text-purple-500" ? "from-purple-500 to-violet-500" : careerPath.color === "text-red-500" ? "from-red-500 to-rose-500" : careerPath.color === "text-cyan-500" ? "from-cyan-500 to-sky-500" : "from-pink-500 to-fuchsia-500"}`} />
          <CardHeader className="text-center pb-4">
            <div className={`w-20 h-20 rounded-2xl ${careerPath.bg} flex items-center justify-center mx-auto mb-4`}>
              <Sparkles className={`w-10 h-10 ${careerPath.color}`} />
            </div>
            <CardTitle className="text-2xl">
              {alreadyPassed ? "🎉 Assessment Passed!" : "🎉 Congratulations!"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {alreadyPassed
                ? `You've already passed the ${careerPath.title} assessment. View your certificate or retake for a higher score.`
                : `You have completed all modules in the ${careerPath.title} path.`}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {!alreadyPassed && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
                <h3 className="text-lg font-semibold">Next Step: Final Assessment</h3>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />30 Questions</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />35 Minutes</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4" />No Negative Marking</div>
                  <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4" />75% to Pass</div>
                </div>
              </div>
            )}

            {bestAttempt && (
              <div className="bg-secondary/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Previous Best Score</p>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${bestAttempt.passed ? "text-emerald-500" : "text-amber-500"}`}>
                    {bestAttempt.score}%
                  </span>
                  <Badge className={bestAttempt.passed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                    {bestAttempt.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {bestAttempt.correct_count}/{bestAttempt.total_count} correct • Attempted {pastAttempts.length} time{pastAttempts.length > 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="gap-2 text-base" onClick={handleStart}>
                <Flag className="w-5 h-5" />
                {alreadyPassed ? "Retake Assessment" : "Start Final Assessment"}
              </Button>
              {alreadyPassed && (
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link href="/student/certifications">
                    <Award className="w-5 h-5" /> View Certificate
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Quiz ──
  if (view === "quiz" && currentQuestion) {
    const selectedAnswer = answers[currentQuestion.id];
    const isAnswered = selectedAnswer !== undefined;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Timer + Progress Bar */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-mono px-3 py-1.5">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <Badge
            variant="outline"
            className={`text-sm font-mono px-3 py-1.5 ${timerDanger ? "border-red-500/50 text-red-500 animate-pulse" : ""}`}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {formatTime(timeRemaining)}
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-full bg-secondary/30 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Answered count */}
        <p className="text-xs text-muted-foreground text-right">
          {answeredCount} of {questions.length} answered
        </p>

        {/* Question Card */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold leading-relaxed">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const optLetter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
                    }}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 group
                      ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                      }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                      ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                      {optLetter}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((p) => p + 1)}
              disabled={!isAnswered}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Flag className="w-4 h-4 mr-2" />}
              Submit Assessment
            </Button>
          )}
        </div>

        {/* Question Navigator Dots */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-2">
          {questions.map((q, i) => {
            const isActive = i === currentIndex;
            const isDone = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => { if (isDone || i <= currentIndex) setCurrentIndex(i); }}
                disabled={!isDone && i > currentIndex}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all
                  ${isActive ? "bg-primary text-primary-foreground scale-110" :
                    isDone ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30" :
                    "bg-secondary/30 text-muted-foreground/50"}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Results ──
  if (view === "results" && result) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="border-border/50 overflow-hidden">
          <div className={`h-2 ${result.passed ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`} />
          <CardHeader className="text-center pb-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
              {result.passed ? (
                <Trophy className="w-10 h-10 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {result.passed ? "🎉 Assessment Passed!" : "Assessment Not Passed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {/* Score Display */}
            <div className="text-center">
              <p className={`text-6xl font-bold ${result.passed ? "text-emerald-500" : "text-amber-500"}`}>
                {result.score}%
              </p>
              <p className="text-muted-foreground mt-1">
                {result.correctCount} of {result.totalCount} correct
              </p>
              <Badge className={`mt-3 ${result.passed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                {result.passed ? "PASS — Score ≥ 75%" : `FAIL — Minimum 75% required`}
              </Badge>
            </div>

            {/* Score Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">75% passing</span>
                <span>100%</span>
              </div>
              <div className="relative w-full h-4 bg-secondary/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${result.passed ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${result.score}%` }}
                />
                <div className="absolute top-0 left-[75%] w-0.5 h-full bg-foreground/30" />
              </div>
            </div>

            {/* Message */}
            {!result.passed && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-sm">
                  You scored <span className="font-bold">{result.score}%</span>. Minimum passing score is <span className="font-bold">75%</span>.
                </p>
                <p className="text-sm text-muted-foreground mt-1">Please retake the assessment. Your module progress is preserved.</p>
              </div>
            )}

            {result.passed && result.certificateId && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2">
                <Award className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold">Career Path Certificate Earned!</p>
                <p className="text-sm text-muted-foreground">Certificate ID: {result.certificateId}</p>
              </div>
            )}

            {/* Question Review */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-primary hover:underline flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Review Answers ({result.correctCount}/{result.totalCount})
              </summary>
              <div className="mt-4 space-y-3">
                {questions.map((q, i) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correctOption;
                  return (
                    <div key={q.id} className={`p-3 rounded-lg border text-sm ${isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">Q{i + 1}: {q.question}</p>
                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Your answer: {q.options[userAns] ?? "Not answered"} — Correct: {q.options[q.correctOption]}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 italic">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {!result.passed && (
                <Button size="lg" onClick={handleStart} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Retake Assessment
                </Button>
              )}
              {result.passed && (
                <Button size="lg" asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/student/certifications">
                    <Award className="w-4 h-4" /> View Certificate
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/student/career-guidance">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Career Guidance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
