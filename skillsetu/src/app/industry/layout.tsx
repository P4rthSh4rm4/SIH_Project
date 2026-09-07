"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, PlusCircle, Users, BookOpen, BarChart3, Kanban,
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const industryNav: NavItem[] = [
  { label: "Dashboard", href: "/industry/dashboard", icon: LayoutDashboard },
  { label: "Post Opportunity", href: "/industry/post", icon: PlusCircle },
  { label: "Candidates", href: "/industry/candidates", icon: Users },
  { label: "Programs", href: "/industry/programs", icon: BookOpen },
  { label: "Applicants", href: "/industry/applicants", icon: Kanban },
  { label: "Analytics", href: "/industry/analytics", icon: BarChart3 },
];

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={industryNav}
        roleLabel="Industry Portal"
        roleColor="text-blue-500"
        userName={profile?.name}
        userEmail={profile?.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
