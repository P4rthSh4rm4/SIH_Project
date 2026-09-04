"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Digital Portfolio</h1>
        <p className="text-muted-foreground mt-1">Showcase your projects and achievements</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Portfolio manager will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
