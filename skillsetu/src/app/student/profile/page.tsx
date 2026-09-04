"use client";

import { useState, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Award,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast, Toaster } from "sonner";

// Hooks
import { useProfileData } from "@/lib/hooks/useProfileData";
import { useUpdateProfile } from "@/lib/hooks/useUpdateProfile";
import { useEducation } from "@/lib/hooks/useEducation";
import { useExperience } from "@/lib/hooks/useExperience";
import { useProfileSkills } from "@/lib/hooks/useProfileSkills";
import { useCertifications } from "@/lib/hooks/useCertifications";
import { useResume } from "@/lib/hooks/useResume";

// Utils
import { calculateProfileCompletion } from "@/lib/profile-completion";

// Components
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileCompletionCard } from "@/components/profile/profile-completion-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { EducationSection } from "@/components/profile/education-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { CertificationsSection } from "@/components/profile/certifications-section";
import { ResumeSection } from "@/components/profile/resume-section";

import type { ProfileFormData } from "@/lib/types";

export default function ProfilePage() {
  // ─── Data Hooks ───────────────────────────────────────────
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileData();

  const { updateProfile, saving } = useUpdateProfile();
  const eduHook = useEducation();
  const expHook = useExperience();
  const skillsHook = useProfileSkills();
  const certsHook = useCertifications();
  const resumeHook = useResume();

  // ─── Local Form State (optimistic) ───────────────────────
  const [formOverrides, setFormOverrides] = useState<
    Partial<ProfileFormData>
  >({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Merge server data with local overrides
  const formData: ProfileFormData | null = useMemo(() => {
    if (!profile) return null;
    return { ...profile, ...formOverrides };
  }, [profile, formOverrides]);

  // ─── Profile Completion ───────────────────────────────────
  const completion = useMemo(() => {
    return calculateProfileCompletion({
      profile: formData,
      education: eduHook.education,
      experience: expHook.experiences,
      skills: skillsHook.skills,
      certifications: certsHook.certifications,
    });
  }, [
    formData,
    eduHook.education,
    expHook.experiences,
    skillsHook.skills,
    certsHook.certifications,
  ]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleFormChange = useCallback(
    (data: Partial<ProfileFormData>) => {
      setFormOverrides((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const handleAvatarChange = useCallback((file: File) => {
    setAvatarFile(file);
    // Optimistic preview
    const preview = URL.createObjectURL(file);
    setFormOverrides((prev) => ({ ...prev, avatar_url: preview }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData) return;

    const result = await updateProfile(formOverrides, avatarFile);

    if (result.success) {
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved to the database.",
      });
      setFormOverrides({});
      setAvatarFile(null);
      refetchProfile();
    } else {
      toast.error("Failed to save profile", {
        description: result.error,
      });
    }
  }, [formData, formOverrides, avatarFile, updateProfile, refetchProfile]);

  // ─── Loading State ────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal and academic details
          </p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────
  if (profileError || !formData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal and academic details
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Failed to load profile
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            {profileError ?? "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={refetchProfile}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "border-border/50 bg-card text-card-foreground shadow-lg",
        }}
        richColors
        closeButton
      />

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">My Profile</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal and academic details
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        profile={formData}
        onAvatarChange={handleAvatarChange}
      />

      {/* Completion Card */}
      <ProfileCompletionCard completion={completion} />

      {/* Tabbed Content */}
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Education
          </TabsTrigger>
          <TabsTrigger value="experience">
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="resume">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Resume
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <ProfileForm
            profile={formData}
            onChange={handleFormChange}
            onSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-4">
          <EducationSection
            education={eduHook.education}
            loading={eduHook.loading}
            onAdd={eduHook.addEducation}
            onUpdate={eduHook.updateEducation}
            onDelete={eduHook.deleteEducation}
          />
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="mt-4">
          <ExperienceSection
            experiences={expHook.experiences}
            loading={expHook.loading}
            onAdd={expHook.addExperience}
            onUpdate={expHook.updateExperience}
            onDelete={expHook.deleteExperience}
          />
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-4">
          <SkillsSection
            skills={skillsHook.skills}
            loading={skillsHook.loading}
            onAdd={skillsHook.addSkill}
            onRemove={skillsHook.removeSkill}
            onSearch={skillsHook.searchSkills}
          />
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="mt-4">
          <CertificationsSection
            certifications={certsHook.certifications}
            loading={certsHook.loading}
            onAdd={certsHook.addCertification}
            onUpdate={certsHook.updateCertification}
            onDelete={certsHook.deleteCertification}
          />
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume" className="mt-4">
          <ResumeSection
            resumeUrl={formData.resume_url}
            uploading={resumeHook.uploading}
            onUpload={resumeHook.uploadResume}
            onDelete={resumeHook.deleteResume}
            onGetSignedUrl={resumeHook.getResumeSignedUrl}
            onRefetch={refetchProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
