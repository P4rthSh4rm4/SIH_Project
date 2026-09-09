"use client";

import { useMockInterview } from "@/lib/hooks/useMockInterview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, PlusCircle, History, Clock, Target, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function MockInterviewHomePage() {
  const { interviews, loading, getStats } = useMockInterview();
  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 w-full rounded-2xl bg-secondary/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 rounded-xl bg-secondary/50" />
          <div className="h-32 rounded-xl bg-secondary/50" />
          <div className="h-32 rounded-xl bg-secondary/50" />
        </div>
        <div className="h-64 w-full rounded-xl bg-secondary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Video className="w-8 h-8 text-primary" /> AI Mock Interview
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Simulate real-world interviews with our AI engine. Practice HR, Technical, and Behavioral questions tailored to your career path.
          </p>
        </div>
        <Button size="lg" className="shrink-0 gap-2 font-bold shadow-lg shadow-primary/25" asChild>
          <Link href="/student/mock-interview/setup">
            <PlusCircle className="w-5 h-5" /> Start New Interview
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-xl">
              <History className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Score</p>
              <h3 className="text-xl font-bold mt-1 text-emerald-600">{stats.bestScore}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Score</p>
              <h3 className="text-xl font-bold mt-1 text-amber-600">{stats.averageScore}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Interview History
          </CardTitle>
          <CardDescription>Review your past interview attempts and resume incomplete sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>You haven't taken any mock interviews yet.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/student/mock-interview/setup">Take your first interview</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div key={interview.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:bg-secondary/20 transition-colors">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg">{interview.interview_type} Interview</h4>
                      <Badge variant={interview.status === 'Completed' ? 'default' : interview.status === 'In Progress' ? 'secondary' : 'destructive'} 
                             className={interview.status === 'Completed' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {interview.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{interview.career_path}</Badge>
                      <Badge variant="outline">{interview.difficulty}</Badge>
                      <span>•</span>
                      <span>{new Date(interview.started_at).toLocaleDateString()}</span>
                      {interview.time_taken > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(interview.time_taken / 60)}m {interview.time_taken % 60}s</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    {interview.status === 'In Progress' ? (
                      <Button variant="default" className="w-full sm:w-auto" asChild>
                        <Link href={`/student/mock-interview/session?id=${interview.id}`}>
                          <PlayCircle className="w-4 h-4 mr-2" /> Resume
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href={`/student/mock-interview/report/${interview.id}`}>
                          View Report
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
