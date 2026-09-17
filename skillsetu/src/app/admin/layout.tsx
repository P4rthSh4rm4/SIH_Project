"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, Users, UserCog, Briefcase, Award, GraduationCap, Building2
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Academicians", href: "/admin/academicians", icon: UserCog },
  { label: "Recruiters", href: "/admin/recruiters", icon: Building2 },
  { label: "Placements", href: "/admin/placements", icon: Briefcase },
  { label: "Training & FDP", href: "/admin/training-fdp", icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={adminNav}
        roleLabel="System Admin"
        roleColor="text-indigo-500"
        userName={profile?.name || "Admin User"}
        userEmail={profile?.email || "admin@skillsetu.com"}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
