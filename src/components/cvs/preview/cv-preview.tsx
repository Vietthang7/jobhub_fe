"use client";

import { getCvPreviewKind } from "@/lib/api/cvs";
import { PdfPreview } from "./pdf-preview";
import { DocxPreview } from "./docx-preview";
import { PreviewFallback } from "./preview-fallback";
import type { CandidateCv } from "@/lib/api/schema";

interface CvPreviewProps {
  cv: CandidateCv;
  onClose?: () => void;
}

/**
 * Router component: chọn renderer dựa vào contentType / extension.
 */
export function CvPreview({ cv, onClose }: CvPreviewProps) {
  const kind = getCvPreviewKind(cv);

  if (kind === "pdf") return <PdfPreview cv={cv} onClose={onClose} />;
  if (kind === "docx") return <DocxPreview cv={cv} onClose={onClose} />;
  return <PreviewFallback cv={cv} reason="unknown-type" />;
}
