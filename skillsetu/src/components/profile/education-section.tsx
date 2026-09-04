"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import type { StudentEducation } from "@/lib/types";
import { toast } from "sonner";

interface EducationSectionProps {
  education: StudentEducation[];
  loading: boolean;
  onAdd: (
    data: Omit<StudentEducation, "id" | "user_id" | "created_at">
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    data: Partial<Omit<StudentEducation, "id" | "user_id" | "created_at">>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const EMPTY_FORM = {
  institute: "",
  degree: "",
  branch: "",
  cgpa: "",
  start_year: "",
  end_year: "",
};

/**
 * Education section with add/edit/delete via dialogs.
 */
export function EducationSection({
  education,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: EducationSectionProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openAddDialog = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEditDialog = (edu: StudentEducation) => {
    setEditId(edu.id);
    setForm({
      institute: edu.institute,
      degree: edu.degree,
      branch: edu.branch ?? "",
      cgpa: edu.cgpa?.toString() ?? "",
      start_year: edu.start_year?.toString() ?? "",
      end_year: edu.end_year?.toString() ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.institute.trim() || !form.degree.trim()) {
      toast.error("Institute and Degree are required");
      return;
    }

    setSaving(true);
    const payload = {
      institute: form.institute.trim(),
      degree: form.degree.trim(),
      branch: form.branch.trim() || undefined,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
      start_year: form.start_year ? parseInt(form.start_year) : undefined,
      end_year: form.end_year ? parseInt(form.end_year) : undefined,
    };

    const result = editId
      ? await onUpdate(editId, payload)
      : await onAdd(payload);

    setSaving(false);

    if (result.success) {
      toast.success(editId ? "Education updated" : "Education added");
      setOpen(false);
    } else {
      toast.error(result.error ?? "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.success) {
      toast.success("Education deleted");
    } else {
      toast.error(result.error ?? "Delete failed");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Education
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline" onClick={openAddDialog}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit Education" : "Add Education"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Institute *</Label>
                  <Input
                    value={form.institute}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, institute: e.target.value }))
                    }
                    placeholder="University / College name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Degree *</Label>
                    <Input
                      value={form.degree}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, degree: e.target.value }))
                      }
                      placeholder="B.Tech, M.Sc..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input
                      value={form.branch}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, branch: e.target.value }))
                      }
                      placeholder="CS, ECE..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>CGPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={form.cgpa}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cgpa: e.target.value }))
                      }
                      placeholder="8.50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="number"
                      min="1990"
                      max="2040"
                      value={form.start_year}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_year: e.target.value }))
                      }
                      placeholder="2022"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="number"
                      min="1990"
                      max="2040"
                      value={form.end_year}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, end_year: e.target.value }))
                      }
                      placeholder="2026"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline">Cancel</Button>
                  }
                />
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : education.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No education entries yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add your academic background to improve your profile
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {edu.degree}
                    {edu.branch ? ` — ${edu.branch}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {edu.institute}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {edu.cgpa && (
                      <Badge variant="secondary" className="text-[10px]">
                        CGPA: {edu.cgpa}
                      </Badge>
                    )}
                    {edu.start_year && (
                      <span className="text-[10px] text-muted-foreground">
                        {edu.start_year}
                        {edu.end_year ? ` – ${edu.end_year}` : " – Present"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => openEditDialog(edu)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(edu.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
