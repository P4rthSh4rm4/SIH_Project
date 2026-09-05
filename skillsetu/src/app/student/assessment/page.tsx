"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target, Code, Brain, MessageSquare, Clock, ChevronRight,
  CheckCircle2, XCircle, ArrowLeft, Flag, ChevronLeft,
  Loader2, Trophy, RotateCcw, BarChart3, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAssessments } from "@/lib/hooks/useAssessments";
import { awardXp } from "@/lib/supabase/queries";
import type { AssessmentQuestion, AssessmentResult } from "@/lib/hooks/useAssessments";

type ViewState = "catalog" | "quiz" | "results";

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  subcategories: Array<{ id: string; label: string; description: string }>;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "coding",
    label: "Coding",
    icon: Code,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    subcategories: [
      { id: "dsa", label: "DSA", description: "Arrays, Trees, Graphs, DP, Sorting" },
      { id: "sql", label: "SQL", description: "Queries, JOINs, Aggregations, Optimization" },
      { id: "web_dev", label: "Web Dev", description: "HTML, CSS, JS, React, APIs" },
    ],
  },
  {
    id: "aptitude",
    label: "Aptitude",
    icon: Brain,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    subcategories: [
      { id: "quant", label: "Quantitative", description: "Numbers, Percentages, Probability" },
      { id: "logical", label: "Logical Reasoning", description: "Puzzles, Patterns, Syllogisms" },
      { id: "verbal", label: "Verbal Ability", description: "Comprehension, Grammar, Vocabulary" },
    ],
  },
  {
    id: "soft_skills",
    label: "Soft Skills",
    icon: MessageSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    subcategories: [
      { id: "communication", label: "Communication", description: "Listening, Presentation, Feedback" },
      { id: "leadership", label: "Leadership", description: "Decision Making, Delegation, Vision" },
      { id: "teamwork", label: "Teamwork", description: "Collaboration, Conflict Resolution" },
      { id: "problem_solving", label: "Problem Solving", description: "Critical Thinking, Analysis" },
    ],
  },
];

const DIFFICULTIES = [
  { id: "beginner", label: "Beginner", color: "text-emerald-500" },
  { id: "intermediate", label: "Intermediate", color: "text-amber-500" },
  { id: "advanced", label: "Advanced", color: "text-red-500" },
];

const QUESTION_COUNTS = [5, 10, 15];

