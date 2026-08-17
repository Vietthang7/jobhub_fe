import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Đang chờ",
    className: "bg-warning/10 text-warning hover:bg-warning/10",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "bg-primary/10 text-primary hover:bg-primary/10",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-danger/10 text-danger hover:bg-danger/10",
  },
  WITHDRAWN: {
    label: "Đã rút",
    className: "bg-secondary/70 text-secondary-foreground hover:bg-secondary/70",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status];

  return (
    <Badge variant="outline" className={cn("rounded-full border-transparent px-3 py-1 font-semibold", config.className, className)}>
      {config.label}
    </Badge>
  );
}
