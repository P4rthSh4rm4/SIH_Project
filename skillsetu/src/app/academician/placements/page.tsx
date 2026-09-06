"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building2, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AcademicianPlacementsPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch pending opportunities
      const { data: oppsData, error: oppsError } = await supabase
        .from("opportunities")
        .select(`
          *,
          industry:users(name)
        `)
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false });

      if (oppsError) throw oppsError;
      setOpportunities(oppsData || []);

      // Fetch pending applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select(`
          *,
          opportunity:opportunities(title),
          student:users(name)
        `)
        .eq("status", "pending_faculty")
        .order("applied_at", { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);
    } catch (err) {
      console.error("Error fetching placement data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyOpportunity = async (id: string, isApproved: boolean) => {
    setProcessingId(id);
    try {
      const supabase = createClient();
      const newStatus = isApproved ? "approved" : "rejected";
      
      const { error } = await supabase
        .from("opportunities")
        .update({ verification_status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success(`Opportunity ${isApproved ? "approved" : "rejected"} successfully`);
      fetchData(); // Refresh data
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyApplication = async (id: string, isApproved: boolean) => {
    setProcessingId(id);
    try {
      const supabase = createClient();
      const newStatus = isApproved ? "applied" : "faculty_rejected";
      
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success(`Application ${isApproved ? "approved" : "rejected"} successfully`);
      fetchData(); // Refresh data
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placements & Campus Drives</h1>
          <p className="text-muted-foreground mt-1">Verifying industry opportunities and student applications...</p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Placements & Campus Drives</h1>
        <p className="text-muted-foreground mt-1">Review and verify industry opportunities and student applications.</p>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="opportunities" className="mt-6">
          {opportunities.length === 0 ? (
            <Card className="border-border/50 border-dashed bg-secondary/20">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No pending opportunities</p>
                <p className="text-sm">All posted opportunities have been verified.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="border-border/50">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{opp.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {opp.industry?.name || opp.company_name || "Unknown Company"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div><span className="font-medium text-foreground">Type:</span> <span className="capitalize">{opp.type}</span></div>
                      <div><span className="font-medium text-foreground">Location:</span> {opp.location || "N/A"}</div>
                      <div><span className="font-medium text-foreground">Stipend:</span> {opp.stipend || "N/A"}</div>
                      <div><span className="font-medium text-foreground">Posted:</span> {new Date(opp.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" 
                        disabled={processingId === opp.id}
                        onClick={() => handleVerifyOpportunity(opp.id, true)}
                      >
                        {processingId === opp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Approve</>}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        disabled={processingId === opp.id}
                        onClick={() => handleVerifyOpportunity(opp.id, false)}
                      >
                        {processingId === opp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="applications" className="mt-6">
          {applications.length === 0 ? (
            <Card className="border-border/50 border-dashed bg-secondary/20">
              <CardContent className="p-12 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No pending applications</p>
                <p className="text-sm">All student applications have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <Card key={app.id} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{app.student?.name || "Unknown Student"}</h3>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {app.match_score}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applying for <span className="font-medium text-foreground">{app.opportunity?.title}</span> at {app.opportunity?.company_name || "Unknown Company"}
                        </p>
                        <p className="text-xs text-muted-foreground pt-1">
                          Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 min-w-[240px]">
                        <Button 
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" 
                          disabled={processingId === app.id}
                          onClick={() => handleVerifyApplication(app.id, true)}
                        >
                          {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Verify & Forward</>}
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          disabled={processingId === app.id}
                          onClick={() => handleVerifyApplication(app.id, false)}
                        >
                          {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
