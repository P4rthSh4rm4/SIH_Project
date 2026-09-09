"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  FolderGit2, Plus, Image as ImageIcon, Link as LinkIcon, 
  Trash2, Loader2, Code, Trophy, Briefcase, ExternalLink,
  BookOpen, Award, Share2, Printer, Map, ShieldCheck, Zap,
  Mail, Globe, FileText, Star, User, Mic, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useDigitalPortfolio } from "@/lib/hooks/useDigitalPortfolio";
import { useMockInterview } from "@/lib/hooks/useMockInterview";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";
import Image from "next/image";

export default function PortfolioPage() {
  const portfolio = useDigitalPortfolio();
  const { interviews } = useMockInterview();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<"project" | "achievement" | "internship">("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await portfolio.addItem({ type, title, description, url }, imageFile);
      if (success) {
        toast.success("Portfolio item added!");
        setIsAdding(false);
        setTitle("");
        setDescription("");
        setUrl("");
        setImageFile(null);
        await awardXp("portfolio_item_added");
      } else {
        toast.error(error || "Failed to add item");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    try {
      const { success, error } = await portfolio.deleteItem(id);
      if (success) {
        toast.success("Item deleted");
      } else {
        toast.error(error || "Failed to delete item");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
      case "project": return Code;
      case "achievement": return Trophy;
      case "internship": return Briefcase;
      default: return FolderGit2;
    }
  };

  const getTimelineIcon = (iconStr: string) => {
    switch (iconStr) {
      case "BookOpen": return BookOpen;
      case "Code": return Code;
      case "Award": return Award;
      case "Briefcase": return Briefcase;
      case "Trophy": return Trophy;
      case "ShieldCheck": return ShieldCheck;
      default: return Zap;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    let slug = portfolio.portfolioSlug;
    if (!slug) {
      const generated = await portfolio.generateSlug();
      if (!generated) {
        toast.error("Failed to generate portfolio link.");
        return;
      }
      slug = generated;
    }
    const url = window.location.origin + `/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(`Public portfolio link copied: ${url}`);
  };

  if (portfolio.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { github, linkedin, portfolio_website, resume_url, email } = portfolio.profile || {};

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto portfolio-container pt-4 sm:pt-8">
      
      {/* 1. Premium Hero Header */}
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] p-8 sm:p-12 overflow-hidden print:shadow-none print:border-none print:p-0 print:bg-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none print:hidden"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none print:hidden"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 sm:gap-12">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
            {/* Readiness Ring + Avatar */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-muted/50" />
                <circle 
                  cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="4" 
                  strokeDasharray={`${portfolio.recruiterScore * 2.89} 289`} 
                  strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-background shadow-xl z-10 relative bg-secondary">
                {portfolio.profile?.avatar_url ? (
                  <Image src={portfolio.profile.avatar_url} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground bg-secondary">
                    {portfolio.profile?.name?.[0]?.toUpperCase() || "S"}
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-3 z-20 bg-primary text-primary-foreground shadow-lg px-3 py-1 font-semibold border-2 border-background">
                {portfolio.recruiterScore}% Ready
              </Badge>
            </div>

            {/* Identity & Links */}
            <div className="text-center sm:text-left flex-1 mt-2 sm:mt-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">{portfolio.profile?.name || "Student"}</h1>
              <p className="text-xl text-primary/80 font-medium mt-2 capitalize tracking-wide">{portfolio.profile?.role || "Student"} | UI/UX & Full-Stack Developer</p>
              <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
                {portfolio.profile?.career_objective || "Passionate about building scalable applications and intuitive user experiences. Continuously learning and solving real-world problems."}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6 print:mt-4">
                {email && (
                  <a href={`mailto:${email}`} className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-primary/10 rounded-full transition-all" title="Email">
                    <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-[#0A66C2]/10 rounded-full transition-all" title="LinkedIn">
                    <FaLinkedin className="w-4 h-4 text-muted-foreground group-hover:text-[#0A66C2]" />
                  </a>
                )}
                {github && (
                  <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-foreground/10 rounded-full transition-all" title="GitHub">
                    <FaGithub className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </a>
                )}
                {portfolio_website && (
                  <a href={portfolio_website.startsWith('http') ? portfolio_website : `https://${portfolio_website}`} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-emerald-500/10 rounded-full transition-all" title="Website">
                    <Globe className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500" />
                  </a>
                )}
                {resume_url && (
                  <a href={resume_url} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 bg-secondary/60 hover:bg-orange-500/10 rounded-full transition-all" title="Resume">
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-orange-500" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0 print:hidden w-full md:w-auto">
            <Button className="w-full md:w-40 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share Profile
            </Button>
            <Button variant="outline" className="w-full md:w-40 rounded-full hover:bg-secondary/50" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button variant="secondary" className="w-full md:w-40 rounded-full" onClick={() => setIsAdding(!isAdding)}>
              <Plus className="w-4 h-4 mr-2" /> {isAdding ? "Cancel" : "Add Project"}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Professional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {[
          { label: "Completed Courses", value: portfolio.stats.courses, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Verified Skills", value: portfolio.stats.skills, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Certifications", value: portfolio.stats.certificates, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Projects Built", value: portfolio.stats.projects, icon: Code, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="group border-border/50 bg-card/40 hover:bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements & Milestones (Full Width) */}
      {(portfolio.achievements.length > 0 || portfolio.milestones.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Achievements & Milestones
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Progress Milestones (Combined) */}
            {portfolio.milestones.map((m) => {
              const Icon = getTimelineIcon(m.icon) || Trophy;
              const isComplete = m.isUnlocked;
              return (
                <div key={m.id} className={`group relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${isComplete ? 'bg-card border-primary/20 shadow-lg shadow-primary/5 hover:-translate-y-1 hover:shadow-primary/10' : 'bg-muted/30 border-transparent opacity-70 grayscale-[50%]'}`}>
                  {isComplete && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />}
                  
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative z-10 ${isComplete ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                    <Icon className="w-6 h-6" />
                    {isComplete && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />}
                  </div>
                  
                  <h3 className={`font-bold text-sm leading-tight mb-1 relative z-10 ${!isComplete && 'text-muted-foreground'}`}>{m.title}</h3>
                  
                  {isComplete ? (
                    <Badge variant="outline" className="mt-auto text-[10px] uppercase bg-background border-primary/20 text-primary">Unlocked</Badge>
                  ) : (
                    <div className="w-full mt-auto pt-2">
                      <Progress value={(m.current / m.target) * 100} className="h-1" />
                      <span className="text-[10px] text-muted-foreground mt-1 block">{m.current}/{m.target}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Summary & Skills */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Executive Summary */}
          <Card className="border-border/50 bg-card/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/10 bg-card/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Executive Overview</h4>
                <p className="text-base leading-relaxed text-foreground/90">
                  {portfolio.resumeSummary}
                </p>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group hover:bg-primary/10 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <Zap className="w-24 h-24" />
                </div>
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" /> AI Career Insight
                </h4>
                <p className="text-sm text-foreground/80 relative z-10 italic">
                  "{portfolio.aiInsights}"
                </p>
              </div>

              {interviews.filter(i => i.status === 'Completed').length > 0 && (
                <div className="p-5 bg-card border rounded-xl shadow-sm relative overflow-hidden group transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Mic className="w-4 h-4 text-emerald-500" /> AI Mock Interviews
                    </h4>
                    <Link href="/student/mock-interview">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary">View Reports <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Completed</p>
                      <p className="text-2xl font-black">{interviews.filter(i => i.status === 'Completed').length}</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Top Score</p>
                      <p className="text-2xl font-black text-emerald-500">
                        {Math.max(...interviews.filter(i => i.status === 'Completed').map(i => i.overall_score || 0))}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Average</p>
                      <p className="text-2xl font-black text-primary">
                        {Math.round(interviews.filter(i => i.status === 'Completed').reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / interviews.filter(i => i.status === 'Completed').length)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorized Skills */}
          <Card className="border-border/50 bg-card/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/10 bg-card/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Core Competencies
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
            {portfolio.skills.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No skills mapped yet. Complete courses or add skills to your profile.</p>
            ) : (
              <div className="space-y-6">
                {/* Verified Skills */}
                {portfolio.skills.some(s => s.verified || s.proficiency_score >= 100) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Platform Verified
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.skills.filter(s => s.verified || s.proficiency_score >= 100).map(s => (
                        <Badge key={`v-${s.skill_id}`} className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1.5 shadow-sm">
                          {s.skill?.name || "Skill"} <ShieldCheck className="w-3 h-3 ml-1.5 inline" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Technical / Other Skills */}
                {portfolio.skills.some(s => !s.verified && (s.proficiency_score || 0) < 100) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessed Skills</h4>
                    <div className="space-y-3">
                      {portfolio.skills.filter(s => !s.verified && (s.proficiency_score || 0) < 100).map(s => (
                        <div key={`u-${s.skill_id}`} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span>{s.skill?.name || "Skill"}</span>
                            <span className="text-muted-foreground text-xs">{s.proficiency_score || 20}%</span>
                          </div>
                          <Progress value={s.proficiency_score || 20} className="h-1.5 bg-secondary" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Projects & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Project Form */}
          {isAdding && (
            <Card className="border-primary/50 shadow-sm animate-in fade-in slide-in-from-top-4 print:hidden">
              <CardHeader>
                <CardTitle className="text-lg">Add New Portfolio Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Type</Label>
                      <div className="flex gap-2">
                        {(["project", "achievement", "internship"] as const).map((t) => (
                          <Badge 
                            key={t}
                            variant={type === t ? "default" : "outline"}
                            className="cursor-pointer capitalize py-1.5 px-3"
                            onClick={() => setType(t)}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder={`E.g., ${type === 'project' ? 'E-commerce Platform' : type === 'achievement' ? 'Hackathon Winner' : 'Software Engineering Intern'}`}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Describe your work, technologies used, and impact..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url">Link (URL)</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="url" 
                          type="url" 
                          value={url} 
                          onChange={(e) => setUrl(e.target.value)} 
                          placeholder="https://github.com/..."
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Cover Image (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          {imageFile ? imageFile.name : "Upload Image"}
                        </Button>
                        <input 
                          id="image-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        {/* Premium Projects Showcase */}
        {(portfolio.portfolioItems.length > 0 || isAdding) && (
          <Card className="border-border/50 bg-card/40 shadow-sm rounded-2xl overflow-hidden mt-8">
            <CardHeader className="pb-4 border-b border-border/10 bg-card/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" /> Projects Showcase
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.portfolioItems.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <Card key={item.id} className="overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card border-border/50 flex flex-col">
                      <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
                        {item.image_url ? (
                          <Image 
                            src={item.image_url} 
                            alt={item.title} 
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/50 group-hover:bg-secondary transition-colors">
                            <Icon className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/30 transition-colors duration-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background border-none capitalize shadow-sm">
                            <Icon className="w-3 h-3 mr-1.5" /> {item.type}
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm print:hidden"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <CardContent className="p-5 flex-grow flex flex-col">
                        <h3 className="font-bold text-xl line-clamp-1 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</span>
                          {item.url && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              View Details <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Premium Learning Roadmap */}
          <Card className="border-border/50 bg-card/40 shadow-sm rounded-2xl overflow-hidden mt-8">
            <CardHeader className="pb-4 border-b border-border/10 bg-card/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" /> Career Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
            {portfolio.timeline.length === 0 ? (
              <Card className="border-dashed bg-secondary/20">
                <CardContent className="p-12 text-center flex flex-col items-center">
                  <Map className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Your learning journey is just beginning.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Complete courses and projects to build your roadmap.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative border-l-2 border-border/60 ml-4 md:ml-6 space-y-8 pb-4">
                {portfolio.timeline.map((event, i) => {
                  const Icon = getTimelineIcon(event.icon);
                  const isCert = event.type === 'certificate';
                  const isProject = event.type === 'project';
                  
                  return (
                    <div key={event.id} className="relative pl-8 md:pl-10 group">
                      {/* Node */}
                      <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-background shadow-sm transition-all duration-300 group-hover:scale-110 ${isCert ? 'bg-amber-500 text-white' : isProject ? 'bg-indigo-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      
                      {/* Content Card */}
                      <div className={`p-5 rounded-2xl border transition-all duration-300 ${isCert ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30' : isProject ? 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10' : 'bg-card border-border/50 hover:border-primary/30 hover:shadow-md'}`}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-lg leading-tight">{event.title}</h4>
                          <Badge variant="outline" className="w-fit text-[10px] uppercase font-semibold bg-background shrink-0">
                            {event.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </CardContent>
          </Card>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .portfolio-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .print\\:mb-8 { margin-bottom: 2rem !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .card, [class*="bg-card"], [class*="bg-primary/5"] { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}} />
    </div>
  );
}
