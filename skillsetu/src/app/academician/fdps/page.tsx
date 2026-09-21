"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, ExternalLink, Calendar, MapPin,
  Clock, Presentation, Sparkles, CheckCircle2, Download, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { FDPCertificateView } from "@/components/dashboard/fdp-certificate-view";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { createClient } from "@/lib/supabase/client";

// We'll define the types here to match the DB
type FDP = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  duration: string | null;
  mode: string | null;
  location: string | null;
  instructor: string | null;
  capacity: number | null;
  status: string;
  created_by: string | null;
};

type FDPCount = {
  opportunity_id: string;
  enrolled_count: number;
};

export default function FDPsPage() {
  const { profile } = useUserProfile();
  const [fdps, setFdps] = useState<FDP[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [enrolledIds, setEnrolledIds] = useState<Record<string, string>>({}); // FDP ID -> status
  const [loading, setLoading] = useState(true);
  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const supabase = createClient();

  useEffect(() => {
    fetchFDPs();
  }, [profile?.id, profile?.department]);

  const fetchFDPs = async () => {
    try {
      setLoading(true);
      // 1. Fetch FDPs
      let query = supabase
        .from("academician_opportunities")
        .select(`
          *,
          creator:users!academician_opportunities_created_by_fkey!inner(department)
        `)
        .eq("type", "FDP")
        .order("start_date", { ascending: true });

      if (profile?.department && profile.department !== 'global') {
        query = query.eq("creator.department", profile.department);
      } else if (!profile?.department) {
        setFdps([]);
        setLoading(false);
        return;
      }

      const { data: fdpData, error: fdpError } = await query;

      if (fdpError) throw fdpError;

      // 2. Fetch capacities via RPC safely
      const { data: countData, error: countError } = await supabase
        .rpc("get_fdp_enrollment_counts");

      if (countError) throw countError;

      const countsMap: Record<string, number> = {};
      if (countData) {
        countData.forEach((row: FDPCount) => {
          countsMap[row.opportunity_id] = row.enrolled_count;
        });
      }

      // 3. Fetch user's enrollments
      let userEnrollments: Record<string, string> = {};
      if (profile?.id) {
        const { data: enrollData, error: enrollError } = await supabase
          .from("academician_opportunity_enrollments")
          .select("opportunity_id, status")
          .eq("user_id", profile.id);

        if (enrollError) throw enrollError;
        
        if (enrollData) {
          enrollData.forEach(row => {
            userEnrollments[row.opportunity_id] = row.status;
          });
        }
      }

      setFdps(fdpData || []);
      setCounts(countsMap);
      setEnrolledIds(userEnrollments);
    } catch (err) {
      console.error("Error fetching FDPs:", err);
      toast.error("Failed to load Faculty Development Programs");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (id: string) => {
    if (!profile?.id) {
      toast.error("You must be logged in to enroll");
      return;
    }

    const toastId = toast.loading("Enrolling...");
    try {
      const { error } = await supabase
        .from("academician_opportunity_enrollments")
        .insert({
          opportunity_id: id,
          user_id: profile.id,
          status: "enrolled"
        });

      if (error) throw error;

      toast.success("Successfully enrolled in the FDP!", { id: toastId });
      fetchFDPs(); // Refresh to update capacity and status
    } catch (err: any) {
      console.error("Enrollment error:", err);
      toast.error(err.message || "Failed to enroll. The FDP might be full or closed.", { id: toastId });
    }
  };


  const handleDownload = async (workshopId: string, workshopTitle: string) => {
    const element = certificateRefs.current[workshopId];
    if (!element) {
      toast.error("Certificate element not found. Please try refreshing.");
      return;
    }
    
    const toastId = toast.loading("Generating high-resolution certificate...");
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#fdfbf7",
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(style => style.remove());
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`SkillSetu_Certificate_${workshopId.substring(0, 8)}.pdf`);
      
      toast.success("Certificate downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error("Failed to generate PDF.", { id: toastId });
    }
  };

  const formatDate = (start?: string | null, end?: string | null) => {
    if (!start) return "TBA";
    if (!end) return new Date(start).toLocaleDateString();
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-emerald-500" />
            Faculty Development Programs
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Enhance your teaching methodologies, research capabilities, and technical skills through ATAL FDPs and internal college workshops.
          </p>
        </div>

      </div>

      {/* ATAL FDP Featured Section */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-background overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-500" />
        </div>
        <CardContent className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 max-w-2xl">
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 mb-2 font-bold uppercase tracking-widest">
              Government Initiative
            </Badge>
            <h2 className="text-3xl font-extrabold text-foreground font-heading">
              AICTE ATAL Academy
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The AICTE Training and Learning (ATAL) Academy offers continuous learning opportunities for faculty members of AICTE approved institutions. 
              Gain certifications in emerging areas like AI, IoT, Robotics, and Blockchain.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600/80">
                <CheckCircleIcon className="w-4 h-4" /> 500+ Programs
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600/80">
                <CheckCircleIcon className="w-4 h-4" /> Free Enrollment
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600/80">
                <CheckCircleIcon className="w-4 h-4" /> Official Certification
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" asChild>
              <a href="https://atalacademy.aicte-india.org/" target="_blank" rel="noopener noreferrer">
                Explore ATAL FDPs <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* College Workshops */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Internal College Workshops</h2>
          <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={fetchFDPs}>
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : fdps.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No Workshops Found</h3>
            <p className="text-muted-foreground">There are currently no internal FDPs posted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fdps.map((workshop) => {
              const enrolledCount = counts[workshop.id] || 0;
              const userEnrollStatus = enrolledIds[workshop.id];
              const isEnrolled = !!userEnrollStatus;
              const isCompleted = userEnrollStatus === 'completed';
              const isFull = workshop.capacity ? enrolledCount >= workshop.capacity : false;
              const isClosed = workshop.status === 'cancelled' || workshop.status === 'completed';

              return (
                <Card key={workshop.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {workshop.status !== 'upcoming' && (
                          <Badge variant="secondary" className="capitalize bg-muted">
                            {workshop.status}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        workshop.mode === "Offline" ? "border-amber-200 text-amber-700 bg-amber-50" : 
                        workshop.mode === "Online" ? "border-blue-200 text-blue-700 bg-blue-50" : 
                        "border-purple-200 text-purple-700 bg-purple-50"
                      }>
                        {workshop.mode || "Unspecified"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl leading-snug group-hover:text-emerald-600 transition-colors">
                      {workshop.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{formatDate(workshop.start_date, workshop.end_date)}</span>
                      </div>
                      {workshop.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{workshop.duration}</span>
                        </div>
                      )}
                      {workshop.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{workshop.location}</span>
                        </div>
                      )}
                      {workshop.instructor && (
                        <div className="flex items-center gap-2">
                          <Presentation className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{workshop.instructor}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    {workshop.capacity && (
                      <div className="space-y-1.5 mb-6">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Capacity</span>
                          <span>{enrolledCount} / {workshop.capacity}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min((enrolledCount / workshop.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isEnrolled ? (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-emerald-500/30 text-emerald-600 bg-emerald-50 cursor-default hover:bg-emerald-50">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Enrolled
                        </Button>
                        <Button 
                          variant="default" 
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                          onClick={() => handleDownload(workshop.id, workshop.title)}
                          disabled={!isCompleted}
                          title={!isCompleted ? "FDP must be completed to download certificate" : "Download Certificate"}
                        >
                          <Download className="w-4 h-4 mr-2" /> Cert
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-secondary text-foreground hover:bg-emerald-600 hover:text-white transition-colors border border-border/50 disabled:opacity-50"
                        onClick={() => handleEnroll(workshop.id)}
                        disabled={isClosed || isFull}
                      >
                        {isClosed ? "Closed" : isFull ? "Full" : "Enroll Now"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden certificates for PDF rendering */}
      <div className="absolute top-0 left-0 -z-50 pointer-events-none" aria-hidden="true">
        <style dangerouslySetInnerHTML={{ __html: `
          .pdf-capture-container * {
            border-color: transparent;
            outline-color: transparent;
            text-decoration-color: transparent;
            --tw-shadow-color: transparent;
            --tw-ring-color: transparent;
          }
        `}} />
        {fdps.filter(w => enrolledIds[w.id] === 'completed').map((workshop) => (
          <div key={`hidden-${workshop.id}`} className="absolute top-0 left-0 opacity-[0.01] pdf-capture-container">
            <FDPCertificateView
              ref={(el) => {
                if (el) certificateRefs.current[workshop.id] = el;
              }}
              facultyName={profile?.name || "Dr. Teacher"}
              workshopTitle={workshop.title}
              collegeName="SkillSetu University"
              completionDate={new Date()}
              certificateId={`FDP-${new Date().getFullYear()}-${workshop.id.substring(0, 8)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
