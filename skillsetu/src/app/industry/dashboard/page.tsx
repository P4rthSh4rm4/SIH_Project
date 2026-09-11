"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, TrendingUp, Eye, PlusCircle, ArrowRight, Loader2, MapPin, CheckCircle2, Clock, PlayCircle, BarChart3, Activity } from "lucide-react";
import Link from "next/link";
import type { UserProfile, StudentProfile } from "@/lib/types";

// Helper for relative time
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}


export default function IndustryDashboard() {
  const [students, setStudents] = useState<(UserProfile & { profile: StudentProfile | null })[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch industry's opportunities WITH applications
          const { data: oppsData } = await supabase
            .from("opportunities")
            .select(`*, applications(*)`)
            .eq("industry_id", user.id)
            .order("created_at", { ascending: false });
            
          setOpportunities(oppsData || []);

          // Fetch skills to map skill IDs to names
          const { data: skillsData } = await supabase
            .from("skills")
            .select("id, name");
            
          setSkillsMaster(skillsData || []);
        }

        // Fetch users who are students
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student")
          .limit(10);
          
        if (usersError) throw usersError;
        
        // Fetch their profiles
        const { data: profilesData } = await supabase
          .from("student_profiles")
          .select("*")
          .in("user_id", (usersData || []).map(u => u.id));
          
        const combined = (usersData || []).map(user => {
          const profile = profilesData?.find(p => p.user_id === user.id) || null;
          return { ...user, profile };
        });
        
        setStudents(combined);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const [skillsMaster, setSkillsMaster] = useState<any[]>([]);

  // ── Compute Metrics from Data ──
  const activeOpps = opportunities.filter(o => o.status === "active");
  const allApplications = opportunities.flatMap(o => o.applications || []);
  
  // KPI stats
  const stats = [
    { label: "Active Listings", value: activeOpps.length.toString(), icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Applicants", value: allApplications.length.toString(), icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Available Students", value: students.length.toString(), icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  // Hiring KPIs
  const shortlistedCount = allApplications.filter(a => ['shortlisted', 'interview', 'offer', 'hired'].includes(a.status)).length;
  const interviewCount = allApplications.filter(a => a.status === 'interview').length;
  const offerCount = allApplications.filter(a => a.status === 'offer').length;
  const hiredCount = allApplications.filter(a => a.status === 'hired').length;
  
  const avgMatchScore = allApplications.length > 0 && allApplications.some(a => a.match_score !== null)
    ? Math.round(allApplications.reduce((acc, a) => acc + (a.match_score || 0), 0) / allApplications.filter(a => a.match_score !== null).length)
    : null;

  // Candidate Pipeline
  const pipeline = {
    applied: allApplications.filter(a => a.status === 'applied').length,
    screening: shortlistedCount, // Shortlisted serves as screening
    interview: interviewCount,
    offer: offerCount,
    hired: hiredCount,
  };

  // Skill Demand
  const skillCounts: Record<string, number> = {};
  opportunities.forEach(opp => {
    (opp.required_skills || []).forEach((skillId: string) => {
      skillCounts[skillId] = (skillCounts[skillId] || 0) + 1;
    });
  });
  const demandedSkills = Object.entries(skillCounts)
    .map(([id, count]) => {
      const skillName = skillsMaster.find(s => s.id === id)?.name || "Unknown Skill";
      return { name: skillName, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent Activity Feed
  // We'll combine recent applications and recent opportunities
  const recentActivities = [
    ...allApplications.map(a => ({
      id: `app-${a.id}`,
      type: "application",
      title: `New application received`,
      date: a.applied_at,
      status: a.status
    })),
    ...opportunities.map(o => ({
      id: `opp-${o.id}`,
      type: "opportunity",
      title: `Opportunity "${o.title}" posted`,
      date: o.created_at,
      status: o.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Industry <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">Manage opportunities and find top talent</p>
        </div>
        <Link href="/industry/post">
          <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Post Opportunity
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? "-" : s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiring KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Shortlisted", value: shortlistedCount },
          { label: "Interviews", value: interviewCount },
          { label: "Offers Made", value: offerCount },
          { label: "Hired", value: hiredCount === 0 ? "No data yet" : hiredCount },
          { label: "Avg Match Score", value: avgMatchScore !== null ? `${avgMatchScore}%` : "No data" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-secondary/5">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold">{loading ? "-" : kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Action Required & Skill Demand */}
        <div className="space-y-6 lg:col-span-1">
          {/* Action Required */}
          <Card className="border-amber-500/20 shadow-sm shadow-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <PlayCircle className="w-5 h-5" /> Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
              ) : pipeline.applied > 0 || pipeline.screening > 0 ? (
                <>
                  {pipeline.applied > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">{pipeline.applied}</Badge>
                        <span className="text-sm">Pending Review</span>
                      </div>
                      <Link href="/industry/applicants">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Review</Button>
                      </Link>
                    </div>
                  )}
                  {pipeline.screening > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">{pipeline.screening}</Badge>
                        <span className="text-sm">Ready to Interview</span>
                      </div>
                      <Link href="/industry/applicants">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">View</Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground p-3 text-center border border-border/30 rounded-lg">
                  No pending actions required.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Demand Snapshot */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Skill Demand Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
              ) : demandedSkills.length > 0 ? (
                <div className="space-y-3">
                  {demandedSkills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {skill.count} opp{skill.count !== 1 && 's'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center p-3 border border-border/30 rounded-lg">
                  No skill data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Candidate Pipeline & Your Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Candidate Pipeline */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Candidate Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
              ) : allApplications.length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-row items-center justify-between relative">
                  {/* Visual connecting line for desktop */}
                  <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10 -translate-y-1/2"></div>
                  
                  {[
                    { label: "Applied", val: pipeline.applied, color: "text-slate-500" },
                    { label: "Screening", val: pipeline.screening, color: "text-blue-500" },
                    { label: "Interview", val: pipeline.interview, color: "text-amber-500" },
                    { label: "Offer", val: pipeline.offer, color: "text-emerald-500" },
                  ].map((stage, i) => (
                    <div key={i} className="flex flex-col items-center bg-card p-2">
                      <div className={`w-12 h-12 rounded-full border-4 border-background bg-secondary flex items-center justify-center font-bold shadow-sm ${stage.color}`}>
                        {stage.val}
                      </div>
                      <span className="text-xs font-semibold mt-2">{stage.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6 border border-border/30 rounded-lg border-dashed">
                  Not enough data yet. Post an opportunity to build your pipeline.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Posted Opportunities */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Your Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                   <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
                ) : opportunities.length > 0 ? (
                  opportunities.slice(0, 3).map((opp) => (
                    <div key={opp.id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{opp.title}</h3>
                        <div className="flex gap-1">
                          <Badge variant={opp.status === "active" ? "default" : "secondary"} className="text-[10px] capitalize">
                            {opp.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="capitalize">{opp.type}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                          {opp.applications?.length || 0} Applicants
                        </span>
                        <Link href={`/industry/applicants?opportunity=${opp.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-6 border border-border/30 rounded-lg border-dashed">
                    You haven't posted any opportunities yet.
                  </div>
                )}
                
                {opportunities.length > 3 && (
                   <Button variant="outline" size="sm" className="w-full mt-2">
                     View All Opportunities <ArrowRight className="w-3.5 h-3.5 ml-1" />
                   </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border/50">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative flex gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-background bg-primary shrink-0 z-10 mt-0.5 flex items-center justify-center" />
                    <div>
                      <p className="text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {timeAgo(act.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6 border border-border/30 rounded-lg border-dashed">
                No recent activity to display.
              </div>
            )}
          </CardContent>
        </Card>
      
        {/* Available Student Profiles */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Available Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No students found on the platform yet.
              </div>
            ) : (
              <div className="space-y-3">
                {students.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{student.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {student.profile?.career_objective || "Student"}
                      </div>
                    </div>
                    <Link href={`/industry/candidates`}>
                      <Button variant="outline" size="sm" className="h-8">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && students.length > 5 && (
              <Link href="/industry/candidates">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Candidates <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
