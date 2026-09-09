"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Network, Menu, LogOut, Moon, Sun, Bell,
  ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  subItems?: Omit<NavItem, "subItems">[];
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
  userName = "",
  userEmail = "",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const NavGroup = ({ item, mobile, collapsed, setCollapsed, pathname }: any) => {
    const isActive = item.subItems?.some((sub: any) => sub.href && (pathname === sub.href || pathname.startsWith(sub.href + "/")));
    const [isOpen, setIsOpen] = useState(isActive);

    if (collapsed && !mobile) {
      return (
        <button
          onClick={() => { setCollapsed(false); setIsOpen(true); }}
          className={cn(
            "w-full flex items-center justify-center py-3 rounded-xl transition-all duration-200 relative",
            isActive ? "bg-primary/10 dark:bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
          title={item.label}
        >
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-gradient-to-b from-primary to-chart-4" />}
          <item.icon className="w-[22px] h-[22px]" />
        </button>
      );
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[0.9rem] font-medium transition-all duration-200 relative",
            isActive
              ? "bg-primary/5 dark:bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-gradient-to-b from-primary to-chart-4" />}
          <item.icon className={cn("w-[22px] h-[22px] shrink-0", isActive && "text-primary")} />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <div className="pl-11 pr-2 pb-1 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
            {item.subItems?.map((sub: any) => {
              const isSubActive = sub.href && (pathname === sub.href || pathname.startsWith(sub.href + "/"));
              return (
                <Link
                  key={sub.label}
                  href={sub.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    isSubActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  <span className="flex-1">{sub.label}</span>
                  {sub.badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{sub.badge}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group flex-1 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
            <Network className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <span className="text-xl font-bold truncate font-heading">
              Skill<span className="gradient-text">Setu</span>
            </span>
          )}
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {(!collapsed || mobile) && (
        <div className="px-5 pb-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${roleColor}`}>
            {roleLabel}
          </span>
        </div>
      )}

      <Separator className="opacity-40" />

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            if (item.subItems) {
              return <NavGroup key={item.label} item={item} mobile={mobile} collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} />;
            }

            const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-[0.9rem] font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-primary/10 dark:bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
                title={collapsed && !mobile ? item.label : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-gradient-to-b from-primary to-chart-4" />
                )}
                <item.icon className={cn("w-[22px] h-[22px] shrink-0", isActive && "text-primary")} />
                {(!collapsed || mobile) && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
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

      <Separator className="opacity-40" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[0.9rem] text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200 w-full"
        >
          <Sun className="w-[22px] h-[22px] hidden dark:block" />
          <Moon className="w-[22px] h-[22px] block dark:hidden" />
          {(!collapsed || mobile) && <span className="font-medium">Toggle Theme</span>}
        </button>
        <form method="POST" action="/auth/signout" className="w-full">
          <button
            type="submit"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[0.9rem] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-[22px] h-[22px]" />
            {(!collapsed || mobile) && <span className="font-medium">Sign Out</span>}
          </button>
        </form>
      </div>

      {(!collapsed || mobile) && (
        <div className="p-5 border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 ring-2 ring-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              {userName ? (
                <div className="text-[0.9rem] font-semibold truncate">{userName}</div>
              ) : (
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              )}
              {userEmail ? (
                <div className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</div>
              ) : (
                <div className="h-3.5 w-32 rounded bg-muted animate-pulse mt-1" />
              )}
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
        "hidden md:flex flex-col border-r border-border/40 bg-sidebar transition-all duration-300 shrink-0 sticky top-0 h-screen",
        collapsed ? "w-[76px]" : "w-72"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile topbar + sheet */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-sidebar sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
            <Network className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg font-heading">SkillSetu</span>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl hover:bg-accent/60 text-muted-foreground transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Sheet>
            <SheetTrigger
              render={<button className="p-2.5 rounded-xl hover:bg-accent/60 text-muted-foreground transition-colors" />}
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
