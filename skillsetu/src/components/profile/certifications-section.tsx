"use client";

import { useState, useRef } from "react";
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
  Award,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ShieldCheck,
  Clock,
  ShieldX,
} from "lucide-react";
import type { Certification, VerificationStatus } from "@/lib/types";
import { toast } from "sonner";

interface CertificationsSectionProps {
  certifications: Certification[];
  loading: boolean;
  onAdd: (
    data: {
      title: string;
      issuer: string;
      credential_id?: string;
      issued_at?: string;
    },
    file?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    data: Partial<{
      title: string;
      issuer: string;
      credential_id?: string;
      issued_at?: string;
    }>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  verified: {
    label: "Verified",
    icon: <ShieldCheck className="w-3 h-3" />,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: <ShieldX className="w-3 h-3" />,
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

const EMPTY_FORM = {
  title: "",
  issuer: "",
  credential_id: "",
  issued_at: "",
};

export function CertificationsSection({
  certifications,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: CertificationsSectionProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAddDialog = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setOpen(true);
  };

  const openEditDialog = (cert: Certification) => {
    setEditId(cert.id);
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      credential_id: cert.credential_id ?? "",
      issued_at: cert.issued_at ?? "",
    });
    setFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast.error("Title and Issuer are required");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      credential_id: form.credential_id.trim() || undefined,
      issued_at: form.issued_at || undefined,
    };

    const result = editId
      ? await onUpdate(editId, payload)
      : await onAdd(payload, file);

    setSaving(false);

    if (result.success) {
      toast.success(editId ? "Certification updated" : "Certification added");
      setOpen(false);
    } else {
      toast.error(result.error ?? "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.success) {
      toast.success("Certification deleted");
    } else {
      toast.error(result.error ?? "Delete failed");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Certifications
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
                  {editId ? "Edit Certification" : "Add Certification"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="AWS Cloud Practitioner"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuer *</Label>
                  <Input
                    value={form.issuer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, issuer: e.target.value }))
                    }
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Credential ID</Label>
                    <Input
                      value={form.credential_id}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          credential_id: e.target.value,
                        }))
                      }
                      placeholder="ABC123XYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input
                      type="date"
                      value={form.issued_at}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          issued_at: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* File upload (only for new certifications) */}
                {!editId && (
                  <div className="space-y-2">
                    <Label>Certificate File (optional)</Label>
                    <div
                      className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {file
                          ? file.name
                          : "Click to upload PDF, PNG or JPG"}
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                )}
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
                className="h-16 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : certifications.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No certifications yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload your certifications to build credibility
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => {
              const status =
                STATUS_CONFIG[cert.verification_status ?? "pending"];
              return (
                <div
                  key={cert.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {cert.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cert.issuer}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${status.className}`}
                      >
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                      {cert.credential_id && (
                        <span className="text-[10px] text-muted-foreground">
                          ID: {cert.credential_id}
                        </span>
                      )}
                      {cert.issued_at && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(cert.issued_at).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEditDialog(cert)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
