"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that returns the currently authenticated user's profile
 * from the public.users table. Returns null while loading.
 */
export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const supabase = createClient();

        // 1. Get the authenticated user from the session
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          if (!cancelled) setLoading(false);
          return;
        }

        // 2. Fetch the matching row from public.users
        const { data, error: dbError } = await supabase
          .from("users")
          .select("id, role, name, email, avatar_url, institution_id, created_at")
          .eq("id", user.id)
          .single();

        if (dbError) {
          // If no row exists yet, create one from auth metadata
          if (dbError.code === "PGRST116") {
            const meta = user.user_metadata ?? {};
            const { data: inserted, error: insertError } = await supabase
              .from("users")
              .insert({
                id: user.id,
                name: (meta.name as string) || user.email?.split("@")[0] || "User",
                email: user.email ?? "",
                role: (meta.role as string) || "student",
              })
              .select("id, role, name, email, avatar_url, institution_id, created_at")
              .single();

            if (insertError) throw insertError;
            if (!cancelled) setProfile(inserted as UserProfile);
          } else {
            throw dbError;
          }
        } else {
          if (!cancelled) setProfile(data as UserProfile);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