export default function SkillAssessmentPage() {
  const { history, loading: historyLoading, generateQuestions, evaluateAssessment, saveAssessment } = useAssessments();

  // Catalog state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz state
  const [view, setView] = useState<ViewState>("catalog");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleStartAssessment = async () => {
    if (!selectedCategory || !selectedSubcategory) {
      toast.error("Please select a category and subcategory");
      return;
    }
    setIsGenerating(true);
    try {
      const qs = await generateQuestions(
        selectedCategory,
        selectedSubcategory,
        selectedDifficulty,
        questionCount
      );
      setQuestions(qs);
      setAnswers({});
      setFlagged(new Set());
      setCurrentIndex(0);
      setStartTime(Date.now());
      setView("quiz");
      toast.success("Assessment ready! Good luck!");
    } catch {
      toast.error("Failed to generate questions. Check your Gemini API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedCategory || !selectedSubcategory) return;
    setIsSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const evalResult = await evaluateAssessment(
        selectedCategory,
        selectedSubcategory,
        questions,
        answers,
        timeTaken
      );
      setResult(evalResult);
      await saveAssessment(selectedCategory, selectedSubcategory, questions, answers, evalResult);
      await awardXp("assessment_completed", {
        score: evalResult.score,
        category: selectedCategory,
        subcategory: selectedSubcategory,
      });
      setView("results");
      toast.success(`Assessment complete! You scored ${evalResult.score}%`);
    } catch {
      toast.error("Failed to evaluate assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToCatalog = () => {
    setView("catalog");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setShowExplanations(false);
  };

  // ─── CATALOG VIEW ────────────────────────────────────────────
  if (view === "catalog") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Assessment</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered assessments to map your proficiency across Coding, Aptitude & Soft Skills
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              className={`border-border/50 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedCategory === cat.id
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-primary/5"
              }`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubcategory(null);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${cat.bg}`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{cat.label}</h3>
                </div>
                <div className="space-y-1.5">
                  {cat.subcategories.map((sub) => (
                    <div key={sub.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" />
                      {sub.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subcategory Selection */}
        {currentCategory && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <currentCategory.icon className={`w-5 h-5 ${currentCategory.color}`} />
                Choose a {currentCategory.label} Module
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentCategory.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      selectedSubcategory === sub.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{sub.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub.description}</p>
                  </button>
                ))}
              </div>

              {/* Difficulty & Count */}
              {selectedSubcategory && (
                <div className="flex flex-wrap items-end gap-6 pt-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Difficulty</p>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDifficulty(d.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedDifficulty === d.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-accent"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Questions</p>
                    <div className="flex gap-2">
                      {QUESTION_COUNTS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setQuestionCount(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            questionCount === c
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-accent"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleStartAssessment} disabled={isGenerating} className="ml-auto">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Start Assessment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Assessments */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No assessments taken yet. Choose a category above to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map((a) => {
                  const profile = a.generated_profile_json as Record<string, unknown> | null;
                  const score = (profile?.score as number) ?? 0;
                  const resp = a.responses_json as Record<string, string> | null;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {resp?.category ?? a.type} — {resp?.subcategory ?? "General"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.taken_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {score}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── QUIZ RUNNER VIEW ────────────────────────────────────────
  if (view === "quiz") {
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={resetToCatalog}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Exit
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">
              Question {currentIndex + 1} / {questions.length}
            </span>
            <Badge variant="secondary" className="text-xs">
              {answeredCount} answered
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold leading-relaxed">{currentQ.question}</h2>
                <button
                  onClick={() => {
                    setFlagged((prev) => {
                      const next = new Set(prev);
                      if (next.has(currentIndex)) next.delete(currentIndex);
                      else next.add(currentIndex);
                      return next;
                    });
                  }}
                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                    flagged.has(currentIndex)
                      ? "bg-amber-500/10 text-amber-500"
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Code Snippet */}
              {currentQ.codeSnippet && (
                <pre className="p-4 rounded-xl bg-secondary/50 overflow-x-auto text-sm font-mono leading-relaxed border border-border/30">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [String(currentIndex)]: i }))
                    }
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 text-sm ${
                      answers[String(currentIndex)] === i
                        ? "border-primary bg-primary/5 shadow-sm font-medium"
                        : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-secondary text-xs font-semibold mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Submit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigator */}
        <div className="flex flex-wrap gap-2 justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[String(i)] !== undefined
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : flagged.has(i)
                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── RESULTS VIEW ────────────────────────────────────────────
  if (view === "results" && result) {
    const scoreColor =
      result.score >= 70
        ? "text-emerald-500"
        : result.score >= 50
          ? "text-amber-500"
          : "text-red-500";
    const scoreBg =
      result.score >= 70
        ? "bg-emerald-500/10"
        : result.score >= 50
          ? "bg-amber-500/10"
          : "bg-red-500/10";

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" onClick={resetToCatalog}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
        </Button>

        {/* Score Card */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${scoreBg} mb-4`}>
              <span className={`text-3xl font-bold ${scoreColor}`}>{result.score}%</span>
            </div>
            <h2 className="text-xl font-bold mb-1">
              {result.score >= 70 ? "Excellent!" : result.score >= 50 ? "Good Effort!" : "Keep Practicing!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {result.correctCount} / {result.totalCount} correct • {Math.floor(result.timeTakenSeconds / 60)}m{" "}
              {result.timeTakenSeconds % 60}s
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">+100 XP Earned</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.feedback}</p>
          </CardContent>
        </Card>

        {/* Skills Assessed */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.skillsAssessed.map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      skill.score >= 70
                        ? "bg-emerald-500"
                        : skill.score >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Question Review Toggle */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Question Review</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
              >
                {showExplanations ? "Hide" : "Show"} Explanations
              </Button>
            </div>
          </CardHeader>
          {showExplanations && (
            <CardContent className="space-y-4">
              {questions.map((q, i) => {
                const qResult = result.questionResults[i];
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      qResult?.isCorrect
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {qResult?.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <p className="text-sm font-medium">{q.question}</p>
                    </div>
                    {!qResult?.isCorrect && (
                      <p className="text-xs text-muted-foreground ml-6 mb-1">
                        Your answer: <span className="font-medium">{q.options[qResult?.userAnswer ?? 0]}</span> •
                        Correct: <span className="font-medium text-emerald-600">{q.options[q.correctAnswer]}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-6">{q.explanation}</p>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={resetToCatalog}>
            <RotateCcw className="w-4 h-4 mr-2" /> Take Another
          </Button>
          <Button asChild>
            <a href="/student/skill-analysis">
              <BarChart3 className="w-4 h-4 mr-2" /> View Skill Analysis
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
