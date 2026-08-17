import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { JobApplicationsClient } from "./client";

export default function JobApplicationsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
      <JobApplicationsClient />
    </Suspense>
  );
}
