import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SELF_ASSIGNABLE_ROLES, type UserRole } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, department } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const safeRole: UserRole = SELF_ASSIGNABLE_ROLES.includes(role)
      ? role
      : "student";
    const safeDept = department || "CSE";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Create user with email_confirm: true (bypasses email rate limits & guarantees immediate login)
    const { data: userData, error: createError } =
      await admin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          name: name.trim(),
          full_name: name.trim(),
          role: safeRole,
          department: safeDept,
        },
      });

    if (createError) {
      if (
        createError.message.includes("already registered") ||
        createError.message.includes("unique constraint") ||
        createError.status === 422
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const newUser = userData.user;

    // 2. Ensure record exists in public.users
    const { error: dbError } = await admin.from("users").upsert(
      {
        id: newUser.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: safeRole,
        department: safeDept,
        onboarding_completed: false,
      },
      { onConflict: "id" }
    );

    if (dbError) {
      console.warn("[/api/auth/signup] public.users upsert note:", dbError.message);
    }

    // 3. Ensure student_profiles row exists if student
    if (safeRole === "student") {
      try {
        await admin.from("student_profiles").upsert(
          {
            user_id: newUser.id,
            department: safeDept,
          },
          { onConflict: "user_id" }
        );
      } catch (e) {
        console.warn("student_profiles setup notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: name.trim(),
        role: safeRole,
        department: safeDept,
      },
    });
  } catch (err) {
    console.error("[/api/auth/signup] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign up failed" },
      { status: 500 }
    );
  }
}
