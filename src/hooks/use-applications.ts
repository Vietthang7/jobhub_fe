import useSWR from "swr";
import { apiFetch } from "@/lib/api/client";
import { ApplicationResponse, ApplicationStatus, Page } from "@/lib/api/schema";

const PAGE_SIZE = 10;

export function useApplications(page: number, status?: ApplicationStatus) {
  const statusParam = status ? `&status=${status}` : "";
  const path = `/applications/mine?page=${page}&size=${PAGE_SIZE}&sort=appliedAt,desc${statusParam}`;

  const { data, error, isLoading, mutate } = useSWR<Page<ApplicationResponse>>(
    path,
    (url: string) => apiFetch<Page<ApplicationResponse>>(url),
    { revalidateOnFocus: false }
  );

  async function withdraw(id: number) {
    if (!data) return;
    const previous = data;
    const optimistic: Page<ApplicationResponse> = {
      ...data,
      content: data.content.map((app) =>
        app.id === id ? { ...app, status: "WITHDRAWN" as const } : app
      ),
    };

    // Optimistic update, skip revalidation until we know the outcome.
    await mutate(optimistic, { revalidate: false });

    try {
      await apiFetch<ApplicationResponse>(`/applications/${id}/withdraw`, {
        method: "POST",
      });
      // Re-sync with server truth.
      mutate();
    } catch (err) {
      // Rollback on failure.
      await mutate(previous, { revalidate: false });
      throw err;
    }
  }

  return {
    applications: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    number: data?.number ?? 0,
    isLoading,
    error,
    withdraw,
  };
}
