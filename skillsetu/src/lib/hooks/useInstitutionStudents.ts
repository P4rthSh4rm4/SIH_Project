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

export function useInstitutionStudents(
  departmentFilter: string = "All Students",
  searchQuery: string = "",
  page: number = 1,
  pageSize: number = 20
) {
  const { profile } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<InstitutionStudent[]>([]);
  const [counts, setCounts] = useState({ all: 0, cse: 0, ayurveda: 0, bpharma: 0 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!profile || (profile.role !== 'institution_admin' && profile.role !== ('institution' as any) && profile.role !== 'academician')) {
      return;
    }
    
    async function fetchStudents() {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch lightweight department counts for the institution
        if (profile?.role !== 'academician') {
          const { data: deptData, error: deptError } = await supabase
            .from('users')
            .select('department')
            .eq('role', 'student')
            .eq('institution_id', profile?.institution_id);
            
          if (!deptError && deptData) {
            let all = 0, cse = 0, ayurveda = 0, bpharma = 0;
            deptData.forEach(d => {
              all++;
              if (d.department === 'CSE') cse++;
              else if (d.department === 'Ayurveda') ayurveda++;
              else if (d.department === 'BPharma') bpharma++;
            });
            setCounts({ all, cse, ayurveda, bpharma });
          }
        }

        // 2. Fetch base students with pagination & search
        let query = supabase
          .from('users')
          .select('id, name, email', { count: 'exact' })
          .eq('role', 'student')
          .eq('institution_id', profile?.institution_id);
          
        // Department Isolation or Filter
        if (profile?.role === 'academician') {
          if (!profile?.department) {
            setStudents([]);
            setLoading(false);
            return;
          }
          query = query.eq('department', profile!.department);
        } else {
          if (departmentFilter === 'CSE') query = query.eq('department', 'CSE');
          if (departmentFilter === 'Ayurveda') query = query.eq('department', 'Ayurveda');
          if (departmentFilter === 'B.Pharm') query = query.eq('department', 'BPharma');
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('name');

        const { data: usersData, error: usersError, count } = await query;
          
        if (usersError) throw usersError;
        setTotalRecords(count || 0);
        
        if (!usersData || usersData.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        const studentIds = usersData.map(u => u.id);
        
        // 3. Fetch related data in parallel for efficiency ONLY for this page's students
        const [profilesRes, skillsRes, appsRes, placementsRes] = await Promise.all([
          supabase.from('student_profiles').select('user_id, bio').in('user_id', studentIds),
          supabase.from('student_skills').select('student_id, skills(name)').in('student_id', studentIds),
          supabase.from('applications').select('student_id, status').in('student_id', studentIds),
          supabase.from('placement_records').select('student_id, outcome, package, date, opportunities(title, users(name))').in('student_id', studentIds)
        ]);
        
        const profilesMap = new Map();
        if (profilesRes.data) {
          profilesRes.data.forEach(p => profilesMap.set(p.user_id, p.bio));
        }
        
        const skillsMap = new Map();
        if (skillsRes.data) {
          skillsRes.data.forEach((s: any) => {
            const skillName = (Array.isArray(s.skills) ? s.skills[0]?.name : s.skills?.name) || 'Unknown Skill';
            if (!skillsMap.has(s.student_id)) skillsMap.set(s.student_id, []);
            skillsMap.get(s.student_id).push(skillName);
          });
        }
        
        const appsMap = new Map();
        const activeAppStatuses = new Set(['applied', 'shortlisted', 'interview', 'offer', 'pending_faculty']);
        const hasActiveApp = new Map();
        if (appsRes.data) {
          appsRes.data.forEach((a: any) => {
            appsMap.set(a.student_id, (appsMap.get(a.student_id) || 0) + 1);
            if (activeAppStatuses.has(a.status)) {
              hasActiveApp.set(a.student_id, true);
            }
          });
        }
        
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
              if (!p.opportunities) {
                placedStudentIds.push(p.student_id);
              }
            } else if (!placementsMap.has(p.student_id)) {
              placementsMap.set(p.student_id, { status: 'Not Placed' });
            }
          });
        }

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

        placementsMap.forEach((entry) => {
          if (entry.status === 'Placed') {
            entry.company = entry.company || 'Company not specified';
            entry.role = entry.role || 'Role not specified';
          }
        });
        
        const combined: InstitutionStudent[] = usersData.map(u => {
          const p = placementsMap.get(u.id);
          const s = skillsMap.get(u.id) || [];

          let placementStatus: 'Placed' | 'In Process' | 'Not Placed' = 'Not Placed';
          if (p?.status === 'Placed') placementStatus = 'Placed';
          else if (hasActiveApp.get(u.id)) placementStatus = 'In Process';

          return {
            id: u.id,
            name: u.name || 'Unknown Student',
            email: u.email || 'No email',
            bio: profilesMap.get(u.id) || null,
            skillCount: s.length,
            skills: s.slice(0, 3),
            applicationCount: appsMap.get(u.id) || 0,
            placementStatus,
            placementDetails: p?.status === 'Placed' ? {
              company: p.company,
              role: p.role,
              package: p.package,
              date: p.date
            } : undefined
          };
        });

        setStudents(combined);
      } catch (err: any) {
        console.error('Error fetching institution students:', err);
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudents();
  }, [profile, departmentFilter, searchQuery, page, pageSize]);

  return { loading, error, students, counts, totalRecords };
}
