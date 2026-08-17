"use client";

import { FileText, LayoutDashboard, Users } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const ADMIN_NAV: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/admin",
  },
  {
    href: "/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
  },
  {
    href: "/admin/audit-logs",
    label: "Nhật ký hoạt động",
    icon: FileText,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <DashboardShell title="Quản trị" accent="admin" navItems={ADMIN_NAV}>
        {children}
      </DashboardShell>
    </RequireAuth>
  );
}
