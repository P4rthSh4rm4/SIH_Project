# MASTER PROMPT: Complete SkillSetu Student Portal Implementation

> **Target Audience**: AI Coding Agent / Full-Stack Engineer  
> **Repository**: `skillsetu` (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase, Google Gemini API)  
> **Scope**: Implement all 11 remaining pages in the Student Portal with Supabase connectivity and Gemini AI question generation.

---

## 0. Critical Directives & Boundaries

1. **DO NOT MODIFY COMPLETED PAGES**:
   - `/src/app/student/dashboard/page.tsx` (Dashboard is complete — use it as the benchmark for UI quality, Recharts patterns, and gamification hooks).
   - `/src/app/student/profile/page.tsx` (Profile is complete — use its tab structure, dialogs, form handling, and storage patterns).
   - `/src/app/student/layout.tsx` (Layout & sidebar are complete with routes `/student/*`).

2. **DATABASE INTEGRATION**:
   - **Database Provider**: Supabase PostgreSQL.
   - **Client**: `import { createClient } from "@/lib/supabase/client"`.
   - **Server / Route Handlers**: `import { createClient } from "@/lib/supabase/server"`.
   - **Gamification Rule**: Always award XP via the server-side RPC function:
     ```ts
     import { awardXp } from "@/lib/supabase/queries";
     await awardXp(actionType, metadata);
     ```
     Never write directly to `public.student_gamification` or `public.activity_log`.

3. **GEMINI AI INTEGRATION**:
   - **Environment Variable**: `process.env.GEMINI_API_KEY`.
   - **Categories for Skill Assessment**:
     - **Soft Skills**: Communication, Leadership, Teamwork, Conflict Resolution, Emotional Intelligence, Time Management.
     - **Aptitude**: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation.
     - **Coding**:
       - **DSA**: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting/Searching.
       - **SQL**: Basic SELECT, JOINs, Group By / Aggregations, Subqueries, Indexing & Optimization.
       - **Web & Core**: Frontend (React, JS), Backend (Node, APIs, System Design basics).
   - All AI calls must run in Next.js Server Route Handlers (`src/app/api/gemini/*`) to safeguard the API key.

4. **DESIGN SYSTEM & STYLING**:
   - Tailwind CSS v4 with OKLCH theme variables (`bg-card`, `text-card-foreground`, `border-border/50`, `bg-primary/10 text-primary`, `gradient-text`).
   - Icons: `lucide-react`.
   - Feedback / Alerts: `toast` from `sonner`.
   - Modals / Sheets: Base UI / Shadcn components in `@/components/ui/*`.

---

## 1. Database Schema & Storage Reference

Use the existing tables and columns already established in the migrations:

```sql
-- Existing Supabase Tables
public.users (id, role, name, email, avatar_url, institution_id, onboarding_completed, created_at, updated_at)
public.skills (id, name, category, source_taxonomy, external_id)
public.student_profiles (id, user_id, bio, resume_url, portfolio_json, career_objective, linkedin, github, portfolio_website, location, phone, dob, gender)
public.student_skills (student_id, skill_id, proficiency_score, verified, source)
public.assessments (id, student_id, type, responses_json, generated_profile_json, taken_at)
public.opportunities (id, industry_id, type, title, description, required_skills, location, stipend, deadline, status, created_at)
public.applications (id, opportunity_id, student_id, status, applied_at, match_score)
public.learning_programs (id, industry_id, provider, title, type, skills_covered, url)
public.learning_enrollments (id, student_id, program_id, progress_pct, enrolled_at, completed_at)
public.certifications (id, student_id, title, issuer, verified, credential_hash, credential_id, certificate_url, verification_status, issued_at)
public.documents (id, user_id, title, type, file_url, file_size, uploaded_at)
public.portfolio_items (id, user_id, type, title, description, url, image_url, created_at)
public.notifications (id, user_id, type, payload_json, read, created_at)
public.student_gamification (user_id, total_xp, level, current_streak, longest_streak, last_active_date, updated_at)
public.activity_log (id, user_id, action_type, xp_earned, metadata_json, created_at)
public.badges (id, slug, name, description, icon_name, xp_reward, criteria_json)
public.student_badges (student_id, badge_id, earned_at)
public.leaderboard_view (user_id, name, avatar_url, total_xp, level, current_streak, rank)

-- Storage Buckets:
-- 'student-documents' (Private bucket: resumes, transcripts, certificate proofs)
-- 'student-portfolio' (Public bucket: project screenshots, banners)
-- 'avatars' (Public bucket: user avatars)
```

