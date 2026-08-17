import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <main className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
        <Skeleton className="mb-4 h-5 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="p-5 md:p-6">
              <div className="mb-4 flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="space-y-4 p-5 md:p-6">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <div className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="mt-6 h-12 w-full" />
              <Skeleton className="mt-3 h-10 w-full" />
            </Card>
            <Card className="space-y-4 p-5">
              <Skeleton className="h-6 w-40" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              ))}
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
