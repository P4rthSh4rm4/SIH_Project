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
import { ArrowLeft, Loader2, Send, PlusCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { OpportunityType, Skill } from "@/lib/types";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";

export default function PostOpportunity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFetchingSkills, setIsFetchingSkills] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<MultiSelectOption[]>([]);

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

  useEffect(() => {
    async function fetchSkills() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("skills").select("id, name").order("name");
        if (error) throw error;
        setAvailableSkills((data || []).map(s => ({ label: s.name, value: s.id })));
      } catch (err) {
        console.error("Failed to load skills:", err);
        toast.error("Failed to load skills master table.");
      } finally {
        setIsFetchingSkills(false);
      }
    }
    fetchSkills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required.");
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
          positions: formData.positions,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
          eligibility_requirements: {
             degree: eligibility.degree,
             branch: eligibility.branch,
             batch: eligibility.batch,
             min_cgpa: minCgpa,
             experience: eligibility.experience
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
          verification_status: "pending", 
        });

      if (error) throw error;
      
      toast.success("Opportunity submitted for verification!");
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
            Build a structured, recruitment-ready opportunity for smart candidate matching.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="e.g. Software Engineer Intern"
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
                    onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
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
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
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
                  <Input placeholder="e.g. B.Tech, M.Tech, BCA" value={eligibility.degree} onChange={e => setEligibility({...eligibility, degree: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch/Department (Optional)</label>
                  <Input placeholder="e.g. Computer Science, IT" value={eligibility.branch} onChange={e => setEligibility({...eligibility, branch: e.target.value})} />
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
                    <div className="font-medium text-sm">Technical / Coding Assessment</div>
                    <div className="text-xs text-muted-foreground">Domain-specific technical test (DSA, OOP, SQL, etc.).</div>
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
                  <label className="text-sm font-medium">Min. Technical Score (0-100)</label>
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
