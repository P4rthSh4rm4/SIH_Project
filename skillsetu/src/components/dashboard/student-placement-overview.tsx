"use client";

import { useAcademicianPlacementOverview } from "@/lib/hooks/useAcademicianPlacementOverview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, GraduationCap, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StudentPlacementOverview() {
  const { students, loading, error } = useAcademicianPlacementOverview();

  if (loading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" /> Student Placement Overview
          </CardTitle>
          <CardDescription>Track placement progress across your students</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <GraduationCap className="w-5 h-5 text-destructive" /> Student Placement Overview
          </CardTitle>
          <CardDescription>Track placement progress across your students</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" /> Student Placement Overview
          </CardTitle>
          <CardDescription>Track placement progress across your students</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No students found in your institution.
        </CardContent>
      </Card>
    );
  }

  const placedCount = students.filter(s => s.status === 'Placed').length;
  const inProcessCount = students.filter(s => s.status === 'In Process').length;
  const notPlacedCount = students.filter(s => s.status === 'Not Placed').length;
  
  const totalStudents = students.length;

  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" /> Student Placement Overview
            </CardTitle>
            <CardDescription>Track placement progress across your students</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Summary Bars */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{placedCount}</span>
            <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-1 mt-1">
              <CircleDot className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Placed
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inProcessCount}</span>
            <span className="text-xs font-medium text-amber-600/80 dark:text-amber-400/80 flex items-center gap-1 mt-1">
              <CircleDot className="w-3 h-3 fill-amber-500 text-amber-500" /> In Process
            </span>
          </div>
          <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-destructive">{notPlacedCount}</span>
            <span className="text-xs font-medium text-destructive/80 flex items-center gap-1 mt-1">
              <CircleDot className="w-3 h-3 fill-destructive text-destructive" /> Not Placed
            </span>
          </div>
        </div>

        {/* Unified Progress Bar */}
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex mb-6 shadow-inner">
          <div style={{ width: `${(placedCount / totalStudents) * 100}%` }} className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all" title="Placed" />
          <div style={{ width: `${(inProcessCount / totalStudents) * 100}%` }} className="bg-amber-500 dark:bg-amber-400 h-full transition-all" title="In Process" />
          <div style={{ width: `${(notPlacedCount / totalStudents) * 100}%` }} className="bg-destructive dark:bg-destructive h-full transition-all" title="Not Placed" />
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-auto pr-2 -mr-2 space-y-2 max-h-[180px]">
          {students.map(student => (
            <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border/50">
              <div className="font-medium text-sm text-foreground truncate mr-2">
                {student.name}
              </div>
              <Badge 
                variant={student.status === 'Placed' ? 'outline' : student.status === 'In Process' ? 'secondary' : 'destructive'} 
                className={`text-[10px] whitespace-nowrap ${
                  student.status === 'Placed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400' :
                  student.status === 'In Process' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20' : 
                  'bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20'
                }`}
              >
                {student.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
