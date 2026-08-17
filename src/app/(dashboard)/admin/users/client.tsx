"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { Ban, Search, ShieldCheck } from "lucide-react";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { apiFetch, ApiError } from "@/lib/api/client";
import {
  AdminUserResponseSchema,
  pageSchema,
  type AdminUserResponse,
  type Page,
  type Role,
} from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const AdminUsersPageSchema = pageSchema(AdminUserResponseSchema);

const roleBadgeStyles: Record<Role, string> = {
  ADMIN: "border-red-200 bg-red-50 text-red-600",
  EMPLOYER: "border-primary/20 bg-primary/10 text-primary",
  CANDIDATE: "border-blue-200 bg-blue-50 text-blue-600",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string, email: string) {
  const source = name?.trim() || email;
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { setParams } = useSearchParamsSetter();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Trang {page + 1} / {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => setParams({ page: page - 1 }, { resetPage: false })}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => setParams({ page: page + 1 }, { resetPage: false })}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

export function AdminUsersClient() {
  const searchParams = useSearchParams();
  const { setParams } = useSearchParamsSetter();
  const page = Number(searchParams.get("page") || 0);
  const query = searchParams.get("q") || "";
  const [searchValue, setSearchValue] = useState(query);
  const [banTarget, setBanTarget] = useState<AdminUserResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchValue.trim() !== query) {
        setParams({ q: searchValue.trim() || undefined });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, searchValue, setParams]);

  const qs = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
  if (query) qs.set("q", query);
  const path = `/admin/users?${qs.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<Page<AdminUserResponse>>(
    path,
    async (url: string) => AdminUsersPageSchema.parse(await apiFetch<unknown>(url)),
    { revalidateOnFocus: false }
  );

  async function handleToggleBan() {
    if (!banTarget) return;
    setActionLoading(true);

    try {
      const action = banTarget.banned ? "unban" : "ban";
      await apiFetch<AdminUserResponse>(`/admin/users/${banTarget.id}/${action}`, {
        method: "PUT",
      });
      toast.success(
        banTarget.banned
          ? `Đã mở khóa ${banTarget.email}`
          : `Đã khóa ${banTarget.email}`
      );
      setBanTarget(null);
      await mutate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể cập nhật trạng thái");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.totalElements.toLocaleString("vi-VN")} người dùng` : "Tìm kiếm và quản trị tài khoản hệ thống."}
          </p>
        </div>
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Avatar</th>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Ngày đăng ký</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4" colSpan={7}>
                      <Skeleton className="h-8 w-full bg-primary-50" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-danger">
                    Không tải được danh sách người dùng. Vui lòng thử lại.
                  </td>
                </tr>
              )}

              {!isLoading && !error && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="font-medium text-foreground">Không có người dùng phù hợp.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                data?.content.map((user) => (
                  <tr key={user.id} className="transition hover:bg-page/50">
                    <td className="px-4 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(user.fullName, user.email)}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">{user.fullName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className={roleBadgeStyles[role]}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          user.banned
                            ? "bg-danger/10 text-danger"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {user.banned ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        {user.banned ? "Đã khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBanTarget(user)}
                        className={user.banned ? "text-primary" : "text-danger hover:bg-danger/10 hover:text-danger"}
                      >
                        {user.banned ? "Mở khóa" : "Khóa"}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {data && <Pagination page={data.number} totalPages={data.totalPages} />}
      </Card>

      <ConfirmDialog
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={banTarget?.banned ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
        description={
          banTarget?.banned
            ? `Bạn chắc chắn muốn mở khóa tài khoản ${banTarget.email}?`
            : `Bạn chắc chắn muốn khóa tài khoản ${banTarget?.email}?`
        }
        confirmLabel={banTarget?.banned ? "Mở khóa" : "Khóa"}
        variant={banTarget?.banned ? "default" : "destructive"}
        loading={actionLoading}
        onConfirm={handleToggleBan}
      />
    </div>
  );
}
