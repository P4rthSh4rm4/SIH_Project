import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request via middleware.
 * Handles:
 *  - Session refresh (keeps cookies alive)
 *  - Authentication gate (redirect unauthenticated users from protected routes)
 *  - Redirect authenticated users away from auth pages (except callback/signout/verify)
 *
 * IMPORTANT: This middleware does NOT perform database queries.
 * Role-based authorization is handled in server components / API routes.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth middleware if Supabase is not configured (local dev without Supabase)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not add logic between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ─── Define route categories ──────────────────────────────────────────
  const protectedPrefixes = [
    "/student",
    "/industry",
    "/academician",
    "/institution",
    "/admin",
  ];

  // Auth pages that should NOT redirect authenticated users away
  const authExcludedPaths = [
    "/auth/callback",
    "/auth/signout",
    "/auth/verify",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAuthRoute = pathname.startsWith("/auth");
  const isAuthExcluded = authExcludedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // ─── Unauthenticated users: block protected routes ────────────────────
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ─── Authenticated users: redirect away from login/signup pages ───────
  // But NEVER redirect from callback, signout, or verify pages
  if (user && isAuthRoute && !isAuthExcluded) {
    // We don't query the DB here for performance and reliability.
    // Instead, redirect to a generic dashboard route that will
    // determine the correct portal on the server side.
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const url = request.nextUrl.clone();

    if (redirectTo && redirectTo.startsWith("/")) {
      // If there's a specific redirect target, honour it
      url.pathname = redirectTo;
      url.search = "";
    } else {
      // Default: redirect to the role-resolver page
      url.pathname = "/auth/callback";
      url.searchParams.set("resolve", "true");
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
