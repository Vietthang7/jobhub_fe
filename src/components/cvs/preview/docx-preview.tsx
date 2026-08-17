// mammoth output cho PDF/DOCX từ storage tin cậy của app;
// nếu mở rộng ra user-generated content khác cần sanitize bằng DOMPurify.
"use client";

import { useEffect, useState } from "react";
import mammoth from "mammoth";
import { Loader2 } from "lucide-react";
import { PreviewHeader } from "./preview-header";
import { PreviewFallback } from "./preview-fallback";
import type { CandidateCv } from "@/lib/api/schema";

interface DocxPreviewProps {
  cv: CandidateCv;
  onClose?: () => void;
}

type Status = "loading" | "success" | "error";

export function DocxPreview({ cv, onClose }: DocxPreviewProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [html, setHtml] = useState<string>("");
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch(cv.url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
        setError("Khong the tai hoac convert DOCX preview.");
      }
    }

    load();
    return () => controller.abort();
  }, [cv.url]);

  return (
    <div className="flex flex-col">
      <PreviewHeader cv={cv} onClose={onClose} />

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải DOCX...
        </div>
      )}

      {status === "error" && <PreviewFallback cv={cv} reason="convert-error" />}

      {status === "success" && (
        <div className="max-h-[720px] overflow-auto p-6">
          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
