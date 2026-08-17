import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadCvButtonProps {
  url: string;
  originalFilename: string;
  variant?: "default" | "ghost" | "outline";
}

/**
 * Nút tải CV về máy.
 * Note: `download` attribute là hint cho browser — cross-origin có thể
 * không force download mà mở tab mới thay vào đó. Acceptable cho MVP.
 */
export function DownloadCvButton({
  url,
  originalFilename,
  variant = "outline",
}: DownloadCvButtonProps) {
  return (
    <a
      href={url}
      download={originalFilename}
      className={cn(buttonVariants({ variant, size: "sm" }))}
      rel="noreferrer"
    >
      <Download className="h-4 w-4" />
      Tải xuống
    </a>
  );
}
