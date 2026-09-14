import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from './useUserProfile';

export interface RecentPlacement {
  id: string;
  student: string;
  company: string;
  role: string;
  package: string;
  date: string;
}

export function useInstitutionDashboard() {
  const { profile } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [placedStudents, setPlacedStudents] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [recentPlacements, setRecentPlacements] = useState<RecentPlacement[]>([]);
  
  useEffect(() => {
    if (!profile || (profile.role !== 'institution_admin' && profile.role !== ('institution' as any))) return;
    
    async function fetchData() {
      const supabase = createClient();
      setLoading(true);
      try {
        const institutionId = profile?.institution_id;
        if (!institutionId) {
          console.warn('[useInstitutionDashboard] No institution_id on profile, skipping queries');
          setLoading(false);
          return;
        }

        // 1. Total Students
        const { count: studentCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
          .eq('institution_id', institutionId);
          
        setTotalStudents(studentCount || 0);

        // 1b. Get student IDs for this institution (for scoped sub-queries)
        const { data: studentRows } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('institution_id', institutionId);
        const studentIds = (studentRows || []).map((s: any) => s.id);

        // 2. Placed Students (scoped to institution's students)
        if (studentIds.length > 0) {
          const { data: placedData } = await supabase
            .from('placement_records')
            .select('student_id')
            .eq('outcome', 'placed')
            .in('student_id', studentIds);
          
          if (placedData) {
            const uniquePlacedIds = new Set(placedData.map((p: any) => p.student_id));
            setPlacedStudents(uniquePlacedIds.size);
          } else {
            setPlacedStudents(0);
          }
        } else {
          setPlacedStudents(0);
        }

        // 3. Pending Verifications (scoped to institution's students)
        if (studentIds.length > 0) {
          const { count: pendingCount } = await supabase
            .from('certifications')
            .select('*', { count: 'exact', head: true })
            .eq('verified', false)
            .in('student_id', studentIds);
          setPendingVerifications(pendingCount || 0);
        } else {
          setPendingVerifications(0);
        }

        // 4. Recent Placements (scoped to institution's students)
        if (studentIds.length > 0) {
          const { data: placements } = await supabase
            .from('placement_records')
            .select(`
              id,
              student_id,
              package,
              date,
              users!inner ( name ),
              opportunities (
                title,
                users ( name )
              )
            `)
            .eq('outcome', 'placed')
            .in('student_id', studentIds)
            .order('date', { ascending: false })
            .limit(5);

          if (placements) {
            // Identify placements missing opportunity data
            const missingOppStudentIds = placements
              .filter((p: any) => !p.opportunities)
              .map((p: any) => p.student_id);

            const offersMap = new Map();
            if (missingOppStudentIds.length > 0) {
              const { data: offersData } = await supabase
                .from('application_offers')
                .select('position_title, offer_status, applications!inner(student_id)')
                .eq('offer_status', 'accepted')
                .in('applications.student_id', missingOppStudentIds);

              if (offersData) {
                offersData.forEach((o: any) => {
                  const sid = o.applications?.student_id;
                  if (sid && o.position_title) {
                    offersMap.set(sid, o.position_title);
                  }
                });
              }
            }

            const mapped = placements.map((p: any) => {
              const companyUser = Array.isArray(p.opportunities?.users) ? p.opportunities.users[0] : p.opportunities?.users;
              const companyName = companyUser?.name || 'Company not specified';
              const studentUser = Array.isArray(p.users) ? p.users[0] : p.users;
              
              let roleName = p.opportunities?.title;
              if (!roleName && offersMap.has(p.student_id)) {
                roleName = offersMap.get(p.student_id);
              }
              
              return {
                id: p.id,
                student: studentUser?.name || 'Student',
                company: companyName,
                role: roleName || 'Role not specified',
                package: p.package || 'Not disclosed',
                date: p.date,
              };
            });
            setRecentPlacements(mapped);
          }
        }
      } catch (err) {
        console.error("Error fetching institution dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [profile]);
  
  return {
    loading,
    totalStudents,
    placedStudents,
    pendingVerifications,
    recentPlacements,
    placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) + '%' : '0%',
  };
}
