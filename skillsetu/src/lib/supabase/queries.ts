import { createClient } from "@/lib/supabase/client";
import type {
  ActivityAction,
  AwardXpResult,
} from "@/lib/types";
import { XP_REWARDS } from "@/lib/gamification";

/**
 * Award XP to the current user via the server-side `award_xp` Postgres function.
 * This is the ONLY way XP is awarded — no direct client writes to activity_log
 * or student_gamification.
 */
export async function awardXp(
  actionType: ActivityAction,
  metadata: Record<string, unknown> = {}
): Promise<AwardXpResult | null> {
  const supabase = createClient();
  const xp = XP_REWARDS[actionType] ?? 10;

  const { data, error } = await supabase.rpc("award_xp", {
    p_action_type: actionType,
    p_xp: xp,
    p_metadata: metadata,
  });

  if (error) {
    console.error("[awardXp] Failed:", error.message);
    return null;
  }

  return data as AwardXpResult;
}

/**
 * Upload a file to a Supabase Storage bucket.
 * Path format: {userId}/{filename}
 */
export async function uploadFile(
  bucket: "student-documents" | "student-portfolio",
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

  if (error) {
    console.error(`[uploadFile] Failed to upload to ${bucket}:`, error.message);
    return null;
  }

  // For public buckets, return the public URL
  if (bucket === "student-portfolio") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  // For private buckets, return the path (use createSignedUrl when needed)
  return fileName;
}

/**
 * Get a signed URL for a private file (e.g., from student-documents).
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error("[getSignedUrl] Failed:", error.message);
    return null;
  }

  return data.signedUrl;
}
