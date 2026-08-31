"use client";

import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import {
  LayoutDashboard, Users, BarChart3, FileCheck, Award, FileText,
} from "lucide-react";

const institutionNav: NavItem[] = [
  { label: "Dashboard", href: "/institution/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/institution/students", icon: Users },
  { label: "Placements", href: "/institution/placements", icon: Award },
  { label: "Analytics", href: "/institution/analytics", icon: BarChart3 },
  { label: "Verification", href: "/institution/verification", icon: FileCheck },
  { label: "Reports", href: "/institution/reports", icon: FileText },
];

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar
        navItems={institutionNav}
        roleLabel="Institution Admin"
        roleColor="text-amber-500"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
