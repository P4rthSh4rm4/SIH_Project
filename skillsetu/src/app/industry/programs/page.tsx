"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Users, Clock, PlayCircle, BarChart3, Settings2, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ProgramsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Bootcamp",
    description: "",
    duration: "",
    capacity: "",
    status: "draft",
    provider: "",
    url: "",
    skills_covered: [] as string[]
  });

  const fetchPrograms = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      
      const [programsRes, enrollmentsRes, skillsRes] = await Promise.all([
        supabase.from("learning_programs").select("*").eq("industry_id", user.id).order("id", { ascending: false }),
        supabase.from("learning_enrollments").select("program_id, progress_pct"),
        supabase.from("skills").select("id, name").order("name")
      ]);

      if (programsRes.error) throw programsRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (skillsRes.error) throw skillsRes.error;

      setPrograms(programsRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills_covered: prev.skills_covered.includes(skillId) 
        ? prev.skills_covered.filter(id => id !== skillId)
        : [...prev.skills_covered, skillId]
    }));
  };

  const handleEditClick = (prog: any) => {
    setEditingId(prog.id);
    setFormData({
      title: prog.title || "",
      type: prog.type || "Bootcamp",
      description: prog.description || "",
      duration: prog.duration || "",
      capacity: prog.capacity?.toString() || "",
      status: prog.status || "draft",
      provider: prog.provider || "",
      url: prog.url || "",
      skills_covered: prog.skills_covered || []
    });
    setIsCreateOpen(true);
  };

  const handleCreateNewClick = () => {
    setEditingId(null);
    setFormData({
      title: "", type: "Bootcamp", description: "", duration: "", capacity: "", status: "draft", provider: "", url: "", skills_covered: []
    });
    setIsCreateOpen(true);
  };

  const handleSaveProgram = async () => {
    if (!formData.title) return toast.error("Title is required");
    
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const payload: any = {
        industry_id: userId as string,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        duration: formData.duration,
        capacity: parseInt(formData.capacity) || 0,
        status: formData.status,
        provider: formData.provider,
        url: formData.url,
        skills_covered: formData.skills_covered
      };

      if (editingId) {
        const { error } = await supabase.from("learning_programs").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Program updated successfully");
      } else {
        const { error } = await supabase.from("learning_programs").insert(payload);
        if (error) throw error;
        toast.success("Program created successfully");
      }

      setIsCreateOpen(false);
      setEditingId(null);
      setFormData({
        title: "", type: "Bootcamp", description: "", duration: "", capacity: "", status: "draft", provider: "", url: "", skills_covered: []
      });
      fetchPrograms();
    } catch (err: any) {
      toast.error(err.message || "Failed to save program");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in pb-10">
        <h1 className="text-3xl font-bold tracking-tight">Loading Programs...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            Training Programs
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Manage your company's training bootcamps, workshops, and certifications offered to students.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingId(null);
        }}>
          <DialogTrigger>
            <div className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer" onClick={handleCreateNewClick}>
              <Plus className="w-4 h-4 mr-2" /> Create Program
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Program" : "Create New Program"}</DialogTitle>
              <DialogDescription>{editingId ? "Update your training program details." : "Define a new training program, workshop, or certification for students."}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Program Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AWS Cloud Fundamentals" />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v: string | null) => setFormData({...formData, type: v || "Bootcamp"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Certification">Certification</SelectItem>
                    <SelectItem value="FDP">Faculty Development Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: string | null) => setFormData({...formData, status: v || "draft"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="published">Published (Visible to Students)</SelectItem>
                    <SelectItem value="closed">Closed (No new enrollments)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 6 Weeks" />
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="e.g. 100" />
              </div>

              <div className="space-y-2">
                <Label>Provider (Optional)</Label>
                <Input value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} placeholder="e.g. Coursera / Internal" />
              </div>

              <div className="space-y-2">
                <Label>Program URL (Optional)</Label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe what students will learn..." className="h-20" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Skills Covered</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge 
                      key={skill.id} 
                      variant="outline" 
                      className={`cursor-pointer ${formData.skills_covered.includes(skill.id) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white'}`}
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProgram} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {editingId ? "Save Changes" : "Save Program"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {programs.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No programs created yet</p>
            <p className="text-sm">Create your first training program to share with students.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {programs.map((prog) => {
            const progEnrollments = enrollments.filter(e => e.program_id === prog.id);
            const enrolledCount = progEnrollments.length;
            const completedCount = progEnrollments.filter(e => e.progress_pct === 100).length;
            const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;
            const isFull = prog.capacity > 0 && enrolledCount >= prog.capacity;
            const displayStatus = isFull ? 'full' : prog.status;

            return (
              <Card key={prog.id} className="border-border/50 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border/50 p-6 flex flex-col justify-center items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${prog.status === 'published' ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <Badge variant={prog.status === 'published' ? 'default' : 'secondary'} className={prog.status === 'published' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                      {displayStatus.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{prog.title}</CardTitle>
                          {prog.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prog.description}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => handleEditClick(prog)}>
                          <Settings2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] uppercase">{prog.type || "Program"}</Badge></span>
                        {prog.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {prog.duration}</span>}
                        {prog.skills_covered && prog.skills_covered.length > 0 && (
                          <span className="text-xs text-muted-foreground">{prog.skills_covered.length} Skills covered</span>
                        )}
                      </CardDescription>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                          <Users className="w-4 h-4 mr-2 text-blue-500" /> Enrollment
                        </div>
                        <div className="text-2xl font-bold">
                          {enrolledCount} <span className="text-sm font-normal text-muted-foreground">/ {prog.capacity || "∞"}</span>
                        </div>
                        {prog.capacity > 0 && (
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((enrolledCount / prog.capacity) * 100, 100)}%` }} />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                          <PlayCircle className="w-4 h-4 mr-2 text-emerald-500" /> Completion Rate
                        </div>
                        <div className="text-2xl font-bold">{completionRate}%</div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                        </div>
                      </div>
                      
                      <div className="space-y-2 col-span-2 md:col-span-2 flex items-end justify-end">
                        <Button variant="outline" className="w-full md:w-auto">
                          <BarChart3 className="w-4 h-4 mr-2" /> View Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
