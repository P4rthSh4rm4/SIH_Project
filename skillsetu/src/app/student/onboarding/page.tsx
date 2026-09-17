"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { awardXp } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Code2,
  Leaf,
  Pill,
  CheckCircle2,
  Building,
  Calendar,
  Award,
  Compass,
  MapPin,
  Phone,
  ExternalLink,
  Globe,
  Plus,
  X,
  Loader2,
  Check,
  BookOpen,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type { Department } from "@/lib/types";

const DEPARTMENTS = [
  {
    id: "CSE",
    name: "Computer Science & Engineering",
    shortName: "CSE",
    icon: Code2,
    color: "text-blue-500",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    defaultSkills: [
      "Python",
      "Java",
      "React",
      "TypeScript",
      "Node.js",
      "SQL",
      "Data Structures",
      "Machine Learning",
      "Next.js",
      "Cloud & DevOps",
    ],
  },
  {
    id: "Ayurveda",
    name: "Ayurvedic Medicine & Surgery (BAMS)",
    shortName: "Ayurveda",
    icon: Leaf,
    color: "text-emerald-500",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    defaultSkills: [
      "Dravyaguna",
      "Panchakarma",
      "Ayurvedic Formulation",
      "Rasashastra",
      "Nadi Pariksha",
      "Charaka Samhita",
      "Herbal Pharmacology",
      "Clinical Diagnosis",
    ],
  },
  {
    id: "BPharma",
    name: "Pharmaceutical Sciences (B.Pharm)",
    shortName: "BPharma",
    icon: Pill,
    color: "text-purple-500",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    defaultSkills: [
      "Pharmacology",
      "Pharmaceutics",
      "Pharmacovigilance",
      "Clinical Trials",
      "Quality Assurance",
      "Medicinal Chemistry",
      "Regulatory Affairs",
      "Biopharmaceutics",
    ],
  },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // User details
  const [userId, setUserId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Step state / department
  const [department, setDepartment] = useState<Department>("CSE");

  // Academic Details
  const [institute, setInstitute] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("3rd Year");
  const [endYear, setEndYear] = useState("2026");
  const [cgpa, setCgpa] = useState("");

  // Career & Bio
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Links
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Pre-load user info
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);
        const meta = user.user_metadata || {};
        setName(meta.name || meta.full_name || user.email?.split("@")[0] || "");
        setEmail(user.email || "");

        const initialDept = (meta.department as Department) || "CSE";
        setDepartment(initialDept);

        // Prepopulate default headline and skills based on initial department
        const deptObj = DEPARTMENTS.find((d) => d.id === initialDept) || DEPARTMENTS[0];
        setSelectedSkills(deptObj.defaultSkills.slice(0, 4));

        if (initialDept === "CSE") {
          setDegree("B.Tech Computer Science");
          setHeadline("Aspiring Software Engineer & Problem Solver");
        } else if (initialDept === "Ayurveda") {
          setDegree("BAMS (Bachelor of Ayurvedic Medicine & Surgery)");
          setHeadline("Ayurvedic Intern & Holistic Health Researcher");
        } else if (initialDept === "BPharma") {
          setDegree("B.Pharm (Bachelor of Pharmacy)");
          setHeadline("Pharmaceutical Sciences Researcher & Quality Analyst");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  // Handle department change
  const handleDepartmentSelect = (deptId: Department) => {
    setDepartment(deptId);
    const deptObj = DEPARTMENTS.find((d) => d.id === deptId);
    if (deptObj) {
      // Refresh skills suggestion
      setSelectedSkills(deptObj.defaultSkills.slice(0, 4));
      if (deptId === "CSE") {
        setDegree("B.Tech Computer Science");
        setHeadline("Aspiring Software Engineer & Problem Solver");
      } else if (deptId === "Ayurveda") {
        setDegree("BAMS (Bachelor of Ayurvedic Medicine & Surgery)");
        setHeadline("Ayurvedic Intern & Holistic Health Researcher");
      } else if (deptId === "BPharma") {
        setDegree("B.Pharm (Bachelor of Pharmacy)");
        setHeadline("Pharmaceutical Sciences Researcher & Quality Analyst");
      }
    }
  };

  // Toggle skills
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput("");
    }
  };

  // Skip straight to dashboard
  const handleSkip = async () => {
    setSkipping(true);
    try {
      const supabase = createClient();
      if (userId) {
        // Mark onboarding completed in users table
        await supabase
          .from("users")
          .update({ onboarding_completed: true, department })
          .eq("id", userId);

        // Keep metadata updated
        await supabase.auth.updateUser({
          data: { onboarding_completed: true, department },
        });
      }
      toast.info("Welcome to your dashboard! You can update your profile anytime.");
      router.refresh();
      router.push("/student/dashboard");
    } catch (err) {
      console.error("Error skipping onboarding:", err);
      router.push("/student/dashboard");
    } finally {
      setSkipping(false);
    }
  };

  // Submit and save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createClient();
      if (!userId) throw new Error("User session expired. Please log in again.");

      // 1. Update public.users
      const { error: userErr } = await supabase
        .from("users")
        .update({
          name: name.trim() || undefined,
          department,
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (userErr && !userErr.message?.includes("department")) {
        console.warn("User update notice:", userErr.message);
      }

      // Sync auth metadata
      await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          department,
          onboarding_completed: true,
        },
      });

      // 2. Upsert student_profiles
      const { error: spErr } = await supabase
        .from("student_profiles")
        .upsert(
          {
            user_id: userId,
            department,
            career_objective: headline.trim() || null,
            bio: bio.trim() || null,
            location: location.trim() || null,
            phone: phone.trim() || null,
            linkedin: linkedin.trim() || null,
            portfolio_website: portfolio.trim() || null,
          },
          { onConflict: "user_id" }
        );

      if (spErr && !spErr.message?.includes("department")) {
        console.warn("Student profile update notice:", spErr.message);
      }

      // 3. Insert student_education if institute or degree provided
      if (institute.trim() || degree.trim()) {
        await supabase.from("student_education").insert({
          user_id: userId,
          institute: institute.trim() || "University",
          degree: degree.trim() || "Undergraduate",
          branch: branch.trim() || (department as string),
          cgpa: cgpa ? parseFloat(cgpa) : null,
          end_year: endYear ? parseInt(endYear) : new Date().getFullYear() + 1,
        });
      }

      // 4. Link selected skills
      if (selectedSkills.length > 0) {
        for (const skillName of selectedSkills) {
          // Check if skill exists in master table or insert it
          let skillId: string | null = null;
          const { data: existingSkill } = await supabase
            .from("skills")
            .select("id")
            .ilike("name", skillName)
            .maybeSingle();

          if (existingSkill?.id) {
            skillId = existingSkill.id;
          } else {
            const { data: newSkill } = await supabase
              .from("skills")
              .insert({
                name: skillName,
                category: department as string,
              })
              .select("id")
              .single();
            skillId = newSkill?.id ?? null;
          }

          if (skillId) {
            await supabase.from("student_skills").upsert(
              {
                student_id: userId,
                skill_id: skillId,
                proficiency_score: 70,
                source: "manual",
                verified: false,
              },
              { onConflict: "student_id,skill_id" }
            );
          }
        }
      }

      // 5. Award welcome onboarding XP
      await awardXp("profile_updated", {
        step: "onboarding_completed",
        skills_count: selectedSkills.length,
        department,
      });

      toast.success("Profile setup complete! Welcome aboard! 🎉", {
        description: "Your personalized dashboard is ready.",
      });

      router.refresh();
      router.push("/student/dashboard");
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeptObj =
    DEPARTMENTS.find((d) => d.id === department) || DEPARTMENTS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Setting up your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      {/* Top Header / Brand & Skip Bar */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20">
            S
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-tight">SkillSetu</div>
            <div className="text-xs text-muted-foreground font-medium">Student Onboarding</div>
          </div>
        </div>

        {/* Skip button at top right */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          disabled={skipping || submitting}
          className="text-muted-foreground hover:text-foreground font-semibold text-sm group"
        >
          {skipping ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : null}
          Skip for now & go to Dashboard
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Hero Welcome Banner */}
      <div className="max-w-4xl mx-auto mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Quick Profile Setup
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Welcome to SkillSetu{name ? `, ${name}` : ""}! 🚀
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Help us tailor opportunities, assessments, and roadmap programs to your academic discipline.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="max-w-4xl mx-auto space-y-7 pb-16">
        {/* ─── SECTION 1: Department Selection ─────────────────────── */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  1. Your Department
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Choose your department so we can categorize your curriculum & opportunities.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold text-primary border-primary/30">
                {activeDeptObj.shortName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEPARTMENTS.map((dept) => {
                const isSelected = department === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentSelect(dept.id as Department)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30"
                        : "border-border/60 hover:border-primary/30 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2 rounded-xl ${dept.bg}`}>
                        <dept.icon className={`w-5 h-5 ${dept.color}`} />
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      ) : null}
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight">{dept.shortName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {dept.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 2: Academic Foundations ───────────────────────── */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              2. Academic Foundations
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Your college/institute details to connect you with campus drives & peer networks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institute" className="text-xs font-semibold">
                  College / University Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="institute"
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                    placeholder="e.g. Panipat Institute of Engg & Tech"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree" className="text-xs font-semibold">
                  Degree / Program
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech / BAMS / B.Pharma"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentYear" className="text-xs font-semibold">
                  Current Year / Semester
                </Label>
                <Input
                  id="currentYear"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  placeholder="e.g. 3rd Year / 6th Sem"
                  className="h-11 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endYear" className="text-xs font-semibold">
                  Expected Graduation Year
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="endYear"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgpa" className="text-xs font-semibold">
                  Current CGPA / Percentage
                </Label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cgpa"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.5 or 85%"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 3: Career Headline & Bio ─────────────────────── */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              3. Career Objective & About You
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Give recruiters and academic mentors a quick snapshot of what drives you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="text-xs font-semibold">
                Your Full Name
              </Label>
              <Input
                id="student-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Naitik"
                className="h-11 text-sm rounded-xl font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline" className="text-xs font-semibold">
                Professional Headline / Objective
              </Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full Stack Developer eager to build scalable web apps"
                className="h-11 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-semibold">
                Brief Bio (1-2 sentences)
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="A quick summary of your background, passions, and what you are learning right now..."
                className="rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold">
                  Location (City, State)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gurugram, Haryana"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 4: Department-Specific Key Skills ─────────────── */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  4. Top Skills & Focus Areas
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Click to select key competencies tailored to {activeDeptObj.shortName}, or add your own.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {selectedSkills.length} selected
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Suggested Skills for Active Department */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Suggested for {activeDeptObj.shortName}:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeDeptObj.defaultSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-primary text-white shadow-sm ring-1 ring-primary/40"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 opacity-60" />
                      )}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="flex items-center gap-2 max-w-md pt-2">
              <Input
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="Add other skill (e.g. Docker, Ayurveda Dietetics...)"
                className="h-10 text-xs rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomSkill}
                className="h-10 text-xs px-3 rounded-xl shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>

            {/* Active Selected Skills Pills */}
            {selectedSkills.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Your Profile Skills:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-destructive transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── SECTION 5: Professional Links (Optional) ─────────────── */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              5. Professional Profiles (Optional)
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Add your portfolio, GitHub, or LinkedIn so employers can review your work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-xs font-semibold">
                  LinkedIn Profile
                </Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-xs font-semibold">
                  Portfolio / GitHub / Website
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="portfolio"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://github.com/username or your site"
                    className="pl-10 h-11 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Form Actions / Submit & Skip ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={skipping || submitting}
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground"
          >
            {skipping ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Skip for now & go to Dashboard
          </Button>

          <Button
            type="submit"
            disabled={submitting || skipping}
            className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-95 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving Profile...
              </>
            ) : (
              <>
                Complete Profile & Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
