"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function sendNotificationAction(
  studentId: string,
  subject: string,
  message: string
) {
  try {
    // 1. Verify the current user is an academician
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    if (user.user_metadata?.role !== "academician") {
      throw new Error("Forbidden: Only academicians can send mentorship notifications.");
    }

    // 2. Insert notification using Service Role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[sendNotificationAction] Supabase Config Check:");
    console.log("- URL present:", !!supabaseUrl);
    console.log("- Service Role Key present:", !!serviceRoleKey);
    if (serviceRoleKey === "your-service-role-key-here") {
      console.warn("[sendNotificationAction] WARNING: Service Role Key is using the default placeholder value!");
    }

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server configuration error: Missing Supabase credentials.");
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

    const payload_json = {
      title: `Mentorship: ${subject}`,
      message: message,
      link: "/student/profile"
    };

    const { error: insertError } = await adminClient
      .from("notifications")
      .insert({
        user_id: studentId,
        type: "mentorship_message",
        payload_json: payload_json
      });

    if (insertError) {
      console.error("[sendNotificationAction] Failed to insert notification:", insertError);
      throw new Error("Failed to send notification: " + insertError.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[sendNotificationAction] Action Error:", err);
    return { success: false, error: err.message };
  }
}
