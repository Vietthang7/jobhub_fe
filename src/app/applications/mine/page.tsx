"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, FileX } from "lucide-react";
import { toast } from "sonner";

import { ApplicationCard } from "@/components/applications/application-card";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/jobs/pagination";
import { useApplications } from "@/hooks/use-applications";
import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { ApplicationStatus } from "@/lib/api/schema";

type TabValue = "ALL" | ApplicationStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "ACCEPTED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "WITHDRAWN", label: "Đã rút" },
];

function parsePage(value: string | null) {
  const page = Number(value ?? "0");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
}

function parseStatus(value: string | null): TabValue {
  return TABS.some((tab) => tab.value === value) ? (value as TabValue) : "ALL";
}

export default function ApplicationsMinePage() {
  return (
    <RequireAuth allowedRoles={["CANDIDATE"]}>
      <ApplicationsMineContent />
    </RequireAuth>
  );
}

function ApplicationsMineContent() {
  const searchParams = useSearchParams();
  const { setParams } = useSearchParamsSetter();
  const page = parsePage(searchParams.get("page"));
  const tab = parseStatus(searchParams.get("status"));
  const status = tab === "ALL" ? undefined : tab;
  const { applications, totalElements, totalPages, isLoading, error, withdraw } = useApplications(page, status);

  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setParams({ page: totalPages - 1 }, { resetPage: false });
    }
  }, [page, setParams, totalPages]);

  const handleTabChange = (value: string) => {
    const nextStatus = value === "ALL" ? null : value;
    setParams({ status: nextStatus, page: null }, { resetPage: false });
  };

  const handleWithdraw = async (id: number) => {
    try {
      await withdraw(id);
      toast.success("Đã rút đơn ứng tuyển");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Rút đơn thất bại, vui lòng thử lại";
      toast.error(message);
    }
  };

  return (
    <main className="bg-page pb-16 pt-8">
      <div className="mx-auto max-w-[1200px] px-4">
        <header className="mb-6 rounded-lg border bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Hồ sơ ứng tuyển</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Đơn ứng tuyển của tôi</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? "Đang tải số lượng đơn ứng tuyển..." : `${totalElements} đơn ứng tuyển`}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/jobs">Tìm việc mới</Link>
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="h-auto flex-wrap justify-start gap-1 border bg-white p-1 shadow-card">
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Không tải được đơn ứng tuyển</h2>
            <p className="mt-2 text-sm text-muted-foreground">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
            <Button onClick={() => window.location.reload()} className="mt-5">
              Thử lại
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileX className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {tab === "ALL" ? "Bạn chưa ứng tuyển công việc nào" : "Không có đơn nào phù hợp với bộ lọc"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Lưu lại hành trình ứng tuyển và theo dõi trạng thái xử lý ngay tại đây.
            </p>
            <Button asChild className="mt-5">
              <Link href="/jobs">Khám phá việc làm</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} onWithdraw={handleWithdraw} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
