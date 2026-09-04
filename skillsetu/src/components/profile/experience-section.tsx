"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  FlaskConical,
  FolderKanban,
  Clock,
} from "lucide-react";
import type { StudentExperience, ExperienceType } from "@/lib/types";
import { toast } from "sonner";

interface ExperienceSectionProps {
  experiences: StudentExperience[];
  loading: boolean;
  onAdd: (data: {
    type: ExperienceType;
    title: string;
    organization?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    data: Partial<{
      type: ExperienceType;
      title: string;
      organization?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      is_current?: boolean;
    }>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const TYPE_LABELS: Record<ExperienceType, string> = {
  internship: "Internship",
  project: "Project",
  research: "Research",
  part_time: "Part Time",
};

const TYPE_ICONS: Record<ExperienceType, React.ReactNode> = {
  internship: <Briefcase className="w-4 h-4" />,
  project: <FolderKanban className="w-4 h-4" />,
  research: <FlaskConical className="w-4 h-4" />,
  part_time: <Clock className="w-4 h-4" />,
};

const TYPE_COLORS: Record<ExperienceType, string> = {
  internship: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  project: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  research: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  part_time: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const EMPTY_FORM = {
  type: "internship" as ExperienceType,
  title: "",
  organization: "",
  description: "",
  start_date: "",
  end_date: "",
  is_current: false,
};

export function ExperienceSection({
  experiences,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: ExperienceSectionProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openAddDialog = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEditDialog = (exp: StudentExperience) => {
    setEditId(exp.id);
    setForm({
      type: exp.type,
      title: exp.title,
      organization: exp.organization ?? "",
      description: exp.description ?? "",
      start_date: exp.start_date ?? "",
      end_date: exp.end_date ?? "",
      is_current: exp.is_current,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      type: form.type,
      title: form.title.trim(),
      organization: form.organization.trim() || undefined,
      description: form.description.trim() || undefined,
      start_date: form.start_date || undefined,
      end_date: form.is_current ? undefined : form.end_date || undefined,
      is_current: form.is_current,
    };

    const result = editId
      ? await onUpdate(editId, payload)
      : await onAdd(payload);

    setSaving(false);

    if (result.success) {
      toast.success(editId ? "Experience updated" : "Experience added");
      setOpen(false);
    } else {
      toast.error(result.error ?? "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.success) {
      toast.success("Experience deleted");
    } else {
      toast.error(result.error ?? "Delete failed");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Experience
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
                  {editId ? "Edit Experience" : "Add Experience"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) =>
                      setForm((f) => ({
                        ...f,
                        type: val as ExperienceType,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Position / Project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={form.organization}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, organization: e.target.value }))
                    }
                    placeholder="Company / Institution"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Brief description of your role..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, end_date: e.target.value }))
                      }
                      disabled={form.is_current}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_current}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        is_current: e.target.checked,
                        end_date: e.target.checked ? "" : f.end_date,
                      }))
                    }
                    className="rounded border-input"
                  />
                  Currently working here
                </label>
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
        ) : experiences.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No experience entries yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add internships, projects, or research experience
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[exp.type]}`}
                >
                  {TYPE_ICONS[exp.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{exp.title}</p>
                  {exp.organization && (
                    <p className="text-xs text-muted-foreground truncate">
                      {exp.organization}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${TYPE_COLORS[exp.type]}`}
                    >
                      {TYPE_LABELS[exp.type]}
                    </Badge>
                    {exp.start_date && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(exp.start_date).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                        {" – "}
                        {exp.is_current
                          ? "Present"
                          : exp.end_date
                            ? new Date(exp.end_date).toLocaleDateString(
                                "en-IN",
                                { month: "short", year: "numeric" }
                              )
                            : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => openEditDialog(exp)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(exp.id)}
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
