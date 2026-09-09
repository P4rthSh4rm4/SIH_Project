"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Download, Wand2, RefreshCw, FileText } from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ResumeData {
  professionalSummary: string;
  education: Array<{ institution: string; degree: string; year: string }>;
  skills: Array<{ category: string; items: string }>;
  projects: Array<{ name: string; year: string; role: string; description: string[] }>;
  certifications: string[];
  awards: string[];
}

export default function ResumeBuilderPage() {
  const { profile } = useUserProfile();
  
  // Basic Info State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  
  // AI Prompt State
  const [promptData, setPromptData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Resume Content State
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  const resumeRef = useRef<HTMLDivElement>(null);

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      if (!fullName && profile.name) setFullName(profile.name);
      if (!email && profile.email) setEmail(profile.email);
    }
  }, [profile, fullName, email]);

  const handleGenerate = async () => {
    if (!promptData.trim()) {
      toast.error("Please enter some background information for the AI to work with.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptData, fullName }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate resume");
      }

      const data = await res.json();
      setResumeData(data);
      toast.success("Resume generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error generating resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    
    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF.");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[calc(100vh-100px)]">
      {/* Left Pane - Editor */}
      <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto pb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Resume Builder</h1>
            <p className="text-sm text-muted-foreground">Turn raw notes into a professional ATS-friendly resume.</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">1. Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/johndoe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="github.com/johndoe" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">2. Background & Experience</CardTitle>
            <CardDescription>
              Write roughly about your education, projects, skills, and certifications. The AI will format them perfectly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={promptData}
              onChange={(e) => setPromptData(e.target.value)}
              placeholder="e.g. I am a 3rd year CS student at XYZ College. I know Python, React, and AWS. I built an AgriBot app that uses ML to detect crop health. I won 1st place in a local hackathon..."
              className="h-40 resize-none"
            />
            
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-11 text-base font-semibold">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing & Generating...</>
              ) : (
                <><Wand2 className="mr-2 h-5 w-5" /> Generate Professional Resume</>
              )}
            </Button>
          </CardContent>
        </Card>

        {resumeData && (
          <Button onClick={handleDownloadPDF} variant="outline" className="w-full h-11 border-primary/20 text-primary hover:bg-primary/5">
            <Download className="mr-2 h-5 w-5" /> Download as PDF
          </Button>
        )}
      </div>

      {/* Right Pane - Preview Area */}
      <div className="flex-1 bg-secondary/30 rounded-2xl border border-border p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
        <div 
          className="bg-white shadow-xl max-w-[800px] w-full aspect-[1/1.414] origin-top shrink-0 relative"
          style={{ width: "800px", minHeight: "1131px" }}
        >
          {/* Resume Preview Content Container */}
          <div ref={resumeRef} className="absolute inset-0 bg-white text-black p-12 overflow-hidden flex flex-col font-sans" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            
            {/* HEADER */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-3">{fullName || "YOUR NAME"}</h1>
              <div className="text-sm flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-gray-800">
                {phone && <span>Mobile No. - {phone}</span>}
                {phone && email && <span>|</span>}
                {email && <span>Email - {email}</span>}
              </div>
              <div className="text-sm flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-1 text-gray-800">
                {linkedin && <span>LinkedIN - {linkedin}</span>}
                {linkedin && github && <span>|</span>}
                {github && <span>Github - {github}</span>}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 text-[13px] leading-relaxed">
              
              {/* SUMMARY */}
              {resumeData?.professionalSummary && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Professional Summary</h2>
                  <p className="text-justify">{resumeData.professionalSummary}</p>
                </section>
              )}

              {/* EDUCATION */}
              {resumeData?.education && resumeData.education.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Education</h2>
                  <div className="space-y-3">
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-start font-bold">
                          <span>{edu.degree}</span>
                          <span>{edu.year}</span>
                        </div>
                        <div className="text-gray-800">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SKILLS */}
              {resumeData?.skills && resumeData.skills.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Skills</h2>
                  <ul className="list-disc list-outside ml-4 space-y-1.5">
                    {resumeData.skills.map((skill, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{skill.category} :</span> {skill.items}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* PROJECTS & EXPERIENCE */}
              {resumeData?.projects && resumeData.projects.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Projects And Experience</h2>
                  <div className="space-y-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-start font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="text-base leading-none">•</span> {proj.name} {proj.role && `(${proj.role})`}
                          </span>
                          <span>{proj.year}</span>
                        </div>
                        <ul className="list-none ml-4 space-y-1 text-gray-800">
                          {proj.description.map((desc, dIdx) => (
                            <li key={dIdx} className="flex gap-2">
                              <span className="text-gray-500">-</span> <span>{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CERTIFICATIONS */}
              {resumeData?.certifications && resumeData.certifications.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Certifications</h2>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {resumeData.certifications.map((cert, idx) => (
                      <li key={idx}>{cert}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* AWARDS */}
              {resumeData?.awards && resumeData.awards.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-black pb-1 mb-2">Awards And Achievement</h2>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {resumeData.awards.map((award, idx) => (
                      <li key={idx}>{award}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* DECLARATION */}
              {(resumeData) && (
                <section className="mt-auto pt-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Declaration</h2>
                  <p>I hereby declare that the information provided above is true to the best of my knowledge and belief.</p>
                </section>
              )}
            </div>

            {/* Empty State placeholder before generation */}
            {!resumeData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 text-muted-foreground">
                <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-black/50">Your resume preview will appear here.</p>
                <p className="text-sm text-black/40 mt-1">Fill in the details and click Generate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
