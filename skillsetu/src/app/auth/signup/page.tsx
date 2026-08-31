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
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2,
  GraduationCap, Building2, BookOpen, BarChart3,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Find internships & build your portfolio" },
  { value: "industry", label: "Industry / Recruiter", icon: Building2, desc: "Post opportunities & find talent" },
  { value: "academician", label: "Academician", icon: BookOpen, desc: "FDPs, research & consultancy" },
  { value: "institution", label: "Institution Admin", icon: BarChart3, desc: "Manage placements & analytics" },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") as UserRole | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(preselectedRole || "student");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: selectedRole,
          }
        }
      });

      if (authError) throw authError;

      if (data.session) {
        router.refresh();
        router.push(`/${selectedRole}/dashboard`);
      } else {
        setSuccessMsg("Account created! Please check your email to confirm your registration.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-2xl shadow-primary/5">
      <CardHeader className="text-center pb-2">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join the SkillSetu community</p>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        {/* Role selector */}
        <div className="space-y-2">
          <Label>I am a...</Label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  selectedRole === role.value
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
                }`}
              >
                <role.icon className={`w-5 h-5 mb-1 ${selectedRole === role.value ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-medium">{role.label}</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{role.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-10 text-sm">
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
          <Button variant="outline" className="h-10 text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">or</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="signup-name" placeholder="Your name" className="pl-10 h-11" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="signup-email" type="email" placeholder="you@example.com" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-pw">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="signup-pw" type={showPw ? "text" : "password"} placeholder="Min 8 characters" className="pl-10 pr-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          {successMsg && <p className="text-sm text-green-600 bg-green-500/10 rounded-lg px-3 py-2">{successMsg}</p>}
          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:text-primary/80">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="animate-shimmer h-[600px] rounded-xl" />}>
      <SignupForm />
    </Suspense>
  );
}
