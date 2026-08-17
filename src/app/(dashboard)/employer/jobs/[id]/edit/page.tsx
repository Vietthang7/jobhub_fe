"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ChevronRight } from "lucide-react";

import { JobForm } from "@/components/jobs/job-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import type { JobResponse } from "@/lib/api/schema";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const { data: job, error, isLoading, mutate } = useSWR<JobResponse>(
    jobId ? `/jobs/${jobId}` : null,
    (url: string) => apiFetch<JobResponse>(url),
    { revalidateOnFocus: false }
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/employer/jobs" className="hover:text-primary">
            Tin tuyển dụng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="max-w-[220px] truncate">{job?.title ?? "Đang tải"}</span>
          <ChevronRight className="h-4 w-4" />
          <span>Chỉnh sửa</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Chỉnh sửa tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cập nhật nội dung tin đăng để thu hút ứng viên phù hợp hơn.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-card">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-danger">Không tải được thông tin tin tuyển dụng.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}>
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && job && (
        <JobForm mode="edit" initialData={job} onSuccess={() => router.push("/employer/jobs")} />
      )}
    </div>
  );
}
