"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { apiFetch } from "@/lib/api/client";
import {
  uploadCandidateCv,
  renameCandidateCv,
  setDefaultCv as setDefaultCvApi,
  deleteCandidateCv,
} from "@/lib/api/cvs";
import type { CandidateCv } from "@/lib/api/schema";
import { CV_MAX_COUNT } from "@/lib/api/cvs";

// ==========================================
// Query Keys
// ==========================================
export const cvKeys = {
  all: ["candidate-cvs"] as const,
  list: () => [...cvKeys.all, "list"] as const,
  detail: (id: number) => [...cvKeys.all, "detail", id] as const,
};

// SWR cache keys (actual API paths used as SWR keys — matches use-applications.ts pattern)
const CV_LIST_KEY = "/candidates/me/cvs";
const cvDetailKey = (id: number) => `/candidates/me/cvs/${id}`;

// ==========================================
// Query Hooks
// ==========================================

/** Hook đọc danh sách CV của candidate hiện tại */
export function useCandidateCvs() {
  const { data, error, isLoading, mutate } = useSWR<CandidateCv[]>(
    CV_LIST_KEY,
    (url: string) => apiFetch<CandidateCv[]>(url),
    { revalidateOnFocus: false }
  );

  const cvs = data ?? [];

  return {
    cvs,
    total: cvs.length,
    limit: CV_MAX_COUNT,
    isLoading,
    error,
    mutate,
  };
}

/** Hook đọc chi tiết 1 CV */
export function useCandidateCv(id: number | null) {
  const { data, error, isLoading } = useSWR<CandidateCv>(
    id ? cvDetailKey(id) : null,
    (url: string) => apiFetch<CandidateCv>(url),
    { revalidateOnFocus: false }
  );

  return {
    cv: data ?? null,
    isLoading,
    error,
  };
}

// ==========================================
// Mutation Hook
// ==========================================

/** Hook cung cấp các mutation functions cho CV management */
export function useCvMutations() {
  async function uploadCv(file: File, name: string) {
    const result = await uploadCandidateCv(file, name);
    await mutate(CV_LIST_KEY);
    return result;
  }

  async function renameCv(id: number, name: string) {
    const result = await renameCandidateCv(id, name);
    await mutate(CV_LIST_KEY);
    await mutate(cvDetailKey(id));
    return result;
  }

  async function setDefaultCv(id: number) {
    const result = await setDefaultCvApi(id);
    await mutate(CV_LIST_KEY);
    return result;
  }

  async function deleteCv(id: number) {
    const result = await deleteCandidateCv(id);
    await mutate(CV_LIST_KEY);
    return result;
  }

  return {
    uploadCv,
    renameCv,
    setDefaultCv,
    deleteCv,
  };
}

// ==========================================
// Upload State Hook
// ==========================================

type UploadStatus = "idle" | "uploading" | "success" | "error";

/** Hook quản lý upload state riêng biệt — cung cấp status machine cho UI loading indicator */
export function useCvUpload() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (file: File, name: string) => {
    setStatus("uploading");
    setError(null);
    try {
      const result = await uploadCandidateCv(file, name);
      await mutate(CV_LIST_KEY);
      setStatus("success");
      return result;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err; // re-throw — component layer handles toast/UI
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    upload,
    status,
    error,
    reset,
  };
}
