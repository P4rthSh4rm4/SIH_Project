"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { SELF_ASSIGNABLE_ROLES, ROLE_PORTAL_MAP, type UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const roles: {
  value: UserRole;
  label: string;
  icon: React.ElementType;
  desc: string;
  color: string;
}[] = [
  {
    value: "student",
    label: "Student",
    icon: GraduationCap,
    desc: "Find internships & build your portfolio",
    color: "text-violet-500",
  },
  {
    value: "industry",
    label: "Industry / Recruiter",
    icon: Building2,
    desc: "Post opportunities & find talent",
    color: "text-blue-500",
  },
  {
    value: "academician",
    label: "Academician",
    icon: BookOpen,
    desc: "FDPs, research & consultancy",
    color: "text-emerald-500",
  },
  {
    value: "institution_admin",
    label: "Institution Admin",
    icon: BarChart3,
    desc: "Manage placements & analytics",
    color: "text-amber-500",
  },
];



function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") as UserRole | null;


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    preselectedRole || "student"
  );
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // Sanitize role: never allow privileged roles from client
    const safeRole: UserRole = SELF_ASSIGNABLE_ROLES.includes(selectedRole)
      ? selectedRole
      : "student";

    try {
      const supabase = createClient();

      // 1. Create the auth user, storing name & role in metadata so the
      //    DB trigger (handle_new_user) can populate public.users automatically.
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role: safeRole,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error(
            "An account with this email already exists. Please log in instead."
          );
        }
        throw authError;
      }

      // 2. Redirect to dashboard
      if (data.user) {
        const portalPrefix = ROLE_PORTAL_MAP[safeRole] || "/student";
        router.refresh();
        router.push(`${portalPrefix}/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── OAuth Signup ───────────────────────────────────────────────────
  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth signup failed");
      setLoading(false);
    }
  };



  // ─── Signup Form ────────────────────────────────────────────────────
  return (
    <Card className="border-border/40 shadow-2xl shadow-primary/[0.06] dark:shadow-primary/[0.08] animate-scale-in">
      <CardHeader className="text-center pb-3">
        <h1 className="text-3xl font-extrabold">Create your account</h1>
        <p className="text-[0.95rem] text-muted-foreground mt-1">
          Join the SkillSetu community
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        {/* Role selector */}
        <div className="space-y-2.5">
          <Label className="text-[0.9rem] font-semibold">I am a...</Label>
          <div className="grid grid-cols-2 gap-2.5">
            {roles.map((role) => {
              const isPrivileged = !SELF_ASSIGNABLE_ROLES.includes(role.value);
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => !isPrivileged && setSelectedRole(role.value)}
                  disabled={isPrivileged}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isPrivileged
                      ? "border-border/30 opacity-50 cursor-not-allowed"
                      : selectedRole === role.value
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                        : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
                  }`}
                  title={
                    isPrivileged
                      ? "This role requires admin approval"
                      : undefined
                  }
                >
                  <role.icon
                    className={`w-6 h-6 mb-2 ${selectedRole === role.value ? role.color : "text-muted-foreground"} transition-colors`}
                  />
                  <div className="text-[0.9rem] font-semibold">
                    {role.label}
                    {isPrivileged && (
                      <span className="ml-1 text-[10px] text-muted-foreground font-medium">
                        (by invite)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug mt-1">
                    {role.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 text-[0.9rem]"
            onClick={() => handleOAuth("google")}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            variant="outline"
            className="h-12 text-[0.9rem]"
            onClick={() => handleOAuth("github")}
            disabled={loading}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground font-medium">
            or
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-[0.9rem] font-semibold">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="signup-name"
                placeholder="Your name"
                className="pl-11 h-12 text-[0.95rem] rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-[0.9rem] font-semibold">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                className="pl-11 h-12 text-[0.95rem] rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-pw" className="text-[0.9rem] font-semibold">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="signup-pw"
                type={showPw ? "text" : "password"}
                placeholder="Min 8 characters"
                className="pl-11 pr-11 h-12 text-[0.95rem] rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 font-medium">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-green-600 bg-green-500/10 rounded-xl px-4 py-3 font-medium">
              {successMsg}
            </p>
          )}
          <Button
            type="submit"
            className="w-full h-12 text-[0.95rem] bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20 shimmer-hover"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-[0.9rem] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={<div className="animate-shimmer h-[600px] rounded-2xl" />}
    >
      <SignupForm />
    </Suspense>
  );
}
