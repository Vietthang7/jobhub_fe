"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { FileText, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CvUploader, validateCvFile } from "./cv-uploader";
import { apiFetch, ApiError } from "@/lib/api/client";
import { ApplicationResponse } from "@/lib/api/schema";
import { useCandidateCvs } from "@/hooks/use-cvs";
import { uploadCandidateCv, uploadCvLegacy, formatFileSize } from "@/lib/api/cvs";
import type { CandidateCv } from "@/lib/api/schema";

const MAX_COVER_LETTER = 5000;

type Stage = "idle" | "uploading" | "submitting";
type Mode = "select" | "upload";

interface ApplyDialogProps {
  jobId: number;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function ApplyDialog({ jobId, jobTitle, open, onOpenChange, onApplied }: ApplyDialogProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [duplicate, setDuplicate] = useState(false);

  // New state for CV selection mode
  const [mode, setMode] = useState<Mode>("select");
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [cvName, setCvName] = useState("");

  // Fetch CV list
  const { cvs, total, limit, isLoading: cvsLoading, error: cvsError } = useCandidateCvs();

  // Determine if CV list feature is available (backward compat)
  const cvListAvailable = !cvsError && !cvsLoading;
  const hasCvs = cvs.length > 0;

  // Init selectedCvId when CV list loads — only once
  useEffect(() => {
    if (cvsLoading || cvsError || cvs.length === 0) return;
    if (selectedCvId !== null) return;

    const defaultCv = cvs.find((cv) => cv.default);
    setSelectedCvId(defaultCv ? defaultCv.id : cvs[0]!.id);
  }, [cvsLoading, cvsError, cvs, selectedCvId]);

  // Auto-switch to upload mode if no CVs or API error
  useEffect(() => {
    if (cvsLoading) return;
    if (cvsError || cvs.length === 0) {
      setMode("upload");
    }
  }, [cvsLoading, cvsError, cvs.length]);

  const busy = stage !== "idle";

  // Selected CV object for metadata display
  const selectedCv: CandidateCv | undefined = selectedCvId
    ? cvs.find((cv) => cv.id === selectedCvId)
    : undefined;

  const resetState = () => {
    setCoverLetter("");
    setCvFile(null);
    setFileError(null);
    setStage("idle");
    setDuplicate(false);
    setCvName("");
    // Reset mode based on CV availability
    if (hasCvs && !cvsError) {
      setMode("select");
    } else {
      setMode("upload");
    }
    // Don't reset selectedCvId — keep last selection for convenience
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
  };

  const handleOpenChange = (next: boolean) => {
    if (busy) return; // never allow closing mid-flight
    if (!next) resetState();
    onOpenChange(next);
  };

  const canSubmit = (): boolean => {
    if (busy || !!fileError) return false;
    if (mode === "select") return selectedCvId !== null;
    if (mode === "upload") return cvFile !== null;
    return false;
  };

  const handleSubmit = async () => {
    setDuplicate(false);

    try {
      if (mode === "select" && selectedCvId) {
        // New flow: submit with selected CV id directly
        setStage("submitting");
        await apiFetch<ApplicationResponse>("/applications", {
          method: "POST",
          body: JSON.stringify({
            jobId,
            coverLetter: coverLetter.trim() || undefined,
            cvId: selectedCvId,
          }),
        });
      } else if (mode === "upload" && cvFile) {
        // Upload flow: upload file first, then submit application
        setStage("uploading");

        let cvId: number | undefined;
        let cvUrl: string;

        if (cvName?.trim()) {
          // Upload via new endpoint with name
          const result = await uploadCandidateCv(cvFile, cvName.trim());
          cvId = result.id;
          cvUrl = result.url;
        } else {
          // Upload via legacy endpoint
          const result = await uploadCvLegacy(cvFile);
          cvId = result.cvId;
          cvUrl = result.url;
        }

        setStage("submitting");
        await apiFetch<ApplicationResponse>("/applications", {
          method: "POST",
          body: JSON.stringify({
            jobId,
            coverLetter: coverLetter.trim() || undefined,
            cvId,
            cvUrl, // backward compat fallback
          }),
        });
      }

      toast.success("Đã gửi đơn ứng tuyển");
      resetState();
      onOpenChange(false);
      mutate((key) => typeof key === "string" && key.startsWith("/applications/mine"));
      mutate((key) => typeof key === "string" && key.startsWith("/candidates/me/cvs"));
      onApplied?.();
    } catch (err) {
      setStage("idle");
      if (err instanceof ApiError) {
        if (err.status === 409) {
          if (mode === "upload") {
            toast.error("Bạn đã đạt giới hạn 5 CV. Hãy xoá CV cũ trước khi tải mới.");
          } else {
            setDuplicate(true);
            toast.error("Bạn đã ứng tuyển job này rồi");
          }
        } else if (err.status === 413) {
          toast.error("File CV không được vượt quá 5MB.");
        } else if (err.status === 404 && mode === "select") {
          toast.error("CV đã chọn không còn tồn tại, vui lòng chọn CV khác.");
          mutate((key) => typeof key === "string" && key.startsWith("/candidates/me/cvs"));
          setSelectedCvId(null);
        } else if (err.status === 400) {
          toast.error(err.message || "File CV không hợp lệ");
        } else if (err.status === 401) {
          toast.error("Vui lòng đăng nhập để ứng tuyển");
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
          <DialogTitle className="font-display text-xl text-foreground">{"Ứng tuyển: "}{jobTitle}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {"Điền thông tin bên dưới để gửi hồ sơ ứng tuyển."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apply-cover-letter">{`Thư giới thiệu (không bắt buộc)`}</Label>
            <Textarea
              id="apply-cover-letter"
              value={coverLetter}
              maxLength={MAX_COVER_LETTER}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={"Giới thiệu ngắn về bản thân và lý do bạn phù hợp với vị trí này..."}
              className="min-h-[120px]"
              disabled={busy}
            />
            <p className="text-right text-xs text-muted-foreground">
              {coverLetter.length}/{MAX_COVER_LETTER}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{`CV đính kèm`}</Label>

            {/* CV Selection Mode */}
            {mode === "select" && cvListAvailable && hasCvs && (
              <div className="space-y-3">
                <Select
                  value={selectedCvId?.toString() ?? ""}
                  onValueChange={(val) => setSelectedCvId(Number(val))}
                  disabled={busy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"Chọn CV..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {cvs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id.toString()}>
                        <span className="flex items-center gap-2">
                          <span className="truncate">{cv.name}</span>
                          {cv.default && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {`Mặc định`}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatFileSize(cv.fileSize)}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected CV metadata preview */}
                {selectedCv && (
                  <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{selectedCv.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCv.originalFilename} — {formatFileSize(selectedCv.fileSize)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action links */}
                <div className="flex items-center gap-4 text-sm">
                  {total < limit && (
                    <button
                      type="button"
                      className="text-primary hover:underline disabled:opacity-50"
                      disabled={busy}
                      onClick={() => setMode("upload")}
                    >
                      {`Hoặc tải CV mới`}
                    </button>
                  )}
                  <a
                    href="/candidate/cvs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    {`Quản lý CV`}
                  </a>
                </div>
              </div>
            )}

            {/* Upload Mode */}
            {mode === "upload" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="apply-cv-name">{`Tên CV (không bắt buộc)`}</Label>
                  <Input
                    id="apply-cv-name"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    placeholder="VD: CV Fullstack Developer"
                    disabled={busy}
                    maxLength={100}
                  />
                </div>

                <CvUploader
                  file={cvFile}
                  onFileSelect={handleFileSelect}
                  onRemove={() => {
                    setCvFile(null);
                    setFileError(null);
                  }}
                  error={fileError}
                  disabled={busy}
                  loading={stage === "uploading"}
                />

                {/* Back to select link — only when CV list has items */}
                {hasCvs && cvListAvailable && (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                    disabled={busy}
                    onClick={() => setMode("select")}
                  >
                    {`Quay lại chọn CV có sẵn`}
                  </button>
                )}
              </div>
            )}

            {/* Loading state while fetching CV list */}
            {cvsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {`Đang tải danh sách CV...`}
              </div>
            )}
          </div>

          {duplicate && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
              <span>{`Bạn đã ứng tuyển job này rồi.`}</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto shrink-0 p-0 text-danger"
                onClick={() => {
                  resetState();
                  onOpenChange(false);
                  router.push("/applications/mine");
                }}
              >
                {`Xem đơn ứng tuyển`}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
          >
            {`Hủy`}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit()}
          >
            {stage === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {`Đang tải CV...`}
              </>
            ) : stage === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {`Đang gửi...`}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {`Gửi đơn ứng tuyển`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
