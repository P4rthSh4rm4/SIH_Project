"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, UploadCloud, Trash2, Download,
  File, FileBadge, FileDigit, Plus, Loader2
} from "lucide-react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";
import type { DocumentType } from "@/lib/types";

const DOC_TYPES: { id: DocumentType; label: string; icon: React.ElementType }[] = [
  { id: "resume", label: "Resume / CV", icon: FileText },
  { id: "transcript", label: "Transcript", icon: FileBadge },
  { id: "id_proof", label: "ID Proof", icon: FileDigit },
  { id: "other", label: "Other", icon: File },
];

export default function DocumentsPage() {
  const { documents, loading, uploadDocument, getDownloadUrl, deleteDocument } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("resume");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error("Please provide a title and select a file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await uploadDocument(file, title, type);
      if (success) {
        toast.success("Document uploaded successfully");
        setIsUploading(false);
        setTitle("");
        setFile(null);
        setType("resume");
        await awardXp("document_uploaded");
      } else {
        toast.error(error || "Upload failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (docPath: string, docId: string) => {
    setActionId(`dl-${docId}`);
    try {
      const url = await getDownloadUrl(docPath);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Failed to generate download link");
      }
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (docId: string, docPath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setActionId(`del-${docId}`);
    try {
      const { success, error } = await deleteDocument(docId, docPath);
      if (success) {
        toast.success("Document deleted");
      } else {
        toast.error(error || "Failed to delete document");
      }
    } finally {
      setActionId(null);
    }
  };

  const getDocIcon = (t: DocumentType) => {
    const found = DOC_TYPES.find(d => d.id === t);
    return found ? found.icon : File;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Loading your files...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your resume, transcripts, and other important files securely.
          </p>
        </div>
        <Button onClick={() => setIsUploading(!isUploading)}>
          <Plus className="w-4 h-4 mr-2" /> {isUploading ? "Cancel" : "Upload File"}
        </Button>
      </div>

      {isUploading && (
        <Card className="border-primary/50 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle className="text-lg">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="E.g., Updated Resume 2026"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOC_TYPES.map((t) => (
                      <Badge 
                        key={t.id}
                        variant={type === t.id ? "default" : "outline"}
                        className="cursor-pointer py-1.5 px-3"
                        onClick={() => setType(t.id)}
                      >
                        <t.icon className="w-3 h-3 mr-1.5" />
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>File (Max 5MB)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-secondary/20 border-border/50 hover:bg-secondary/40 hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                        {file ? (
                          <>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, JPG or PNG (MAX. 5MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
                <Button type="button" variant="ghost" onClick={() => setIsUploading(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !file}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Upload Document"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && !isUploading ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No documents uploaded</p>
            <p className="text-sm mb-4">Upload your resume to easily apply for opportunities.</p>
            <Button variant="outline" onClick={() => setIsUploading(true)}>
              <UploadCloud className="w-4 h-4 mr-2" /> Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => {
            const Icon = getDocIcon(doc.type);
            const isDownloading = actionId === `dl-${doc.id}`;
            const isDeleting = actionId === `del-${doc.id}`;
            
            return (
              <Card key={doc.id} className="border-border/50 hover:border-primary/30 transition-colors group flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {doc.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-auto">
                    {formatSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="p-3 pt-0 flex gap-2 border-t border-border/10 mt-auto bg-muted/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 h-8"
                    disabled={isDownloading}
                    onClick={() => handleDownload(doc.file_url, doc.id)}
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-3.5 h-3.5 mr-1.5" /> Download</>}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                    onClick={() => handleDelete(doc.id, doc.file_url)}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
