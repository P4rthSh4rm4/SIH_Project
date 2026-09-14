import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from './useUserProfile';

export interface InstitutionCertification {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  title: string;
  issuer: string;
  issued_at: string;
  verified: boolean;
  verification_status: string;
  credential_id: string | null;
  certificate_url: string | null;
}

export function useInstitutionVerification() {
  const { profile } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState<InstitutionCertification[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!profile || (profile.role !== 'institution_admin' && profile.role !== ('institution' as any))) {
      return;
    }
    
    async function fetchVerifications() {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch base students for this institution
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'student')
          .eq('institution_id', profile?.institution_id);
          
        if (usersError) throw usersError;
        
        if (!usersData || usersData.length === 0) {
          setCertifications([]);
          return;
        }
        
        const studentIds = usersData.map(u => u.id);
        const usersMap = new Map(usersData.map(u => [u.id, { name: u.name, email: u.email }]));
        
        // 2. Fetch certifications for these students
        const { data: certsData, error: certsError } = await supabase
          .from('certifications')
          .select('*')
          .in('student_id', studentIds)
          .order('issued_at', { ascending: false });
          
        if (certsError) throw certsError;
        
        // 3. Map into structured frontend state
        const combined: InstitutionCertification[] = (certsData || []).map(c => {
          const studentInfo = usersMap.get(c.student_id);
          return {
            id: c.id,
            student_id: c.student_id,
            student_name: studentInfo?.name || 'Unknown Student',
            student_email: studentInfo?.email || '',
            title: c.title,
            issuer: c.issuer,
            issued_at: c.issued_at,
            verified: c.verified,
            verification_status: c.verification_status,
            credential_id: c.credential_id,
            certificate_url: c.certificate_url
          };
        });
        
        setCertifications(combined);
      } catch (err: any) {
        console.error("Error fetching institution verifications:", err);
        setError(err.message || "Failed to load verification records");
      } finally {
        setLoading(false);
      }
    }
    
    fetchVerifications();
  }, [profile]);
  
  return {
    loading,
    error,
    certifications
  };
}
