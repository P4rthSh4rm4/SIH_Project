"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Users, Clock, PlayCircle, BarChart3, Settings2 } from "lucide-react";

const PROGRAMS = [
  {
    id: "prog_1",
    title: "Full-Stack Development Bootcamp",
    status: "active",
    enrolled: 145,
    capacity: 200,
    duration: "12 Weeks",
    completionRate: 68,
    type: "Bootcamp"
  },
  {
    id: "prog_2",
    title: "Cloud Computing Fundamentals (AWS)",
    status: "active",
    enrolled: 89,
    capacity: 100,
    duration: "6 Weeks",
    completionRate: 42,
    type: "Certification"
  },
  {
    id: "prog_3",
    title: "Intro to GenAI for Enterprise",
    status: "draft",
    enrolled: 0,
    capacity: 50,
    duration: "4 Weeks",
    completionRate: 0,
    type: "Workshop"
  }
];

export default function ProgramsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            Training Programs
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Manage your company's training bootcamps, workshops, and certifications offered to students.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Create Program
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {PROGRAMS.map((prog) => (
          <Card key={prog.id} className="border-border/50 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border/50 p-6 flex flex-col justify-center items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${prog.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                  <BookOpen className="w-8 h-8" />
                </div>
                <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className={prog.status === 'active' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                  {prog.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{prog.title}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] uppercase">{prog.type}</Badge></span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {prog.duration}</span>
                  </CardDescription>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-blue-500" /> Enrollment
                    </div>
                    <div className="text-2xl font-bold">
                      {prog.enrolled} <span className="text-sm font-normal text-muted-foreground">/ {prog.capacity}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(prog.enrolled / prog.capacity) * 100}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <PlayCircle className="w-4 h-4 mr-2 text-emerald-500" /> Completion Rate
                    </div>
                    <div className="text-2xl font-bold">{prog.completionRate}%</div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prog.completionRate}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 col-span-2 md:col-span-2 flex items-end justify-end">
                    <Button variant="outline" className="w-full md:w-auto">
                      <BarChart3 className="w-4 h-4 mr-2" /> View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
