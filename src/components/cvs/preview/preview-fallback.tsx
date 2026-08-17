import { AlertCircle, FileQuestion } from "lucide-react";
import { DownloadCvButton } from "./download-cv-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CandidateCv } from "@/lib/api/schema";

type FallbackReason = "unknown-type" | "load-error" | "convert-error";

interface PreviewFallbackProps {
  cv: Pick<CandidateCv, "name" | "originalFilename" | "url">;
  reason: FallbackReason;
}

const REASON_CONFIG: Record<FallbackReason, { title: string; icon: "alert" | "question" }> = {
  "unknown-type": {
    title: "Không hỗ trợ preview file này",
    icon: "question",
  },
  "load-error": {
    title: "Không thể tải preview CV",
    icon: "alert",
  },
  "convert-error": {
    title: "Không thể convert DOCX để preview",
    icon: "alert",
  },
};

export function PreviewFallback({ cv, reason }: PreviewFallbackProps) {
  const config = REASON_CONFIG[reason];
  const Icon = config.icon === "alert" ? AlertCircle : FileQuestion;

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 px-6 py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground" />

      <div className="space-y-1">
        <h4 className="font-semibold">{config.title}</h4>
        <p className="text-sm text-muted-foreground">
          Bạn vẫn có thể tải file về máy hoặc mở trong tab mới.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <DownloadCvButton url={cv.url} originalFilename={cv.originalFilename} />
        <a
          href={cv.url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Mở tab mới
        </a>
      </div>
    </div>
  );
}
