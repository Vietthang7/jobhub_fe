"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { apiFetch } from "@/lib/api/client";
import {
  AuditLogEntrySchema,
  pageSchema,
  type AuditLogEntry,
  type Page,
} from "@/lib/api/schema";

const PAGE_SIZE = 10;
const AuditLogsPageSchema = pageSchema(AuditLogEntrySchema);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTarget(log: AuditLogEntry) {
  if (!log.targetType) return "—";
  return `${log.targetType}${log.targetId ? ` #${log.targetId}` : ""}`;
}

function formatDetails(log: AuditLogEntry) {
  const parts = [formatTarget(log), log.ip ? `IP: ${log.ip}` : undefined].filter(
    (part): part is string => Boolean(part && part !== "—")
  );

  if (log.metadata) parts.push(log.metadata);
  return parts.length ? parts.join(" · ") : "—";
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { setParams } = useSearchParamsSetter();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Trang {page + 1} / {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => setParams({ page: page - 1 }, { resetPage: false })}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => setParams({ page: page + 1 }, { resetPage: false })}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

export function AdminAuditLogsClient() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 0);
  const qs = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
  const path = `/admin/audit-logs?${qs.toString()}`;

  const { data, error, isLoading } = useSWR<Page<AuditLogEntry>>(
    path,
    async (url: string) => AuditLogsPageSchema.parse(await apiFetch<unknown>(url)),
    { revalidateOnFocus: false }
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Nhật ký hoạt động
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi các hành động được ghi nhận trong hệ thống.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4" colSpan={4}>
                      <Skeleton className="h-8 w-full bg-primary-50" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-danger">
                    Không tải được nhật ký hoạt động. Vui lòng thử lại.
                  </td>
                </tr>
              )}

              {!isLoading && !error && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <p className="font-medium text-foreground">Chưa có nhật ký hoạt động.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Các hành động quản trị sẽ xuất hiện tại đây.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                data?.content.map((log, index) => (
                  <tr
                    key={log.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-page/50"}
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-primary-50 px-2 py-1 font-mono text-xs font-semibold text-primary-700">
                        {log.action}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {log.actorUserId ? `User #${log.actorUserId}` : "Hệ thống"}
                    </td>
                    <td className="max-w-[420px] px-4 py-4 text-muted-foreground">
                      <span className="line-clamp-2">{formatDetails(log)}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {data && <Pagination page={data.number} totalPages={data.totalPages} />}
      </Card>
    </div>
  );
}
