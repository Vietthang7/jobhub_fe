"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { EmptyState } from "@/components/jobs/empty-state";
import { apiFetch } from "@/lib/api/client";
import { JobSummaryResponse, Page } from "@/lib/api/schema";
import { ArrowRight, Briefcase, Building2, MapPin, Search, Users } from "lucide-react";

const stats = [
  { label: "Việc làm đang mở", value: "1,245+", icon: Briefcase },
  { label: "Công ty uy tín", value: "430+", icon: Building2 },
  { label: "Ứng viên kết nối", value: "12,500+", icon: Users },
];

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const { data, isLoading, error } = useSWR<Page<JobSummaryResponse>>(
    "/jobs?size=6&sort=createdAt,desc",
    (url: string) => apiFetch<Page<JobSummaryResponse>>(url, { skipAuth: true }),
    { revalidateOnFocus: false }
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(params.toString() ? `/jobs?${params}` : "/jobs");
  };

  return (
    <main className="bg-white">
      <section className="relative bg-gradient-to-br from-primary-50/80 via-white to-white py-20 md:py-28 overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-[40px] md:leading-[48px]">
              Tìm việc làm <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">phù hợp với bạn</span>
            </h1>
            <p className="mt-4 text-md text-text-secondary">
              Hàng ngàn cơ hội việc làm từ các công ty hàng đầu đang chờ bạn ứng tuyển.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/[0.04]">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Vị trí tuyển dụng, tên công ty..."
                  className="h-12 pl-11 text-base"
                />
              </div>
              <div className="relative md:w-[280px]">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Địa điểm"
                  className="h-12 pl-11 text-base"
                />
              </div>
              <Button type="submit" size="xl" className="h-12 px-8 text-base font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </div>
          </form>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="group rounded-xl border border-border/60 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-page py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-text-primary">
                <span className="inline-block h-6 w-1 rounded-full bg-primary" />
                Việc làm nổi bật
              </h2>
              <p className="mt-1 text-base text-text-secondary">Các cơ hội mới nhất được cập nhật liên tục.</p>
            </div>
            <Button asChild variant="outline" className="group">
              <Link href="/jobs">
                Xem tất cả <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border bg-white p-6 text-center text-text-secondary shadow-card">
              Chưa thể tải việc làm nổi bật. Vui lòng thử lại sau.
            </div>
          ) : data?.content?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.content.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 rounded-xl border-0 bg-gradient-to-r from-primary-50 via-emerald-50 to-primary-50/60 px-8 py-10 text-center shadow-sm md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Bạn là nhà tuyển dụng?</h2>
            <p className="mt-1 text-base text-text-secondary">Đăng tin tuyển dụng và tiếp cận ứng viên phù hợp ngay hôm nay.</p>
          </div>
          <Button asChild>
            <Link href="/register">Đăng tin ngay</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
