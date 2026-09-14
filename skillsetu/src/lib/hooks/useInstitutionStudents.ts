import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from './useUserProfile';

export interface InstitutionStudent {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  skillCount: number;
  skills: string[]; // names of top skills
  applicationCount: number;
  placementStatus: 'Placed' | 'In Process' | 'Not Placed';
  placementDetails?: {
    company: string;
    role: string;
    package: string;
    date: string;
  };
}

export function useInstitutionStudents() {
  const { profile } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<InstitutionStudent[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!profile || (profile.role !== 'institution_admin' && profile.role !== ('institution' as any))) {
      return;
    }
    
    async function fetchStudents() {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch base students
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'student')
          .eq('institution_id', profile?.institution_id);
          
        if (usersError) throw usersError;
        
        if (!usersData || usersData.length === 0) {
          setStudents([]);
          return; // Early return if no students
        }
        
        const studentIds = usersData.map(u => u.id);
        
        // 2. Fetch related data in parallel for efficiency
        const [profilesRes, skillsRes, appsRes, placementsRes] = await Promise.all([
          supabase.from('student_profiles').select('user_id, bio').in('user_id', studentIds),
          supabase.from('student_skills').select('student_id, skills(name)').in('student_id', studentIds),
          supabase.from('applications').select('student_id, status').in('student_id', studentIds),
          supabase.from('placement_records').select('student_id, outcome, package, date, opportunities(title, users(name))').in('student_id', studentIds)
        ]);
        
        // Avoid throwing immediately if related fetches fail (e.g., table missing) 
        // to gracefully degrade.
        const profilesMap = new Map();
        if (profilesRes.data) {
          profilesRes.data.forEach(p => profilesMap.set(p.user_id, p.bio));
        }
        
        const skillsMap = new Map(); // student_id -> array of skill names
        if (skillsRes.data) {
          skillsRes.data.forEach((s: any) => {
            const skillName = (Array.isArray(s.skills) ? s.skills[0]?.name : s.skills?.name) || 'Unknown Skill';
            if (!skillsMap.has(s.student_id)) skillsMap.set(s.student_id, []);
            skillsMap.get(s.student_id).push(skillName);
          });
        }
        
        const appsMap = new Map(); // student_id -> count
        const activeAppStatuses = new Set(['applied', 'shortlisted', 'interview', 'offer', 'pending_faculty']);
        const hasActiveApp = new Map(); // student_id -> boolean
        if (appsRes.data) {
          appsRes.data.forEach((a: any) => {
            appsMap.set(a.student_id, (appsMap.get(a.student_id) || 0) + 1);
            if (activeAppStatuses.has(a.status)) {
              hasActiveApp.set(a.student_id, true);
            }
          });
        }
        
        // Identify placed student IDs that have missing opportunity data
        const placedStudentIds: string[] = [];
        const placementsMap = new Map();
        if (placementsRes.data) {
          placementsRes.data.forEach((p: any) => {
            if (p.outcome === 'placed') {
              const companyUser = Array.isArray(p.opportunities?.users) ? p.opportunities.users[0] : p.opportunities?.users;
              placementsMap.set(p.student_id, {
                status: 'Placed',
                company: companyUser?.name || null,
                role: p.opportunities?.title || null,
                package: p.package || 'Not disclosed',
                date: p.date
              });
              // Track placed students with missing opportunity data for fallback lookup
              if (!p.opportunities) {
                placedStudentIds.push(p.student_id);
              }
            } else if (!placementsMap.has(p.student_id)) {
              placementsMap.set(p.student_id, { status: 'Not Placed' });
            }
          });
        }

        // Fallback: for placed students with missing opportunity, try to resolve role
        // from accepted application_offers.position_title
        if (placedStudentIds.length > 0) {
          const { data: offersData } = await supabase
            .from('application_offers')
            .select('position_title, offer_status, applications!inner(student_id)')
            .eq('offer_status', 'accepted')
            .in('applications.student_id', placedStudentIds);

          if (offersData) {
            offersData.forEach((o: any) => {
              const sid = o.applications?.student_id;
              if (sid && placementsMap.has(sid)) {
                const entry = placementsMap.get(sid);
                if (!entry.role && o.position_title) {
                  entry.role = o.position_title;
                }
              }
            });
          }
        }

        // Apply clean fallback text for any remaining nulls
        placementsMap.forEach((entry) => {
          if (entry.status === 'Placed') {
            entry.company = entry.company || 'Company not specified';
            entry.role = entry.role || 'Role not specified';
          }
        });
        
        // 3. Combine into structured frontend state
        const combined: InstitutionStudent[] = usersData.map(u => {
          const p = placementsMap.get(u.id);
          const s = skillsMap.get(u.id) || [];

          // Derive placement status: Placed > In Process > Not Placed
          let placementStatus: 'Placed' | 'In Process' | 'Not Placed' = 'Not Placed';
          if (p && p.status === 'Placed') {
            placementStatus = 'Placed';
          } else if (hasActiveApp.get(u.id)) {
            placementStatus = 'In Process';
          }
          
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            bio: profilesMap.get(u.id) || null,
            skillCount: s.length,
            skills: s,
            applicationCount: appsMap.get(u.id) || 0,
            placementStatus,
            placementDetails: p && p.status === 'Placed' ? {
              company: p.company,
              role: p.role,
              package: p.package,
              date: p.date
            } : undefined
          };
        });
        
        // Sort alphabetically by name
        combined.sort((a, b) => a.name.localeCompare(b.name));
        
        setStudents(combined);
        
      } catch (err: any) {
        console.error("Error fetching institution students:", err);
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudents();
  }, [profile]);
  
  return {
    loading,
    error,
    students
  };
}
