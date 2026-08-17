import Link from "next/link";
import { Card } from "@/components/ui/card";
import { JobSummaryResponse } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { formatSalary } from "@/lib/utils/format";
import { Briefcase, Building2, MapPin } from "lucide-react";

interface JobCardProps {
  job: JobSummaryResponse;
}

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
};

const typeColors: Record<string, string> = {
  FULL_TIME: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PART_TIME: "bg-blue-50 text-blue-700 border-blue-200",
  CONTRACT: "bg-amber-50 text-amber-700 border-amber-200",
  INTERNSHIP: "bg-purple-50 text-purple-700 border-purple-200",
};

export function JobCard({ job }: JobCardProps) {
  const companyInitial = job.employerName.charAt(0).toUpperCase();

  return (
    <Link href={`/jobs/${job.id}`} className="group block h-full">
      <Card className="relative h-full overflow-hidden border border-border/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary ring-1 ring-primary/10">
            {companyInitial ? (
              <span className="font-display text-lg font-bold">{companyInitial}</span>
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-1">
              <h3 className="line-clamp-1 text-[15px] font-semibold text-text-primary transition-colors group-hover:text-primary">
                {job.title}
              </h3>
              <p className="line-clamp-1 text-base text-text-secondary">{job.employerName}</p>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{job.location || "Đang cập nhật"}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p>
                <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-sm font-semibold text-accent-orange">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  typeColors[job.employmentType] || "bg-gray-50 text-gray-700 border-gray-200"
                )}
              >
                <Briefcase className="h-3 w-3" />
                {employmentTypeLabels[job.employmentType] || job.employmentType}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