---

## 2. API Routes: Gemini AI Backend (`/src/app/api/gemini/*`)

Create three server route handlers using Gemini (via direct REST API endpoint or `@google/genai`):

### 2.1 Question Generator API: `src/app/api/gemini/generate-questions/route.ts`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "category": "coding" | "aptitude" | "soft_skills",
    "subcategory": "dsa" | "sql" | "web_dev" | "quant" | "logical" | "verbal" | "communication" | "leadership",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "count": 5
  }
  ```
- **Gemini Model**: `gemini-1.5-flash` or `gemini-2.0-flash`
- **System Instruction**:
  Instruct Gemini to return a strict JSON array conforming to this schema without markdown fences:
  ```json
  [
    {
      "id": "q1",
      "question": "What is the amortized time complexity of inserting into a dynamic array?",
      "codeSnippet": null,
      "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      "correctAnswer": 0,
      "explanation": "Dynamic array resizing doubles capacity when full, making average insertion O(1).",
      "skillTag": "Data Structures",
      "difficulty": "intermediate"
    }
  ]
  ```
- **Coding Specifics**:
  - If `subcategory === 'dsa'`, include algorithmic problems with short code snippets (Python/Java/C++), time/space complexity questions, and edge cases.
  - If `subcategory === 'sql'`, include queries with tables, JOIN logic, GROUP BY, aggregations, and query optimization questions.
  - If `subcategory === 'soft_skills'`, include real-world workplace scenarios (e.g. handling conflicting deadlines, client pushback, code review etiquette).
  - If `subcategory === 'aptitude'`, include quantitative, numerical reasoning, syllogisms, pattern analysis, and verbal ability.

### 2.2 Assessment Evaluation API: `src/app/api/gemini/evaluate-assessment/route.ts`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "category": "coding",
    "subcategory": "sql",
    "questions": [...],
    "answers": { "0": 1, "1": 3, "2": 0 },
    "timeTakenSeconds": 180
  }
  ```
- **Logic**:
  1. Calculate raw score (`correctAnswers / totalQuestions * 100`).
  2. Call Gemini to generate qualitative feedback:
     - Strengths identified.
     - Weak areas with targeted improvement tips.
     - Suggested next skills to practice.
  3. Return:
     ```json
     {
       "score": 80,
       "correctCount": 4,
       "totalCount": 5,
       "feedback": "Strong understanding of SQL joins and aggregation. Review subquery optimization and window functions.",
       "skillsAssessed": [
         { "name": "SQL Queries", "score": 85 },
         { "name": "Database Joins", "score": 75 }
       ]
     }
     ```

