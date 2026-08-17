import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus, JobStatus } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const jobStatusConfig: Record<JobStatus, { label: string; className: string }> = {
  OPEN: {
    label: "Đang mở",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  CLOSED: {
    label: "Đã đóng",
    className: "border-secondary/20 bg-secondary/10 text-muted-foreground",
  },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const cfg = jobStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full font-medium", cfg.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}

const applicationStatusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Đang chờ",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "border-danger/20 bg-danger/10 text-danger",
  },
  WITHDRAWN: {
    label: "Đã rút",
    className: "border-secondary/20 bg-secondary/10 text-muted-foreground",
  },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = applicationStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full font-medium", cfg.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}
