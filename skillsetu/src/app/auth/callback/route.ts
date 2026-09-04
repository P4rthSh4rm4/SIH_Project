import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROLE_PORTAL_MAP, type UserRole } from "@/lib/types";

/**
 * Auth callback route — handles ALL Supabase auth flows:
 *  1. OAuth code exchange (Google, GitHub)
 *  2. Email verification links (code or token_hash)
 *  3. Magic link / email OTP confirmation
 *  4. Role-based redirect resolution (when ?resolve=true)
 *
 * Supabase may send:
 *  - ?code=...             → OAuth / PKCE code exchange
 *  - ?token_hash=...&type= → Email verification (non-PKCE)
 *  - ?resolve=true         → Middleware redirect for already-authenticated users
 *  - ?error=...            → Auth error from Supabase
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type"); // signup, recovery, invite, magiclink, email
  const _resolve = searchParams.get("resolve"); // Used by middleware redirect, not this handler
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const explicitNext = searchParams.get("next");

  const supabase = await createClient();

  // ─── Handle errors from Supabase ──────────────────────────────────────
  if (errorParam) {
    const msg = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  // ─── 1. Exchange auth code (OAuth / PKCE) ─────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] Code exchange failed:", error.message);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // ─── 2. Verify token_hash (email verification links, non-PKCE) ───────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "recovery" | "invite" | "magiclink" | "email",
    });
    if (error) {
      console.error("[auth/callback] Token verification failed:", error.message);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // ─── Determine the authenticated user ─────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
  }

  // ─── Honour explicit ?next= redirect ──────────────────────────────────
  if (explicitNext && explicitNext.startsWith("/")) {
    return NextResponse.redirect(`${origin}${explicitNext}`);
  }

  // ─── Look up the user's profile/role ──────────────────────────────────
  const { data: userProfile } = await supabase
    .from("users")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    // Profile doesn't exist yet — the trigger may not have fired or RLS may block.
    // Redirect to a verification / onboarding page that will create the profile.
    return NextResponse.redirect(`${origin}/auth/verify?setup=true`);
  }

  const role = userProfile.role as UserRole;
  const portalPrefix = ROLE_PORTAL_MAP[role] || "/student";

  // ─── Check onboarding status ──────────────────────────────────────────
  if (!userProfile.onboarding_completed) {
    // For now, redirect to dashboard — onboarding can be added later
    return NextResponse.redirect(`${origin}${portalPrefix}/dashboard`);
  }

  return NextResponse.redirect(`${origin}${portalPrefix}/dashboard`);
}
