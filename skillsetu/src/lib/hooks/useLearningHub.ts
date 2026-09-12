"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LearningProgram, LearningEnrollment } from "@/lib/types";

export const MOCK_PROGRAMS = [
  {
    id: "mock-tech-1",
    title: "Full Stack Web Development with Next.js",
    provider: "Sheryians Coding School",
    type: "tech",
    skills_covered: ["React", "Next.js", "Node.js", "MongoDB"],
    url: "https://www.youtube.com/watch?v=8hly31xKli0"
  },
  {
    id: "mock-fs-1",
    title: "Full-Stack Engineer Bootcamp",
    provider: "SkillSetu Academy",
    type: "tech",
    skills_covered: ["HTML5", "CSS3", "JavaScript", "Web APIs", "React", "Next.js", "Redux", "Tailwind CSS", "Node.js", "Express", "REST API", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "System Design", "Docker", "AWS", "CI/CD", "Vercel", "WebSockets", "Microservices", "Kafka", "Performance Optimization"],
    url: "https://www.youtube.com/watch?v=8hly31xKli0"
  },
  {
    id: "mock-ds-1",
    title: "Data Scientist Certification Course",
    provider: "SkillSetu Data School",
    type: "tech",
    skills_covered: ["Python", "Linear Algebra", "Statistics", "Calculus", "Pandas", "NumPy", "SQL", "Data Cleaning", "Matplotlib", "Seaborn", "Tableau", "PowerBI", "Scikit-Learn", "Regression", "Classification", "XGBoost", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "MLflow", "FastAPI", "Docker", "Model Monitoring"],
    url: "https://www.youtube.com/watch?v=ua-CiDNNj30"
  },
  {
    id: "mock-do-1",
    title: "DevOps Engineer Masterclass",
    provider: "SkillSetu Cloud",
    type: "tech",
    skills_covered: ["Linux Admin", "Bash Scripting", "TCP/IP", "DNS", "Git", "GitHub Actions", "Jenkins", "GitLab CI", "Docker", "Docker Compose", "Container Registry", "Terraform", "Ansible", "CloudFormation", "Kubernetes", "Helm", "Istio", "EKS/GKE", "Prometheus", "Grafana", "ELK Stack", "Datadog"],
    url: "https://www.youtube.com/watch?v=hQcFE0RD0cQ"
  },
  {
    id: "mock-ai-1",
    title: "AI Engineer Professional Certificate",
    provider: "SkillSetu AI Lab",
    type: "tech",
    skills_covered: ["Transformers", "Attention Mechanism", "Embeddings", "OpenAI API", "HuggingFace", "Prompt Engineering", "Pinecone", "ChromaDB", "LangChain", "LlamaIndex", "LoRA", "QLoRA", "vLLM", "Ollama"],
    url: "https://www.youtube.com/watch?v=zjkBMFhNj_g"
  },
  {
    id: "mock-sec-1",
    title: "Cyber Security Analyst Training",
    provider: "SkillSetu Security",
    type: "tech",
    skills_covered: ["Wireshark", "TCP/IP", "Nmap", "Linux Security", "Windows Active Directory", "IAM", "Nessus", "Burp Suite", "OWASP Top 10", "Splunk", "SIEM", "Digital Forensics"],
    url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"
  },
  {
    id: "mock-mob-1",
    title: "Mobile App Developer with React Native",
    provider: "SkillSetu Mobile",
    type: "tech",
    skills_covered: ["Figma", "UI/UX", "Mobile Patterns", "React Native", "Flutter", "Dart", "Redux", "REST APIs", "GraphQL", "App Store Connect", "Google Play Console", "Native Code (Swift/Kotlin)"],
    url: "https://www.youtube.com/watch?v=0-S5a0eXPoc"
  },
  {
    id: "mock-uiux-1",
    title: "UI/UX Designer Fundamentals",
    provider: "SkillSetu Design",
    type: "design",
    skills_covered: ["Color Theory", "Typography", "Grid Systems", "User Interviews", "Personas", "Journey Mapping", "Figma", "Adobe XD", "Interactive Prototyping", "Component Variants", "Auto Layout", "Design Tokens"],
    url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"
  },
  {
    id: "mock-apti-1",
    title: "Quantitative Aptitude Mastery",
    provider: "SkillSetu Prep",
    type: "aptitude",
    skills_covered: ["Problem Solving", "Mathematics", "Speed Math"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "mock-comm-1",
    title: "Business Communication & Soft Skills",
    provider: "Corporate Trainers Inc",
    type: "communication",
    skills_covered: ["Public Speaking", "Email Etiquette", "Negotiation"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

export function useLearningHub() {
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [enrollments, setEnrollments] = useState<LearningEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [programsRes, enrollmentsRes] = await Promise.all([
        supabase.rpc("get_published_programs_with_counts"),
        supabase
          .from("learning_enrollments")
          .select("*, program:learning_programs(*)")
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false }),
      ]);

      let finalProgramsData = programsRes.data;
      if (programsRes.error) {
        // Fallback to standard fetch if RPC is not deployed yet
        const fallbackRes = await supabase
          .from("learning_programs")
          .select("*")
          .eq("status", "published")
          .order("title", { ascending: true });
        if (fallbackRes.error) throw fallbackRes.error;
        finalProgramsData = fallbackRes.data;
      }
      
      if (enrollmentsRes.error) throw enrollmentsRes.error;

      const loadedPrograms = (finalProgramsData as LearningProgram[]) ?? [];
      const loadedEnrollments = (enrollmentsRes.data as LearningEnrollment[]) ?? [];

      // Deduplicate programs by title (seed script may have created duplicates)
      const seenTitles = new Set<string>();
      const uniquePrograms = loadedPrograms.filter((p) => {
        if (seenTitles.has(p.title)) return false;
        seenTitles.add(p.title);
        return true;
      });

      // Merge with persisted mock enrollments only if the real database is empty
      try {
        if (typeof window !== "undefined" && uniquePrograms.length === 0) {
          const storedMocks = localStorage.getItem("mock_enrollments");
          if (storedMocks) {
            const parsedMocks = JSON.parse(storedMocks) as LearningEnrollment[];
            loadedEnrollments.push(...parsedMocks);
          }
        }
      } catch(e) {
        console.error("Failed to parse mock enrollments", e);
      }
      
      console.log("[useLearningHub] programs.length after fetching:", uniquePrograms.length);
      console.log("[useLearningHub] enrollments.length after fetching:", loadedEnrollments.length);

      setPrograms(uniquePrograms);
      setEnrollments(loadedEnrollments);
    } catch (err) {
      console.error("[useLearningHub] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enroll = useCallback(
    async (
      programId: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        console.log("[useLearningHub] handleEnroll executed");
        console.log("[useLearningHub] Program ID:", programId);
        console.log("[useLearningHub] Authenticated User ID:", user.id);

        if (programId.startsWith("mock-")) {
          // Intercept mock program enrollment to preserve UI functionality without DB errors
          console.log("[useLearningHub] Intercepting mock program enrollment for:", programId);
          await new Promise(r => setTimeout(r, 800)); // Simulate network delay
          
          const mockProgram = MOCK_PROGRAMS.find(p => p.id === programId);
          
          const newEnrollment = {
            id: `mock-enroll-${Date.now()}`,
            student_id: user.id,
            program_id: programId,
            progress_pct: 0,
            enrolled_at: new Date().toISOString(),
            completed_at: null,
            // @ts-ignore - Mocking the program join for UI purposes
            program: { 
              id: programId, 
              title: mockProgram?.title || "Mock Program", 
              provider: mockProgram?.provider || "Mock Provider",
              type: mockProgram?.type || "tech",
              skills_covered: mockProgram?.skills_covered || []
            }
          };

          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem("mock_enrollments");
              const parsed = stored ? JSON.parse(stored) : [];
              localStorage.setItem("mock_enrollments", JSON.stringify([newEnrollment, ...parsed]));
            }
          } catch(e) {}
          
          setEnrollments(prev => [newEnrollment, ...prev]);
          return { success: true };
        }
        const { data, error } = await supabase.rpc("enroll_in_program", { p_program_id: programId });
        console.log("[useLearningHub] Complete Supabase response:", { data, error });

        if (error) {
          console.error("[useLearningHub] enroll Supabase error object:", JSON.stringify(error, null, 2));
          // If RPC is missing, fallback to direct insert
          if (error.code === '42883' || error.message.includes('function enroll_in_program does not exist')) {
             const payload = {
               student_id: user.id,
               program_id: programId,
               progress_pct: 0,
             };
             const { error: insertError } = await supabase.from("learning_enrollments").insert(payload);
             if (insertError) throw new Error(insertError.message || "Failed to enroll");
          } else {
             throw new Error(error.message || error.details || "Supabase enroll failed");
          }
        } else if (data && data.success === false) {
           throw new Error(data.error || "Failed to enroll");
        }
        
        await fetchData();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to enroll",
        };
      }
    },
    [fetchData]
  );

  const updateProgress = useCallback(
    async (
      enrollmentId: string,
      progressPct: number,
      lessonProgressJson?: Record<string, any>
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const updateData: Record<string, unknown> = {
          progress_pct: progressPct,
        };
        if (progressPct >= 100) {
          updateData.completed_at = new Date().toISOString();
        }
        if (lessonProgressJson !== undefined) {
          updateData.lesson_progress_json = lessonProgressJson;
        }

        if (enrollmentId.startsWith("mock-")) {
          console.log("[useLearningHub] Intercepting mock program update for:", enrollmentId);
          await new Promise(r => setTimeout(r, 400)); // Simulating network delay (shorter for progress saves)
          
          let finalUpdateData = { ...updateData };
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem("mock_enrollments");
              if (stored) {
                const parsed = JSON.parse(stored);
                const updated = parsed.map((e: any) => {
                  if (e.id === enrollmentId) {
                    return { 
                      ...e, 
                      progress_pct: progressPct, 
                      completed_at: updateData.completed_at as string || e.completed_at,
                      ...(lessonProgressJson ? { lesson_progress_json: lessonProgressJson } : {})
                    };
                  }
                  return e;
                });
                localStorage.setItem("mock_enrollments", JSON.stringify(updated));
              }
            }
          } catch(e) {}

          setEnrollments(prev => prev.map(e => {
            if (e.id === enrollmentId) {
              return { 
                ...e, 
                progress_pct: progressPct, 
                completed_at: updateData.completed_at as string || e.completed_at,
                ...(lessonProgressJson ? { lesson_progress_json: lessonProgressJson } : {})
              };
            }
            return e;
          }));
          return { success: true };
        }

        const { error } = await supabase
          .from("learning_enrollments")
          .update(updateData)
          .eq("id", enrollmentId);

        if (error) throw error;
        // Optimization: Do NOT trigger a full fetchData() refetch for every single progress update! 
        // We will optimistically update the local state to avoid UI flashing and excessive DB calls.
        setEnrollments(prev => prev.map(e => {
            if (e.id === enrollmentId) {
              return { 
                ...e, 
                progress_pct: progressPct, 
                completed_at: updateData.completed_at as string || e.completed_at,
                ...(lessonProgressJson ? { lesson_progress_json: lessonProgressJson } : {})
              };
            }
            return e;
        }));
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update progress",
        };
      }
    },
    [fetchData]
  );

  return { programs, enrollments, loading, enroll, updateProgress, refetch: fetchData };
}
