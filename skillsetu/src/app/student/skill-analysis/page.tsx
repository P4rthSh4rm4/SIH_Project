"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Analysis & Gap</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your strengths and areas for improvement</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Industry Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Advanced radar charts and skill gap analysis will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
