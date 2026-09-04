"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook that returns the currently authenticated user's profile
 * from the public.users table. Listens for auth state changes
 * and refetches automatically on sign-in/sign-out.
 */
export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // 1. Get the authenticated user from the session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 2. Fetch the matching row from public.users
      const { data, error: dbError } = await supabase
        .from("users")
        .select(
          "id, role, name, email, avatar_url, institution_id, onboarding_completed, created_at, updated_at"
        )
        .eq("id", user.id)
        .single();

      if (dbError) {
        // If no row exists yet (trigger hasn't fired), create a safe profile
        if (dbError.code === "PGRST116") {
          const meta = user.user_metadata ?? {};

          // Only allow non-privileged roles from metadata
          let role = (meta.role as string) || "student";
          if (!["student", "industry", "academician"].includes(role)) {
            role = "student";
          }

          const { data: inserted, error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              name:
                (meta.name as string) ||
                (meta.full_name as string) ||
                user.email?.split("@")[0] ||
                "User",
              email: user.email ?? "",
              role,
              avatar_url: (meta.avatar_url as string) || null,
            })
            .select(
              "id, role, name, email, avatar_url, institution_id, onboarding_completed, created_at, updated_at"
            )
            .single();

          if (insertError) {
            // If insert fails (maybe race condition with trigger), try fetching again
            const { data: retryData, error: retryError } = await supabase
              .from("users")
              .select(
                "id, role, name, email, avatar_url, institution_id, onboarding_completed, created_at, updated_at"
              )
              .eq("id", user.id)
              .single();

            if (retryError) throw retryError;
            setProfile(retryData as UserProfile);
          } else {
            setProfile(inserted as UserProfile);
          }
        } else {
          throw dbError;
        }
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listen for auth state changes (sign in, sign out, token refresh)
    // INITIAL_SESSION fires immediately on mount, triggering the initial fetch
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
