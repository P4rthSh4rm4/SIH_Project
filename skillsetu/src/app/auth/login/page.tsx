"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  ArrowRight,
  Loader2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_PORTAL_MAP, type UserRole } from "@/lib/types";

type LoginMode = "password" | "otp-send" | "otp-verify";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(callbackError || "");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpCountdown, setOtpCountdown] = useState(0);

  // ─── Email + Password Login ─────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          throw new Error(
            "Please verify your email before signing in. Check your inbox for a verification link."
          );
        }
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Your email or password is incorrect.");
        }
        throw authError;
      }

      // Fetch user role to redirect correctly
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = (userData?.role as UserRole) || "student";
      const portalPrefix = ROLE_PORTAL_MAP[role] || "/student";

      router.refresh();
      router.push(`${portalPrefix}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── OAuth Login ────────────────────────────────────────────────────
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
      // Browser will redirect to the OAuth provider
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth login failed");
      setLoading(false);
    }
  };

  // ─── Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only existing users
        },
      });
      if (otpError) {
        if (otpError.message.includes("rate")) {
          throw new Error(
            "Too many requests. Please wait a moment before trying again."
          );
        }
        if (otpError.message.includes("Signups not allowed")) {
          throw new Error(
            "No account found with this email. Please sign up first."
          );
        }
        throw otpError;
      }
      setSuccessMsg(`Verification code sent to ${email}`);
      setMode("otp-verify");
      startCountdown();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (verifyError) {
        if (verifyError.message.includes("expired")) {
          throw new Error(
            "The verification code has expired. Request a new code."
          );
        }
        if (verifyError.message.includes("invalid")) {
          throw new Error(
            "Invalid verification code. Please check and try again."
          );
        }
        throw verifyError;
      }

      if (data.user) {
        // Fetch user role to redirect correctly
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const role = (userData?.role as UserRole) || "student";
        const portalPrefix = ROLE_PORTAL_MAP[role] || "/student";

        router.refresh();
        router.push(`${portalPrefix}/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP input helpers ──────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
    if (e.key === "Enter" && otpDigits.join("").length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      const last = document.getElementById(`otp-5`);
      last?.focus();
    }
  };

  const startCountdown = () => {
    setOtpCountdown(45);
    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtpDigits(Array(6).fill(""));
    handleSendOtp();
  };

  // ─── OTP Verify View ───────────────────────────────────────────────
  if (mode === "otp-verify") {
    return (
      <Card className="border-border/40 shadow-2xl shadow-primary/[0.06] dark:shadow-primary/[0.08] animate-scale-in">
        <CardHeader className="text-center pb-3">
          <button
            onClick={() => {
              setMode("otp-send");
              setError("");
              setSuccessMsg("");
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-18 h-18 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-xl animate-pulse-glow">
            <KeyRound className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold">Verify your email</h1>
          <p className="text-[0.95rem] text-muted-foreground mt-2">
            We&apos;ve sent a 6-digit code to
          </p>
          <p className="text-[0.95rem] font-semibold text-foreground">{email}</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* OTP input boxes */}
            <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-13 h-16 text-center text-2xl font-bold rounded-xl border border-border/50 bg-background focus:border-primary focus:ring-3 focus:ring-primary/20 outline-none transition-all duration-200"
                  autoFocus={i === 0}
                />
              ))}
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
              disabled={loading || otpDigits.join("").length !== 6}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {otpCountdown > 0 ? (
              <p className="font-medium">Resend code in {otpCountdown}s</p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                disabled={loading}
              >
                Resend code
              </button>
            )}
            <p className="mt-2 text-xs">
              Didn&apos;t receive it? Check spam or{" "}
              <button
                onClick={handleResendOtp}
                className="text-primary hover:text-primary/80 font-medium"
                disabled={otpCountdown > 0 || loading}
              >
                resend
              </button>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Main Login View ────────────────────────────────────────────────
  return (
    <Card className="border-border/40 shadow-2xl shadow-primary/[0.06] dark:shadow-primary/[0.08] animate-scale-in">
      <CardHeader className="text-center pb-3">
        <h1 className="text-3xl font-extrabold">Welcome back</h1>
        <p className="text-[0.95rem] text-muted-foreground mt-1">Sign in to SkillSetu</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* OAuth buttons */}
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

        {mode === "password" ? (
          <>
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[0.9rem] font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="login-email"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-pw" className="text-[0.9rem] font-semibold">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="login-pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 text-[0.95rem] rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <button
              onClick={() => {
                setMode("otp-send");
                setError("");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <KeyRound className="w-3.5 h-3.5 inline mr-1.5" />
              Sign in with email code instead
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email" className="text-[0.9rem] font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-11 h-12 text-[0.95rem] rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 font-medium">
                  {error}
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
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {loading ? "Sending code..." : "Send Verification Code"}
              </Button>
            </form>
            <button
              onClick={() => {
                setMode("password");
                setError("");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <Lock className="w-3.5 h-3.5 inline mr-1.5" />
              Sign in with password instead
            </button>
          </>
        )}

        <p className="text-center text-[0.9rem] text-muted-foreground">
          No account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="animate-shimmer h-[500px] rounded-2xl" />}
    >
      <LoginForm />
    </Suspense>
  );
}
