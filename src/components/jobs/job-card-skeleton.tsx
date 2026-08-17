import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const shimmerClass = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

export function JobCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Skeleton className={`h-12 w-12 shrink-0 rounded-lg ${shimmerClass}`} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className={`h-5 w-4/5 ${shimmerClass}`} />
            <Skeleton className={`h-4 w-2/3 ${shimmerClass}`} />
          </div>
          <Skeleton className={`h-4 w-1/2 ${shimmerClass}`} />
          <div className="flex items-center justify-between gap-3 pt-1">
            <Skeleton className={`h-5 w-28 ${shimmerClass}`} />
            <Skeleton className={`h-7 w-24 rounded-full ${shimmerClass}`} />
          </div>
        </div>
      </div>
    </Card>
  );
}
