"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMockInterview, MockInterviewRecord } from "@/lib/hooks/useMockInterview";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, ChevronRight, ChevronLeft, CheckCircle2, Save, FastForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { interviews, fetchInterviews, saveProgress, finishInterview, evaluateInterview } = useMockInterview();
  
  const [interview, setInterview] = useState<MockInterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  // Load interview
  useEffect(() => {
    if (!id) return;
    const inv = interviews.find(i => i.id === id);
    if (inv) {
      setInterview(inv);
      setAnswers(inv.answers || {});
      setCurrentAnswer(inv.answers[inv.questions[currentIndex]?.id] || "");
      setSecondsElapsed(inv.time_taken || 0);
      setLoading(false);
    } else {
      // Might not be in local state if refreshed, trigger fetch
      fetchInterviews();
    }
  }, [id, interviews, currentIndex, fetchInterviews]);

  // Timer
  useEffect(() => {
    if (!interview || interview.status !== 'In Progress') return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [interview]);

  // Auto save every 30 seconds
  useEffect(() => {
    if (!interview || interview.status !== 'In Progress') return;
    const interval = setInterval(() => {
      saveProgress(interview.id, answers, secondsElapsed);
    }, 30000);
    return () => clearInterval(interval);
  }, [interview, answers, secondsElapsed, saveProgress]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!interview) {
    return <div className="text-center py-20">Interview not found.</div>;
  }

  const questions = interview.questions;
  const currentQ = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (val: string) => {
    setCurrentAnswer(val);
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer(answers[questions[currentIndex + 1].id] || "");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentAnswer(answers[questions[currentIndex - 1].id] || "");
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await finishInterview(interview.id, answers, secondsElapsed);
      await evaluateInterview(interview.id);
      router.push(`/student/mock-interview/report/${interview.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (interview.status === 'Completed') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold">Interview Completed</h2>
        <p className="text-muted-foreground">You have already submitted this interview.</p>
        <Button onClick={() => router.push(`/student/mock-interview/report/${interview.id}`)}>View Detailed Report</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="font-bold text-lg">{interview.interview_type} Interview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Badge variant="outline">{interview.career_path}</Badge>
            <Badge variant="outline">{interview.difficulty}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xl font-bold bg-background px-4 py-2 rounded-lg border shadow-sm">
          <Clock className="w-5 h-5 text-primary" /> {formatTime(secondsElapsed)}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground">{Math.round(progressPct)}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Main Question Card */}
      <Card className="border-primary/20 shadow-xl shadow-primary/5 min-h-[400px] flex flex-col">
        <CardHeader className="bg-primary/5 border-b pb-6">
          <div className="flex justify-between items-start mb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">{currentQ.type}</Badge>
          </div>
          <CardTitle className="text-2xl leading-relaxed">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-6 flex flex-col">
          <Label className="mb-2 text-muted-foreground font-semibold flex justify-between">
            Your Answer
            <span className="text-xs font-normal opacity-50 flex items-center gap-1">
              <Save className="w-3 h-3" /> Auto-saving
            </span>
          </Label>
          <Textarea 
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here. Be detailed and structured..."
            className="flex-1 min-h-[200px] text-base resize-none bg-secondary/10 border-border/50 focus-visible:ring-primary/30"
          />
        </CardContent>
        <CardFooter className="bg-secondary/20 p-4 flex justify-between border-t border-border/50">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          
          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <>
                <Button variant="ghost" onClick={handleNext} className="text-muted-foreground hidden sm:flex">
                  Skip <FastForward className="w-4 h-4 ml-2" />
                </Button>
                <Button onClick={handleNext} className="min-w-[120px]">
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowFinishDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                Finish Interview <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Finish Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Interview?</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish this interview? Make sure you have answered all questions to the best of your ability.
              <br/><br/>
              Total answered: {Object.values(answers).filter(v => v.trim().length > 0).length} / {questions.length}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Cancel</Button>
            <Button onClick={handleFinish} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MockInterviewSessionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SessionContent />
    </Suspense>
  );
}
