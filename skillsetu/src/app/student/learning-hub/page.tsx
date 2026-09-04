"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LearningHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-muted-foreground mt-1">Recommended courses and workshops</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>My Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Course progress and recommendations will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
