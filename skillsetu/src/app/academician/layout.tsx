"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, BookOpen, FlaskConical, Handshake, Presentation, Briefcase
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const academicianNav: NavItem[] = [
  { label: "Dashboard", href: "/academician/dashboard", icon: LayoutDashboard },
  { label: "Placements", href: "/academician/placements", icon: Briefcase },
  { label: "FDPs", href: "/academician/fdps", icon: BookOpen },
  { label: "Research", href: "/academician/research", icon: FlaskConical },
  { label: "Consultancy", href: "/academician/consultancy", icon: Handshake },
  { label: "Mentorship", href: "/academician/mentorship", icon: Presentation },
];

export default function AcademicianLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={academicianNav}
        roleLabel="Academician Portal"
        roleColor="text-emerald-500"
        userName={profile?.name}
        userEmail={profile?.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
