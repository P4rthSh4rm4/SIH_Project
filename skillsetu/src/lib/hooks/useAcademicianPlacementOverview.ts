import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";

export type PlacementStatus = 'Placed' | 'In Process' | 'Not Placed';

export type StudentPlacement = {
  id: string;
  name: string;
  status: PlacementStatus;
};

export function useAcademicianPlacementOverview() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [students, setStudents] = useState<StudentPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!profileLoading && profile?.id) {
      fetchOverview();
    }
  }, [profile?.id, profileLoading]);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      if (profile?.role === 'academician' && !profile.department) {
        setLoading(false);
        return; // Fail closed if department is not yet loaded
      }

      // 1. Fetch all students in the academician's institution (RLS handles scoping)
      // along with their placement_records and applications.
      let query = supabase
        .from('users')
        .select(`
          id,
          name,
          placement_records ( outcome ),
          applications ( status )
        `)
        .eq('role', 'student');

      if (profile?.role === 'academician') {
        query = query.eq('department', profile.department);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const placementData: StudentPlacement[] = (data || []).map((student: any) => {
        // Check if placed
        const isPlaced = student.placement_records?.some((pr: any) => pr.outcome === 'placed');
        
        if (isPlaced) {
          return { id: student.id, name: student.name, status: 'Placed' };
        }

        // Check if in process (has active applications)
        const activeStatuses = ['applied', 'shortlisted', 'interview', 'offer'];
        const inProcess = student.applications?.some((app: any) => activeStatuses.includes(app.status));

        if (inProcess) {
          return { id: student.id, name: student.name, status: 'In Process' };
        }

        return { id: student.id, name: student.name, status: 'Not Placed' };
      });

      // Sort: Placed -> In Process -> Not Placed
      const order = { 'Placed': 1, 'In Process': 2, 'Not Placed': 3 };
      placementData.sort((a, b) => order[a.status] - order[b.status]);

      setStudents(placementData);
    } catch (err: any) {
      console.error("Error fetching placement overview:", err);
      setError(err.message || "Failed to load placement overview");
      toast.error("Failed to load placement overview");
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    loading,
    error,
    refresh: fetchOverview
  };
}
