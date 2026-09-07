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
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Skill Mapping",
    description:
      "Sentence-transformer powered skill embeddings map your abilities against industry demand in real time.",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
  },
  {
    icon: Target,
    title: "Smart Matching",
    description:
      "Our ML engine ranks opportunities by how well they fit your unique skill profile — not just keywords.",
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
  },
  {
    icon: Sparkles,
    title: "Career Copilot",
    description:
      "An AI-powered chatbot that helps refine your skill profile, suggests learning paths, and answers career questions.",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
  },
  {
    icon: Shield,
    title: "Verified Credentials",
    description:
      "Certificates are OCR-scanned and institution-verified before earning a trusted badge on your portfolio.",
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description:
      "Institutions get real-time dashboards showing skill trends, placement rates, and gap analysis.",
    gradient: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-500/10 dark:bg-pink-500/15",
  },
  {
    icon: Zap,
    title: "Instant Applications",
    description:
      "Apply to internships, micro-internships, and skill bounties with one click — tracked end to end.",
    gradient: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
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
    bgColor: "bg-violet-500/10 dark:bg-violet-500/15",
    borderActive: "border-violet-500/30",
  },
  {
    icon: Building2,
    title: "Industry",
    description:
      "Post opportunities, get AI-ranked candidate shortlists, run programs.",
    href: "/auth/signup?role=industry",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
    borderActive: "border-blue-500/30",
  },
  {
    icon: BookOpen,
    title: "Academicians",
    description:
      "Find FDPs, research collaborations, consulting, and guest lectures.",
    href: "/auth/signup?role=academician",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
    borderActive: "border-emerald-500/30",
  },
  {
    icon: BarChart3,
    title: "Institutions",
    description:
      "Track placements, manage rosters, verify credentials — all in one place.",
    href: "/auth/signup?role=institution_admin",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
    borderActive: "border-amber-500/30",
  },
];

const stats = [
  { value: 50000, suffix: "+", label: "Skills Mapped" },
  { value: 10000, suffix: "+", label: "Students" },
  { value: 500, suffix: "+", label: "Companies" },
  { value: 95, suffix: "%", label: "Match Accuracy" },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const display = count >= 1000 ? `${(count / 1000).toFixed(count >= target ? 0 : 1)}K` : count.toString();

  return (
    <div ref={ref} className="text-4xl sm:text-5xl font-extrabold gradient-text tracking-tight">
      {display}{suffix}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Skill<span className="gradient-text">Setu</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { href: "#features", label: "Features" },
                { href: "#roles", label: "For You" },
                { href: "#stats", label: "Impact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-[0.9rem] text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-accent/60 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl hover:bg-accent/60 transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105"
                aria-label="Toggle theme"
              >
                <Sun className="w-[18px] h-[18px] hidden dark:block" />
                <Moon className="w-[18px] h-[18px] block dark:hidden" />
              </button>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-[0.9rem] font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all text-white shadow-lg shadow-primary/25 shimmer-hover text-[0.9rem]"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2.5 rounded-xl hover:bg-accent/60 transition-colors"
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
          <div className="md:hidden border-t border-border/50 glass animate-slide-up">
            <div className="px-5 py-5 space-y-2">
              {[
                { href: "#features", label: "Features" },
                { href: "#roles", label: "For You" },
                { href: "#stats", label: "Impact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-[0.95rem] font-medium rounded-xl hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border/50 flex gap-3">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full h-11">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button
                    className="w-full h-11 bg-gradient-to-r from-primary to-chart-4 text-white"
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
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden mesh-bg noise-bg">
        {/* Decorative orbs */}
        <div className="absolute top-16 left-[5%] w-80 h-80 bg-primary/10 dark:bg-primary/15 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-10 right-[5%] w-[28rem] h-[28rem] bg-chart-4/10 dark:bg-chart-4/15 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-chart-2/5 dark:bg-chart-2/8 rounded-full blur-[120px]"
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-8 px-5 py-2 text-sm font-medium border border-primary/20 bg-primary/5 backdrop-blur-sm animate-fade-in"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Smart India Hackathon 2024 — PS 26044
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 text-balance animate-slide-up">
            Bridge the Gap Between{" "}
            <span className="gradient-text">Academia</span>
            <br className="hidden sm:block" /> &{" "}
            <span className="gradient-text">Industry</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up stagger-1">
            AI-powered skill mapping, personalised internship matching, and
            verified digital portfolios — built for students, recruiters,
            academicians, and institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="text-base px-8 h-13 bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] shimmer-hover"
              >
                Start Your Skill Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-13 hover:bg-accent/60 transition-all backdrop-blur-sm"
              >
                See How It Works
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex items-center justify-center gap-5 sm:gap-8 text-sm text-muted-foreground animate-fade-in stagger-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/60 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Supabase Auth</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/60 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Real-time Matching</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/60 backdrop-blur-sm">
              <BrainCircuit className="w-4 h-4 text-violet-500" />
              <span className="font-medium">AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section id="stats" className="border-y border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-5 px-4 py-1.5 text-sm border border-primary/20 bg-primary/5"
            >
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-balance">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From AI-driven skill assessment to verified portfolios, SkillSetu
              covers the entire journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className={`group relative overflow-hidden border-border/40 bg-card/80 hover:shadow-2xl hover:shadow-primary/[0.06] dark:hover:shadow-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <CardContent className="p-7">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-[0.95rem] text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles Section ─── */}
      <section id="roles" className="py-28 md:py-36 mesh-bg noise-bg">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-5 px-4 py-1.5 text-sm border border-primary/20 bg-primary/5"
            >
              Built For Everyone
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-balance">
              One Platform,{" "}
              <span className="gradient-text">Four Perspectives</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Whether you&apos;re a student, recruiter, professor, or admin —
              SkillSetu has your portal ready.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((role) => (
              <Link key={role.title} href={role.href}>
                <Card className="group h-full border-border/40 bg-card/80 hover:shadow-2xl hover:shadow-primary/[0.06] dark:hover:shadow-primary/[0.08] transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                  <CardContent className="p-7 flex flex-col h-full">
                    <div
                      className={`w-16 h-16 rounded-2xl ${role.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-500`}
                    >
                      <role.icon className={`w-8 h-8 ${role.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2.5">{role.title}</h3>
                    <p className="text-[0.95rem] text-muted-foreground leading-relaxed flex-1">
                      {role.description}
                    </p>
                    <div
                      className={`mt-5 flex items-center gap-1.5 text-[0.95rem] font-semibold ${role.color} group-hover:gap-3 transition-all duration-300`}
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
      <section className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="relative p-14 md:p-20 rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-chart-4/10 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 mesh-bg" />
            <div className="absolute inset-0 noise-bg" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-balance">
                Ready to Build Your{" "}
                <span className="gradient-text">Skill Profile</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                Join thousands of students, recruiters, and institutions already
                using SkillSetu to bridge the academia–industry gap.
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="text-base px-10 h-13 bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] shimmer-hover"
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
      <footer className="border-t border-border/40 py-14 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Skill<span className="gradient-text">Setu</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Built for Smart India Hackathon 2024 — PS 26044
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
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
