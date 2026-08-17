"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Briefcase,
  ClipboardList,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Pagination } from "@/components/jobs/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { JobResponse, Page } from "@/lib/api/schema";
import { formatSalary } from "@/lib/utils/format";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | "OPEN" | "CLOSED";

const employmentTypeLabels: Record<JobResponse["employmentType"], string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
};

const filterLabels: Record<StatusFilter, string> = {
  ALL: "Tất cả",
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
};

async function updateJobStatus(job: JobResponse, status: JobResponse["status"]) {
  try {
    return await apiFetch<JobResponse>(`/jobs/${job.id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    if (status === "CLOSED") {
      return apiFetch<JobResponse>(`/jobs/${job.id}/close`, { method: "POST" });
    }
    throw error;
  }
}

export function EmployerJobsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [statusTarget, setStatusTarget] = useState<JobResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Server-side status filter — passed to /jobs/my so pagination and counts stay consistent.
  const statusQuery = statusFilter === "ALL" ? "" : `&status=${statusFilter}`;

  const { data, error, isLoading, mutate } = useSWR<Page<JobResponse>>(
    `/jobs/my?page=${page}&size=${PAGE_SIZE}${statusQuery}`,
    (url: string) => apiFetch<Page<JobResponse>>(url),
    { revalidateOnFocus: false }
  );

  const jobs = useMemo(() => data?.content ?? [], [data?.content]);
  // Page-local aggregates — labeled explicitly as "trên trang này" so the numbers aren't misread as global totals.
  const pageOpen = jobs.filter((job) => job.status === "OPEN").length;
  const pageClosed = jobs.length - pageOpen;
  const pageApplications = jobs.reduce((sum, job) => sum + (job.applicationCount ?? 0), 0);

  function handleFilterChange(next: StatusFilter) {
    setStatusFilter(next);
    // Reset to page 0 — the result set changes and the current page index may fall out of range.
    if (page !== 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  }

  async function handleStatusChange() {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "OPEN" ? "CLOSED" : "OPEN";
    setActionLoading(true);
    try {
      await updateJobStatus(statusTarget, nextStatus);
      toast.success(nextStatus === "OPEN" ? "Đã mở lại tin tuyển dụng" : "Đã đóng tin tuyển dụng");
      setStatusTarget(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không cập nhật được trạng thái");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await apiFetch(`/jobs/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Đã xoá tin tuyển dụng");
      setDeleteTarget(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không xoá được tin tuyển dụng");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Tin tuyển dụng của tôi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.totalElements.toLocaleString("vi-VN")} tin tuyển dụng` : "Quản lý các tin bạn đã đăng"}
          </p>
        </div>
        <Button asChild className="font-semibold">
          <Link href="/employer/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Đăng tin mới
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Tổng tin đăng"
          total={data?.totalElements ?? jobs.length}
          icon={Briefcase}
          gradient="from-emerald-500 to-green-500"
          breakdown={[{ label: "Trên trang này", value: jobs.length }]}
        />
        <StatCard
          title="Đang mở (trang này)"
          total={pageOpen}
          icon={ClipboardList}
          gradient="from-blue-500 to-sky-500"
          breakdown={[{ label: "Đã đóng", value: pageClosed }]}
        />
        <StatCard
          title="Ứng viên (trang này)"
          total={pageApplications}
          icon={FileText}
          gradient="from-amber-500 to-orange-400"
          breakdown={[{ label: "Từ các tin đang hiển thị", value: pageApplications }]}
        />
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => handleFilterChange(value as StatusFilter)}>
        <TabsList className="bg-white">
          {(Object.keys(filterLabels) as StatusFilter[]).map((status) => (
            <TabsTrigger key={status} value={status}>
              {filterLabels[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-gray-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold">Địa điểm</th>
                <th className="px-4 py-3 font-semibold">Loại hình</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ứng viên</th>
                <th className="px-4 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} className="px-4 py-4">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-danger">
                    Không tải được danh sách tin tuyển dụng. Vui lòng thử lại.
                  </td>
                </tr>
              )}

              {!isLoading && !error && jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Chưa có tin tuyển dụng nào</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Tạo tin đầu tiên để bắt đầu nhận hồ sơ từ ứng viên.
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link href="/employer/jobs/new">Đăng tin đầu tiên</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                jobs.map((job) => (
                  <tr key={job.id} className="transition-colors duration-150 hover:bg-primary-50/30">
                    <td className="px-4 py-4">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-foreground hover:text-primary">
                        {job.title}
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{job.location || "—"}</td>
                    <td className="px-4 py-4 text-muted-foreground">{employmentTypeLabels[job.employmentType]}</td>
                    <td className="px-4 py-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{(job.applicationCount ?? 0).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Mở menu hành động">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/jobs/${job.id}/applications`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem ứng viên
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/jobs/${job.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusTarget(job)}>
                            <Power className="mr-2 h-4 w-4" />
                            {job.status === "OPEN" ? "Đóng tin" : "Mở lại"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(job)}
                            className="text-danger focus:text-danger"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {data && <Pagination page={data.number} totalPages={data.totalPages} />}

      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.status === "OPEN" ? "Đóng tin tuyển dụng?" : "Mở lại tin tuyển dụng?"}
        description={
          statusTarget?.status === "OPEN"
            ? `Ứng viên sẽ không thể ứng tuyển thêm vào "${statusTarget?.title}".`
            : `Tin "${statusTarget?.title}" sẽ nhận ứng tuyển trở lại.`
        }
        confirmLabel={statusTarget?.status === "OPEN" ? "Đóng tin" : "Mở lại"}
        loading={actionLoading}
        onConfirm={handleStatusChange}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa tin tuyển dụng?"
        description="Hành động này không thể hoàn tác. Dữ liệu liên quan có thể bị xoá khỏi hệ thống."
        confirmLabel="Xóa"
        variant="destructive"
        loading={actionLoading}
        onConfirm={handleDelete}
        requireTextMatch={deleteTarget?.title}
        requireTextLabel={`Gõ "${deleteTarget?.title}" để xác nhận xoá`}
      />
    </div>
  );
}
