import type {
  ProfileFormData,
  ProfileCompletionResult,
  ProfileCompletionItem,
  StudentEducation,
  StudentExperience,
  StudentSkill,
  Certification,
} from "@/lib/types";

interface CompletionInput {
  profile: ProfileFormData | null;
  education: StudentEducation[];
  experience: StudentExperience[];
  skills: StudentSkill[];
  certifications: Certification[];
}

/**
 * Calculate profile completion percentage based on weighted criteria.
 * Used by both the Profile page and Dashboard to show consistent progress.
 */
export function calculateProfileCompletion(
  input: CompletionInput
): ProfileCompletionResult {
  const { profile, education, experience, skills, certifications } = input;

  const items: ProfileCompletionItem[] = [
    {
      label: "Profile Photo",
      completed: !!profile?.avatar_url,
      weight: 10,
    },
    {
      label: "Bio",
      completed: !!profile?.bio && profile.bio.trim().length > 0,
      weight: 10,
    },
    {
      label: "Career Objective",
      completed:
        !!profile?.career_objective &&
        profile.career_objective.trim().length > 0,
      weight: 5,
    },
    {
      label: "Education",
      completed: education.length >= 1,
      weight: 15,
    },
    {
      label: "Skills (3+)",
      completed: skills.length >= 3,
      weight: 15,
    },
    {
      label: "Resume",
      completed: !!profile?.resume_url,
      weight: 10,
    },
    {
      label: "LinkedIn / Portfolio",
      completed: !!profile?.linkedin || !!profile?.portfolio_website,
      weight: 10,
    },
    {
      label: "Experience",
      completed: experience.length >= 1,
      weight: 15,
    },
    {
      label: "Location",
      completed: !!profile?.location && profile.location.trim().length > 0,
      weight: 5,
    },
    {
      label: "Phone",
      completed: !!profile?.phone && profile.phone.trim().length > 0,
      weight: 5,
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = items
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + item.weight, 0);

  const percentage =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return { percentage, items };
}
