"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Users, Target, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Types based on Supabase schema
type Opportunity = { id: string; status: string; required_skills: string[]; preferred_skills: string[]; };
type Application = { id: string; opportunity_id: string; status: string; applied_at: string; match_score: number | null; };
type Interview = { id: string; application_id: string; opportunity_id: string; interview_status: string; };
type Offer = { id: string; application_id: string; opportunity_id: string; offer_status: string; };
type Placement = { id: string; student_id: string; opportunity_id: string; outcome: string; date: string; };
type Program = { id: string; industry_id: string; status: string; };
type Enrollment = { id: string; program_id: string; progress_pct: number; };
type Skill = { id: string; name: string; };
type SkillFeedback = { id: string; opportunity_id: string; skill_id: string; rating: number; gap_indicator: string; };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [feedback, setFeedback] = useState<SkillFeedback[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        // Fetch Opportunities for the industry
        const { data: opps, error: oppsError } = await supabase
          .from("opportunities")
          .select("id, status, required_skills, preferred_skills")
          .eq("industry_id", user.id);
        
        if (oppsError) throw oppsError;
        const fetchedOpps = opps || [];
        setOpportunities(fetchedOpps);

        const oppIds = fetchedOpps.map(o => o.id);

        if (oppIds.length > 0) {
          // Fetch related data for these opportunities
          const [appsRes, intsRes, offsRes, plcsRes, feedRes] = await Promise.all([
            supabase.from("applications").select("id, opportunity_id, status, applied_at, match_score").in("opportunity_id", oppIds),
            supabase.from("application_interviews").select("id, application_id, opportunity_id, interview_status").in("opportunity_id", oppIds),
            supabase.from("application_offers").select("id, application_id, opportunity_id, offer_status").in("opportunity_id", oppIds),
            supabase.from("placement_records").select("id, student_id, opportunity_id, outcome, date").in("opportunity_id", oppIds),
            supabase.from("application_skill_feedback").select("id, opportunity_id, skill_id, rating, gap_indicator").in("opportunity_id", oppIds)
          ]);

          if (appsRes.error) throw appsRes.error;
          if (intsRes.error) throw intsRes.error;
          if (offsRes.error) throw offsRes.error;
          if (plcsRes.error) throw plcsRes.error;
          if (feedRes.error && feedRes.error.code !== '42P01') throw feedRes.error; // Ignore 42P01 if table doesn't exist yet

          setApplications(appsRes.data || []);
          setInterviews(intsRes.data || []);
          setOffers(offsRes.data || []);
          setPlacements(plcsRes.data || []);
          setFeedback(feedRes.data || []);
        }

        // Fetch Programs for the industry
        const { data: progs, error: progsError } = await supabase
          .from("learning_programs")
          .select("id, industry_id, status")
          .eq("industry_id", user.id);
        
        if (progsError) throw progsError;
        const fetchedProgs = progs || [];
        setPrograms(fetchedProgs);

        const progIds = fetchedProgs.map(p => p.id);
        if (progIds.length > 0) {
          const { data: enrs, error: enrsError } = await supabase
            .from("learning_enrollments")
            .select("id, program_id, progress_pct")
            .in("program_id", progIds);
          if (enrsError) throw enrsError;
          setEnrollments(enrs || []);
        }

        // Fetch all skills for mapping
        const { data: sks, error: sksError } = await supabase.from("skills").select("id, name");
        if (sksError) throw sksError;
        setSkills(sks || []);

      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Compute Metrics using useMemo
  const metrics = useMemo(() => {
    // 1. KPI Calculations
    const activeOpps = opportunities.filter(o => o.status === 'active').length;
    const totalApps = applications.length;
    
    // Shortlisted = status is 'shortlisted', 'interview', 'offer' (we don't use 'hired' for application status)
    const shortlistedApps = applications.filter(a => ['shortlisted', 'interview', 'offer'].includes(a.status)).length;
    
    const completedInterviews = interviews.filter(i => i.interview_status === 'completed').length;
    const totalOffersSent = offers.filter(o => ['sent', 'accepted', 'declined'].includes(o.offer_status)).length;
    const acceptedOffers = offers.filter(o => o.offer_status === 'accepted').length;
    const hiredCandidates = placements.filter(p => p.outcome === 'placed').length;

    const appsWithScore = applications.filter(a => a.match_score !== null);
    const avgMatchScore = appsWithScore.length > 0 
      ? Math.round(appsWithScore.reduce((sum, a) => sum + (a.match_score as number), 0) / appsWithScore.length) 
      : 0;

    const appsPerOpp = opportunities.length > 0 ? (totalApps / opportunities.length).toFixed(1) : "0";
    const shortlistRate = totalApps > 0 ? ((shortlistedApps / totalApps) * 100).toFixed(1) : "0";
    const interviewCompleteRate = interviews.length > 0 ? ((completedInterviews / interviews.length) * 100).toFixed(1) : "0";
    const offerAcceptRate = totalOffersSent > 0 ? ((acceptedOffers / totalOffersSent) * 100).toFixed(1) : "0";

    // 2. Funnel Data (Unique applications reaching each stage)
    const interviewedAppIds = new Set(interviews.map(i => i.application_id));
    const offeredAppIds = new Set(offers.map(o => o.application_id));
    
    // Placements don't map directly to application_id, but logically a placement means hired.
    // For funnel precision based on unique applications reaching "Hired", we can match via student_id + opportunity_id.
    // However, since we just need the count of placements for this industry's opportunities that are 'placed',
    // and assuming 1 placement per candidate per opportunity, we can just use the hiredCandidates count.
    const funnel = [
      { stage: 'Applied', count: totalApps },
      { stage: 'Shortlisted', count: shortlistedApps },
      { stage: 'Interviewed', count: interviewedAppIds.size },
      { stage: 'Offered', count: offeredAppIds.size },
      { stage: 'Hired', count: hiredCandidates }
    ];

    // 3. Volume Trend (Monthly Applications vs Hires)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const volumeMap: Record<string, { applicants: number, hires: number, sortKey: string }> = {};

    applications.forEach(app => {
      if (!app.applied_at) return;
      const d = new Date(app.applied_at);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!volumeMap[key]) volumeMap[key] = { applicants: 0, hires: 0, sortKey };
      volumeMap[key].applicants++;
    });

    placements.filter(p => p.outcome === 'placed').forEach(p => {
      if (!p.date) return;
      const d = new Date(p.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!volumeMap[key]) volumeMap[key] = { applicants: 0, hires: 0, sortKey };
      volumeMap[key].hires++;
    });

    const volumeData = Object.keys(volumeMap)
      .map(k => ({ name: k, applicants: volumeMap[k].applicants, hires: volumeMap[k].hires, sortKey: volumeMap[k].sortKey }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // 4. Skills Data (Combined Required and Preferred)
    const skillCountMap: Record<string, number> = {};
    opportunities.forEach(opp => {
      const allSkills = [...(opp.required_skills || []), ...(opp.preferred_skills || [])];
      allSkills.forEach(sId => {
        if (!skillCountMap[sId]) skillCountMap[sId] = 0;
        skillCountMap[sId]++;
      });
    });

    const skillsData = Object.keys(skillCountMap)
      .map(sId => {
        const skillObj = skills.find(s => s.id === sId);
        return {
          name: skillObj ? skillObj.name : "Unknown Skill",
          value: skillCountMap[sId]
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 skills

    // 5. Program Impact
    const publishedPrograms = programs.filter(p => p.status === 'published').length;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.progress_pct === 100).length;
    const programCompletionRate = totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) : "0";

    // 6. Skill Gap Insights
    const skillGapsMap: Record<string, { count: number, ratingSum: number, gapCount: number }> = {};
    feedback.forEach(f => {
      if (!skillGapsMap[f.skill_id]) {
        skillGapsMap[f.skill_id] = { count: 0, ratingSum: 0, gapCount: 0 };
      }
      skillGapsMap[f.skill_id].count++;
      skillGapsMap[f.skill_id].ratingSum += f.rating;
      if (f.gap_indicator === 'Needs Improvement' || f.gap_indicator === 'Significant Gap') {
        skillGapsMap[f.skill_id].gapCount++;
      }
    });

    const skillGaps = Object.keys(skillGapsMap).map(sId => {
      const stats = skillGapsMap[sId];
      const avgRating = (stats.ratingSum / stats.count).toFixed(1);
      const gapSeverity = (stats.gapCount / stats.count) * 100;
      let gapLevel = 'Strong/Adequate';
      if (gapSeverity > 60) gapLevel = 'Significant Gap';
      else if (gapSeverity > 30) gapLevel = 'Needs Improvement';

      const skillObj = skills.find(s => s.id === sId);
      return {
        id: sId,
        name: skillObj ? skillObj.name : 'Unknown Skill',
        count: stats.count,
        avgRating,
        gapSeverity,
        gapLevel
      };
    })
    .sort((a, b) => {
      if (b.gapSeverity !== a.gapSeverity) return b.gapSeverity - a.gapSeverity;
      return b.count - a.count;
    })
    .slice(0, 5);

    return {
      activeOpps, totalApps, shortlistedApps, completedInterviews, totalOffersSent, acceptedOffers, hiredCandidates, avgMatchScore,
      appsPerOpp, shortlistRate, interviewCompleteRate, offerAcceptRate,
      funnel, volumeData, skillsData,
      publishedPrograms, totalEnrollments, programCompletionRate,
      skillGaps
    };
  }, [opportunities, applications, interviews, offers, placements, programs, enrollments, skills, feedback]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col text-red-500">
        <Target className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Hiring Analytics
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Track your recruitment funnel, analyze applicant volume, and identify top skill demands across {metrics.activeOpps} active {metrics.activeOpps === 1 ? 'opportunity' : 'opportunities'}.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applicants", value: metrics.totalApps.toString(), subtext: `${metrics.appsPerOpp} avg per opportunity`, icon: Users, color: "text-blue-500" },
          { label: "Shortlist Rate", value: `${metrics.shortlistRate}%`, subtext: `${metrics.shortlistedApps} candidates shortlisted`, icon: Target, color: "text-emerald-500" },
          { label: "Offer Acceptance", value: `${metrics.offerAcceptRate}%`, subtext: `${metrics.acceptedOffers} out of ${metrics.totalOffersSent} accepted`, icon: TrendingUp, color: "text-amber-500" },
          { label: "Avg Match Score", value: `${metrics.avgMatchScore}%`, subtext: "Based on Smart Matching", icon: BarChart3, color: "text-violet-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.subtext}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trend */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Applicant Volume Trends</CardTitle>
            <CardDescription>Total applications vs actual hires over time</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.volumeData.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                No application data available yet.
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.1} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="applicants" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Unique candidates reaching each hiring stage</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.totalApps === 0 ? (
               <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                 No applications in funnel yet.
               </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.funnel} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                      {metrics.funnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Distribution */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Top Skill Demands</CardTitle>
            <CardDescription>Frequency of required & preferred skills in your opportunities</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {metrics.skillsData.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                 No skills listed in active opportunities yet.
              </div>
            ) : (
              <div className="h-[300px] w-full max-w-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.skillsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {metrics.skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Program Impact / Industry Feedback */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Training Program Impact</CardTitle>
              <CardDescription>Metrics from your published student learning programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <p className="text-2xl font-bold text-blue-600">{metrics.publishedPrograms}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Published Programs</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <p className="text-2xl font-bold text-emerald-600">{metrics.totalEnrollments}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Total Enrollments</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50 col-span-2">
                  <p className="text-2xl font-bold text-violet-600">{metrics.programCompletionRate}%</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Overall Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Top Skill Gaps</CardTitle>
              <CardDescription>
                Identify recurring skill gaps observed during candidate recruitment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.skillGaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-md font-semibold text-foreground">No feedback data yet</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Insufficient data to generate meaningful skill gap insights. Begin leaving structured feedback on candidates to populate this report.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.skillGaps.map(gap => (
                    <div key={gap.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors gap-3">
                      <div>
                        <p className="font-semibold text-sm">{gap.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{gap.count} feedback {gap.count === 1 ? 'record' : 'records'} • Avg Rating: {gap.avgRating}/5</p>
                      </div>
                      <Badge variant="outline" className={`
                        ${gap.gapLevel === 'Significant Gap' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${gap.gapLevel === 'Needs Improvement' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${gap.gapLevel === 'Strong/Adequate' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        px-2.5 py-0.5 whitespace-nowrap w-fit
                      `}>
                        {gap.gapLevel} ({gap.gapSeverity.toFixed(0)}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
