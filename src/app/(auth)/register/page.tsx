"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Check, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
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
  RegisterRequest,
  RegisterRequestSchema,
  Role,
} from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

const ROLE_OPTIONS: { value: RegisterRequest["role"]; label: string; description: string }[] = [
  {
    value: "CANDIDATE",
    label: "Ứng viên",
    description: "Tìm việc và ứng tuyển nhanh",
  },
  {
    value: "EMPLOYER",
    label: "Nhà tuyển dụng",
    description: "Đăng tin và quản lý ứng viên",
  },
];

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "CANDIDATE",
    },
  });

  const role = form.watch("role");
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterRequest) => {
    try {
      const response = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
        skipAuth: true,
      });

      setSession(response);
      toast.success("Đăng ký thành công");
      router.push(getRedirectPath(response.roles, searchParams.get("next")));
    } catch (error) {
      if (error instanceof RateLimitError) {
        toast.error("Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        form.setError("email", { message: "Email này đã được sử dụng" });
        toast.error("Email này đã được sử dụng");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-7 text-center">
        <Link href="/" className="mb-4 inline-flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-primary">JobHub</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">Tạo tài khoản JobHub</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bắt đầu hành trình nghề nghiệp của bạn</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bạn là</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map((option) => {
                      const selected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            "rounded-lg border p-4 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-card"
                              : "border-border bg-white hover:border-primary/50"
                          )}
                        >
                          <span className="mb-2 flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">{option.label}</span>
                            {selected && <Check className="h-4 w-4 text-primary" />}
                          </span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <div className="relative">
                    {role === "EMPLOYER" ? (
                      <BriefcaseBusiness className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    ) : (
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    )}
                    <Input {...field} autoComplete="name" placeholder="Nguyễn Văn A" className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input {...field} type="email" autoComplete="email" placeholder="email@example.com" className="pl-10" />
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
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 6 ký tự"
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

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <span>
              Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của JobHub.
            </span>
          </label>

          <Button type="submit" size="xl" className="w-full" disabled={isSubmitting || !acceptedTerms}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

function AuthIllustration() {
  return (
    <div className="hidden min-h-[640px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-50/50 p-10 lg:flex lg:flex-col lg:justify-between ring-1 ring-primary/10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">TopCV style</p>
        <h2 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight text-foreground">
          Một tài khoản cho mọi bước phát triển sự nghiệp.
        </h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          Ứng viên tìm việc dễ dàng, nhà tuyển dụng tiếp cận đúng nhân tài nhanh hơn.
        </p>
      </div>
      <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-foreground">Hoàn tất hồ sơ trong vài phút</p>
        <div className="mt-4 h-2 rounded-full bg-secondary">
          <div className="h-2 w-3/4 rounded-full bg-primary" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">JobHub đồng hành từ đăng ký đến ứng tuyển.</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="bg-page">
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-[1200px] items-center gap-12 px-4 py-10 lg:grid-cols-[minmax(0,480px)_1fr] lg:py-16">
        <div className="flex justify-center lg:justify-start">
          <Suspense fallback={<div className="h-[640px] w-full max-w-md rounded-lg bg-white shadow-card" />}>
            <RegisterForm />
          </Suspense>
        </div>
        <AuthIllustration />
      </div>
    </main>
  );
}
