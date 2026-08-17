import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { apiFetch, RateLimitError } from "@/lib/api/client";
import { JobSummaryResponse, Page } from "@/lib/api/schema";
import { useState, useEffect } from "react";

export function useJobSearch() {
  const searchParams = useSearchParams();
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const endpoint = "/jobs/search";
  
  // Construct path with query string
  const queryString = searchParams.toString();
  const path = queryString ? `${endpoint}?${queryString}` : endpoint;

  const { data, error, isLoading, mutate } = useSWR<Page<JobSummaryResponse>>(
    path,
    (url: string) => apiFetch<Page<JobSummaryResponse>>(url),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: (err) => {
        if (err instanceof RateLimitError) {
          const secs = err.retryAfter || 60;
          setRateLimitSeconds(secs);
        }
      },
    }
  );

  useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const page = data?.number ?? 0;
  const size = data?.size ?? 20;
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return {
    jobs: data?.content ?? [],
    totalElements,
    totalPages,
    page,
    size,
    isLoading,
    error,
    rateLimitSeconds,
    mutate,
  };
}
