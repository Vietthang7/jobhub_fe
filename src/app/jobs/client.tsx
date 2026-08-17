"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { AlertCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { FilterSidebar } from "@/components/jobs/filter-sidebar";
import { Pagination } from "@/components/jobs/pagination";
import { EmptyState } from "@/components/jobs/empty-state";
import { apiFetch, RateLimitError } from "@/lib/api/client";
import { JobSummaryResponse, Page } from "@/lib/api/schema";

const numericParams = new Set(["page", "size", "salaryMinGte", "salaryMaxLte"]);

function buildJobsPath(searchParams: URLSearchParams) {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (!value) return;
    if (numericParams.has(key)) {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) params.set(key, String(numericValue));
      return;
    }
    params.set(key, value);
  });
  if (!params.has("size")) params.set("size", "10");
  if (!params.has("sort")) params.set("sort", "createdAt,desc");
  const query = params.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

export function JobsPageClient() {
  const searchParams = useSearchParams();
  const path = useMemo(() => buildJobsPath(searchParams), [searchParams]);
  const { data, error, isLoading, mutate } = useSWR<Page<JobSummaryResponse>>(
    path,
    (url: string) => apiFetch<Page<JobSummaryResponse>>(url, { skipAuth: true }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const jobs = data?.content ?? [];
  const page = data?.number ?? Number(searchParams.get("page") || 0);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const isRateLimited = error instanceof RateLimitError;
  const hasQuery = Boolean(searchParams.get("q") || searchParams.get("location"));

  return (
    <main className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
        <nav className="mb-4 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">Việc làm</span>
        </nav>

        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary">
              {hasQuery ? "Kết quả tìm kiếm" : "Tìm việc làm"}
            </h1>
            <p className="mt-1 text-base text-text-secondary">
              {isLoading ? "Đang tải danh sách việc làm..." : `${totalElements.toLocaleString("vi-VN")} việc làm phù hợp`}
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto bg-page p-4">
              <SheetHeader className="mb-4">
                <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
              </SheetHeader>
              <FilterSidebar disabled={isRateLimited} />
            </SheetContent>
          </Sheet>
        </div>

        {isRateLimited && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-danger/20 bg-red-50 p-4 text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">Yêu cầu quá nhanh. Vui lòng thử lại sau.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="hidden md:block">
            <div className="sticky top-20">
              <FilterSidebar disabled={isRateLimited} />
            </div>
          </div>

          <div className="space-y-4">
            <JobSearchBar disabled={isRateLimited} />

            {isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : error && !isRateLimited ? (
              <div className="rounded-lg border bg-white p-8 text-center shadow-card">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-danger" />
                <h2 className="font-display text-xl font-bold text-text-primary">Không tải được danh sách việc làm</h2>
                <p className="mt-2 text-base text-text-secondary">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
                <Button onClick={() => mutate()} className="mt-4">Thử lại</Button>
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
