"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, FileText, FolderOpen, LogOut, Menu, PlusCircle, Shield } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/store/auth";

const navItems = [
  { href: "/jobs", label: "Việc làm" },
  { href: "#", label: "Công ty", disabled: true },
  { href: "#", label: "CV & Hồ sơ", disabled: true },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="JobHub">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105">
        <Briefcase className="h-5 w-5" />
      </span>
      <span className="font-display text-2xl font-bold text-primary">JobHub</span>
    </Link>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { user, clear, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleAuthLogout = () => {
      // Skip if this was a deliberate logout — handleLogout already showed a toast.
      if (useAuthStore.getState().loggingOut) return;
      clear();
      toast.error("Phiên đăng nhập đã hết hạn", { id: "auth-expired" });
      router.push("/login");
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [clear, router]);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    router.push("/");
  };

  const displayName = user?.email || "Người dùng";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "JH";

  const isCandidate = user?.roles.includes("CANDIDATE");
  const isEmployer = user?.roles.includes("EMPLOYER");
  const isAdmin = user?.roles.includes("ADMIN");

  const authWidget = mounted && user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2 text-foreground hover:text-primary">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-50 text-sm font-semibold text-primary ring-2 ring-primary/20">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold text-foreground">{displayName}</span>
          {user.email && (
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isCandidate && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/applications/mine">
                <FileText className="mr-2 h-4 w-4" />
                Đơn ứng tuyển
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/candidate/cvs">
                <FolderOpen className="mr-2 h-4 w-4" />
                Quản lý CV
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isEmployer && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/employer/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs của tôi
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/employer/jobs/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo job mới
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              Quản trị
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Đăng nhập</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Đăng ký</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Điều hướng chính">
            {navItems.map((item) =>
              item.disabled ? (
                <span
                  key={item.label}
                  className="cursor-default text-sm font-medium text-text-tertiary transition-colors duration-150"
                  aria-disabled="true"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="hidden items-center md:flex">{authWidget}</div>

        <div className="flex items-center gap-2 md:hidden">
          {mounted && user ? authWidget : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mở menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="mt-8 flex flex-col gap-6">
                <nav className="flex flex-col gap-4" aria-label="Điều hướng di động">
                  {navItems.map((item) =>
                    item.disabled ? (
                      <span
                        key={item.label}
                        className="text-base font-medium text-text-tertiary transition-colors duration-150"
                        aria-disabled="true"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-base font-medium text-foreground transition-colors duration-150 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </nav>
                {(!mounted || !user) && (
                  <div className="grid gap-2 border-t pt-6">
                    <Button variant="outline" asChild>
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
