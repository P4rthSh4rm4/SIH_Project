"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, Target, User, Briefcase, FolderOpen,
  MessageSquare, Award, FileText, Activity, Compass, BookOpen, FileArchive, Bell, TrendingUp, Video
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Skill Assessment", href: "/student/assessment", icon: Target, badge: "New" },
  { label: "AI Mock Interview", href: "/student/mock-interview", icon: Video, badge: "AI" },
  { label: "Career Guidance", href: "/student/career-guidance", icon: Compass },
  { label: "My Profile", href: "/student/profile", icon: User },
  { 
    label: "Placement", 
    icon: Briefcase,
    subItems: [
      { label: "Resume Builder", href: "/student/resume-builder", icon: FileText },
      { label: "Placement Readiness", href: "/student/placement-readiness", icon: TrendingUp },
      { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
      { label: "Applications", href: "/student/applications", icon: FileText },
    ]
  },
  { label: "Portfolio", href: "/student/portfolio", icon: FolderOpen },
  { label: "Certifications", href: "/student/certifications", icon: Award },
  { label: "Documents", href: "/student/documents", icon: FileArchive },
  { label: "Notifications", href: "/student/notifications", icon: Bell },
  { label: "Career Copilot", href: "/student/copilot", icon: MessageSquare },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useUserProfile();

  if (pathname === "/student/onboarding") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const filteredNav = studentNav.filter((item) => {
    if (item.label === "Documents" && profile?.department === "Ayurveda") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={filteredNav}
        roleLabel="Student Portal"
        roleColor="text-violet-500"
        userName={profile?.name}
        userEmail={profile?.email}
        department={profile?.department}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
