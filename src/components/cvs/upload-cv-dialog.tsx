"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CvUploader, validateCvFile } from "@/components/apply/cv-uploader";
import { ApiError } from "@/lib/api/client";
import { useCvUpload } from "@/hooks/use-cvs";

interface UploadCvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function deriveName(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
}

export function UploadCvDialog({ open, onOpenChange }: UploadCvDialogProps) {
  const { upload, status, reset } = useCvUpload();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const busy = status === "uploading";

  const resetState = () => {
    setCvFile(null);
    setFileError(null);
    setName("");
    setNameError(null);
    reset();
  };

  const handleOpenChange = (next: boolean) => {
    if (busy) return;
    if (!next) resetState();
    onOpenChange(next);
  };

  const handleFileSelect = (file: File) => {
    const err = validateCvFile(file);
    if (err) {
      setFileError(err);
      setCvFile(null);
      return;
    }
    setFileError(null);
    setCvFile(file);
    // Auto-fill name from filename if name is empty
    if (!name.trim()) {
      setName(deriveName(file.name));
    }
  };

  const handleSubmit = async () => {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      if (cvFile) {
        // Fallback: derive from filename
        const derived = deriveName(cvFile.name).trim();
        if (!derived) {
          setNameError("Tên CV không được để trống");
          return;
        }
        setName(derived);
      } else {
        setNameError("Tên CV không được để trống");
        return;
      }
    }
    setNameError(null);

    if (!cvFile) {
      setFileError("Vui lòng chọn file CV");
      return;
    }

    const finalName = name.trim() || deriveName(cvFile.name).trim();

    try {
      await upload(cvFile, finalName);
      toast.success("Đã tải CV lên thành công");
      resetState();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Bạn đã đạt giới hạn 5 CV");
        } else if (err.status === 413) {
          toast.error("File CV không được vượt quá 5MB");
        } else if (err.status === 415) {
          toast.error("Chỉ hỗ trợ định dạng PDF, DOC hoặc DOCX");
        } else if (err.status === 400) {
          toast.error(err.message || "Dữ liệu không hợp lệ");
        } else {
          toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Tải CV lên</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn file CV và đặt tên để dễ quản lý.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cv-name">Tên CV</Label>
            <Input
              id="cv-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Ví dụ: CV Frontend Developer"
              disabled={busy}
            />
            {nameError && <p className="text-xs text-danger">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <Label>File CV</Label>
            <CvUploader
              file={cvFile}
              onFileSelect={handleFileSelect}
              onRemove={() => {
                setCvFile(null);
                setFileError(null);
              }}
              error={fileError}
              disabled={busy}
              loading={busy}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={busy}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={busy || !!fileError}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Tải lên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
