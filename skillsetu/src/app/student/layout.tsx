"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, Target, User, Briefcase, FolderOpen,
  MessageSquare, Award, FileText, Activity, Compass, BookOpen, FileArchive, Bell
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Skill Assessment", href: "/student/assessment", icon: Target, badge: "New" },
  { label: "Skill Analysis", href: "/student/skill-analysis", icon: Activity },
  { label: "Career Guidance", href: "/student/career-guidance", icon: Compass },
  { label: "Learning Hub", href: "/student/learning-hub", icon: BookOpen },
  { label: "My Profile", href: "/student/profile", icon: User },
  { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
  { label: "Applications", href: "/student/applications", icon: FileText },
  { label: "Portfolio", href: "/student/portfolio", icon: FolderOpen },
  { label: "Certifications", href: "/student/certifications", icon: Award },
  { label: "Documents", href: "/student/documents", icon: FileArchive },
  { label: "Notifications", href: "/student/notifications", icon: Bell },
  { label: "Career Copilot", href: "/student/copilot", icon: MessageSquare },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={studentNav}
        roleLabel="Student Portal"
        roleColor="text-violet-500"
        userName={profile?.name}
        userEmail={profile?.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
