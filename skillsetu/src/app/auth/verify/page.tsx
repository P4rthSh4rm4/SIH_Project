"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_PORTAL_MAP, type UserRole } from "@/lib/types";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setup = searchParams.get("setup");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setUserEmail(user.email || "");

      if (setup === "true") {
        // Profile doesn't exist yet — try to create it
        const meta = user.user_metadata ?? {};
        let role = (meta.role as string) || "student";
        if (!["student", "industry", "academician"].includes(role)) {
          role = "student";
        }

        const { error: upsertError } = await supabase.from("users").upsert(
          {
            id: user.id,
            name:
              (meta.name as string) ||
              (meta.full_name as string) ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email ?? "",
            role,
            avatar_url: (meta.avatar_url as string) || null,
          },
          { onConflict: "id" }
        );

        if (upsertError && upsertError.code !== "23505") {
          console.warn("Profile setup warning:", upsertError.message);
        }

        // Now redirect to portal
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole = (profile?.role as UserRole) || "student";
        const portalPrefix = ROLE_PORTAL_MAP[userRole] || "/student";

        setVerified(true);
        setLoading(false);

        // Auto-redirect after brief delay
        setTimeout(() => {
          router.replace(`${portalPrefix}/dashboard`);
        }, 1500);
        return;
      }

      // Check if email is confirmed
      if (user.email_confirmed_at) {
        setVerified(true);
        setLoading(false);

        // Look up role and redirect
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole = (profile?.role as UserRole) || "student";
        const portalPrefix = ROLE_PORTAL_MAP[userRole] || "/student";

        setTimeout(() => {
          router.replace(`${portalPrefix}/dashboard`);
        }, 1500);
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setup]);

  if (loading) {
    return (
      <Card className="border-border/50 shadow-2xl shadow-primary/5">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </CardContent>
      </Card>
    );
  }

  if (verified) {
    return (
      <Card className="border-border/50 shadow-2xl shadow-primary/5">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your account is ready. Redirecting to your dashboard...
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Unverified state
  return (
    <Card className="border-border/50 shadow-2xl shadow-primary/5">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a verification link to
        </p>
        <p className="text-sm font-medium text-foreground">{userEmail}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="p-4 rounded-xl bg-accent/50 border border-border/50 space-y-2">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account, then return
            here.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t get the email? Check your spam folder.
          </p>
        </div>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full h-11"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          I&apos;ve verified my email
        </Button>

        <Button
          onClick={async () => {
            setLoading(true);
            const supabase = createClient();
            const { error: resendError } = await supabase.auth.resend({
              type: "signup",
              email: userEmail,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
            if (resendError) {
              setError(resendError.message);
            }
            setLoading(false);
          }}
          variant="ghost"
          className="w-full text-sm"
        >
          Resend verification email
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={<div className="animate-shimmer h-[400px] rounded-xl" />}
    >
      <VerifyContent />
    </Suspense>
  );
}
