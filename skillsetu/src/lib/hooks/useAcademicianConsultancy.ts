import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "./useUserProfile";

export type ConsultancyProject = {
  id: string;
  title: string;
  description: string | null;
  host_industry_id: string | null;
  deadline: string | null;
  status: string;
  created_by: string | null;
  users?: { name: string } | null;
};

export function useAcademicianConsultancy() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [projects, setProjects] = useState<ConsultancyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("academician_opportunities")
        .select(`
          id, 
          title, 
          description, 
          host_industry_id, 
          deadline, 
          status, 
          created_by,
          creator:users!academician_opportunities_created_by_fkey!inner(department),
          users!academician_opportunities_host_industry_id_fkey(name)
        `)
        .eq("type", "consultancy")
        .order("id", { ascending: false });

      if (profile?.department && profile.department !== 'global') {
        query = query.eq("creator.department", profile.department);
      } else if (!profile?.department) {
        // Fail closed: Do not expose all records if department is unknown
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setProjects(data as unknown as ConsultancyProject[]);
    } catch (err: any) {
      console.error("Error fetching consultancy projects:", err);
      toast.error("Failed to load consultancy projects.");
    } finally {
      setLoading(false);
    }
  }, [profile?.department, supabase]);

  useEffect(() => {
    if (profile?.department) {
      fetchProjects();
    } else {
      // Still fetch if no department is set yet to avoid infinite loading if profile fails
      fetchProjects();
    }
  }, [fetchProjects, profile?.department]);

  const createProject = async (formData: FormData) => {
    if (!profile?.id) {
      toast.error("You must be logged in to create a project.");
      return false;
    }
    
    setIsMutating(true);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;
    const hostIndustryId = formData.get("host_industry_id") as string;

    try {
      const { error } = await supabase
        .from("academician_opportunities")
        .insert({
          type: "consultancy",
          title,
          description: description || null,
          deadline: deadline || null,
          host_industry_id: hostIndustryId || null,
          created_by: profile.id,
          status: "upcoming"
        });

      if (error) throw error;
      toast.success("Consultancy project created successfully!");
      await fetchProjects();
      return true;
    } catch (err: any) {
      console.error("Create project error:", err);
      toast.error(err.message || "Failed to create consultancy project.");
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!profile?.id) return false;
    const toastId = toast.loading("Deleting project...");
    try {
      setIsMutating(true);
      const { error } = await supabase
        .from("academician_opportunities")
        .delete()
        .eq("id", id)
        .eq("type", "consultancy");

      if (error) throw error;
      toast.success("Consultancy project deleted.", { id: toastId });
      await fetchProjects();
      return true;
    } catch (err: any) {
      console.error("Delete project error:", err);
      toast.error(err.message || "Failed to delete project.", { id: toastId });
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateProject = async (id: string, formData: FormData) => {
     if (!profile?.id) return false;
     setIsMutating(true);
     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const deadline = formData.get("deadline") as string;
     
     try {
       const { error } = await supabase
         .from("academician_opportunities")
         .update({
           title,
           description: description || null,
           deadline: deadline || null,
         })
         .eq("id", id)
         .eq("type", "consultancy");
         
       if (error) throw error;
       toast.success("Consultancy project updated!");
       await fetchProjects();
       return true;
     } catch (err: any) {
       console.error("Update error:", err);
       toast.error(err.message || "Failed to update project.");
       return false;
     } finally {
       setIsMutating(false);
     }
  };

  return {
    projects,
    loading: loading || profileLoading,
    isMutating,
    profile,
    fetchProjects,
    createProject,
    deleteProject,
    updateProject
  };
}
