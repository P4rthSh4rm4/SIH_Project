"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LayoutGrid, MoreHorizontal, MessageSquare, Calendar, CheckCircle2, ChevronRight, XCircle } from "lucide-react";

type ApplicantStatus = "applied" | "shortlisted" | "interview" | "offer";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  // Scheduling State
  const [schedulingApp, setSchedulingApp] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState({
    interview_type: "",
    scheduled_date: "",
    scheduled_time: "",
    mode: "",
    meeting_link: "",
    location: "",
    interviewer: "",
    instructions: ""
  });

  // Evaluation State
  const [evaluatingApp, setEvaluatingApp] = useState<any>(null);
  const [evalData, setEvalData] = useState({
    technical_score: "",
    problem_solving_score: "",
    communication_score: "",
    confidence_score: "",
    recruiter_feedback: "",
    recommendation: ""
  });

  // Offer State
  const [offeringApp, setOfferingApp] = useState<any>(null);
  const [offerData, setOfferData] = useState({
    position_title: "",
    employment_type: "",
    salary_package: "",
    joining_date: "",
    offer_expiry_date: "",
    additional_terms: "",
    recruiter_message: ""
  });

  // Skill Feedback State
  const [feedbackApp, setFeedbackApp] = useState<any>(null);
  const [appSkills, setAppSkills] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState({
    skill_id: "",
    rating: "",
    gap_indicator: "",
    comment: ""
  });

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Fetch active opportunities for this industry user to verify ownership (RLS handles this but good for safety)
        const { data: opps } = await supabase
          .from("opportunities")
          .select("id")
          .eq("industry_id", user.id);
          
        if (!opps || opps.length === 0) {
          setApplicants([]);
          return;
        }
        
        const oppIds = opps.map(o => o.id);
        
        // Fetch applications for these opportunities
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            opportunity_id,
            match_score,
            applied_at,
            opportunities ( title, required_skills, preferred_skills ),
            users!student_id ( name ),
            application_interview_evaluations ( overall_score ),
            application_interviews ( id, interview_status ),
            application_offers ( id, offer_status )
          `)
          .in("opportunity_id", oppIds)
          .order("applied_at", { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            opportunity_id: d.opportunity_id, // Need this for scheduling
            name: d.users?.name || "Unknown Applicant",
            role: d.opportunities?.title || "Unknown Role",
            required_skills: d.opportunities?.required_skills || [],
            preferred_skills: d.opportunities?.preferred_skills || [],
            // If the status is pending_faculty or something else, default to applied for UI
            status: ["shortlisted", "interview", "offer"].includes(d.status) ? d.status : "applied",
            match: d.match_score || 0,
            date: d.applied_at ? new Date(d.applied_at).toLocaleDateString() : "Unknown date",
            evaluation: Array.isArray(d.application_interview_evaluations) 
              ? (d.application_interview_evaluations.length > 0 ? d.application_interview_evaluations[0] : null) 
              : (d.application_interview_evaluations || null),
            interview: Array.isArray(d.application_interviews)
              ? (d.application_interviews.length > 0 ? d.application_interviews[0] : null)
              : (d.application_interviews || null),
            offer: Array.isArray(d.application_offers)
              ? (d.application_offers.length > 0 ? d.application_offers[0] : null)
              : (d.application_offers || null)
          }));
          setApplicants(mapped);
        }
      } catch (err: any) {
        const message = String(err?.message ?? "Unknown error");
        const code = String(err?.code ?? "No code");
        const details = String(err?.details ?? "No details");
        const hint = String(err?.hint ?? "No hint");
        
        console.error("Failed to fetch applicants:", message, code, details, hint);
        toast.error("Failed to load applicants");
      } finally {
        setLoading(false);
      }
    }
    
    fetchApplicants();
  }, []);

  const roles = Array.from(new Set(applicants.map(a => a.role)));

  const moveApplicant = async (id: string, newStatus: ApplicantStatus) => {
    // Optimistic UI update
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      toast.success(`Applicant moved to ${newStatus}`);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update applicant status");
      // Revert optimism if we had to
    }
  };

  const handleScheduleInterview = async () => {
    try {
      // Validate
      if (!scheduleData.interview_type) return toast.error("Please select an interview type");
      if (!scheduleData.scheduled_date) return toast.error("Please select a date");
      if (!scheduleData.scheduled_time) return toast.error("Please select a time");
      if (!scheduleData.mode) return toast.error("Please select a mode");
      if (scheduleData.mode === "Online" && !scheduleData.meeting_link) return toast.error("Meeting link is required for online interviews");
      if (scheduleData.mode === "Offline" && !scheduleData.location) return toast.error("Location is required for offline interviews");
      if (!scheduleData.interviewer) return toast.error("Please specify an interviewer");

      const supabase = createClient();
      
      // Fetch full application to get opportunity_id if not present
      let oppId = schedulingApp.opportunity_id;
      if (!oppId) {
        const { data: appData } = await supabase.from("applications").select("opportunity_id").eq("id", schedulingApp.id).single();
        if (appData) oppId = appData.opportunity_id;
      }

      // Insert into application_interviews
      const { data: interviewData, error: insertError } = await supabase
        .from("application_interviews")
        .insert({
          application_id: schedulingApp.id,
          opportunity_id: oppId,
          interview_type: scheduleData.interview_type,
          scheduled_date: scheduleData.scheduled_date,
          scheduled_time: scheduleData.scheduled_time,
          mode: scheduleData.mode,
          meeting_link: scheduleData.mode === "Online" ? scheduleData.meeting_link : null,
          location: scheduleData.mode === "Offline" ? scheduleData.location : null,
          interviewer: scheduleData.interviewer,
          instructions: scheduleData.instructions,
          interview_status: "scheduled"
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Move application to 'interview'
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "interview" })
        .eq("id", schedulingApp.id);
        
      if (updateError) throw updateError;

      // Update UI optimism
      setApplicants(prev => prev.map(a => a.id === schedulingApp.id ? { ...a, status: "interview", interview: interviewData } : a));
      
      setSchedulingApp(null);
      setScheduleData({ interview_type: "", scheduled_date: "", scheduled_time: "", mode: "", meeting_link: "", location: "", interviewer: "", instructions: "" });
      toast.success("Interview scheduled successfully!");
    } catch (err: any) {
      console.error("Failed to schedule interview:", err);
      toast.error(err.message || "Failed to schedule interview");
    }
  };

  const handleMarkInterviewCompleted = async (interviewId: string, appId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("application_interviews")
        .update({ interview_status: "completed" })
        .eq("id", interviewId);

      if (error) throw error;

      setApplicants(prev => prev.map(a => {
        if (a.id === appId && a.interview) {
          return { ...a, interview: { ...a.interview, interview_status: "completed" } };
        }
        return a;
      }));

      toast.success("Interview marked as completed");
    } catch (err: any) {
      console.error("Failed to update interview status:", err);
      toast.error("Failed to mark interview as completed");
    }
  };

  const handleEvaluateInterview = async () => {
    try {
      const ts = Number(evalData.technical_score);
      const ps = Number(evalData.problem_solving_score);
      const cs = Number(evalData.communication_score);
      const cfs = Number(evalData.confidence_score);

      if (evalData.technical_score === "" || isNaN(ts) || ts < 0 || ts > 100) return toast.error("Technical score must be between 0 and 100");
      if (evalData.problem_solving_score === "" || isNaN(ps) || ps < 0 || ps > 100) return toast.error("Problem solving score must be between 0 and 100");
      if (evalData.communication_score === "" || isNaN(cs) || cs < 0 || cs > 100) return toast.error("Communication score must be between 0 and 100");
      if (evalData.confidence_score === "" || isNaN(cfs) || cfs < 0 || cfs > 100) return toast.error("Confidence score must be between 0 and 100");
      if (!evalData.recruiter_feedback) return toast.error("Feedback is required");
      if (!evalData.recommendation) return toast.error("Recommendation is required");

      const overall = Math.round((ts + ps + cs + cfs) / 4);

      const supabase = createClient();
      
      let oppId = evaluatingApp.opportunity_id;
      if (!oppId) {
        const { data: appData } = await supabase.from("applications").select("opportunity_id").eq("id", evaluatingApp.id).single();
        if (appData) oppId = appData.opportunity_id;
      }

      const payload = {
        application_id: evaluatingApp.id,
        opportunity_id: oppId,
        technical_score: ts,
        problem_solving_score: ps,
        communication_score: cs,
        confidence_score: cfs,
        overall_score: overall,
        recruiter_feedback: evalData.recruiter_feedback,
        recommendation: evalData.recommendation
      };

      // We use upsert on application_id conflict
      const { error: saveError } = await supabase
        .from("application_interview_evaluations")
        .upsert(payload, { onConflict: "application_id" });

      if (saveError) throw saveError;

      setApplicants(prev => prev.map(a => a.id === evaluatingApp.id ? { ...a, evaluation: { overall_score: overall } } : a));
      setEvaluatingApp(null);
      setEvalData({ technical_score: "", problem_solving_score: "", communication_score: "", confidence_score: "", recruiter_feedback: "", recommendation: "" });
      toast.success("Interview evaluation saved successfully!");
    } catch (err: any) {
      console.error("Failed to evaluate interview:", err.message, err.details, err.hint, err.code, err);
      toast.error(err.message || "Failed to evaluate interview");
    }
  };

  const handleOpenEvaluationModal = async (app: any) => {
    setEvaluatingApp(app);
    if (app.evaluation) {
      // Fetch full evaluation details since we only have overall_score in state
      const supabase = createClient();
      const { data } = await supabase.from("application_interview_evaluations").select("*").eq("application_id", app.id).single();
      if (data) {
        setEvalData({
          technical_score: data.technical_score?.toString() || "",
          problem_solving_score: data.problem_solving_score?.toString() || "",
          communication_score: data.communication_score?.toString() || "",
          confidence_score: data.confidence_score?.toString() || "",
          recruiter_feedback: data.recruiter_feedback || "",
          recommendation: data.recommendation || ""
        });
        return;
      }
    }
    setEvalData({ technical_score: "", problem_solving_score: "", communication_score: "", confidence_score: "", recruiter_feedback: "", recommendation: "" });
  };

  const handleOpenFeedbackModal = async (app: any) => {
    try {
      const allSkillIds = [...(app.required_skills || []), ...(app.preferred_skills || [])];
      if (allSkillIds.length === 0) {
        toast.error("This opportunity does not have any specified skills to evaluate.");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase.from('skills').select('id, name').in('id', allSkillIds);
      if (error) throw error;
      setAppSkills(data || []);
      setFeedbackApp(app);
      setFeedbackData({ skill_id: "", rating: "", gap_indicator: "", comment: "" });
    } catch (err: any) {
      toast.error("Failed to load skills for feedback");
    }
  };

  const handleSaveFeedback = async () => {
    try {
      if (!feedbackData.skill_id) return toast.error("Please select a skill");
      const r = Number(feedbackData.rating);
      if (!feedbackData.rating || isNaN(r) || r < 1 || r > 5) return toast.error("Rating must be between 1 and 5");
      if (!feedbackData.gap_indicator) return toast.error("Please select a gap indicator");

      const supabase = createClient();
      let oppId = feedbackApp.opportunity_id;
      if (!oppId) {
        const { data: appData } = await supabase.from("applications").select("opportunity_id").eq("id", feedbackApp.id).single();
        if (appData) oppId = appData.opportunity_id;
      }

      const { error } = await supabase.from('application_skill_feedback').upsert({
        application_id: feedbackApp.id,
        opportunity_id: oppId,
        skill_id: feedbackData.skill_id,
        rating: r,
        gap_indicator: feedbackData.gap_indicator,
        comment: feedbackData.comment
      }, { onConflict: 'application_id,skill_id' });

      if (error) throw error;
      toast.success("Skill feedback saved successfully");
      setFeedbackApp(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save feedback");
    }
  };

  const handleOpenOfferModal = async (app: any) => {
    setOfferingApp(app);
    if (app.offer?.id) {
       const supabase = createClient();
       const { data } = await supabase.from("application_offers").select("*").eq("id", app.offer.id).single();
       if (data) {
         setOfferData({
           position_title: data.position_title || "",
           employment_type: data.employment_type || "",
           salary_package: data.salary_package || "",
           joining_date: data.joining_date || "",
           offer_expiry_date: data.offer_expiry_date || "",
           additional_terms: data.additional_terms || "",
           recruiter_message: data.recruiter_message || ""
         });
         return;
       }
    }
    setOfferData({
      position_title: "",
      employment_type: "",
      salary_package: "",
      joining_date: "",
      offer_expiry_date: "",
      additional_terms: "",
      recruiter_message: ""
    });
  };

  const handleSaveOffer = async (isDraft: boolean) => {
    try {
      if (!offerData.position_title) return toast.error("Position title is required");
      if (!offerData.employment_type) return toast.error("Employment type is required");
      if (!offerData.salary_package) return toast.error("Salary package is required");
      if (!offerData.joining_date) return toast.error("Joining date is required");
      if (!offerData.offer_expiry_date) return toast.error("Expiry date is required");

      const supabase = createClient();
      let oppId = offeringApp.opportunity_id;
      if (!oppId) {
        const { data: appData } = await supabase.from("applications").select("opportunity_id").eq("id", offeringApp.id).single();
        if (appData) oppId = appData.opportunity_id;
      }

      const offerStatus = isDraft ? 'draft' : 'sent';
      let offerId = offeringApp.offer?.id;

      if (offerId) {
         const { error } = await supabase.from("application_offers").update({
           position_title: offerData.position_title,
           employment_type: offerData.employment_type,
           salary_package: offerData.salary_package,
           joining_date: offerData.joining_date,
           offer_expiry_date: offerData.offer_expiry_date,
           additional_terms: offerData.additional_terms,
           recruiter_message: offerData.recruiter_message,
           offer_status: offerStatus
         }).eq("id", offerId);
         if (error) throw error;
      } else {
         const { data, error } = await supabase.from("application_offers").insert({
           application_id: offeringApp.id,
           opportunity_id: oppId,
           position_title: offerData.position_title,
           employment_type: offerData.employment_type,
           salary_package: offerData.salary_package,
           joining_date: offerData.joining_date,
           offer_expiry_date: offerData.offer_expiry_date,
           additional_terms: offerData.additional_terms,
           recruiter_message: offerData.recruiter_message,
           offer_status: offerStatus
         }).select().single();
         if (error) throw error;
         offerId = data.id;
      }

      if (!isDraft) {
        const { error: updateError } = await supabase
          .from("applications")
          .update({ status: "offer" })
          .eq("id", offeringApp.id);
        if (updateError) throw updateError;
        
        // Notify student about the offer
        await supabase.from("notifications").insert({
          user_id: offeringApp.student_id || offeringApp.users?.id || (await supabase.from("applications").select("student_id").eq("id", offeringApp.id).single()).data?.student_id,
          type: "offer_sent",
          payload_json: {
            application_id: offeringApp.id,
            opportunity_title: offeringApp.role,
            company_name: offeringApp.opportunities?.company_name || "a company"
          }
        });
        
        setApplicants(prev => prev.map(a => a.id === offeringApp.id ? { ...a, status: "offer", offer: { id: offerId, offer_status: offerStatus } } : a));
        toast.success("Offer sent successfully!");
      } else {
        setApplicants(prev => prev.map(a => a.id === offeringApp.id ? { ...a, offer: { id: offerId, offer_status: offerStatus } } : a));
        toast.success("Offer draft saved");
      }

      setOfferingApp(null);
    } catch (err: any) {
      console.error("Failed to save offer:", err);
      toast.error(err.message || "Failed to save offer");
    }
  };

  const filteredApplicants = filterRole === "all" ? applicants : applicants.filter(a => a.role === filterRole);

  const columns: { id: ApplicantStatus; label: string; color: string }[] = [
    { id: "applied", label: "Applied", color: "bg-slate-100 border-slate-200 text-slate-700" },
    { id: "shortlisted", label: "Shortlisted", color: "bg-blue-100 border-blue-200 text-blue-700" },
    { id: "interview", label: "Interview", color: "bg-purple-100 border-purple-200 text-purple-700" },
    { id: "offer", label: "Offer", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
            Applicant Tracking
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Manage your hiring pipeline. Move candidates through the stages of your recruitment process.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterRole} onValueChange={(val) => setFilterRole(val || "all")}>
            <SelectTrigger className="w-[250px] bg-secondary/50">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map(col => {
          const colApplicants = filteredApplicants.filter(a => a.status === col.id);
          
          return (
            <div key={col.id} className="w-[320px] shrink-0 flex flex-col bg-muted/30 rounded-xl border border-border/50">
              <div className="p-4 border-b border-border/50 flex justify-between items-center">
                <Badge variant="outline" className={`${col.color} font-semibold uppercase tracking-wider`}>
                  {col.label}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50">
                  {colApplicants.length}
                </span>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                {colApplicants.map(app => (
                  <Card key={app.id} className="border-border/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{app.role}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 py-2 flex items-center justify-between text-xs">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {app.match}% Match
                      </Badge>
                      <span className="text-muted-foreground">{app.date}</span>
                    </CardContent>
                    <CardFooter className="p-3 pt-2 bg-muted/10 border-t border-border/10 flex flex-wrap justify-between gap-1 items-center">
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50 shrink-0" title="Message">
                         <MessageSquare className="w-3.5 h-3.5" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600 hover:bg-purple-50 shrink-0" title="Schedule">
                         <Calendar className="w-3.5 h-3.5" />
                       </Button>
                       <div className="flex-1 min-w-[20px]" />
                       {col.id === "applied" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-blue-50 text-blue-600 border-blue-200 shrink-0" onClick={() => moveApplicant(app.id, "shortlisted")}>
                           Shortlist <ChevronRight className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "shortlisted" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0" onClick={() => setSchedulingApp(app)}>
                           Schedule Interview <Calendar className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "interview" && app.interview && app.interview.interview_status === "scheduled" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0" onClick={() => handleMarkInterviewCompleted(app.interview.id, app.id)}>
                           Mark Completed <CheckCircle2 className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "interview" && app.interview && app.interview.interview_status === "completed" && !app.evaluation && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0" onClick={() => handleOpenEvaluationModal(app)}>
                           Evaluate Interview <Calendar className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "interview" && app.evaluation && (
                         <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                           <Button variant="outline" size="sm" className="h-7 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0" onClick={() => handleOpenEvaluationModal(app)}>
                             Evaluated ({app.evaluation.overall_score}%)
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shrink-0" onClick={() => handleOpenFeedbackModal(app)}>
                             Skill Feedback
                           </Button>
                           {(!app.offer || app.offer.offer_status === 'draft') && (
                             <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-blue-50 text-blue-600 border-blue-200 shrink-0" onClick={() => handleOpenOfferModal(app)}>
                               {app.offer ? "Edit Draft Offer" : "Create Offer"} <ChevronRight className="w-3 h-3 ml-1" />
                             </Button>
                           )}
                         </div>
                       )}
                       {col.id === "offer" && app.offer && (
                         <div className="flex flex-col gap-1 w-full text-right">
                           {app.offer.offer_status === 'accepted' ? (
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3 w-max ml-auto">
                               Hired 🎉
                             </Badge>
                           ) : app.offer.offer_status === 'declined' ? (
                             <Badge className="bg-red-100 text-red-700 hover:bg-red-100 px-3 w-max ml-auto">
                               Declined
                             </Badge>
                           ) : (
                             <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 capitalize w-max ml-auto">
                               Offer {app.offer.offer_status}
                             </Badge>
                           )}
                         </div>
                       )}
                    </CardFooter>
                  </Card>
                ))}
                
                {colApplicants.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                    Drop candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Interview Modal */}
      <Dialog open={!!schedulingApp} onOpenChange={(open) => !open && setSchedulingApp(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {schedulingApp?.name} ({schedulingApp?.role})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select value={scheduleData.interview_type} onValueChange={(val) => setScheduleData({...scheduleData, interview_type: val || ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Technical + HR">Technical + HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={scheduleData.mode} onValueChange={(val) => setScheduleData({...scheduleData, mode: val || ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={scheduleData.scheduled_date} onChange={(e) => setScheduleData({...scheduleData, scheduled_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={scheduleData.scheduled_time} onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})} />
              </div>
            </div>

            {scheduleData.mode === "Online" && (
              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <Input placeholder="https://meet.google.com/..." value={scheduleData.meeting_link} onChange={(e) => setScheduleData({...scheduleData, meeting_link: e.target.value})} />
              </div>
            )}

            {scheduleData.mode === "Offline" && (
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Office address or room" value={scheduleData.location} onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Interviewer Name</Label>
              <Input placeholder="e.g., John Doe" value={scheduleData.interviewer} onChange={(e) => setScheduleData({...scheduleData, interviewer: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Instructions (Optional)</Label>
              <Textarea placeholder="Any special instructions for the candidate..." value={scheduleData.instructions} onChange={(e) => setScheduleData({...scheduleData, instructions: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulingApp(null)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} className="bg-blue-600 hover:bg-blue-700 text-white">Schedule Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluate Interview Modal */}
      <Dialog open={!!evaluatingApp} onOpenChange={(open) => !open && setEvaluatingApp(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Evaluate Interview</DialogTitle>
            <DialogDescription>
              Record the evaluation scores for {evaluatingApp?.name} ({evaluatingApp?.role})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technical Skills (0-100)</Label>
                <Input type="number" min="0" max="100" value={evalData.technical_score} onChange={(e) => setEvalData({...evalData, technical_score: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Problem Solving (0-100)</Label>
                <Input type="number" min="0" max="100" value={evalData.problem_solving_score} onChange={(e) => setEvalData({...evalData, problem_solving_score: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Communication (0-100)</Label>
                <Input type="number" min="0" max="100" value={evalData.communication_score} onChange={(e) => setEvalData({...evalData, communication_score: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Confidence (0-100)</Label>
                <Input type="number" min="0" max="100" value={evalData.confidence_score} onChange={(e) => setEvalData({...evalData, confidence_score: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select value={evalData.recommendation} onValueChange={(val) => setEvalData({...evalData, recommendation: val || ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proceed to Offer">Proceed to Offer</SelectItem>
                  <SelectItem value="Further Review">Further Review</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recruiter Feedback</Label>
              <Textarea placeholder="Detailed feedback about the candidate..." value={evalData.recruiter_feedback} onChange={(e) => setEvalData({...evalData, recruiter_feedback: e.target.value})} />
            </div>
            
            <div className="pt-2">
               <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 flex justify-between items-center">
                 <span className="text-sm font-semibold">Overall Computed Score</span>
                 <span className="text-xl font-bold text-blue-600">
                   {evalData.technical_score && evalData.problem_solving_score && evalData.communication_score && evalData.confidence_score ? 
                    Math.round((Number(evalData.technical_score) + Number(evalData.problem_solving_score) + Number(evalData.communication_score) + Number(evalData.confidence_score)) / 4) : 0}%
                 </span>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvaluatingApp(null)}>Cancel</Button>
            <Button onClick={handleEvaluateInterview} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Evaluation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Offer Modal */}
      <Dialog open={!!offeringApp} onOpenChange={(open) => !open && setOfferingApp(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{offeringApp?.offer?.id ? "Edit Offer" : "Create Offer"}</DialogTitle>
            <DialogDescription>
              Draft an offer for {offeringApp?.name} ({offeringApp?.role})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div className="space-y-2">
              <Label>Position / Role *</Label>
              <Input placeholder="e.g. Software Engineer" value={offerData.position_title} onChange={(e) => setOfferData({...offerData, position_title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Employment Type *</Label>
                 <Select value={offerData.employment_type} onValueChange={(val) => setOfferData({...offerData, employment_type: val || ""})}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Full-time">Full-time</SelectItem>
                     <SelectItem value="Part-time">Part-time</SelectItem>
                     <SelectItem value="Internship">Internship</SelectItem>
                     <SelectItem value="Contract">Contract</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Salary / Package *</Label>
                 <Input placeholder="e.g. $100,000/yr" value={offerData.salary_package} onChange={(e) => setOfferData({...offerData, salary_package: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Joining Date *</Label>
                <Input type="date" value={offerData.joining_date} onChange={(e) => setOfferData({...offerData, joining_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Offer Expiry Date *</Label>
                <Input type="date" value={offerData.offer_expiry_date} onChange={(e) => setOfferData({...offerData, offer_expiry_date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Terms</Label>
              <Textarea placeholder="Any specific conditions or bonuses..." value={offerData.additional_terms} onChange={(e) => setOfferData({...offerData, additional_terms: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Message to Candidate</Label>
              <Textarea placeholder="Congratulations! We are thrilled to offer you..." value={offerData.recruiter_message} onChange={(e) => setOfferData({...offerData, recruiter_message: e.target.value})} />
            </div>

          </div>
          <DialogFooter className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setOfferingApp(null)}>Cancel</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleSaveOffer(true)}>Save Draft</Button>
              <Button onClick={() => handleSaveOffer(false)} className="bg-blue-600 hover:bg-blue-700 text-white">Send Offer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Feedback Modal */}
      <Dialog open={!!feedbackApp} onOpenChange={(open) => !open && setFeedbackApp(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Skill Gap Feedback</DialogTitle>
            <DialogDescription>
              Provide structured feedback on observed skills for {feedbackApp?.name} ({feedbackApp?.role})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="space-y-2">
              <Label>Evaluated Skill *</Label>
              <Select value={feedbackData.skill_id} onValueChange={(val) => setFeedbackData({...feedbackData, skill_id: val || ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill to rate" />
                </SelectTrigger>
                <SelectContent>
                  {appSkills.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Skill Rating (1-5) *</Label>
              <Input type="number" min="1" max="5" placeholder="e.g. 4" value={feedbackData.rating} onChange={(e) => setFeedbackData({...feedbackData, rating: e.target.value})} />
              <p className="text-xs text-muted-foreground">Rate the candidate's proficiency in this specific skill.</p>
            </div>

            <div className="space-y-2">
              <Label>Gap Indicator *</Label>
              <Select value={feedbackData.gap_indicator} onValueChange={(val) => setFeedbackData({...feedbackData, gap_indicator: val || ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gap assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strong">Strong (Exceeds Requirements)</SelectItem>
                  <SelectItem value="Adequate">Adequate (Meets Requirements)</SelectItem>
                  <SelectItem value="Needs Improvement">Needs Improvement (Slight Gap)</SelectItem>
                  <SelectItem value="Significant Gap">Significant Gap (Major Deficit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Comments (Optional)</Label>
              <Textarea placeholder="Specific observations about this skill..." value={feedbackData.comment} onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackApp(null)}>Cancel</Button>
            <Button onClick={handleSaveFeedback} className="bg-amber-600 hover:bg-amber-700 text-white">Save Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
