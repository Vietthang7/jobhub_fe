import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBreakdownItem {
  label: string;
  value: number;
  className?: string;
}

interface StatCardProps {
  title: string;
  total: number;
  icon: LucideIcon;
  /** Tailwind gradient stops, kept for backward compatibility and mapped to a soft icon tint. */
  gradient?: string;
  breakdown?: StatBreakdownItem[];
}

function chipClasses(gradient?: string) {
  if (gradient?.includes("red")) {
    return "bg-danger/10 text-danger";
  }
  if (gradient?.includes("orange")) {
    return "bg-accent-orange/10 text-accent-orange";
  }
  if (gradient?.includes("amber") || gradient?.includes("yellow")) {
    return "bg-warning/10 text-warning";
  }
  if (gradient?.includes("blue") || gradient?.includes("cyan") || gradient?.includes("sky")) {
    return "bg-blue-50 text-blue-600";
  }
  return "bg-primary/10 text-primary";
}

export function StatCard({ title, total, icon: Icon, gradient, breakdown = [] }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-lg", chipClasses(gradient))}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-display text-[32px] font-semibold leading-tight tabular-nums text-foreground">
          {total.toLocaleString("vi-VN")}
        </p>
      </div>
      {breakdown.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {breakdown.map((item) => (
            <span
              key={item.label}
              className={cn(
                "rounded-full bg-page px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground",
                item.className
              )}
            >
              {item.label}: {item.value.toLocaleString("vi-VN")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
