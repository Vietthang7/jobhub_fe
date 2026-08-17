"use client";

import { Briefcase, Building, Plus } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const EMPLOYER_NAV: DashboardNavItem[] = [
  {
    href: "/employer/jobs",
    label: "Tin tuyển dụng",
    icon: Briefcase,
    isActive: (pathname) => pathname === "/employer/jobs" || /^\/employer\/jobs\/\d+/.test(pathname),
  },
  {
    href: "/employer/jobs/new",
    label: "Đăng tin mới",
    icon: Plus,
  },
  {
    href: "#",
    label: "Hồ sơ công ty",
    icon: Building,
  },
];

export default function EmployerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["EMPLOYER"]}>
      <DashboardShell accent="employer" title="Nhà tuyển dụng" navItems={EMPLOYER_NAV}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
