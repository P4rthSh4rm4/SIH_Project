"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Document, DocumentType } from "@/lib/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) ?? []);
    } catch (err) {
      console.error("[useDocuments] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(
    async (
      file: File,
      title: string,
      type: DocumentType
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("student-documents")
          .upload(fileName, file, { upsert: false });

        if (uploadErr) throw uploadErr;

        const { error } = await supabase.from("documents").insert({
          user_id: user.id,
          title,
          type,
          file_url: fileName,
          file_size: file.size,
        });

        if (error) throw error;
        await fetchDocuments();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to upload",
        };
      }
    },
    [fetchDocuments]
  );

  const getDownloadUrl = useCallback(
    async (filePath: string): Promise<string | null> => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(filePath, 3600);
      if (error) {
        console.error("[useDocuments] signed url error:", error);
        return null;
      }
      return data.signedUrl;
    },
    []
  );

  const deleteDocument = useCallback(
    async (
      id: string,
      filePath: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        // Delete from storage
        await supabase.storage.from("student-documents").remove([filePath]);
        // Delete from table
        const { error } = await supabase
          .from("documents")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await fetchDocuments();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete",
        };
      }
    },
    [fetchDocuments]
  );

  return {
    documents,
    loading,
    uploadDocument,
    getDownloadUrl,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
