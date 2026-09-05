"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Building2, MapPin, Clock, CheckCircle2,
  XCircle, Clock3, AlertCircle, RefreshCw, Eye, X, Loader2
} from "lucide-react";
import { useApplications } from "@/lib/hooks/useApplications";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_CONFIG = {
  applied: { label: "Applied", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Clock3 },
  reviewing: { label: "Under Review", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Eye },
  interviewed: { label: "Interviewed", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: RefreshCw },
  accepted: { label: "Accepted", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border/50", icon: X },
};

export default function ApplicationsPage() {
  const { applications, loading, withdrawApplication } = useApplications();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
    setWithdrawingId(id);
    try {
      const { success, error } = await withdrawApplication(id);
      if (success) {
        toast.success("Application withdrawn successfully");
      } else {
        toast.error(error || "Failed to withdraw application");
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Loading your application history...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your job and internship applications.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/student/opportunities">
            <Briefcase className="w-4 h-4 mr-2" /> Find More Opportunities
          </Link>
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-sm mb-4">Start applying to opportunities to see them tracked here.</p>
            <Button asChild>
              <Link href="/student/opportunities">Browse Opportunities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => {
            const opp = app.opportunity as any;
            if (!opp) return null;
            
            const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.applied;
            const StatusIcon = statusConfig.icon;
            const isWithdrawing = withdrawingId === app.id;
            const canWithdraw = app.status === "applied" || app.status === "reviewing";

            return (
              <Card key={app.id} className={`border-border/50 flex flex-col ${app.status === 'withdrawn' ? 'opacity-75 bg-secondary/10' : 'hover:shadow-md transition-shadow'}`}>
                <CardHeader className="pb-3 border-b border-border/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base line-clamp-1">{opp.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-1">{opp.company_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`shrink-0 capitalize ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 flex-1">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    {opp.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-1.5 shrink-0" />
                      <span className="truncate capitalize">{opp.type}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1.5 shrink-0" />
                      <span className="truncate">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                    {app.match_score > 0 && (
                      <div className="flex items-center text-emerald-600">
                        <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                        <span className="truncate">{app.match_score}% Skill Match</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                {canWithdraw && (
                  <CardFooter className="pt-0 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isWithdrawing}
                      onClick={() => handleWithdraw(app.id)}
                    >
                      {isWithdrawing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      Withdraw Application
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
