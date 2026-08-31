import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request via middleware.
 * Also handles role-based route protection.
 * Gracefully skips when Supabase env vars are not configured (dev mode).
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

  // Define protected route prefixes
  const protectedPrefixes = [
    "/student",
    "/industry",
    "/academician",
    "/institution",
    "/admin",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  // Redirect unauthenticated users to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  // IMPORTANT: /auth/signout must NOT be redirected — it's the logout endpoint.
  const isAuthSignout = request.nextUrl.pathname === "/auth/signout";
  if (user && request.nextUrl.pathname.startsWith("/auth") && !isAuthSignout) {
    const url = request.nextUrl.clone();
    // TODO: Redirect based on user role from profiles table
    url.pathname = "/student/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

