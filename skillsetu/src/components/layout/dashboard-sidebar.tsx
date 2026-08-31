"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Menu, LogOut, Moon, Sun, Bell,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  roleLabel: string;
  roleColor: string; // Tailwind text color class
  userName?: string;
  userEmail?: string;
}

export function DashboardSidebar({
  navItems,
  roleLabel,
  roleColor,
  userName = "Demo User",
  userEmail = "demo@skillsetu.in",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group flex-1 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <span className="text-lg font-bold truncate">
              Skill<span className="gradient-text">Setu</span>
            </span>
          )}
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {(!collapsed || mobile) && (
        <div className="px-4 pb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${roleColor}`}>
            {roleLabel}
          </span>
        </div>
      )}

      <Separator className="opacity-50" />

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                )}
                title={collapsed && !mobile ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                {(!collapsed || mobile) && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all w-full"
        >
          <Sun className="w-5 h-5 hidden dark:block" />
          <Moon className="w-5 h-5 block dark:hidden" />
          {(!collapsed || mobile) && <span>Toggle Theme</span>}
        </button>
        <form method="POST" action="/auth/signout" className="w-full">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || mobile) && <span>Sign Out</span>}
          </button>
        </form>
      </div>

      {(!collapsed || mobile) && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{userName}</div>
              <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile topbar + sheet */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-border/50 bg-sidebar sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">SkillSetu</span>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <Bell className="w-5 h-5" />
          </button>
          <Sheet>
            <SheetTrigger
              render={<button className="p-2 rounded-lg hover:bg-accent text-muted-foreground" />}
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
