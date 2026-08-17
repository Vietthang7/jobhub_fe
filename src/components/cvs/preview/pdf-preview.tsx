"use client";

import { useState } from "react";
import { PreviewHeader } from "./preview-header";
import { PreviewFallback } from "./preview-fallback";
import type { CandidateCv } from "@/lib/api/schema";

interface PdfPreviewProps {
  cv: CandidateCv;
  onClose?: () => void;
}

/**
 * Render PDF bằng iframe. MVP approach — không cần config worker hay cài react-pdf.
 *
 * Note: iframe onError không fire consistently trên cross-origin.
 * Header luôn hiển thị link "Mở tab mới" như escape hatch cho user.
 * Nếu MVP thấy iframe không đủ (mobile Safari fail), Sprint 2 sẽ upgrade react-pdf.
 */
export function PdfPreview({ cv, onClose }: PdfPreviewProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col">
      <PreviewHeader cv={cv} onClose={onClose} />

      <div className="max-h-[720px] overflow-auto bg-muted p-4">
        {failed ? (
          <PreviewFallback cv={cv} reason="load-error" />
        ) : (
          <iframe
            src={cv.url}
            title={`Preview: ${cv.name}`}
            className="h-[720px] w-full rounded-lg border"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
