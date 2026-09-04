"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground mt-1">Browse jobs, internships, and bounties</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Active Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">List of active opportunities will be built here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
