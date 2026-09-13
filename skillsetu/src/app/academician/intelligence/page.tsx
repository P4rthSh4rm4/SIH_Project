"use client";

import { useAcademicianSkillGaps } from "@/lib/hooks/useAcademicianSkillGaps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, Users, AlertTriangle, BookOpen, UserPlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SkillGapIntelligencePage() {
  const { skillGaps, affectedStudents, loading, error, isMutating, offerMentorship } = useAcademicianSkillGaps();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const totalGaps = skillGaps.reduce((acc, curr) => acc + curr.gapCount, 0);
  const highSeverityGaps = skillGaps.filter(g => g.gapSeverity > 60).length;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-blue-500 fill-blue-500/20" />
            Skill Gap Intelligence
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Convert actual industry recruiter feedback on your students into targeted Faculty actions. Discover exactly where your curriculum can improve based on real interview evaluations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm bg-blue-50/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Skill Gaps</p>
              <p className="text-3xl font-bold text-foreground">{skillGaps.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-amber-50/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Flagged Students</p>
              <p className="text-3xl font-bold text-foreground">{totalGaps}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-red-50/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">High-Severity Gaps</p>
              <p className="text-3xl font-bold text-foreground">{highSeverityGaps}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {skillGaps.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center h-64">
            <Lightbulb className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Skill Gaps Detected Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your students haven't received any negative skill feedback from industry recruiters during their interviews yet. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight mb-4">Ranked Skill Deficiencies</h2>
          
          {skillGaps.map(gap => (
            <Card key={gap.skill_id} className="border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-card hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedSkill(expandedSkill === gap.skill_id ? null : gap.skill_id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${
                    gap.gapSeverity > 60 ? 'bg-red-500' : gap.gapSeverity > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{gap.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Failed by {gap.gapCount} out of {gap.count} evaluated students
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`px-3 py-1 ${
                    gap.gapSeverity > 60 ? 'bg-red-50 text-red-700 border-red-200' : 
                    gap.gapSeverity > 30 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {gap.gapLevel} ({gap.gapSeverity.toFixed(0)}%)
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/academician/fdps?new_skill=${encodeURIComponent(gap.name)}`);
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-1.5" />
                      Create FDP
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      {expandedSkill === gap.skill_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {expandedSkill === gap.skill_id && (
                <div className="bg-muted/20 border-t border-border/50 p-5 animate-in slide-in-from-top-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Affected Student Roster
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {affectedStudents[gap.skill_id]?.map(student => (
                      <div key={student.application_id} className="bg-card border border-border/60 rounded-lg p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <Badge variant="secondary" className={
                            student.gap_indicator === 'Significant Gap' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }>
                            {student.rating}/5
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full mt-auto"
                          disabled={isMutating}
                          onClick={() => offerMentorship(student.student_id, gap.name)}
                        >
                          {isMutating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
                          Offer 1:1 Mentorship
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
