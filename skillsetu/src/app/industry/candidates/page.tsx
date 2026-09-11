"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, GraduationCap, Mail, MapPin, Search, Users, ExternalLink, Activity, Info, Check, X, Briefcase, Award, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Pure Readiness Services
import {
  calculateTechnicalScore,
  calculateSoftSkillsScore,
  calculateAptitudeScore,
  calculateResumeScore,
  calculatePortfolioScore,
  calculateGitHubScore,
  calculateLinkedInScore,
  calculateExperienceScore,
} from "@/lib/services/readiness";
import type { Opportunity } from "@/lib/types";
import { calculateOpportunityMatch, type OpportunityMatchResult } from "@/lib/services/matching/OpportunityMatchService";
import type { ProfileSkillEntry } from "@/lib/hooks/useProfileSkills";
import type { MockInterviewRecord } from "@/lib/hooks/useMockInterview";

// ─── Interfaces for Mapped Candidate ──────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  verified: boolean;
  category: string;
}

interface Education {
  institute: string;
  degree: string;
  branch: string;
  cgpa: number;
  batch: string;
}

export interface Candidate {
  id: string;
  name: string;
  institution: string;
  education: Education[];
  skills: Skill[];
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  experienceCount: number;
  projectsCount: number;
  certificationsCount: number;
  
  // Readiness Metrics
  readinessCategory: "Highly Ready" | "Job Ready" | "Developing" | "Early Stage" | "Not Assessed";
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  aptitudeScore: number;
  
  // Raw for mapping if needed
  rawSkills: ProfileSkillEntry[];
  rawInterviews: MockInterviewRecord[];
  matchResult?: OpportunityMatchResult;
}

