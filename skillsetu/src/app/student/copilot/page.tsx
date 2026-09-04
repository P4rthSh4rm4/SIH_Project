"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CopilotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career Copilot</h1>
        <p className="text-muted-foreground mt-1">Your AI guide for career navigation</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Chat Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">AI Chat interface will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
