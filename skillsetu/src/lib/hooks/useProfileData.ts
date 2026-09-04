"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProfileFormData } from "@/lib/types";

interface UseProfileDataResult {
  profile: ProfileFormData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches and merges data from `users` and `student_profiles` tables
 * for the currently authenticated user. Automatically creates a
 * student_profiles row if one doesn't exist.
 */
export function useProfileData(): UseProfileDataResult {
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
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

      // Fetch user row and student_profile in parallel
      const [userRes, spRes] = await Promise.all([
        supabase
          .from("users")
          .select(
            "id, role, name, email, avatar_url, institution_id, onboarding_completed, created_at, updated_at"
          )
          .eq("id", user.id)
          .single(),
        supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (userRes.error) throw userRes.error;

      const userData = userRes.data;
      let spData = spRes.data;

      // Auto-create student_profiles row if missing
      if (!spData) {
        const { data: newSp, error: insertErr } = await supabase
          .from("student_profiles")
          .insert({ user_id: user.id })
          .select("*")
          .single();

        if (insertErr) {
          // Race condition: try fetching again
          const { data: retryData } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
          spData = retryData;
        } else {
          spData = newSp;
        }
      }

      // Merge into ProfileFormData
      const merged: ProfileFormData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar_url: userData.avatar_url,
        institution_id: userData.institution_id,
        student_profile_id: spData?.id,
        bio: spData?.bio,
        career_objective: spData?.career_objective,
        linkedin: spData?.linkedin,
        github: spData?.github,
        portfolio_website: spData?.portfolio_website,
        location: spData?.location,
        phone: spData?.phone,
        dob: spData?.dob,
        gender: spData?.gender,
        resume_url: spData?.resume_url,
        portfolio_json: spData?.portfolio_json,
      };

      setProfile(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