// ─── Weights from usePlacementReadiness ───────────────────────────────────
const READINESS_WEIGHTS = {
  technical:  0.25,
  softSkills: 0.15,
  aptitude:   0.15,
  resume:     0.10,
  portfolio:  0.10,
  github:     0.10,
  linkedin:   0.05,
  experience: 0.10,
} as const;

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  
  // Filters
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillMatchMode, setSkillMatchMode] = useState<"ANY" | "ALL">("ANY");
  
  const [allSkills, setAllSkills] = useState<{label: string, value: string}[]>([]);

  // Opportunity Matching
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("none");

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // 1. Fetch available skills for the filter
        const { data: skillsData } = await supabase.from("skills").select("id, name");
        if (skillsData) {
          setAllSkills(skillsData.map(s => ({ label: s.name, value: s.id })));
        }

        // 1b. Fetch active opportunities for this industry user
        if (currentUser) {
          const { data: opps } = await supabase
            .from("opportunities")
            .select("*")
            .eq("industry_id", currentUser.id)
            .eq("status", "active");
          if (opps) setOpportunities(opps);
        }

        // 2. Fetch candidates via secure RPC (bypasses RLS strictly for industry role)
        const { data, error } = await supabase.rpc("get_talent_pool_candidates");

        if (error) {
          console.error("Supabase Query Error:");
          console.error("- Message:", error.message);
          console.error("- Details:", error.details);
          console.error("- Hint:", error.hint);
          console.error("- Code:", error.code);
          
          setErrorMsg(error.message || "An unknown error occurred while fetching candidates.");
          throw error;
        }

        // Temporary deep inspection of raw data as requested
        if (data && data.length > 0) {
          console.log("--- RAW SUPABASE RPC RESPONSE HEAD ---");
          console.dir(data[0], { depth: null });
          console.log("--------------------------------------");
        }

        console.log("Supabase RPC Success. Rows returned:", data?.length);

        // 3. Map to Candidate interface and calculate readiness
        // The RPC returns mock_interviews inside the user object just like other relations.
        const mappedCandidates: Candidate[] = (data || []).map((user: any) => {
          const profile = user.student_profiles?.[0] || user.student_profiles || {};
          const educationData = user.student_education || [];
          const rawSkillsData = user.student_skills || [];
          const assessmentsData = user.assessments || [];
          const mockInterviewsData = user.mock_interviews || [];
          const experienceData = user.student_experience || [];
          const portfolioData = user.portfolio_items || [];
          const certificationsData = user.certifications || [];

          // Format Education
          const education: Education[] = educationData.map((e: any) => ({
            institute: e.institute || "",
            degree: e.degree || "",
            branch: e.branch || "",
            cgpa: e.cgpa || 0,
            batch: e.end_year ? String(e.end_year) : "N/A"
          }));

          // Format Skills
          const skills: Skill[] = rawSkillsData
            .filter((s: any) => s.skills)
            .map((s: any) => ({
              id: s.skill_id,
              name: s.skills.name,
              verified: !!s.verified,
              category: s.skills.category || "General"
            }));

          // Construct ProfileSkillEntry for Readiness Service
          const rawSkills: ProfileSkillEntry[] = rawSkillsData
            .filter((s: any) => s.skills)
            .map((s: any) => ({
              id: s.id || s.skill_id, // Default to skill_id if id missing
              student_id: user.id,
              skill_id: s.skill_id,
              proficiency_score: s.proficiency_score || 0,
              verified: !!s.verified,
              created_at: new Date().toISOString(),
              skill: s.skills
            }));

          const rawInterviews: MockInterviewRecord[] = mockInterviewsData;
          const completedInterviews = rawInterviews.filter(i => i.status === "Completed" && i.overall_score !== null);
          const assessmentHistory = assessmentsData.map((a: any) => ({ ...a, result: { score: a.generated_profile_json?.score || 0 } })); // Fixed nested score mapping

          // Calculate Metrics
          const technicalMetric = calculateTechnicalScore(rawSkills, completedInterviews);
          const softSkillsMetric = calculateSoftSkillsScore(rawSkills, completedInterviews);
          const aptitudeMetric = calculateAptitudeScore(assessmentHistory);
          const resumeMetric = calculateResumeScore(profile, rawSkills.length, education.length, experienceData.length, portfolioData.length, certificationsData.length);
          const portfolioMetric = calculatePortfolioScore(portfolioData);
          const githubMetric = calculateGitHubScore(profile.github, portfolioData);
          const linkedinMetric = calculateLinkedInScore(profile, rawSkills.length, education.length, experienceData.length);
          const experienceMetric = calculateExperienceScore(portfolioData, certificationsData.length, certificationsData, 0);

          const total = 
            (technicalMetric.score || 0)  * READINESS_WEIGHTS.technical +
            (softSkillsMetric.score || 0) * READINESS_WEIGHTS.softSkills +
            (aptitudeMetric.score || 0)   * READINESS_WEIGHTS.aptitude +
            (resumeMetric.score || 0)     * READINESS_WEIGHTS.resume +
            (portfolioMetric.score || 0)  * READINESS_WEIGHTS.portfolio +
            (githubMetric.score || 0)     * READINESS_WEIGHTS.github +
            (linkedinMetric.score || 0)   * READINESS_WEIGHTS.linkedin +
            (experienceMetric.score || 0) * READINESS_WEIGHTS.experience;
          
          let overallScore = Math.round(total) || 0;
          let readinessCategory: Candidate["readinessCategory"] = "Not Assessed";

          if (overallScore > 0) {
            if (overallScore >= 85) readinessCategory = "Highly Ready";
            else if (overallScore >= 70) readinessCategory = "Job Ready";
            else if (overallScore >= 50) readinessCategory = "Developing";
            else readinessCategory = "Early Stage";
          }

          return {
            id: user.id,
            name: user.name || "Unknown Student",
            institution: user.institutions?.name || (education.length > 0 ? education[0].institute : "Unknown Institution"),
            education,
            skills,
            resumeUrl: profile.resume_url,
            portfolioUrl: profile.portfolio_website,
            linkedinUrl: profile.linkedin,
            githubUrl: profile.github,
            experienceCount: experienceData.length,
            projectsCount: portfolioData.filter((p: any) => p.type === 'project' || p.type === 'portfolio').length, // Account for both portfolio/project types
            certificationsCount: certificationsData.length,
            readinessCategory,
            overallScore,
            technicalScore: technicalMetric.score,
            communicationScore: softSkillsMetric.score,
            aptitudeScore: aptitudeMetric.score,
            rawSkills,
            rawInterviews
          };
        });

        setCandidates(mappedCandidates);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
        toast.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const handleInvite = (id: string, name: string) => {
    setInvited(prev => [...prev, id]);
    toast.success(`Candidate ${name} shortlisted!`);
  };

  // ─── Filtering Logic ──────────────────────────────────────────────────────
  const filteredCandidates = useMemo(() => {
    const selectedOpp = selectedOppId !== "none" ? opportunities.find(o => o.id === selectedOppId) : null;

    return candidates
      .filter(c => {
        // 1. Search Filter
        const matchesSearch = 
          c.name?.toLowerCase().includes(search.toLowerCase()) || 
          c.institution.toLowerCase().includes(search.toLowerCase()) ||
          c.education.some(e => e.branch?.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        // 2. Segment Filter
        if (selectedSegment === "hire-ready") {
          if (c.readinessCategory !== "Highly Ready" && c.readinessCategory !== "Job Ready") return false;
        } else if (selectedSegment === "develop-talent") {
          if (c.readinessCategory !== "Developing" && c.readinessCategory !== "Early Stage") return false;
        } else if (selectedSegment === "not-assessed") {
          if (c.readinessCategory !== "Not Assessed") return false;
        }

        // 3. Skills Filter
        if (selectedSkills.length > 0) {
          const candidateSkillIds = c.skills.map(s => s.id);
          if (skillMatchMode === "ANY") {
            const hasAny = selectedSkills.some(skillId => candidateSkillIds.includes(skillId));
            if (!hasAny) return false;
          } else {
            const hasAll = selectedSkills.every(skillId => candidateSkillIds.includes(skillId));
            if (!hasAll) return false;
          }
        }

        return true;
      })
      .map(c => {
        // Apply Smart Matching if an opportunity is selected
        let matchResult: OpportunityMatchResult | undefined = undefined;
        if (selectedOpp) {
          matchResult = calculateOpportunityMatch(c, selectedOpp, allSkills);
        }
        return { ...c, matchResult };
      })
      .sort((a, b) => {
        if (selectedOpp && a.matchResult && b.matchResult) {
          // Sort by match score desc if determinable
          if (a.matchResult.isDeterminable && b.matchResult.isDeterminable) {
            return b.matchResult.score - a.matchResult.score;
          }
          if (a.matchResult.isDeterminable) return -1;
          if (b.matchResult.isDeterminable) return 1;
        }
        // Default sort by readiness
        return b.overallScore - a.overallScore;
      });
  }, [candidates, search, selectedSegment, selectedSkills, skillMatchMode, selectedOppId, opportunities, allSkills]);


  const getCategoryColor = (cat: Candidate["readinessCategory"]) => {
    switch(cat) {
      case "Highly Ready": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Job Ready": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Developing": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Early Stage": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Talent Pool
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Browse verified student profiles, filter by skills, and identify top candidates based on real assessments.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <Tabs value={selectedSegment} onValueChange={setSelectedSegment} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Talent</TabsTrigger>
                <TabsTrigger value="hire-ready">Hire Ready</TabsTrigger>
                <TabsTrigger value="develop-talent">Develop Talent</TabsTrigger>
                <TabsTrigger value="not-assessed">Not Assessed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 w-full md:w-auto flex-col md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name, institution, branch..." 
                  className="pl-9 bg-secondary/50 border-border/50"
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-full md:w-64">
                <Select value={selectedOppId} onValueChange={(val: any) => setSelectedOppId(val?.value ? val.value[0] : (val || "none"))}>
                  <SelectTrigger className="w-full bg-secondary/50 [&>span]:truncate [&>span]:text-left overflow-hidden">
                    <SelectValue placeholder="Match Opportunity...">
                      {selectedOppId !== "none" ? opportunities.find(o => o.id === selectedOppId)?.title || "Match Opportunity..." : "Match Opportunity..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Opportunity Selected</SelectItem>
                    {opportunities.map(opp => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
            <div className="w-full sm:w-96 flex gap-2">
              <div className="flex-1">
                <MultiSelect
                  options={allSkills}
                  selected={selectedSkills}
                  onChange={setSelectedSkills}
                  placeholder="Filter by skills..."
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSkillMatchMode(prev => prev === "ANY" ? "ALL" : "ANY")}
                className="shrink-0"
                title="Toggle between Match ANY and Match ALL selected skills"
              >
                Match: {skillMatchMode}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {errorMsg ? (
        <Card className="border-destructive/50 border-dashed bg-destructive/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="text-lg font-bold">Supabase Query Failed</p>
            <p className="text-sm font-mono mt-2 bg-destructive/20 p-2 rounded">{errorMsg}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-xl border border-border/50" />)}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No candidates match the selected filters.</p>
            <p className="text-sm">Try adjusting your search or skill requirements.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => {
             const isInvited = invited.includes(candidate.id);
             const topEdu = candidate.education[0];

             return (
              <Card key={candidate.id} className="border-border/50 flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0 border-2 border-white shadow-sm">
                        {candidate.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> 
                          {topEdu ? `${topEdu.degree} ${topEdu.branch}` : "Education Not Available"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {candidate.institution} {topEdu?.batch && topEdu?.batch !== "N/A" && `(Class of ${topEdu.batch})`}
                        </div>
                      </div>
                    </div>
                    {selectedOppId !== "none" && candidate.matchResult && (
                      <div className="flex flex-col items-end gap-2">
                        {candidate.matchResult.isDeterminable ? (
                          <Badge variant="default" className={
                            candidate.matchResult.category === "Excellent Match" ? "bg-emerald-500 hover:bg-emerald-600" :
                            candidate.matchResult.category === "Strong Match" ? "bg-blue-500 hover:bg-blue-600" :
                            candidate.matchResult.category === "Partial Match" ? "bg-amber-500 hover:bg-amber-600" :
                            "bg-slate-500 hover:bg-slate-600"
                          }>
                            {candidate.matchResult.category} — {candidate.matchResult.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-dashed text-muted-foreground">
                            Matching Unavailable
                          </Badge>
                        )}
                        
                        {candidate.matchResult.isDeterminable && (
                          <Dialog>
                            <DialogTrigger>
                              <div role="button" className="text-xs text-blue-600 hover:underline cursor-pointer">
                                Why this candidate?
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Match Breakdown</DialogTitle>
                                <DialogDescription>How this candidate matches your opportunity</DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 mt-2">
                                {candidate.matchResult.breakdown.matchedRequiredSkills.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1 text-emerald-700">Matched Required Skills</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {candidate.matchResult.breakdown.matchedRequiredSkills.map(s => (
                                        <Badge key={s.id} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200"><Check className="w-3 h-3 mr-1"/>{s.name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {candidate.matchResult.breakdown.missingRequiredSkills.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1 text-destructive">Missing Required Skills</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {candidate.matchResult.breakdown.missingRequiredSkills.map(s => (
                                        <Badge key={s.id} variant="outline" className="text-destructive border-destructive/30"><X className="w-3 h-3 mr-1"/>{s.name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {candidate.matchResult.breakdown.matchedPreferredSkills.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1 text-blue-700">Matched Preferred Skills</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {candidate.matchResult.breakdown.matchedPreferredSkills.map(s => (
                                        <Badge key={s.id} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200"><Check className="w-3 h-3 mr-1"/>{s.name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {candidate.matchResult.breakdown.eligibility.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1">Eligibility</h4>
                                    <ul className="text-sm space-y-1">
                                      {candidate.matchResult.breakdown.eligibility.map((e, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                          {e.passed ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-destructive" />}
                                          <span>{e.label}: {e.value} <span className="text-muted-foreground">(Req: {e.required})</span></span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {candidate.matchResult.breakdown.assessments.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1">Screening & Assessments</h4>
                                    <ul className="text-sm space-y-1">
                                      {candidate.matchResult.breakdown.assessments.map((a, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                          {a.passed ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-destructive" />}
                                          <span>{a.label}: {a.value} <span className="text-muted-foreground">(Req: {a.required})</span></span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {candidate.matchResult.breakdown.experienceNotes.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1">Experience Note</h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                                      {candidate.matchResult.breakdown.experienceNotes.map((note, i) => (
                                        <li key={i}>{note}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="py-4 flex-1 space-y-5">
                  {/* Readiness Passport Mini View */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Overall</span>
                      <span className="text-xl font-bold mt-0.5">{candidate.overallScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Tech</span>
                      <span className="text-lg font-bold mt-0.5 text-blue-600">{candidate.technicalScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Soft Skill</span>
                      <span className="text-lg font-bold mt-0.5 text-emerald-600">{candidate.communicationScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Aptitude</span>
                      <span className="text-lg font-bold mt-0.5 text-amber-600">{candidate.aptitudeScore}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <Badge variant="outline" className={getCategoryColor(candidate.readinessCategory)}>
                       {candidate.readinessCategory}
                     </Badge>
                     {topEdu?.cgpa > 0 && (
                        <span className="text-sm font-semibold">CGPA: {topEdu.cgpa}</span>
                     )}
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Skills</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.length > 0 ? candidate.skills.slice(0, 6).map(skill => (
                        <Badge key={skill.id} variant="secondary" className="bg-secondary/50 font-medium">
                          {skill.name}
                          {skill.verified && <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-500" />}
                        </Badge>
                      )) : (
                        <span className="text-xs text-muted-foreground">Not Available</span>
                      )}
                      {candidate.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">+{candidate.skills.length - 6} more</Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Links / Metadata */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1.5" title="Projects">
                      <Briefcase className="w-3.5 h-3.5" /> {candidate.projectsCount} Projects
                    </div>
                    <div className="flex items-center gap-1.5" title="Certifications">
                      <Award className="w-3.5 h-3.5" /> {candidate.certificationsCount} Certs
                    </div>
                    <div className="flex items-center gap-1.5" title="Experience">
                      <MapPin className="w-3.5 h-3.5" /> {candidate.experienceCount} Exp
                    </div>
                    
                    <div className="flex gap-2 ml-auto">
                      {candidate.resumeUrl && <div title="Resume Available"><FileText className="w-4 h-4 text-primary hover:text-blue-500 cursor-pointer" /></div>}
                      {candidate.portfolioUrl && <div title="Portfolio Available"><ExternalLink className="w-4 h-4 text-primary hover:text-blue-500 cursor-pointer" /></div>}
                      {candidate.githubUrl && <div title="GitHub Available"><LinkIcon className="w-4 h-4 text-primary hover:text-blue-500 cursor-pointer" /></div>}
                      {candidate.linkedinUrl && <div title="LinkedIn Available"><LinkIcon className="w-4 h-4 text-primary hover:text-blue-500 cursor-pointer" /></div>}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 p-4 bg-muted/20 border-t border-border/50">
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 bg-white text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => setSelectedCandidate(candidate)}>
                      View Profile
                    </Button>
                    {isInvited ? (
                      <Button variant="outline" className="flex-1 bg-blue-50 text-blue-700 border-blue-200 cursor-default hover:bg-blue-50" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Shortlisted
                      </Button>
                    ) : (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => handleInvite(candidate.id, candidate.name)}>
                        <Mail className="w-4 h-4 mr-2" /> Shortlist
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(o) => !o && setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0 border-2 border-white shadow-sm">
                    {selectedCandidate.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedCandidate.name}</DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                      {selectedCandidate.education[0]?.degree} {selectedCandidate.education[0]?.branch} • {selectedCandidate.institution}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Readiness Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Placement Readiness</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Overall</span>
                      <span className="text-3xl font-bold">{selectedCandidate.overallScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Tech</span>
                      <span className="text-2xl font-bold text-blue-600">{selectedCandidate.technicalScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Soft Skill</span>
                      <span className="text-2xl font-bold text-emerald-600">{selectedCandidate.communicationScore}%</span>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-border/50">
                      <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Aptitude</span>
                      <span className="text-2xl font-bold text-amber-600">{selectedCandidate.aptitudeScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Verified Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.length > 0 ? selectedCandidate.skills.map(skill => (
                      <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 font-medium">
                        {skill.name}
                        {skill.verified && <CheckCircle2 className="w-3.5 h-3.5 ml-1.5 text-emerald-500" />}
                      </Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground italic">No skills available</span>
                    )}
                  </div>
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Links & Attachments</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedCandidate.resumeUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 mr-2" /> Resume</a>
                      </Button>
                    ) : <span className="text-sm text-muted-foreground flex items-center h-9"><FileText className="w-4 h-4 mr-2 opacity-50" /> No Resume</span>}
                    
                    {selectedCandidate.portfolioUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Portfolio</a>
                      </Button>
                    ) : null}
                    
                    {selectedCandidate.githubUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCandidate.githubUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-4 h-4 mr-2" /> GitHub</a>
                      </Button>
                    ) : null}
                    
                    {selectedCandidate.linkedinUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-4 h-4 mr-2" /> LinkedIn</a>
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                   <div className="text-center">
                     <div className="text-2xl font-bold">{selectedCandidate.projectsCount}</div>
                     <div className="text-xs text-muted-foreground uppercase mt-1">Projects</div>
                   </div>
                   <div className="text-center border-l border-r border-border/50">
                     <div className="text-2xl font-bold">{selectedCandidate.certificationsCount}</div>
                     <div className="text-xs text-muted-foreground uppercase mt-1">Certifications</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">{selectedCandidate.experienceCount}</div>
                     <div className="text-xs text-muted-foreground uppercase mt-1">Experiences</div>
                   </div>
                </div>
                
                {/* Action Footer */}
                <div className="pt-6 flex justify-end gap-3">
                   <Button variant="outline" onClick={() => setSelectedCandidate(null)}>Close</Button>
                   <Button 
                     className="bg-blue-600 hover:bg-blue-700 text-white"
                     disabled={invited.includes(selectedCandidate.id)}
                     onClick={() => {
                       handleInvite(selectedCandidate.id, selectedCandidate.name);
                       setSelectedCandidate(null);
                     }}
                   >
                     {invited.includes(selectedCandidate.id) ? (
                       <><CheckCircle2 className="w-4 h-4 mr-2" /> Shortlisted</>
                     ) : (
                       <><Mail className="w-4 h-4 mr-2" /> Shortlist Candidate</>
                     )}
                   </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
