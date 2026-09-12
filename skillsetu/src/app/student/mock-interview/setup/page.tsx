"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockInterview } from "@/lib/hooks/useMockInterview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { InterviewType, InterviewDifficulty, InterviewMode } from "@/lib/data/mock-interview-questions";
import { Video, ChevronLeft, Loader2, Play, Mic, Type } from "lucide-react";
import Link from "next/link";

export default function MockInterviewSetupPage() {
  const router = useRouter();
  const { startNewInterview } = useMockInterview();
  
  const [type, setType] = useState<InterviewType>("Mixed");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("Medium");
  const [careerPath, setCareerPath] = useState<string>(CAREER_PATHS[0].title);
  const [mode, setMode] = useState<InterviewMode>("Text");
  
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const interview = await startNewInterview(type, careerPath, difficulty, mode);
      if (interview && interview.id) {
        router.push(`/student/mock-interview/session?id=${interview.id}`);
      }
    } catch (err) {
      console.error("Failed to start interview", err);
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/student/mock-interview">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
      </Button>

      <Card className="border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" /> Configure Your Interview
          </CardTitle>
          <CardDescription>
            Customize the AI interview to match your target role and skill level.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-8">
          
          {/* Interview Type */}
          <div className="space-y-3">
            <Label className="text-base font-bold">Interview Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Mixed', 'HR', 'Technical', 'Behavioral', 'Aptitude'].map((t) => (
                <div 
                  key={t}
                  onClick={() => setType(t as InterviewType)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center font-medium ${
                    type === t 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <Label className="text-base font-bold">Difficulty Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <div 
                  key={d}
                  onClick={() => setDifficulty(d as InterviewDifficulty)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center font-medium ${
                    difficulty === d 
                      ? d === 'Easy' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' :
                        d === 'Medium' ? 'border-amber-500 bg-amber-500/10 text-amber-600' :
                        'border-rose-500 bg-rose-500/10 text-rose-600'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Interview Mode */}
          <div className="space-y-3">
            <Label className="text-base font-bold">Interview Mode</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'Text', icon: Type, desc: 'Type your answers' },
                { id: 'Voice', icon: Mic, desc: 'Speak into microphone' },
                { id: 'Video', icon: Video, desc: 'Webcam + Microphone' }
              ].map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setMode(m.id as InterviewMode)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    mode === m.id 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  <m.icon className="w-6 h-6" />
                  <div>
                    <div className="font-bold">{m.id} Mode</div>
                    <div className="text-xs opacity-70 font-medium">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Domain / Career Path */}
          <div className="space-y-3">
            <Label className="text-base font-bold">Target Domain (Career Path)</Label>
            <Select value={careerPath} onValueChange={(val) => setCareerPath(val || "")}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Select your career path" />
              </SelectTrigger>
              <SelectContent>
                {CAREER_PATHS.map((path) => (
                  <SelectItem key={path.id} value={path.title}>
                    {path.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">Technical questions will be tailored to this domain.</p>
          </div>

        </CardContent>

        <CardFooter className="bg-secondary/20 p-6 flex justify-end">
          <Button size="lg" onClick={handleStart} disabled={isStarting} className="w-full md:w-auto font-bold text-lg px-8 h-14">
            {isStarting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing AI Engine...</>
            ) : (
              <><Play className="w-5 h-5 mr-2" /> Start Interview</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
