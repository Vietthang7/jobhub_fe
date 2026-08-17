import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJobById, ServerApiError } from "@/lib/api/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatSalary, formatRelativeDate } from "@/lib/utils/format";
import { JobDetailActions } from "@/components/jobs/job-detail-actions";
import { AlertTriangle, Briefcase, Building2, CalendarDays, ChevronRight, Clock, MapPin, Wallet } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (isNaN(Number(id))) return {};

  try {
    const job = await fetchJobById(id);
    const description = job.description.slice(0, 160).replace(/\n/g, " ") + (job.description.length > 160 ? "..." : "");
    return {
      title: `${job.title} · JobHub`,
      description,
    };
  } catch {
    return { title: "Việc làm không tồn tại · JobHub" };
  }
}

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
};

function InfoItem({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  if (isNaN(Number(id))) notFound();

  let job;
  try {
    job = await fetchJobById(id);
  } catch (err) {
    if (err instanceof ServerApiError && err.status === 404) notFound();
    throw err;
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const employmentType = employmentTypeLabels[job.employmentType] || job.employmentType;

  return (
    <main className="min-h-screen bg-page pb-16">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/jobs" className="hover:text-primary">Việc làm</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="line-clamp-1 text-text-primary">{job.title}</span>
        </nav>

        {job.status === "CLOSED" && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-danger/20 bg-red-50 p-4 text-danger">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Tin tuyển dụng này đã đóng — không nhận thêm ứng tuyển.</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className={job.status === "OPEN" ? "bg-primary-50 text-primary" : "bg-red-50 text-danger"}>
                  {job.status === "OPEN" ? "Đang mở tuyển" : "Đã đóng"}
                </Badge>
                <Badge variant="outline" className="gap-1 text-text-secondary">
                  <Briefcase className="h-3 w-3" />
                  {employmentType}
                </Badge>
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight text-text-primary md:text-[36px] md:leading-[44px]">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-col gap-3 text-base text-text-secondary sm:flex-row sm:flex-wrap">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <strong className="font-semibold text-text-primary">{job.employerName}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {job.location || "Đang cập nhật"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InfoItem icon={Wallet} label="Mức lương" value={salary} />
                <InfoItem icon={Briefcase} label="Loại hình" value={employmentType} />
                <InfoItem icon={CalendarDays} label="Ngày đăng" value={formatRelativeDate(job.createdAt)} />
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <h2 className="mb-4 font-display text-xl font-bold text-text-primary">Mô tả công việc</h2>
              <div className="whitespace-pre-wrap text-[15px] leading-7 text-text-primary">
                {job.description}
              </div>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-page text-primary">
                  <span className="font-display text-xl font-bold">{job.employerName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 font-semibold text-text-primary">{job.employerName}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                    <MapPin className="h-4 w-4" />
                    {job.location || "Đang cập nhật"}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-5">
                <JobDetailActions jobId={job.id} jobTitle={job.title} status={job.status} />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Thông tin tóm tắt</h2>
              <div className="space-y-4">
                <InfoItem icon={Wallet} label="Mức lương" value={salary} />
                <InfoItem icon={Briefcase} label="Loại hình" value={employmentType} />
                <InfoItem icon={MapPin} label="Địa điểm" value={job.location || "Đang cập nhật"} />
                <InfoItem icon={Clock} label="Cập nhật" value={formatRelativeDate(job.updatedAt)} />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
