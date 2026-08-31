import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/student/dashboard";

  if (code) {
    // TODO: Exchange code for session when Supabase is configured
    // const supabase = await createClient();
    // const { error } = await supabase.auth.exchangeCodeForSession(code);
    // if (!error) {
    //   return NextResponse.redirect(`${origin}${next}`);
    // }
  }

  // Fallback: redirect to the dashboard
  return NextResponse.redirect(`${origin}${next}`);
}
