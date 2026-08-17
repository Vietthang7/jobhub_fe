"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, type LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Custom active-path matcher. Defaults to exact-or-prefix match on href. */
  isActive?: (pathname: string) => boolean;
}

export type DashboardAccent = "employer" | "admin";

const accentStyles: Record<
  DashboardAccent,
  { active: string; marker: string; chip: string }
> = {
  employer: {
    active: "border-primary bg-primary/10 text-primary",
    marker: "bg-primary",
    chip: "bg-primary/10 text-primary",
  },
  admin: {
    active: "border-accent-orange bg-accent-orange/10 text-accent-orange",
    marker: "bg-accent-orange",
    chip: "bg-accent-orange/10 text-accent-orange",
  },
};

function defaultIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  navItems,
  accent,
  pathname,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  accent: DashboardAccent;
  pathname: string;
  onNavigate?: () => void;
}) {
  const styles = accentStyles[accent];

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive
          ? item.isActive(pathname)
          : defaultIsActive(pathname, item.href);
        const isPlaceholder = item.href === "#";

        const className = cn(
          "group flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
          active
            ? styles.active
            : "border-transparent text-muted-foreground hover:bg-page hover:text-foreground"
        );

        const content = (
          <>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </>
        );

        if (isPlaceholder) {
          return (
            <button key={item.label} type="button" disabled className={cn(className, "w-full cursor-not-allowed opacity-60")}>
              {content}
            </button>
          );
        }

        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

interface DashboardShellProps {
  title: string;
  accent: DashboardAccent;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  accent,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const styles = accentStyles[accent];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-page">
      <div className="sticky top-16 z-30 border-b bg-white/95 px-4 py-3 shadow-xs backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-8 w-8 rounded-lg", styles.chip, "flex items-center justify-center")}>
              <span className={cn("h-2 w-2 rounded-full", styles.marker)} />
            </span>
            <span className="font-display font-semibold text-foreground">{title}</span>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Mở menu dashboard">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-white p-0">
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle className="font-display text-lg text-foreground">{title}</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <NavLinks
                  navItems={navItems}
                  accent={accent}
                  pathname={pathname}
                  onNavigate={() => setSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:py-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-xl border border-border/60 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 px-2 py-1">
              <span className={cn("h-2.5 w-2.5 rounded-full", styles.marker)} />
              <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
            </div>
            <NavLinks navItems={navItems} accent={accent} pathname={pathname} />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
