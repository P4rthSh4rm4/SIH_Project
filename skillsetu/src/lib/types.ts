// ─── User Roles ────────────────────────────────────────────
export type UserRole =
  | "student"
  | "industry"
  | "academician"
  | "institution_admin"
  | "super_admin";

/** Roles a normal user can self-assign during signup */
export const SELF_ASSIGNABLE_ROLES: UserRole[] = [
  "student",
  "industry",
  "academician",
];

/** Map each role to its portal route prefix */
export const ROLE_PORTAL_MAP: Record<UserRole, string> = {
  student: "/student",
  industry: "/industry",
  academician: "/academician",
  institution_admin: "/institution",
  super_admin: "/admin",
};

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url?: string;
  institution_id?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Skills ────────────────────────────────────────────────
export interface Skill {
  id: string;
  name: string;
  category: string;
  source_taxonomy?: string; // e.g. "ESCO", "O*NET", "Lightcast"
  external_id?: string;
}

export interface StudentSkill {
  student_id: string;
  skill_id: string;
  skill?: Skill;
  proficiency_score: number; // 0-100
  verified: boolean;
  source: "assessment" | "certificate" | "manual" | "ai_inferred";
}

// ─── Assessments ───────────────────────────────────────────
export interface Assessment {
  id: string;
  student_id: string;
  type: "questionnaire" | "aptitude" | "ai_conversation";
  responses_json: Record<string, unknown>;
  generated_profile_json: Record<string, unknown>;
  taken_at: string;
}

// ─── Opportunities ─────────────────────────────────────────
export type OpportunityType =
  | "internship"
  | "job"
  | "micro-internship"
  | "bounty";

export type OpportunityStatus = "draft" | "pending" | "active" | "rejected" | "closed" | "archived";

export interface Opportunity {
  id: string;
  industry_id: string;
  type: OpportunityType;
  title: string;
  description: string;
  required_skills: string[]; // skill IDs
  location?: string;
  stipend?: string;
  deadline?: string;
  status: OpportunityStatus;
  created_at: string;
  company?: string;
  company_name?: string;
  verifiedBy?: string;
  sharedBy?: string;
  
  // Advanced Recruitment Fields
  work_mode?: "On-site" | "Hybrid" | "Remote";
  duration?: string;
  start_date?: string;
  positions?: number;
  preferred_skills?: string[]; // skill IDs
  eligibility_requirements?: Record<string, unknown>;
  assessment_requirements?: Record<string, unknown>;
  hiring_process?: string[]; // Custom stages
  smart_screening_requirements?: Record<string, unknown>;
}

// ─── Applications ──────────────────────────────────────────
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  opportunity_id: string;
  student_id: string;
  status: ApplicationStatus;
  applied_at: string;
  match_score?: number;
  opportunity?: Opportunity;
}

// ─── Learning Programs ─────────────────────────────────────
export interface LearningProgram {
  id: string;
  industry_id?: string;
  provider?: string;
  title: string;
  type: string;
  skills_covered: string[];
  url?: string;
  status?: string;
  duration?: string;
  capacity?: number;
  description?: string;
  enrolled_count?: number;
}

// ─── Certifications ────────────────────────────────────────
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface Certification {
  id: string;
  student_id: string;
  title: string;
  issuer: string;
  verified: boolean;
  credential_hash?: string;
  credential_id?: string;
  certificate_url?: string;
  verification_status: VerificationStatus;
  issued_at: string;
}

// ─── Academician ───────────────────────────────────────────
export type AcademicianOpportunityType =
  | "FDP"
  | "consultancy"
  | "research"
  | "guest-lecture";

export interface AcademicianOpportunity {
  id: string;
  type: AcademicianOpportunityType;
  title: string;
  host_industry_id?: string;
  description: string;
  deadline?: string;
}

// ─── Mentorship ────────────────────────────────────────────
export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: "active" | "completed" | "cancelled";
  notes?: string;
}

// ─── Placement Records ────────────────────────────────────
export interface PlacementRecord {
  id: string;
  student_id: string;
  opportunity_id: string;
  outcome: "placed" | "not_placed";
  package?: string;
  date: string;
}

// ─── Notifications ─────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload_json: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ─── Institutions ──────────────────────────────────────────
export interface Institution {
  id: string;
  name: string;
  type: string;
  address?: string;
}

// ─── Student Profile ───────────────────────────────────────
export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export interface StudentProfile {
  id: string;
  user_id: string;
  bio?: string;
  resume_url?: string;
  portfolio_json?: Record<string, unknown>;
  career_objective?: string;
  linkedin?: string;
  github?: string;
  portfolio_website?: string;
  location?: string;
  phone?: string;
  dob?: string;
  gender?: Gender;
  updated_at?: string;
}

// ─── Student Education ─────────────────────────────────────
export interface StudentEducation {
  id: string;
  user_id: string;
  institute: string;
  degree: string;
  branch?: string;
  cgpa?: number;
  start_year?: number;
  end_year?: number;
  created_at: string;
}

// ─── Student Experience ────────────────────────────────────
export type ExperienceType = "internship" | "project" | "research" | "part_time";

export interface StudentExperience {
  id: string;
  user_id: string;
  type: ExperienceType;
  title: string;
  organization?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  created_at: string;
}

// ─── Profile Form Data (merged user + student_profile) ─────
export interface ProfileFormData {
  // From users table
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  institution_id?: string;
  // From student_profiles table
  student_profile_id?: string;
  bio?: string;
  career_objective?: string;
  linkedin?: string;
  github?: string;
  portfolio_website?: string;
  location?: string;
  phone?: string;
  dob?: string;
  gender?: Gender;
  resume_url?: string;
  portfolio_json?: Record<string, unknown>;
}

// ─── Profile Completion ────────────────────────────────────
export interface ProfileCompletionItem {
  label: string;
  completed: boolean;
  weight: number;
}

export interface ProfileCompletionResult {
  percentage: number;
  items: ProfileCompletionItem[];
}

// ─── Gamification ──────────────────────────────────────────
export interface StudentGamification {
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at: string;
}

export type ActivityAction =
  | "assessment_completed"
  | "course_enrolled"
  | "course_completed"
  | "certification_earned"
  | "profile_updated"
  | "portfolio_item_added"
  | "application_submitted"
  | "document_uploaded"
  | "login"
  | "badge_earned"
  | "skill_added"
  | "streak_milestone";

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityAction;
  xp_earned: number;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  criteria_json: Record<string, unknown>;
}

export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  current_streak: number;
  rank: number;
}

// ─── Documents ─────────────────────────────────────────────
export type DocumentType = "resume" | "academic" | "internship_report" | "other";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: DocumentType;
  file_url: string;
  file_size?: number;
  uploaded_at: string;
}

// ─── Learning Enrollments ──────────────────────────────────
export interface LearningEnrollment {
  id: string;
  student_id: string;
  program_id: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  lesson_progress_json?: Record<string, {
    duration: number;
    last_position: number;
    watched_ranges: [number, number][];
    completed: boolean;
  }>;
  program?: LearningProgram;
}

// ─── Portfolio Items ───────────────────────────────────────
export type PortfolioItemType = "project" | "achievement" | "internship";

export interface PortfolioItem {
  id: string;
  user_id: string;
  type: PortfolioItemType;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  created_at: string;
}

// ─── Award XP Response ─────────────────────────────────────
export interface AwardXpResult {
  xp_earned: number;
  total_xp: number;
  level: number;
  streak: number;
}
