"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, PlusCircle, Search, Calendar, Briefcase, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademicianResearch, ResearchProject } from "@/lib/hooks/useAcademicianResearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

function EditProjectDialog({ project, onUpdate, isMutating }: { project: ResearchProject, onUpdate: (id: string, fd: FormData) => Promise<boolean>, isMutating: boolean }) {
  const [open, setOpen] = useState(false);
  
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await onUpdate(project.id, new FormData(e.currentTarget));
    if (success) setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50" disabled={isMutating} onClick={() => setOpen(true)}>
        <Edit className="w-3 h-3 mr-1" /> Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Research Project</DialogTitle>
          </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input name="title" defaultValue={project.title} required className="w-full p-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" defaultValue={project.description || ""} rows={3} className="w-full p-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline (Optional)</label>
            <input name="deadline" type="date" defaultValue={project.deadline || ""} className="w-full p-2 border rounded-md" />
          </div>
          <Button type="submit" className="w-full bg-blue-600" disabled={isMutating}>
            {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}

export default function ResearchPage() {
  const { projects, loading, isMutating, profile, createProject, deleteProject, updateProject } = useAcademicianResearch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await createProject(new FormData(e.currentTarget));
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this research project?")) {
      await deleteProject(id);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Rolling / TBA";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-emerald-500" />
            Research & Publications
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track your ongoing research, published papers, and active collaborations.
          </p>
        </div>
        
        {(profile?.role?.toLowerCase() === "academician" || profile?.role?.toLowerCase() === "institution_admin" || profile?.role?.toLowerCase() === "super_admin") && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger 
              render={
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" /> New Project
                </Button>
              } 
            />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Research Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <input name="title" required placeholder="e.g. Advancements in Machine Learning" className="w-full p-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea name="description" rows={3} placeholder="Brief summary of the research..." className="w-full p-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline (Optional)</label>
                    <input name="deadline" type="date" className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Host Industry ID (Optional)</label>
                    <input name="host_industry_id" placeholder="UUID of collaborating industry" className="w-full p-2 border rounded-md" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-600" disabled={isMutating}>
                  {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center h-64">
            <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Research Projects Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Get started by adding your first publication or research project.
            </p>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => setIsDialogOpen(true)}>
              Add Publication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: ResearchProject) => {
            const isCreator = profile?.id === project.created_by;
            
            return (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="capitalize bg-muted">
                      {project.status || "Upcoming"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-snug group-hover:text-emerald-600 transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4 mt-auto border-t border-border/50 pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{formatDate(project.deadline)}</span>
                    </div>
                    {project.host_industry_id && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{project.users?.name || "Industry Partner"}</span>
                      </div>
                    )}
                  </div>

                  {isCreator && (
                    <div className="flex gap-2 mt-2">
                      <EditProjectDialog project={project} onUpdate={updateProject} isMutating={isMutating} />
                      <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(project.id)} disabled={isMutating}>
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
