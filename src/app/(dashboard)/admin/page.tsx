"use client";

import Link from "next/link";
import useSWR from "swr";
import { Briefcase, FileCheck, FileText, TrendingUp, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api/client";
import { AdminStatsResponseSchema, type AdminStatsResponse } from "@/lib/api/schema";

export default function AdminOverviewPage() {
  const { data, error, isLoading, mutate } = useSWR<AdminStatsResponse>(
    "/admin/stats",
    async (url: string) => AdminStatsResponseSchema.parse(await apiFetch<unknown>(url)),
    { revalidateOnFocus: false }
  );

  const acceptRate = data?.applications.total
    ? Math.round((data.applications.accepted / data.applications.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Admin dashboard</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi người dùng, tin tuyển dụng và đơn ứng tuyển trên JobHub.
          </p>
        </div>
        {error && (
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Thử lại
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-2xl bg-primary-50" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="p-8 text-center">
          <p className="font-medium text-danger">Không tải được số liệu thống kê.</p>
          <p className="mt-1 text-sm text-muted-foreground">Vui lòng thử lại sau ít phút.</p>
        </Card>
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Người dùng"
            total={data.users.total}
            icon={Users}
            gradient="from-red-500 to-orange-400"
            breakdown={[
              { label: "Admin", value: data.users.admin },
              { label: "Employer", value: data.users.employer },
              { label: "Candidate", value: data.users.candidate },
              {
                label: "Đã khóa",
                value: data.users.banned,
                className: "border-red-200 bg-red-50 text-red-600",
              },
            ]}
          />
          <StatCard
            title="Tin tuyển dụng"
            total={data.jobs.total}
            icon={Briefcase}
            gradient="from-primary to-primary-400"
            breakdown={[
              {
                label: "Đang mở",
                value: data.jobs.open,
                className: "border-primary/20 bg-primary/10 text-primary",
              },
              {
                label: "Đã đóng",
                value: data.jobs.closed,
                className: "border-border bg-page text-muted-foreground",
              },
            ]}
          />
          <StatCard
            title="Đơn ứng tuyển"
            total={data.applications.total}
            icon={FileCheck}
            gradient="from-amber-500 to-orange-400"
            breakdown={[
              {
                label: "Chờ xử lý",
                value: data.applications.pending,
                className: "border-amber-200 bg-amber-50 text-amber-700",
              },
              {
                label: "Đã nhận",
                value: data.applications.accepted,
                className: "border-primary/20 bg-primary/10 text-primary",
              },
              {
                label: "Từ chối",
                value: data.applications.rejected,
                className: "border-red-200 bg-red-50 text-red-600",
              },
            ]}
          />
          <StatCard
            title="Tỷ lệ accept (%)"
            total={acceptRate}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-400"
            breakdown={[
              { label: "Phần trăm", value: acceptRate },
              {
                label: "Đã nhận",
                value: data.applications.accepted,
                className: "border-primary/20 bg-primary/10 text-primary",
              },
            ]}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Quản lý người dùng
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tìm kiếm, kiểm tra vai trò và khóa/mở khóa tài khoản.
                </p>
              </div>
              <Users className="h-6 w-6 text-primary transition group-hover:scale-110" />
            </div>
          </Card>
        </Link>
        <Link href="/admin/audit-logs">
          <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Xem nhật ký
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Theo dõi các hành động quản trị và thay đổi quan trọng.
                </p>
              </div>
              <FileText className="h-6 w-6 text-primary transition group-hover:scale-110" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
