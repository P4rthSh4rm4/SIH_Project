"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, Target, User, Briefcase, FolderOpen,
  MessageSquare, Award, FileText,
} from "lucide-react";

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Skill Assessment", href: "/student/assessment", icon: Target, badge: "New" },
  { label: "My Profile", href: "/student/profile", icon: User },
  { label: "Opportunities", href: "/student/opportunities", icon: Briefcase },
  { label: "Applications", href: "/student/applications", icon: FileText },
  { label: "Portfolio", href: "/student/portfolio", icon: FolderOpen },
  { label: "Certifications", href: "/student/certifications", icon: Award },
  { label: "Career Copilot", href: "/student/copilot", icon: MessageSquare },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={studentNav}
        roleLabel="Student Portal"
        roleColor="text-violet-500"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
