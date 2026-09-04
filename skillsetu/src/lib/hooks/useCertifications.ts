"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Certification } from "@/lib/types";

type CertificationInput = {
  title: string;
  issuer: string;
  credential_id?: string;
  issued_at?: string;
};

interface UseCertificationsResult {
  certifications: Certification[];
  loading: boolean;
  addCertification: (
    data: CertificationInput,
    file?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  updateCertification: (
    id: string,
    data: Partial<CertificationInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteCertification: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

/**
 * CRUD hook for the `certifications` table with certificate file upload.
 */
export function useCertifications(): UseCertificationsResult {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertifications = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setCertifications((data as Certification[]) ?? []);
    } catch (err) {
      console.error("[useCertifications] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const addCertification = useCallback(
    async (
      data: CertificationInput,
      file?: File | null
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        let certificateUrl: string | undefined;

        // Upload certificate file if provided
        if (file) {
          const ext = file.name.split(".").pop();
          const fileName = `${user.id}/certs/${Date.now()}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("documents")
            .upload(fileName, file, { upsert: false });

          if (uploadErr) throw uploadErr;

          // Store the path — use signed URLs when needed
          certificateUrl = fileName;
        }

        const { error } = await supabase.from("certifications").insert({
          student_id: user.id,
          title: data.title,
          issuer: data.issuer,
          credential_id: data.credential_id || null,
          issued_at: data.issued_at || null,
          certificate_url: certificateUrl || null,
          verification_status: "pending",
          verified: false,
        });

        if (error) throw error;
        await fetchCertifications();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to add certification",
        };
      }
    },
    [fetchCertifications]
  );

  const updateCertification = useCallback(
    async (
      id: string,
      data: Partial<CertificationInput>
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("certifications")
          .update(data)
          .eq("id", id);

        if (error) throw error;
        await fetchCertifications();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to update certification",
        };
      }
    },
    [fetchCertifications]
  );

  const deleteCertification = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("certifications")
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchCertifications();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to delete certification",
        };
      }
    },
    [fetchCertifications]
  );

  return {
    certifications,
    loading,
    addCertification,
    updateCertification,
    deleteCertification,
    refetch: fetchCertifications,
  };
}
