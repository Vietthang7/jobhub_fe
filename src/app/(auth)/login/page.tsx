"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError, RateLimitError, apiFetch } from "@/lib/api/client";
import {
  AuthResponse,
  LoginRequest,
  LoginRequestSchema,
  Role,
} from "@/lib/api/schema";
import { useAuthStore } from "@/lib/store/auth";

function isSafeNextPath(value: string | null): value is string {
  // Only allow relative same-origin paths — reject "https://…", protocol-relative "//evil", and empty strings.
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

function getRedirectPath(roles: Role[], next: string | null) {
  if (isSafeNextPath(next)) return next;
  if (roles.includes("ADMIN")) return "/admin";
  if (roles.includes("EMPLOYER")) return "/employer/jobs";
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: LoginRequest) => {
    try {
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
        skipAuth: true,
      });

      setSession(response);
      toast.success("Đăng nhập thành công");
      router.push(getRedirectPath(response.roles, searchParams.get("next")));
    } catch (error) {
      if (error instanceof RateLimitError) {
        toast.error("Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút");
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        toast.error("Email hoặc mật khẩu không đúng");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="mb-4 inline-flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-primary">JobHub</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Đăng nhập vào JobHub
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Chào mừng bạn quay trở lại</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="email@example.com"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>Mật khẩu</FormLabel>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        hoặc
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

function AuthIllustration() {
  return (
    <div className="hidden min-h-[560px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-50/50 p-10 lg:flex lg:flex-col lg:justify-between ring-1 ring-primary/10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">JobHub</p>
        <h2 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight text-foreground">
          Tìm việc nhanh hơn với trải nghiệm ứng tuyển hiện đại.
        </h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          Quản lý hồ sơ, theo dõi đơn ứng tuyển và kết nối với nhà tuyển dụng phù hợp.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
          <p className="text-3xl font-bold text-primary">10k+</p>
          <p className="mt-1 text-sm text-muted-foreground">cơ hội việc làm</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
          <p className="text-3xl font-bold text-primary">24/7</p>
          <p className="mt-1 text-sm text-muted-foreground">theo dõi hồ sơ</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="bg-page">
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-[1200px] items-center gap-12 px-4 py-10 lg:grid-cols-[minmax(0,480px)_1fr] lg:py-16">
        <div className="flex justify-center lg:justify-start">
          <Suspense fallback={<div className="h-[520px] w-full max-w-md rounded-lg bg-white shadow-card" />}>
            <LoginForm />
          </Suspense>
        </div>
        <AuthIllustration />
      </div>
    </main>
  );
}