### 2.3 Career Copilot Chat API: `src/app/api/gemini/copilot/route.ts`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "messages": [{ "role": "user", "content": "..." }],
    "studentContext": {
      "name": "Parth",
      "careerObjective": "Full Stack Engineer",
      "skills": [{ "name": "React", "proficiency": 80 }, { "name": "PostgreSQL", "proficiency": 70 }],
      "education": "B.Tech Computer Science",
      "completedAssessmentsCount": 3
    }
  }
  ```
- **System Prompt**:
  "You are SkillSetu Career Copilot, an expert AI mentor guiding higher education engineering and college students. You have direct access to the student's background. Provide actionable, supportive, concise career guidance, interview questions, resume improvements, and skill roadmaps."

---

## 3. Detailed Page Implementation Specifications

### Page 1: Skill Assessment (`/student/assessment/page.tsx`)
Build an interactive, AI-driven assessment center with three distinct views:
1. **Catalog / Setup View**:
   - Category Selection Cards with icons, difficulty badges, and estimated duration:
     - **Coding Assessment**: DSA (Arrays, Trees, Graphs, DP), SQL (Queries, Joins, Aggregation), Web Fundamentals.
     - **Aptitude Assessment**: Quantitative, Logical Reasoning, Verbal.
     - **Soft Skills Assessment**: Communication, Teamwork, Conflict Resolution, Leadership.
   - Configuration modal: Choose question count (5, 10, 15) and difficulty (Beginner, Intermediate, Advanced).
   - "Recent Assessments" history table showing previous test scores, dates, and review buttons.
2. **Active Quiz Runner View**:
   - Header with countdown timer, progress bar (`Question X of Y`), and exit dialog.
   - Question card with code syntax block (for DSA/SQL questions), options with selectable radio states.
   - Question Navigator drawer (shows answered, flagged, and unvisited questions).
   - "Flag for Review" toggle, "Next", "Previous", and "Submit Test" buttons.
3. **Assessment Results & Breakdown View**:
   - Circular score ring (`score >= 70%` green, `50-69%` amber, `<50%` red).
   - XP Awarded banner with celebratory toast.
   - AI Feedback Summary (strengths, weak topics, recommended roadmaps).
   - Question-by-question review with expandable explanations for wrong answers.
   - Action buttons: "Retake Similar Test", "View in Skill Analysis", "Back to Hub".
4. **Supabase & Gamification Execution**:
   - Insert row into `public.assessments` table (`student_id`, `type`, `responses_json`, `generated_profile_json`, `taken_at`).
   - Upsert/update `public.student_skills` for tested skills with new `proficiency_score` and `source = 'assessment'`.
   - Call `awardXp('assessment_completed', { score, category, subcategory })`.

---

### Page 2: Skill Analysis & Gap (`/student/skill-analysis/page.tsx`)
Build a comprehensive diagnostic dashboard visualizing student competencies vs industry benchmarks:
1. **Interactive Visualizations (Recharts)**:
   - **Radar Chart**: 6-axis skill competency overview (Frontend, Backend, DSA, Databases, Aptitude, Soft Skills).
   - **Proficiency Distribution Bar Chart**: Verified vs self-reported skills.
   - **Skill Growth Over Time**: Line chart showing score progression across assessments.
2. **Target Role Skill Gap Analyzer**:
   - Role Selector dropdown: "Full-Stack Developer", "Data Scientist", "Cloud & DevOps Engineer", "Cybersecurity Analyst", "Frontend Specialist".
   - Comparative match bar: "You match **74%** of required skills for Full-Stack Developer".
   - Two-column gap breakdown:
     - **Matching / Verified Skills** (green checkmarks + current score).
     - **Missing / Under-proficient Skills** (amber/red badges + target benchmark).
   - "Close the Gap" recommendations: direct button links to relevant Learning Hub courses or Skill Assessments.
3. **Supabase Connections**:
   - Queries `student_skills` joined with `skills` where `student_id = auth.uid()`.
   - Queries `assessments` for historic trends.

---

### Page 3: Career Guidance (`/student/career-guidance/page.tsx`)
Build an interactive career roadmap and role navigation portal:
1. **Role Suitability Matrix**:
   - Cards for trending industry roles (e.g., SDE, AI Engineer, DevOps, Product Manager, Data Analyst).
   - Dynamic suitability percentage calculated from student's existing skills in `student_skills`.
   - Typical salary range, demand level (High, Growing, Stable), and key prerequisite competencies.
2. **Step-by-Step Learning Roadmaps**:
   - Expandable interactive timeline with phases:
     - Phase 1: Core Fundamentals
     - Phase 2: Intermediate Tools & Frameworks
     - Phase 3: Real-World Projects & Capstones
     - Phase 4: Interview & Portfolio Preparation
   - Milestone checkboxes allowing students to track personal progress through each phase.
3. **AI Career Mentor Recommendations**:
   - Card displaying personalized advice based on the student's profile and gap analysis.
   - "Ask Career Copilot" shortcut pre-filling queries about the chosen roadmap.

---

### Page 4: Learning Hub (`/student/learning-hub/page.tsx`)
Build a course catalog and learning progress manager:
1. **Tabs**:
   - **Course Catalog**: Browse courses, workshops, and industry tracks from `public.learning_programs`.
   - **My Enrolled Courses**: Track active and completed learning paths from `public.learning_enrollments`.
2. **Features**:
   - Search bar and filters by skill category, provider, and difficulty.
   - "Skills Covered" tags on every course card matching user's gap skills with highlight styling.
   - "Enroll Now" action:
     - Inserts into `public.learning_enrollments` (`student_id`, `program_id`, `progress_pct: 0`).
     - Calls `awardXp('course_enrolled', { program_id })`.
   - Progress Slider / Progress Update modal for enrolled courses:
     - Update progress (0-100%).
     - When marked 100%, sets `completed_at: now()` and calls `awardXp('course_completed', { program_id })`.
   - External URL link out to course materials.

---

### Page 5: Opportunities (`/student/opportunities/page.tsx`)
Build a job, internship, micro-internship, and bounty explorer:
1. **Search & Filter Controls**:
   - Type filter pills: All, Internships, Full-Time Jobs, Micro-Internships, Bounties.
   - Location filter: Remote, On-site, Hybrid.
   - Minimum stipend filter and skill search input.
2. **Dynamic Match Score Badge**:
   - Compare `opportunity.required_skills` (UUIDs) with user's `student_skills` in Supabase.
   - Calculate match percentage `(matching_skills / total_required_skills * 100)` displayed on each card:
     - `>80%`: Green ("Great Match")
     - `50-79%`: Amber ("Good Match")
     - `<50%`: Gray ("Low Match")
3. **Opportunity Detail Dialog & Apply Action**:
   - Full job description, company details, stipend/salary, location, deadline countdown, and required skill tags.
   - "Apply Now" button:
     - Checks if already applied in `public.applications`.
     - Prompts for brief cover note / selected resume from `public.documents`.
     - Inserts row into `public.applications` (`opportunity_id`, `student_id`, `status: 'applied'`, `match_score`).
     - Calls `awardXp('application_submitted', { opportunity_id })`.
     - Shows success toast and updates button to "Applied".

---

### Page 6: Applications Tracker (`/student/applications/page.tsx`)
Build a job application tracking dashboard:
1. **Status Kanban / Filter Tabs**:
   - Filter by status: All, Applied, Shortlisted, Interview Scheduled, Offer Received, Rejected, Withdrawn.
   - Summary stat cards at the top: Total Applications, Under Review, Interviews, Offers.
2. **Application Card & Timeline**:
   - Company name, opportunity title, applied date, current status badge with distinct colors:
     - `applied`: Blue
     - `shortlisted`: Purple
     - `interview`: Amber
     - `offer`: Emerald
     - `rejected`: Red
     - `withdrawn`: Gray
   - Visual progress stepper showing application stage progression.
3. **Actions**:
   - "View Opportunity Details" modal.
   - "Withdraw Application" with confirmation dialog (updates status to `'withdrawn'`).
   - "Prepare for Interview" button that opens Career Copilot with interview questions tailored to that job's role and skills.

---

### Page 7: Digital Portfolio (`/student/portfolio/page.tsx`)
Build a digital portfolio showcase manager:
1. **Category Tabs**:
   - Projects, Hackathons & Competitions, Key Achievements.
2. **Add / Edit Portfolio Item Dialog**:
   - Form fields: Title, Type (`project`, `achievement`, `internship`), Description, Live Demo URL, GitHub Repository URL.
   - Screenshot / Banner Image upload directly to the Supabase `student-portfolio` public bucket via `supabase.storage.from('student-portfolio').upload(...)`.
3. **Interactive Grid**:
   - Cards with project cover images, tech stack chips, direct link buttons (External Link, GitHub), Edit and Delete buttons.
   - Public shareable link preview button.
4. **Gamification**:
   - Calls `awardXp('portfolio_item_added', { title, type })` upon new project creation.

---

### Page 8: Certifications (`/student/certifications/page.tsx`)
Build a verified credentials and certificates management portal:
1. **Certificates Grid**:
   - Displays all certificates from `public.certifications`.
   - Verification status badge:
     - `verified`: Green checkmark with verification timestamp.
     - `pending`: Amber clock ("Pending verification").
     - `rejected`: Red alert icon.
   - Shows issuing organization (AWS, Google, Coursera, Meta, etc.), issue date, credential ID, and preview/download link.
2. **Add Certificate Dialog**:
   - Fields: Title, Issuing Organization, Credential ID, Credential URL, Issue Date.
   - File upload (PDF or Image) saved to `documents` storage bucket.
3. **Actions**:
   - View / Download certificate via Supabase signed URL (`getSignedUrl`).
   - Delete certificate with confirmation.
   - Automatic XP award (`certification_earned`) when status is verified.

---

### Page 9: Document Center (`/student/documents/page.tsx`)
Build a private, encrypted document management repository:
1. **Categories**:
   - Resumes & CVs, Academic Transcripts, Internship Reports, ID & Other Documents.
2. **Upload Zone**:
   - Drag-and-drop file upload with mime-type checking (PDF, DOCX, PNG, JPG) and max 10MB limit.
   - Document type selector and custom title input.
   - Uploads to private bucket `student-documents` at path `{user_id}/{timestamp}.{ext}`.
   - Inserts record into `public.documents` (`user_id`, `title`, `type`, `file_url`, `file_size`, `uploaded_at`).
   - Calls `awardXp('document_uploaded', { type, title })`.
3. **Document Table / Grid**:
   - File icon by extension, title, category badge, size formatted (KB/MB), uploaded date.
   - Download action generates temporary signed URL via `supabase.storage.from('student-documents').createSignedUrl(path, 3600)`.
   - Delete action removes file from storage and deletes row from `public.documents`.

---

### Page 10: Notifications (`/student/notifications/page.tsx`)
Build a notification inbox and preferences center:
1. **Filter Tabs**:
   - All, Unread, Opportunities, Assessments, System / Gamification.
2. **Notification Items**:
   - Icon indicating category (Briefcase for jobs, Target for assessments, Award for badges/XP, Bell for system).
   - Title, descriptive message, timestamp formatted with relative time (`2 hours ago`).
   - Unread indicator dot.
   - Clickable action button linking directly to the relevant page (e.g., "View Application" -> `/student/applications`).
3. **Batch Actions**:
   - "Mark all as read" button (`UPDATE notifications SET read = true WHERE user_id = ...`).
   - Individual "Mark as read" toggle.
   - Delete notification button.

---

### Page 11: Career Copilot (`/student/copilot/page.tsx`)
Build a full-screen conversational AI career mentor:
1. **Context-Aware Sidebar / Header**:
   - Shows student's profile summary: Name, target career objective, top skills, and recent assessments count.
   - Model indicator: Powered by Google Gemini.
2. **Suggested Prompt Chips**:
   - "Analyze my skill gap for a Full-Stack Engineer role"
   - "Generate 5 tricky SQL JOIN interview questions"
   - "Review my resume focus areas for tech internships"
   - "How should I explain my portfolio projects to recruiters?"
3. **Chat Interface**:
   - Scrollable message history with distinct User and AI bubbles.
   - Full Markdown rendering with syntax-highlighted code blocks, copy-to-clipboard buttons, and bulleted action steps.
   - Typing / thinking pulse indicator when Gemini is generating responses.
   - Persistent or session-based chat history.
   - Regenerate response and clear chat buttons.

---

## 4. Custom Hooks Architecture (`src/lib/hooks/*`)

Create modular, reusable client hooks matching existing patterns:
- `useAssessments.ts`: Fetch user's assessment history, submit new assessment, and calculate skill growth.
- `useOpportunities.ts`: Fetch opportunities, filter by type/skills, calculate match scores against `student_skills`, and apply.
- `useApplications.ts`: Fetch applications joined with opportunities, withdraw application, and track statuses.
- `useLearningHub.ts`: Fetch learning programs, enrolled courses, enroll student, and update progress.
- `usePortfolio.ts`: Fetch portfolio items, upload images to `student-portfolio`, and add/edit/delete items.
- `useDocuments.ts`: Upload documents to `student-documents` bucket, fetch files, generate signed URLs, and delete.
- `useNotifications.ts`: Fetch notifications, real-time subscription via Supabase channels, mark as read, and delete.
- `useCopilotChat.ts`: Manage chat state, message history, streaming/async loading, and context passing to `/api/gemini/copilot`.

---

## 5. Implementation Sequence & Execution Order

1. **Step 1: Gemini API Server Routes**
   - Create `src/app/api/gemini/generate-questions/route.ts`
   - Create `src/app/api/gemini/evaluate-assessment/route.ts`
   - Create `src/app/api/gemini/copilot/route.ts`
2. **Step 2: Custom React Hooks**
   - Implement data hooks in `src/lib/hooks/` with Supabase queries and optimistic updates.
3. **Step 3: Core Assessment Engine & UI Components**
   - Build `/src/app/student/assessment/page.tsx` with question generator, quiz runner, and results screen.
   - Build `/src/app/student/skill-analysis/page.tsx` with radar charts and role gap benchmarks.
4. **Step 4: Career & Learning Hub**
   - Build `/src/app/student/career-guidance/page.tsx`
   - Build `/src/app/student/learning-hub/page.tsx`
5. **Step 5: Opportunities & Applications**
   - Build `/src/app/student/opportunities/page.tsx` with automated skill-matching score.
   - Build `/src/app/student/applications/page.tsx` with timeline and status management.
6. **Step 6: Assets & File Management**
   - Build `/src/app/student/portfolio/page.tsx` with public image upload.
   - Build `/src/app/student/certifications/page.tsx` with certificate upload & verification.
   - Build `/src/app/student/documents/page.tsx` with private signed URLs.
7. **Step 7: Real-Time Notifications & Copilot Chat**
   - Build `/src/app/student/notifications/page.tsx`
   - Build `/src/app/student/copilot/page.tsx`
8. **Step 8: Verification & Build Check**
   - Run `npm run build` to ensure zero TypeScript errors, clean imports, and complete hydration safety.
