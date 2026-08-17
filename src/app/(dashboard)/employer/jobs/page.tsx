import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployerJobsClient } from "./client";

export default function EmployerJobsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
      <EmployerJobsClient />
    </Suspense>
  );
}
