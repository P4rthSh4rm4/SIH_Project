"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillAssessmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Assessment</h1>
        <p className="text-muted-foreground mt-1">Take tests to map your proficiency</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Technical Test (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">The assessment form will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
