"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  File,
} from "lucide-react";
import { toast } from "sonner";

interface ResumeSectionProps {
  resumeUrl: string | null | undefined;
  uploading: boolean;
  onUpload: (
    file: globalThis.File
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  onGetSignedUrl: (path: string) => Promise<string | null>;
  onRefetch: () => void;
}

export function ResumeSection({
  resumeUrl,
  uploading,
  onUpload,
  onDelete,
  onGetSignedUrl,
  onRefetch,
}: ResumeSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleUpload = async (file: globalThis.File) => {
    const result = await onUpload(file);
    if (result.success) {
      toast.success("Resume uploaded successfully");
      onRefetch();
    } else {
      toast.error(result.error ?? "Upload failed");
    }
  };

  const handleDelete = async () => {
    const result = await onDelete();
    if (result.success) {
      toast.success("Resume deleted");
      onRefetch();
    } else {
      toast.error(result.error ?? "Delete failed");
    }
  };

  const handleDownload = async () => {
    if (!resumeUrl) return;
    setDownloading(true);
    try {
      const url = await onGetSignedUrl(resumeUrl);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Could not generate download link");
      }
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Resume
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resumeUrl ? (
          /* Resume exists */
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-accent/20">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {resumeUrl.split("/").pop() ?? "resume"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uploaded to Supabase Storage
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="ml-1.5 hidden sm:inline">Download</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="ml-1.5 hidden sm:inline">Replace</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={uploading}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* No resume — upload prompt */
          <div
            className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-accent/20 transition-all"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {uploading ? "Uploading…" : "Upload Your Resume"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              PDF, DOC, or DOCX • Max 10MB
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            // Reset input so the same file can be re-selected
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}
