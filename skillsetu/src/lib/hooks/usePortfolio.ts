"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioItem } from "@/lib/types";

export function usePortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as PortfolioItem[]) ?? []);
    } catch (err) {
      console.error("[usePortfolio] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(
    async (
      input: {
        type: "project" | "achievement" | "internship";
        title: string;
        description?: string;
        url?: string;
      },
      imageFile?: File | null
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        let imageUrl: string | undefined;

        if (imageFile) {
          const ext = imageFile.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("student-portfolio")
            .upload(fileName, imageFile, { upsert: false });
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage
            .from("student-portfolio")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from("portfolio_items").insert({
          user_id: user.id,
          type: input.type,
          title: input.title,
          description: input.description || null,
          url: input.url || null,
          image_url: imageUrl || null,
        });

        if (error) throw error;
        await fetchItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to add item",
        };
      }
    },
    [fetchItems]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("portfolio_items")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await fetchItems();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete",
        };
      }
    },
    [fetchItems]
  );

  return { items, loading, addItem, deleteItem, refetch: fetchItems };
}
