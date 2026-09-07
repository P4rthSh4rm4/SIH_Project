"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Presentation, Search, PlusCircle, User, Activity, CheckCircle2,
  Send, MessageSquare, Briefcase, TrendingUp
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/lib/types";

export default function MentorshipPage() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  
  // Message Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student");
          
        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error("Failed to fetch students", err);
        toast.error("Failed to load students roster.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const handleSendMessage = async () => {
    if (!selectedStudent || !subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setIsSending(true);
    try {
      const supabase = createClient();
      const payload_json = {
        title: `Mentorship: ${subject}`,
        message: message,
        link: "/student/profile"
      };

      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedStudent.id,
          type: "mentorship_message",
          payload_json: payload_json
        });

      if (error) throw error;
      
      toast.success(`Message sent to ${selectedStudent.name}`);
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Failed to send notification", err);
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Presentation className="w-8 h-8 text-emerald-500" />
            Student Mentorship Hub
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Select a student to view their progress, assign projects, or send direct feedback.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
        
        {/* Left Column: Student Roster */}
        <Card className="lg:col-span-1 border-border/50 flex flex-col h-full shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-emerald-500" /> My Mentees
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search students..." 
                className="pl-8 bg-secondary/50 border-border/50"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No students found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {students.map(student => (
                  <div 
                    key={student.id} 
                    className={`p-4 cursor-pointer transition-colors flex items-center gap-3 hover:bg-emerald-50/50 ${selectedStudent?.id === student.id ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-foreground">{student.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Mentorship Action Panel */}
        <div className="lg:col-span-2 flex flex-col h-full gap-6">
          {!selectedStudent ? (
            <Card className="h-full border-dashed border-2 border-border/60 bg-muted/10 flex flex-col items-center justify-center text-center p-12">
              <Presentation className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Select a Student</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a student from the roster to view their progress, assign new projects, or start a discussion.
              </p>
            </Card>
          ) : (
            <>
              {/* Progress Overview (Mocked Data based on selected student) */}
              <Card className="border-border/50 shadow-sm shrink-0">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedStudent.name}'s Progress</CardTitle>
                      <CardDescription>B.Tech Computer Science (3rd Year)</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-1" /> Top 10%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/30 rounded-lg flex flex-col items-center text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Courses</span>
                      <span className="text-xl font-bold">14</span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg flex flex-col items-center text-center">
                      <Activity className="w-6 h-6 text-blue-500 mb-1" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Verified Skills</span>
                      <span className="text-xl font-bold">8</span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg flex flex-col items-center text-center">
                      <Briefcase className="w-6 h-6 text-amber-500 mb-1" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projects</span>
                      <span className="text-xl font-bold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messaging/Task Assignment Panel */}
              <Card className="border-border/50 shadow-sm flex-1 flex flex-col">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" /> 
                    Assign Task or Send Feedback
                  </CardTitle>
                  <CardDescription>
                    Messages sent here will appear directly in the student's notification center.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject / Project Title</label>
                    <Input 
                      placeholder="e.g. Action Required: Improve React State Management" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col h-full min-h-[150px]">
                    <label className="text-sm font-medium">Details</label>
                    <Textarea 
                      placeholder="Provide discussion points, project requirements, or areas of improvement..." 
                      className="flex-1 resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-4 bg-muted/10">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={handleSendMessage}
                    disabled={isSending}
                  >
                    {isSending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Send to Student
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
