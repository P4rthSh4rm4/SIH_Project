"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Building2, MapPin, Clock, CheckCircle2,
  XCircle, Clock3, AlertCircle, RefreshCw, Eye, X, Loader2, Calendar, FileText
} from "lucide-react";
import { useApplications } from "@/lib/hooks/useApplications";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";


const STATUS_CONFIG = {
  pending_faculty: { label: "Pending Verification", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: Clock3 },
  faculty_rejected: { label: "Not Approved", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: XCircle },
  applied: { label: "Applied", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Clock3 },
  shortlisted: { label: "Shortlisted", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Eye },
  interview: { label: "Interview", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: RefreshCw },
  offer: { label: "Offer", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border/50", icon: X },
};

export default function ApplicationsPage() {
  const { applications, loading, withdrawApplication, refetch } = useApplications();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [viewingOfferApp, setViewingOfferApp] = useState<any | null>(null);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const allApplications = applications;

  const handleAcceptOffer = async (app: any) => {
    if (!confirm("Are you sure you want to accept this offer?")) return;
    setProcessingId(app.id);
    try {
      const supabase = createClient();
      
      const offer = Array.isArray(app.application_offers) 
        ? app.application_offers[0] 
        : app.application_offers;

      if (!offer) throw new Error("Offer not found");

      // 1. Update Offer Status
      const { error: updateError } = await supabase
        .from("application_offers")
        .update({ 
          offer_status: "accepted", 
          accepted_at: new Date().toISOString() 
        })
        .eq("id", offer.id);

      if (updateError) throw updateError;

      // 2. Insert into placement_records
      const { error: placementError } = await supabase
        .from("placement_records")
        .insert({
          student_id: app.student_id,
          opportunity_id: app.opportunity_id,
          outcome: "placed",
          package: offer.salary_package,
          date: new Date().toISOString().split('T')[0]
        });

      if (placementError) throw placementError;

      // 3. Notify Industry user
      await supabase.from("notifications").insert({
        user_id: app.opportunity.industry_id,
        type: "offer_accepted",
        payload_json: {
          application_id: app.id,
          student_name: app.student_name || "A candidate",
          opportunity_title: app.opportunity.title
        }
      });

      toast.success("Offer accepted successfully! Congratulations!");
      refetch();
      setViewingOfferApp(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept offer");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineOffer = async (app: any) => {
    setProcessingId(app.id);
    try {
      const supabase = createClient();
      const offer = Array.isArray(app.application_offers) 
        ? app.application_offers[0] 
        : app.application_offers;

      if (!offer) throw new Error("Offer not found");

      const { error: updateError } = await supabase
        .from("application_offers")
        .update({ 
          offer_status: "declined", 
          declined_at: new Date().toISOString(),
          decline_reason: declineReason
        })
        .eq("id", offer.id);

      if (updateError) throw updateError;

      await supabase.from("notifications").insert({
        user_id: app.opportunity.industry_id,
        type: "offer_declined",
        payload_json: {
          application_id: app.id,
          student_name: app.student_name || "A candidate",
          opportunity_title: app.opportunity.title,
          reason: declineReason
        }
      });

      toast.success("Offer declined");
      refetch();
      setIsDeclining(false);
      setDeclineReason("");
      setViewingOfferApp(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to decline offer");
    } finally {
      setProcessingId(null);
    }
  };

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

      {allApplications.length === 0 ? (
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
          {allApplications.map((app) => {
            const opp = app.opportunity as any;
            if (!opp) return null;
            
            const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.applied;
            const StatusIcon = statusConfig.icon;
            const isWithdrawing = withdrawingId === app.id;
            const canWithdraw = app.status === "applied" || app.status === "shortlisted";

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
                    {(app.match_score ?? 0) > 0 && (
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
                
                {app.status === 'offer' && (
                  <CardFooter className="pt-0 justify-end bg-emerald-50/50 mt-2 border-t border-emerald-100 rounded-b-xl py-3">
                    <Button 
                      variant="outline" 
                      className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => setViewingOfferApp(app)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Job Offer
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* View Offer Modal */}
      <Dialog open={!!viewingOfferApp} onOpenChange={(open) => {
        if (!open) {
          setViewingOfferApp(null);
          setIsDeclining(false);
          setDeclineReason("");
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Job Offer Details</DialogTitle>
            <DialogDescription>
              {viewingOfferApp?.opportunity?.title} at {viewingOfferApp?.opportunity?.company_name}
            </DialogDescription>
          </DialogHeader>
          
          {viewingOfferApp && (
            (() => {
              const offer = Array.isArray(viewingOfferApp.application_offers) 
                ? viewingOfferApp.application_offers[0] 
                : viewingOfferApp.application_offers;

              if (!offer || offer.offer_status === 'draft') return <div className="py-4">No finalized offer found.</div>;

              return (
                <div className="grid gap-4 py-4">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Position</div>
                      <div className="font-medium">{offer.position_title}</div>
                      
                      <div className="text-muted-foreground">Employment Type</div>
                      <div className="font-medium">{offer.employment_type}</div>
                      
                      <div className="text-muted-foreground">Salary / Package</div>
                      <div className="font-medium text-emerald-600">{offer.salary_package}</div>
                      
                      <div className="text-muted-foreground">Joining Date</div>
                      <div className="font-medium">{offer.joining_date}</div>

                      <div className="text-muted-foreground">Offer Expires</div>
                      <div className="font-medium">{offer.offer_expiry_date}</div>
                    </div>

                    {offer.additional_terms && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Additional Terms</div>
                        <div className="text-sm">{offer.additional_terms}</div>
                      </div>
                    )}
                    
                    {offer.recruiter_message && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Message from Recruiter</div>
                        <div className="text-sm italic">"{offer.recruiter_message}"</div>
                      </div>
                    )}
                  </div>

                  {offer.offer_status === 'sent' && !isDeclining && (
                    <div className="flex gap-2 justify-end mt-2">
                      <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => setIsDeclining(true)}>
                        Decline Offer
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAcceptOffer(viewingOfferApp)} disabled={!!processingId}>
                        {processingId === viewingOfferApp.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Accept Offer
                      </Button>
                    </div>
                  )}

                  {offer.offer_status === 'sent' && isDeclining && (
                    <div className="space-y-3 mt-2 border border-red-200 rounded-lg p-3 bg-red-50/50">
                      <div className="text-sm font-medium text-red-800">Why are you declining this offer?</div>
                      <Textarea 
                        placeholder="Optional reason (e.g., accepted another offer, compensation mismatch...)" 
                        className="text-sm bg-white"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setIsDeclining(false)}>Cancel</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeclineOffer(viewingOfferApp)} disabled={!!processingId}>
                          {processingId === viewingOfferApp.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Confirm Decline
                        </Button>
                      </div>
                    </div>
                  )}

                  {offer.offer_status === 'accepted' && (
                    <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg flex items-center text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      You accepted this offer on {new Date(offer.accepted_at).toLocaleDateString()}
                    </div>
                  )}

                  {offer.offer_status === 'declined' && (
                    <div className="bg-red-100 text-red-800 p-3 rounded-lg flex items-center text-sm font-medium">
                      <XCircle className="w-5 h-5 mr-2" />
                      You declined this offer on {new Date(offer.declined_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
