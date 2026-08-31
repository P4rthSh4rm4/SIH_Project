"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Users,
  BrainCircuit,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Skill Mapping",
    description:
      "Sentence-transformer powered skill embeddings map your abilities against industry demand in real time.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Smart Matching",
    description:
      "Our ML engine ranks opportunities by how well they fit your unique skill profile — not just keywords.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Career Copilot",
    description:
      "An AI-powered chatbot that helps refine your skill profile, suggests learning paths, and answers career questions.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Verified Credentials",
    description:
      "Certificates are OCR-scanned and institution-verified before earning a trusted badge on your portfolio.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description:
      "Institutions get real-time dashboards showing skill trends, placement rates, and gap analysis.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Instant Applications",
    description:
      "Apply to internships, micro-internships, and skill bounties with one click — tracked end to end.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Discover your skills, find internships, build a verified digital portfolio.",
    href: "/auth/signup?role=student",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Building2,
    title: "Industry",
    description:
      "Post opportunities, get AI-ranked candidate shortlists, run programs.",
    href: "/auth/signup?role=industry",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: BookOpen,
    title: "Academicians",
    description:
      "Find FDPs, research collaborations, consulting, and guest lectures.",
    href: "/auth/signup?role=academician",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Institutions",
    description:
      "Track placements, manage rosters, verify credentials — all in one place.",
    href: "/auth/signup?role=institution",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const stats = [
  { value: "50K+", label: "Skills Mapped" },
  { value: "10K+", label: "Students" },
  { value: "500+", label: "Companies" },
  { value: "95%", label: "Match Accuracy" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Skill<span className="gradient-text">Setu</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="#features"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                Features
              </Link>
              <Link
                href="#roles"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                For You
              </Link>
              <Link
                href="#stats"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                Impact
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                <Sun className="w-4 h-4 hidden dark:block" />
                <Moon className="w-4 h-4 block dark:hidden" />
              </button>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 glass">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="#features"
                className="block px-3 py-2 text-sm rounded-lg hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#roles"
                className="block px-3 py-2 text-sm rounded-lg hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                For You
              </Link>
              <Link
                href="#stats"
                className="block px-3 py-2 text-sm rounded-lg hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Impact
              </Link>
              <div className="pt-2 border-t border-border/50 flex gap-2">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-chart-4 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden mesh-bg">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-2/5 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Smart India Hackathon 2024 — PS 26044
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Bridge the Gap Between{" "}
            <span className="gradient-text">Academia</span>
            <br className="hidden sm:block" /> &{" "}
            <span className="gradient-text">Industry</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered skill mapping, personalised internship matching, and
            verified digital portfolios — built for students, recruiters,
            academicians, and institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
              >
                Start Your Skill Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 hover:bg-accent transition-all"
              >
                See How It Works
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-14 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Supabase Auth</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Real-time Matching</span>
            </div>
            <span className="text-border hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-violet-500" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section id="stats" className="border-y border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1 text-xs border border-primary/20 bg-primary/5"
            >
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From AI-driven skill assessment to verified portfolios, SkillSetu
              covers the entire journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/80 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles Section ─── */}
      <section id="roles" className="py-24 md:py-32 mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1 text-xs border border-primary/20 bg-primary/5"
            >
              Built For Everyone
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              One Platform,{" "}
              <span className="gradient-text">Four Perspectives</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you&apos;re a student, recruiter, professor, or admin —
              SkillSetu has your portal ready.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <Link key={role.title} href={role.href}>
                <Card className="group h-full border-border/50 bg-card/80 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div
                      className={`w-14 h-14 rounded-2xl ${role.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <role.icon className={`w-7 h-7 ${role.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {role.description}
                    </p>
                    <div
                      className={`mt-4 flex items-center gap-1 text-sm font-medium ${role.color} group-hover:gap-2 transition-all`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-chart-4/10 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 mesh-bg" />
            <div className="relative">
              <Users className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to Build Your{" "}
                <span className="gradient-text">Skill Profile</span>?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Join thousands of students, recruiters, and institutions already
                using SkillSetu to bridge the academia–industry gap.
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="text-base px-10 h-12 bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">
                Skill<span className="gradient-text">Setu</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Smart India Hackathon 2024 — PS 26044
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
