import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Allow an explicit ?next= override (e.g. from email magic-link flows)
  const explicitNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If caller supplied an explicit redirect, honour it.
      if (explicitNext) {
        return NextResponse.redirect(`${origin}${explicitNext}`);
      }

      // Otherwise look up the user's role and redirect to their portal.
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role: UserRole = (userData?.role as UserRole) || "student";
      return NextResponse.redirect(`${origin}/${role}/dashboard`);
    }
  }

  // Fallback on error: redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
