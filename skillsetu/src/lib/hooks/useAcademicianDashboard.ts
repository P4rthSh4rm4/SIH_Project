import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "./useUserProfile";

export interface AcademicianStats {
  fdpsAvailable: number;
  researchProjects: number;
  consultancy: number;
  activeMentees: number;
}

export interface MenteeSkillDistribution {
  skillName: string;
  avgScore: number;
}

export interface LatestAcademicOpportunity {
  id: string;
  title: string;
  type: string;
  host_industry_name: string;
  date: string; // we'll use created_at or deadline
}

export interface UpcomingActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  host: string;
}

export function useAcademicianDashboard() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [stats, setStats] = useState<AcademicianStats>({
    fdpsAvailable: 0,
    researchProjects: 0,
    consultancy: 0,
    activeMentees: 0,
  });
  const [skillDistribution, setSkillDistribution] = useState<MenteeSkillDistribution[]>([]);
  const [latestOpportunities, setLatestOpportunities] = useState<LatestAcademicOpportunity[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!profile?.id) return;
    
    // Fail closed for academicians if department is missing
    if (profile.role === 'academician' && !profile.department) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      // 1. Fetch Academician Opportunities for stats & latest list
      let query = supabase
        .from("academician_opportunities")
        .select(`
          id, 
          type, 
          title, 
          deadline,
          users!academician_opportunities_host_industry_id_fkey (
            name
          ),
          creator:users!academician_opportunities_created_by_fkey!inner (
            department
          )
        `);
        
      if (profile.role === 'academician') {
        query = query.eq('creator.department', profile.department);
      }
        
      const { data: opps, error: oppsError } = await query.order("id", { ascending: false });

      if (oppsError) console.error("Error fetching academician opps:", oppsError);
      
      let fdps = 0, research = 0, consultancy = 0;
      const latestList: LatestAcademicOpportunity[] = [];
      
      if (opps) {
        opps.forEach(o => {
          if (o.type === 'FDP') fdps++;
          else if (o.type === 'research') research++;
          else if (o.type === 'consultancy') consultancy++;
          
          if (latestList.length < 5) {
            latestList.push({
              id: o.id,
              title: o.title,
              type: o.type,
              // @ts-ignore
              host_industry_name: o.users?.name || "Institution-led",
              date: o.deadline ? new Date(o.deadline).toLocaleDateString() : "Rolling"
            });
          }
        });
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const withDeadline = opps.filter(o => o.deadline && new Date(o.deadline) >= now);
        withDeadline.sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
        
        const upcoming: UpcomingActivity[] = withDeadline.slice(0, 5).map(o => ({
          id: o.id,
          title: o.title,
          type: o.type,
          date: new Date(o.deadline!).toLocaleDateString(),
          // @ts-ignore
          host: o.users?.name || "Institution-led"
        }));
        setUpcomingActivities(upcoming);
      }

      // 2. Fetch Mentorships for active mentees count and mentee_ids (isolated by mentee department)
      let mentQuery = supabase
        .from("mentorships")
        .select(`
          mentee_id,
          mentee:users!mentorships_mentee_id_fkey!inner(department)
        `)
        .eq("mentor_id", profile.id)
        .eq("status", "active");

      if (profile.role === 'academician' && profile.department) {
        mentQuery = mentQuery.eq('mentee.department', profile.department);
      }
      
      const { data: mentorships, error: mentError } = await mentQuery;
        
      if (mentError) console.error("Error fetching mentorships:", mentError);
      
      const activeMentees = mentorships ? mentorships.length : 0;
      
      // 3. Fetch Student Skills for Mentee Progress Overview
      const skillAverages: Record<string, { total: number, count: number }> = {};
      
      if (activeMentees > 0) {
        const menteeIds = mentorships!.map(m => m.mentee_id);
        const { data: skillsData, error: skillsError } = await supabase
          .from("student_skills")
          .select(`
            proficiency_score,
            skills (
              name
            )
          `)
          .in("student_id", menteeIds);
          
        if (skillsError) console.error("Error fetching student skills:", skillsError);
        
        if (skillsData) {
          skillsData.forEach(sk => {
            // @ts-ignore
            const skillName = sk.skills?.name;
            if (skillName) {
              if (!skillAverages[skillName]) skillAverages[skillName] = { total: 0, count: 0 };
              skillAverages[skillName].total += sk.proficiency_score;
              skillAverages[skillName].count += 1;
            }
          });
        }
      }
      
      const distribution: MenteeSkillDistribution[] = Object.keys(skillAverages).map(name => ({
        skillName: name,
        avgScore: Math.round(skillAverages[name].total / skillAverages[name].count)
      })).sort((a, b) => b.avgScore - a.avgScore).slice(0, 10); // Top 10 skills

      setStats({
        fdpsAvailable: fdps,
        researchProjects: research,
        consultancy: consultancy,
        activeMentees
      });
      setLatestOpportunities(latestList);
      setSkillDistribution(distribution);
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profileLoading) {
      fetchDashboardData();
    }
  }, [profileLoading, fetchDashboardData]);

  return {
    stats,
    skillDistribution,
    latestOpportunities,
    upcomingActivities,
    loading: loading || profileLoading,
    refetch: fetchDashboardData
  };
}
