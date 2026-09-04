"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardXp } from "@/lib/supabase/queries";
import type { ProfileFormData } from "@/lib/types";

interface UseUpdateProfileResult {
  updateProfile: (
    data: Partial<ProfileFormData>,
    avatarFile?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  saving: boolean;
}

/**
 * Provides a single `updateProfile` function that splits the data into
 * `users` and `student_profiles` fields and updates both tables.
 * Handles avatar upload to the `avatars` storage bucket.
 */
export function useUpdateProfile(): UseUpdateProfileResult {
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(
    async (
      data: Partial<ProfileFormData>,
      avatarFile?: File | null
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setSaving(true);
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("Not authenticated");

        let avatarUrl = data.avatar_url;

        // Upload avatar if a file is provided
        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop();
          const fileName = `${user.id}/avatar.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, { upsert: true });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

          avatarUrl = urlData.publicUrl;
        }

        // Split fields between users and student_profiles
        const userFields: Record<string, unknown> = {};
        const profileFields: Record<string, unknown> = {};

        if (data.name !== undefined) userFields.name = data.name;
        if (avatarUrl !== undefined) userFields.avatar_url = avatarUrl;
        if (data.institution_id !== undefined)
          userFields.institution_id = data.institution_id;

        if (data.bio !== undefined) profileFields.bio = data.bio;
        if (data.career_objective !== undefined)
          profileFields.career_objective = data.career_objective;
        if (data.linkedin !== undefined) profileFields.linkedin = data.linkedin;
        if (data.github !== undefined) profileFields.github = data.github;
        if (data.portfolio_website !== undefined)
          profileFields.portfolio_website = data.portfolio_website;
        if (data.location !== undefined) profileFields.location = data.location;
        if (data.phone !== undefined) profileFields.phone = data.phone;
        if (data.dob !== undefined) profileFields.dob = data.dob || null;
        if (data.gender !== undefined)
          profileFields.gender = data.gender || null;
        if (data.resume_url !== undefined)
          profileFields.resume_url = data.resume_url;
        if (data.portfolio_json !== undefined)
          profileFields.portfolio_json = data.portfolio_json;

        // Update both tables in parallel
        const promises: Promise<void>[] = [];

        if (Object.keys(userFields).length > 0) {
          promises.push(
            (async () => {
              const { error } = await supabase
                .from("users")
                .update(userFields)
                .eq("id", user.id);
              if (error) throw error;
            })()
          );
        }

        if (Object.keys(profileFields).length > 0) {
          promises.push(
            (async () => {
              const { error } = await supabase
                .from("student_profiles")
                .update(profileFields)
                .eq("user_id", user.id);
              if (error) throw error;
            })()
          );
        }

        await Promise.all(promises);

        // Award XP for profile update
        await awardXp("profile_updated", {
          fields_updated: [
            ...Object.keys(userFields),
            ...Object.keys(profileFields),
          ],
        });

        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        return { success: false, error: message };
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { updateProfile, saving };
}
