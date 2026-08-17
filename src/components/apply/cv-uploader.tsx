"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateCvFile(file: File): string | null {
  const dotIndex = file.name.lastIndexOf(".");
  const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Chỉ chấp nhận file PDF, DOC hoặc DOCX.";
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Chỉ chấp nhận file PDF, DOC hoặc DOCX.";
  }

  if (file.size > MAX_SIZE_BYTES) {
    return "File vượt quá kích thước tối đa 5MB.";
  }

  return null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CvUploaderProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  error?: string | null;
  disabled?: boolean;
  loading?: boolean;
}

export function CvUploader({ file, onFileSelect, onRemove, error, disabled, loading }: CvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (disabled || loading || !files?.length) return;
    const selectedFile = files.item(0);
    if (selectedFile) onFileSelect(selectedFile);
  };

  if (file) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{loading ? "Đang tải CV lên..." : formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || loading}
            aria-label="Gỡ file CV"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !disabled && !loading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-white px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-primary/5",
          (disabled || loading) && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Kéo thả CV vào đây hoặc <span className="text-primary">chọn file</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX — tối đa 5MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={disabled || loading}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
