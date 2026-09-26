"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Loader2, Send, PlusCircle, CheckCircle2, Building2, Globe, GraduationCap, School, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import type { OpportunityType, Skill, CampusCollaborationType } from "@/lib/types";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";

export default function PostOpportunity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetchingSkills, setIsFetchingSkills] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<MultiSelectOption[]>([]);

  // Publishing Scope & Campus Collaboration State
  const [publishingMode, setPublishingMode] = useState<"direct" | "campus_collaboration">("direct");
  const [targetInstitutionId, setTargetInstitutionId] = useState<string>("");
  const [campusCollaborationType, setCampusCollaborationType] = useState<string>("Campus Placement Drive");
  const [facultyNote, setFacultyNote] = useState<string>("");
  const [institutions, setInstitutions] = useState<{ id: string; name: string; type?: string; address?: string }[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "internship" as OpportunityType,
    work_mode: "On-site" as "On-site" | "Hybrid" | "Remote",
    location: "",
    stipend: "",
    description: "",
    duration: "",
    start_date: "",
    deadline: "",
    positions: 1,
  });

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);

  const [eligibility, setEligibility] = useState({
    degree: "",
    branch: "",
    batch: "",
    min_cgpa: "",
    experience: "",
  });

  const [assessments, setAssessments] = useState({
    aptitude: false,
    technical: false,
    mock_interview: false,
  });

  const [screening, setScreening] = useState({
    min_technical_score: "",
    min_communication_score: "",
    min_placement_readiness: "",
    resume_required: false,
  });

  const [userDepartment, setUserDepartment] = useState<string>("CSE");

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // 1. Get user department first
        const { data: { user } } = await supabase.auth.getUser();
        let currentDept = "CSE";
        if (user) {
          const { data: userData } = await supabase.from("users").select("department").eq("id", user.id).single();
          if (userData?.department) {
            currentDept = userData.department;
            setUserDepartment(currentDept);
          }
        }
        
        // 2. Fetch skills based on department category mapping
        let allowedCategories = ["Coding", "Aptitude", "Soft Skills", "Tech Soft Skills"]; // Default to CSE/Global
        if (currentDept === "Ayurveda") {
          allowedCategories = ["Ayurveda Knowledge", "Soft Skills"];
        } else if (currentDept === "BPharma") {
          allowedCategories = ["BPharma Knowledge", "Aptitude", "Soft Skills", "Tech Soft Skills"];
        }

        const { data: skillsData, error: skillsError } = await supabase
          .from("skills")
          .select("id, name, category")
          .in("category", allowedCategories)
          .order("name");
          
        if (skillsError) throw skillsError;
        setAvailableSkills((skillsData || []).map(s => ({ label: s.name, value: s.id })));

        // 3. Fetch institutions for Campus Collaboration
        setIsLoadingInstitutions(true);
        const { data: instData, error: instError } = await supabase
          .from("institutions")
          .select("id, name, type, address")
          .order("name");
          
        if (!instError && instData) {
          setInstitutions(instData);
          if (instData.length > 0) {
            setTargetInstitutionId(instData[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load skills or institutions:", err);
        toast.error("Failed to load master setup data.");
      } finally {
        setIsFetchingSkills(false);
        setIsLoadingInstitutions(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required.");
      return;
    }

    const isCollab = publishingMode === "campus_collaboration";
    if (isCollab && !targetInstitutionId) {
      toast.error("Please select a target institution for campus collaboration.");
      return;
    }
    
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to post an opportunity");
        return;
      }

      const selectedInstitution = institutions.find(i => i.id === targetInstitutionId);

      // Format numeric fields properly
      const minCgpa = eligibility.min_cgpa ? parseFloat(eligibility.min_cgpa) : null;
      if (eligibility.min_cgpa && (isNaN(minCgpa!) || minCgpa! < 0 || minCgpa! > 10)) {
         throw new Error("Invalid Minimum CGPA (must be 0-10)");
      }

      const { error } = await supabase
        .from("opportunities")
        .insert({
          industry_id: user.id,
          title: formData.title,
          type: formData.type,
          work_mode: formData.work_mode,
          location: formData.location,
          stipend: formData.stipend,
          description: formData.description,
          duration: formData.duration || null,
          start_date: formData.start_date || null,
          deadline: formData.deadline || null,
          positions: (formData.positions as any) === '' ? 1 : formData.positions,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
          eligibility_requirements: {
             degree: eligibility.degree,
             branch: eligibility.branch,
             batch: eligibility.batch,
             min_cgpa: minCgpa,
             experience: eligibility.experience,
             is_campus_collaboration: isCollab,
             target_institution_id: isCollab ? targetInstitutionId : null,
             target_institution_name: isCollab ? (selectedInstitution?.name || null) : null,
             campus_collaboration_type: isCollab ? campusCollaborationType : null,
             faculty_note: isCollab && facultyNote.trim() ? facultyNote.trim() : null
          },
          assessment_requirements: assessments,
          smart_screening_requirements: {
             min_technical_score: screening.min_technical_score ? parseInt(screening.min_technical_score) : null,
             min_communication_score: screening.min_communication_score ? parseInt(screening.min_communication_score) : null,
             min_placement_readiness: screening.min_placement_readiness ? parseInt(screening.min_placement_readiness) : null,
             resume_required: screening.resume_required
          },
          hiring_process: ["Application", "Screening", "Interview", "Offer", "Hired"],
          status: "active",
          verification_status: isCollab ? "pending" : "approved", 
        });

      if (error) throw error;
      
      if (isCollab) {
        toast.success("Campus collaboration submitted! Sent to faculty for verification.");
      } else {
        toast.success("Opportunity posted successfully! Published directly to students.");
      }
      router.push("/industry/dashboard");
      router.refresh();
      
    } catch (err) {
      console.error("Supabase insert error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to post opportunity: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/industry/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Opportunity</h1>
          <p className="text-muted-foreground mt-1">
            Publish an open opportunity directly to students or initiate an institute-specific campus collaboration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Publishing Mode Selection */}
        <Card className="border-border/50 overflow-hidden shadow-sm">
          <CardHeader className="pb-3 bg-secondary/10 border-b border-border/30">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Publishing Scope & Collaboration Mode
              </span>
              <Badge variant={publishingMode === "direct" ? "default" : "secondary"} className="text-xs">
                {publishingMode === "direct" ? "Direct to Students" : "Institute Specific"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Direct to Students */}
              <div 
                onClick={() => setPublishingMode("direct")}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  publishingMode === "direct"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                      Direct Publishing
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-base text-foreground">Direct to Students</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Open opportunity visible immediately to all eligible students across institutions. No faculty verification required.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Instant Student Visibility
                </div>
              </div>

              {/* Option 2: Campus Collaboration */}
              <div 
                onClick={() => setPublishingMode("campus_collaboration")}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  publishingMode === "campus_collaboration"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium">
                      Campus Collab
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-base text-foreground">Campus Collaboration</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Target an exclusive campus drive or joint initiative. Routes to institute faculty for verification before publishing.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs text-blue-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified via College Faculty
                </div>
              </div>
            </div>

            {/* Campus Collaboration Specific Config */}
            {publishingMode === "campus_collaboration" && (
              <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Campus Collaboration Configuration</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      Select the destination institute. Faculty and TPO from this campus will review and verify this drive before their students can apply.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Target Institution <span className="text-red-500">*</span>
                    </label>
                    {isLoadingInstitutions ? (
                      <div className="flex items-center text-xs text-muted-foreground h-10"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading institutes...</div>
                    ) : (
                      <Select value={targetInstitutionId} onValueChange={(val) => setTargetInstitutionId(val || "")}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select target institute" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions.map(inst => (
                            <SelectItem key={inst.id} value={inst.id}>
                              {inst.name} {inst.address ? `(${inst.address})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Collaboration Type
                    </label>
                    <Select value={campusCollaborationType} onValueChange={(val) => setCampusCollaborationType(val || "Campus Placement Drive")}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select collaboration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Campus Placement Drive">Campus Placement Drive</SelectItem>
                        <SelectItem value="Joint Internship Program">Joint Internship Program</SelectItem>
                        <SelectItem value="Campus Hackathon / Contest">Campus Hackathon / Contest</SelectItem>
                        <SelectItem value="Faculty-Guided Research & Lab">Faculty-Guided Research & Lab</SelectItem>
                        <SelectItem value="Guest Lecture / Workshop">Guest Lecture / Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Message / Note to Faculty (Optional)
                    </label>
                    <Input 
                      placeholder="e.g. Seeking top final year students for on-campus interviews..."
                      className="bg-background"
                      value={facultyNote}
                      onChange={(e) => setFacultyNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={["basic", "eligibility", "skills", "assessments", "screening"]} className="space-y-4">
          
          {/* 1. BASIC INFO */}
          <AccordionItem value="basic" className="bg-card border-border/50 rounded-xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/20">
              <span className="font-semibold text-lg flex items-center gap-2">
                1. Basic Information
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input 
                  required 
                  placeholder={userDepartment === 'Ayurveda' ? "e.g. Ayurvedic Clinical Intern, Ayurveda Research Intern" : "e.g. Software Engineer Intern"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opportunity Type</label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as OpportunityType })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="job">Full-time Job</SelectItem>
                      <SelectItem value="micro-internship">Micro-Internship</SelectItem>
                      <SelectItem value="bounty">Bounty/Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Mode</label>
                  <Select value={formData.work_mode} onValueChange={(val) => setFormData({ ...formData, work_mode: val as any })}>
                    <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    placeholder="e.g. Bangalore, Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Positions Available</label>
                  <Input 
                    type="number" min={1}
                    value={formData.positions}
                    onChange={(e) => setFormData({ ...formData, positions: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application Deadline</label>
                  <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input placeholder="e.g. 6 Months" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stipend / Salary</label>
                  <Input placeholder="e.g. ₹20,000/month or Unpaid" value={formData.stipend} onChange={(e) => setFormData({ ...formData, stipend: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Description <span className="text-red-500">*</span></label>
                <Textarea 
                  required
                  className="min-h-[120px]"
                  placeholder={userDepartment === 'Ayurveda' ? "Describe the role, clinical/research activities, and what you're looking for..." : "Describe the role, responsibilities, and what you're looking for..."}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. ELIGIBILITY */}
          <AccordionItem value="eligibility" className="bg-card border-border/50 rounded-xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/20">
              <span className="font-semibold text-lg flex items-center gap-2">
                2. Eligibility Requirements
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree (Optional)</label>
                  <Input placeholder={userDepartment === 'Ayurveda' ? "e.g. BAMS, MD (Ayurveda), PG Diploma" : "e.g. B.Tech, M.Tech, BCA"} value={eligibility.degree} onChange={e => setEligibility({...eligibility, degree: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch/Department (Optional)</label>
                  <Input placeholder={userDepartment === 'Ayurveda' ? "e.g. Ayurveda, Kayachikitsa, Panchakarma" : "e.g. Computer Science, IT"} value={eligibility.branch} onChange={e => setEligibility({...eligibility, branch: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Graduation Year/Batch</label>
                  <Input placeholder="e.g. 2025, 2026" value={eligibility.batch} onChange={e => setEligibility({...eligibility, batch: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum CGPA (0-10)</label>
                  <Input type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.5" value={eligibility.min_cgpa} onChange={e => setEligibility({...eligibility, min_cgpa: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Experience Requirement</label>
                  <Input placeholder="e.g. 0-1 years, Fresher, Prior internship preferred" value={eligibility.experience} onChange={e => setEligibility({...eligibility, experience: e.target.value})} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. SKILLS */}
          <AccordionItem value="skills" className="bg-card border-border/50 rounded-xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/20">
              <span className="font-semibold text-lg flex items-center gap-2">
                3. Skills & Technologies
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
              {isFetchingSkills ? (
                <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading skills taxonomy...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required Skills</label>
                    <p className="text-xs text-muted-foreground mb-2">Mandatory skills the candidate must possess.</p>
                    <MultiSelect 
                      options={availableSkills}
                      selected={requiredSkills}
                      onChange={setRequiredSkills}
                      placeholder="Select required skills..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Skills (Optional)</label>
                    <p className="text-xs text-muted-foreground mb-2">Bonus skills that give candidates an edge.</p>
                    <MultiSelect 
                      options={availableSkills}
                      selected={preferredSkills}
                      onChange={setPreferredSkills}
                      placeholder="Select preferred skills..."
                    />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 4. ASSESSMENTS & PROCESS */}
          <AccordionItem value="assessments" className="bg-card border-border/50 rounded-xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/20">
              <span className="font-semibold text-lg flex items-center gap-2">
                4. Assessment Requirements
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Define the mandatory assessments for this opportunity. Candidates will be prompted to complete these before interviewing.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" checked={assessments.aptitude} onChange={e => setAssessments({...assessments, aptitude: e.target.checked})} />
                  <div>
                    <div className="font-medium text-sm">Aptitude Assessment</div>
                    <div className="text-xs text-muted-foreground">General quantitative and logical reasoning.</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" checked={assessments.technical} onChange={e => setAssessments({...assessments, technical: e.target.checked})} />
                  <div>
                    <div className="font-medium text-sm">{userDepartment === 'Ayurveda' ? 'Clinical & Domain Assessment' : 'Technical / Coding Assessment'}</div>
                    <div className="text-xs text-muted-foreground">{userDepartment === 'Ayurveda' ? 'Assesses Ayurveda domain knowledge and role-relevant clinical concepts.' : 'Domain-specific technical test (DSA, OOP, SQL, etc.).'}</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" checked={assessments.mock_interview} onChange={e => setAssessments({...assessments, mock_interview: e.target.checked})} />
                  <div>
                    <div className="font-medium text-sm">AI Mock Interview</div>
                    <div className="text-xs text-muted-foreground">Requires candidate to have completed at least one AI mock interview for communication evaluation.</div>
                  </div>
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. SMART SCREENING */}
          <AccordionItem value="screening" className="bg-card border-border/50 rounded-xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/20">
              <span className="font-semibold text-lg flex items-center gap-2">
                5. Smart Screening
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Set minimum thresholds to automatically flag or rank candidates based on their SkillSetu profiles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min. Placement Readiness Score (0-100)</label>
                  <Input type="number" min="0" max="100" placeholder="e.g. 70" value={screening.min_placement_readiness} onChange={e => setScreening({...screening, min_placement_readiness: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{userDepartment === 'Ayurveda' ? 'Min. Clinical & Domain Score (0-100)' : 'Min. Technical Score (0-100)'}</label>
                  <Input type="number" min="0" max="100" placeholder="e.g. 60" value={screening.min_technical_score} onChange={e => setScreening({...screening, min_technical_score: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min. Communication Score (0-100)</label>
                  <Input type="number" min="0" max="100" placeholder="e.g. 75" value={screening.min_communication_score} onChange={e => setScreening({...screening, min_communication_score: e.target.value})} />
                </div>
                <div className="space-y-2 flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input type="checkbox" className="w-4 h-4 rounded" checked={screening.resume_required} onChange={e => setScreening({...screening, resume_required: e.target.checked})} />
                    Resume Upload Required
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto text-md px-8 h-12 shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Publish Opportunity
          </Button>
        </div>
      </form>
    </div>
  );
}
