"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMockInterview, MockInterviewRecord } from "@/lib/hooks/useMockInterview";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, ChevronRight, ChevronLeft, CheckCircle2, Save, FastForward, Mic, Square, Video, AlertCircle, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [mediaMetrics, setMediaMetrics] = useState<Record<string, any>>({});
  
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);

  // Multimodal states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [fallbackMode, setFallbackMode] = useState(false); // If media fails, fallback to Text

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load interview
  useEffect(() => {
    if (!id) return;
    const inv = interviews.find(i => i.id === id);
    if (inv) {
      setInterview(inv);
      if (loading) {
        setAnswers(inv.answers || {});
        setCurrentAnswer((inv.answers || {})[inv.questions[0]?.id] || "");
        setSecondsElapsed(inv.time_taken || 0);
        setMediaMetrics(inv.media_metrics || {});
        setLoading(false);
      }
    } else {
      fetchInterviews();
    }
  }, [id, interviews, loading, fetchInterviews]);

  // Main Timer
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

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!interview) {
    return <div className="text-center py-20">Interview not found.</div>;
  }

  const mode = fallbackMode ? 'Text' : (interview.mode || 'Text');
  const questions = interview.questions;
  const currentQ = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (val: string) => {
    setCurrentAnswer(val);
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const startRecording = async () => {
    try {
      if (mode === 'Text') return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in your browser. Falling back to Text mode.");
        setFallbackMode(true);
        return;
      }

      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === 'Video'
      });
      streamRef.current = stream;

      if (mode === 'Video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Keep previous answer if appending, but here we overwrite or append?
      // Better to start fresh for a clean recording, or append? Let's just append.
      let finalTranscript = currentAnswer ? currentAnswer + " " : "";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let newFinal = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        finalTranscript += newFinal;
        handleAnswerChange((finalTranscript + interimTranscript).trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Falling back to Text mode.");
          stopMediaTracks();
          setFallbackMode(true);
          setIsRecording(false);
          if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Media error:", err);
      toast.error("Failed to access camera/microphone. Falling back to Text mode.");
      setFallbackMode(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    stopMediaTracks();

    // Calculate basic metrics: words per minute based on recording duration
    const words = currentAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;
    const minutes = recordingSeconds / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    
    // Store in mediaMetrics
    setMediaMetrics(prev => ({
      ...prev,
      [currentQ.id]: {
        durationSeconds: recordingSeconds,
        wpm: wpm
      }
    }));
  };

  const handleNext = async () => {
    if (isRecording) stopRecording();

    if (currentIndex < questions.length - 1) {
      if (!currentAnswer || currentAnswer.trim().length < 20) {
        setShowEmptyWarning(true);
        return;
      }
      setShowEmptyWarning(false);
      
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentAnswer(answers[questions[nextIndex].id] || "");
    }
  };

  const handlePrev = () => {
    if (isRecording) stopRecording();

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentAnswer(answers[questions[prevIndex].id] || "");
    }
  };

  const validAnswers = Object.values(answers).filter(a => a && a.trim().length >= 20).length;

  const handleFinish = async () => {
    if (isRecording) stopRecording();
    if (validAnswers === 0) return;
    setIsSaving(true);
    try {
      await finishInterview(interview.id, answers, secondsElapsed, 'Completed', mediaMetrics);
      await evaluateInterview(interview.id, answers);
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
            <Badge variant="secondary" className="flex items-center gap-1">
              {mode === 'Voice' ? <Mic className="w-3 h-3" /> : mode === 'Video' ? <Video className="w-3 h-3" /> : <Type className="w-3 h-3" />}
              {mode} Mode
            </Badge>
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
        <CardContent className="flex-1 pt-6 flex flex-col gap-4">
          
          {mode === 'Video' && (
            <div className={`w-full max-w-sm mx-auto aspect-video bg-black rounded-lg overflow-hidden relative border shadow-sm ${!isRecording ? 'opacity-50 grayscale' : ''}`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 flex-col gap-2">
                  <Video className="w-8 h-8" />
                  <span className="text-sm font-medium">Camera Off</span>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  REC {formatTime(recordingSeconds)}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col flex-1">
            <Label className="mb-2 text-muted-foreground font-semibold flex justify-between">
              Your Answer Transcript
              {mode !== 'Text' && isRecording ? (
                <span className="text-xs font-normal text-red-500 flex items-center gap-1 animate-pulse">
                  <Mic className="w-3 h-3" /> Listening...
                </span>
              ) : (
                <span className="text-xs font-normal opacity-50 flex items-center gap-1">
                  <Save className="w-3 h-3" /> Auto-saving
                </span>
              )}
            </Label>
            <Textarea 
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={mode === 'Text' ? "Type your answer here. Be detailed and structured..." : "Your spoken answer will appear here..."}
              className={`flex-1 min-h-[200px] text-base resize-none bg-secondary/10 border-border/50 focus-visible:ring-primary/30 ${isRecording ? 'border-red-300 bg-red-50/50' : ''}`}
            />
          </div>

          {(mode === 'Voice' || mode === 'Video') && (
            <div className="flex justify-center mt-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 h-12 shadow-lg hover:shadow-xl transition-all">
                  <Mic className="w-5 h-5 mr-2" /> Start Recording Answer
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-6 h-12">
                  <Square className="w-4 h-4 mr-2" /> Stop Recording
                </Button>
              )}
            </div>
          )}

          {fallbackMode && mode !== 'Text' && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Media capabilities unavailable. You have been switched to Text mode.</span>
            </div>
          )}

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
                <Button onClick={handleNext} className="min-w-[120px]" disabled={isRecording}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowFinishDialog(true)} disabled={isRecording} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
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
            <DialogTitle>{validAnswers === 0 ? "Cannot Submit Interview" : "Submit Interview?"}</DialogTitle>
            <DialogDescription>
              {validAnswers === 0 ? (
                <span className="text-destructive font-medium block mt-2">
                  You haven't answered any interview questions. Please answer at least one question before submitting.
                </span>
              ) : (
                <>
                  Are you sure you want to finish this interview? Make sure you have answered all questions to the best of your ability.
                  <br/><br/>
                  Total answered: {validAnswers} / {questions.length}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              {validAnswers === 0 ? "Return to Interview" : "Cancel"}
            </Button>
            {validAnswers > 0 && (
              <Button onClick={handleFinish} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Answers
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Warning Dialog */}
      <Dialog open={showEmptyWarning} onOpenChange={setShowEmptyWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Answer Required</DialogTitle>
            <DialogDescription>
              Please enter an answer for this question before proceeding to the next one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowEmptyWarning(false)}>Return</Button>
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
