import { Metadata } from "next";
import { Suspense } from "react";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { JobsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Tìm việc làm · JobHub",
  description: "Khám phá hàng ngàn cơ hội việc làm hấp dẫn tại JobHub.",
};

function JobsPageFallback() {
  return (
    <main className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
        <div className="mb-6 h-20 rounded-lg bg-white shadow-card" />
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="hidden space-y-4 md:block">
            <div className="h-16 rounded-lg bg-white shadow-card" />
            <div className="h-44 rounded-lg bg-white shadow-card" />
            <div className="h-56 rounded-lg bg-white shadow-card" />
          </div>
          <div className="space-y-4">
            <div className="h-20 rounded-lg bg-white shadow-card" />
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageFallback />}>
      <JobsPageClient />
    </Suspense>
  );
}
