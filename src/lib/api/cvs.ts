import { apiFetch } from "./client";
import type {
  CandidateCv,
  CandidateCvList,
  UploadCvResponse,
  DeleteCvResponse,
} from "./schema";

// ==========================================
// Constants
// ==========================================
export const CV_MAX_COUNT = 5;
export const CV_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const CV_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

// ==========================================
// API Functions
// ==========================================

/** Danh sách CV của candidate hiện tại */
export async function listCandidateCvs(): Promise<CandidateCvList> {
  return apiFetch<CandidateCvList>("/candidates/me/cvs");
}

/** Chi tiết 1 CV */
export async function getCandidateCv(id: number): Promise<CandidateCv> {
  return apiFetch<CandidateCv>(`/candidates/me/cvs/${id}`);
}

/** Upload CV mới với tên */
export async function uploadCandidateCv(file: File, name: string): Promise<CandidateCv> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  return apiFetch<CandidateCv>("/candidates/me/cvs", {
    method: "POST",
    body: formData,
  });
}

/** Upload CV bằng endpoint cũ (backward compat) */
export async function uploadCvLegacy(file: File): Promise<UploadCvResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadCvResponse>("/files/cv", {
    method: "POST",
    body: formData,
  });
}

/** Đổi tên CV */
export async function renameCandidateCv(id: number, name: string): Promise<CandidateCv> {
  return apiFetch<CandidateCv>(`/candidates/me/cvs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

/** Set CV mặc định */
export async function setDefaultCv(id: number): Promise<CandidateCv> {
  return apiFetch<CandidateCv>(`/candidates/me/cvs/${id}/default`, {
    method: "POST",
  });
}

/** Xoá CV */
export async function deleteCandidateCv(id: number): Promise<DeleteCvResponse> {
  return apiFetch<DeleteCvResponse>(`/candidates/me/cvs/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// Helper Utilities
// ==========================================

/** Format file size thành human-readable string */
export function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Suy ra loại file từ contentType hoặc extension */
export function getCvPreviewKind(
  cv: Pick<CandidateCv, "contentType" | "originalFilename">
): "pdf" | "docx" | "unknown" {
  // Check contentType first
  if (cv.contentType) {
    if (cv.contentType === "application/pdf") return "pdf";
    if (
      cv.contentType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      cv.contentType === "application/msword"
    ) {
      return "docx";
    }
  }

  // Fallback to extension
  const filename = cv.originalFilename?.toLowerCase() ?? "";
  if (filename.endsWith(".pdf")) return "pdf";
  if (filename.endsWith(".docx") || filename.endsWith(".doc")) return "docx";

  return "unknown";
}
