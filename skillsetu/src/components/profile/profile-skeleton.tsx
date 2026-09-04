"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Full-page loading skeleton matching the profile layout.
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Header skeleton */}
      <Card className="border-border/50 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-chart-4/10 to-chart-2/10" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-muted animate-pulse border-4 border-card" />
            <div className="flex-1 pt-2 space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
            </div>
            <div className="h-10 w-28 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Completion card skeleton */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-full max-w-md bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>

      {/* Form skeleton */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="h-5 w-36 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-12 bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
