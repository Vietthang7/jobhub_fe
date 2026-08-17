"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { JobForm } from "@/components/jobs/job-form";

export default function NewJobPage() {
  const router = useRouter();

  function handleSuccess() {
    router.push("/employer/jobs");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/employer/jobs" className="hover:text-primary">
            Tin tuyển dụng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Đăng tin mới</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Đăng tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Điền thông tin rõ ràng để ứng viên hiểu vai trò và phúc lợi của công việc.
          </p>
        </div>
      </div>

      <JobForm mode="create" onSuccess={handleSuccess} />
    </div>
  );
}
