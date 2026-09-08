"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award, ShieldCheck, Share2, Download, CheckCircle2,
  Medal, Star, ExternalLink, BookOpen, FileText, Expand,
  ArrowRight, Trophy
} from "lucide-react";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";
import { useProfileData } from "@/lib/hooks/useProfileData";
import { useCareerAssessment, type CareerCertificate } from "@/lib/hooks/useCareerAssessment";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CertificateView } from "@/components/dashboard/certificate-view";
import Link from "next/link";
import { toast } from "sonner";

export default function CertificationsPage() {
  const { skills, loading: skillsLoading } = useSkillAnalytics();
  const { profile, loading: profileLoading } = useProfileData();
  const { getCertificates } = useCareerAssessment();
  const [careerCerts, setCareerCerts] = useState<CareerCertificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  useEffect(() => {
    getCertificates().then((certs) => {
      setCareerCerts(certs);
      setCertsLoading(false);
    });
  }, [getCertificates]);

  const loading = skillsLoading || profileLoading || certsLoading;

  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleDownload = async (certificateId: string, refKey: string) => {
    const element = certificateRefs.current[refKey];
    if (!element) {
      toast.error("Certificate element not found. Please try refreshing.");
      return;
    }
    
    const toastId = toast.loading("Generating high-resolution PDF...");
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
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
      pdf.save(`SkillSetu_Certificate_${certificateId}.pdf`);
      
      toast.success("Certificate downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("[handleDownload] PDF Generation Error:", err);
      toast.error(`Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`, { id: toastId });
    }
  };

  const verifiedSkills = skills.filter((s) => s.verified);
  const unverifiedSkills = skills.filter((s) => !s.verified);

  const handleShare = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Share text copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground mt-1">Loading your verified credentials...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── CAREER PATH CERTIFICATES ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Career Path Certificates</h2>
          <p className="text-muted-foreground mt-1">
            Certificates earned by completing all modules and passing the final assessment.
          </p>
        </div>
      </div>

      {careerCerts.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No career path certificates yet</p>
            <p className="text-sm mb-4">Complete all modules in a career path and pass the final assessment to earn your first certificate.</p>
            <Button asChild>
              <Link href="/student/career-guidance">Explore Career Paths</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerCerts.map((cert) => {
            const careerPath = CAREER_PATHS.find((p) => p.id === cert.career_path_id);
            const pathTitle = careerPath?.title || cert.career_path_id;
            const PathIcon = careerPath?.icon || Award;

            return (
              <Card key={cert.id} className="border-border/50 overflow-hidden relative hover:shadow-lg transition-all group flex flex-col">
                {/* Scaled preview for the card */}
                <div className="bg-slate-200/50 flex items-center justify-center overflow-hidden h-[240px] relative border-b border-border/50 p-4">
                   <div className="transform scale-[0.35] origin-center group-hover:scale-[0.37] transition-transform duration-500 shadow-xl">
                      <CertificateView
                        studentName={profile?.name || "Student"}
                        courseTitle={pathTitle}
                        provider="SkillSetu Career Path"
                        completionDate={cert.issued_at}
                        certificateId={cert.certificate_id}
                        score={cert.score}
                      />
                   </div>
                </div>

                <CardContent className="p-4 text-center pt-5">
                  <Badge className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Certified
                  </Badge>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1" title={pathTitle}>{pathTitle}</h3>
                  <p className="text-xs text-muted-foreground">Score: {cert.score}% • ID: {cert.certificate_id}</p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" size="sm" className="w-full text-xs" />}>
                      <Expand className="w-3.5 h-3.5 mr-1.5" /> View
                    </DialogTrigger>
                    <DialogContent className="max-w-[850px] w-[95vw] p-2 sm:p-6 bg-slate-50 border-none flex items-center justify-center">
                      <div className="w-full flex items-center justify-center">
                        <svg viewBox="0 0 800 565" className="w-full h-auto drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                          <foreignObject width="800" height="565">
                            <CertificateView
                              studentName={profile?.name || "Student"}
                              courseTitle={pathTitle}
                              provider="SkillSetu Career Path"
                              completionDate={cert.issued_at}
                              certificateId={cert.certificate_id}
                              score={cert.score}
                            />
                          </foreignObject>
                        </svg>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs" 
                    onClick={() => handleDownload(cert.certificate_id, cert.id)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── VERIFIED SKILLS & BADGES ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-border/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verified Skills & Badges</h2>
          <p className="text-muted-foreground mt-1">
            Your verified skills and micro-credentials earned through assessments.
          </p>
        </div>
      </div>

      {verifiedSkills.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No verified skills yet</p>
            <p className="text-sm mb-4">Take skill assessments to earn verified badges.</p>
            <Button asChild>
              <Link href="/student/assessment">Go to Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedSkills.map((skill) => (
            <Card key={skill.id} className="border-border/50 overflow-hidden relative hover:shadow-lg transition-all group">
              {/* Certificate Header Banner */}
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-400 p-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
                
                <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center shadow-lg relative z-10">
                  <ShieldCheck className="w-7 h-7 text-emerald-500" />
                </div>
              </div>

              <CardContent className="p-5 text-center pt-6">
                <Badge className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Credential
                </Badge>
                <h3 className="font-bold text-xl mb-1">{skill.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mb-4">{skill.category} • Proficiency: {skill.score}%</p>
                
                <div className="flex justify-center mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(skill.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-muted/30'}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 border-t border-border/10 mt-auto bg-muted/10 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleShare(`I just earned a verified skill badge in ${skill.name} on SkillSetu!`)}>
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {unverifiedSkills.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Medal className="w-5 h-5 text-muted-foreground" /> In Progress / Unverified Skills
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {unverifiedSkills.map((skill) => (
              <Card key={skill.id} className="border-border/50 bg-secondary/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{skill.name}</h4>
                    <p className="text-xs text-muted-foreground">{skill.score}% Score</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-primary">
                    <Link href="/student/assessment">
                      Verify <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
        {careerCerts.map((cert) => {
          const careerPath = CAREER_PATHS.find((p) => p.id === cert.career_path_id);
          const pathTitle = careerPath?.title || cert.career_path_id;
          return (
            <div key={`hidden-${cert.id}`} className="absolute top-0 left-0 opacity-[0.01] pdf-capture-container">
              <CertificateView
                ref={(el) => {
                  if (el) certificateRefs.current[cert.id] = el;
                }}
                studentName={profile?.name || "Student"}
                courseTitle={pathTitle}
                provider="SkillSetu Career Path"
                completionDate={cert.issued_at}
                certificateId={cert.certificate_id}
                score={cert.score}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
