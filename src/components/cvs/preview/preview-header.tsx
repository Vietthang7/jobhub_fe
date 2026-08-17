import { ExternalLink, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/api/cvs";
import { DownloadCvButton } from "./download-cv-button";
import type { CandidateCv } from "@/lib/api/schema";

interface PreviewHeaderProps {
  cv: Pick<CandidateCv, "name" | "originalFilename" | "fileSize" | "url">;
  onClose?: () => void;
}

export function PreviewHeader({ cv, onClose }: PreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{cv.name}</h3>
        <p className="truncate text-sm text-muted-foreground">
          {cv.originalFilename} &middot; {formatFileSize(cv.fileSize)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href={cv.url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ExternalLink className="h-4 w-4" />
          Mở tab mới
        </a>

        <DownloadCvButton url={cv.url} originalFilename={cv.originalFilename} />

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
