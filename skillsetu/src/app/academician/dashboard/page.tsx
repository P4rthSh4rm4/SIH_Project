"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Handshake, Presentation, ArrowRight, Calendar, CheckCircle2, XCircle, Loader2, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Opportunity } from "@/lib/types";

const stats = [
  { label: "FDPs Available", value: "12", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Research Projects", value: "5", icon: FlaskConical, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Consultancy", value: "3", icon: Handshake, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Mentorships", value: "8", icon: Presentation, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const opportunities = [
  { title: "AI/ML Faculty Development Program", host: "Google India", type: "FDP", date: "Oct 5-12, 2024" },
  { title: "Collaborative Research: NLP in Healthcare", host: "Microsoft Research", type: "Research", date: "Rolling" },
  { title: "Industry Consulting — Fintech Risk Models", host: "Paytm", type: "Consultancy", date: "Nov 1, 2024" },
];

export default function AcademicianDashboard() {
  const [pendingOpps, setPendingOpps] = useState<Opportunity[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingOpps = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingOpps(data as Opportunity[] || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpps(false);
    }
  };

  useEffect(() => {
    fetchPendingOpps();
  }, []);

  const handleVerify = async (id: string, action: "active" | "rejected") => {
    setProcessingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("opportunities")
        .update({ status: action })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success(action === "active" ? "Opportunity Approved!" : "Opportunity Rejected.");
      await fetchPendingOpps();
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify opportunity");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academician <span className="gradient-text">Dashboard</span></h1>
        <p className="text-muted-foreground mt-1">Discover FDPs, research, and industry collaborations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Industry Approvals */}
        <Card className="border-border/50 border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" /> Pending Industry Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingOpps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingOpps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pending opportunities to verify.
              </div>
            ) : (
              pendingOpps.map((opp) => (
                <div key={opp.id} className="p-4 rounded-xl border border-border/50 bg-background hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{opp.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize text-amber-600 bg-amber-50 border-amber-200">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                    <span className="capitalize">{opp.type}</span>
                    {opp.location && <span>• {opp.location}</span>}
                    {opp.stipend && <span>• {opp.stipend}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      disabled={processingId === opp.id}
                      onClick={() => handleVerify(opp.id, "active")}
                    >
                      {processingId === opp.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={processingId === opp.id}
                      onClick={() => handleVerify(opp.id, "rejected")}
                    >
                      {processingId === opp.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Latest Academic Opportunities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {opportunities.map((o) => (
              <div key={o.title} className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  {o.type === "FDP" ? <BookOpen className="w-5 h-5 text-emerald-500" /> : o.type === "Research" ? <FlaskConical className="w-5 h-5 text-violet-500" /> : <Handshake className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{o.title}</div>
                  <div className="text-xs text-muted-foreground">{o.host}</div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{o.type}</Badge>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{o.date}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
