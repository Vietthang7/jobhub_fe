"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { Check, Download, Mail, User, X } from "lucide-react";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/jobs/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { ApplicationResponse, ApplicationStatus, JobResponse, Page } from "@/lib/api/schema";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | ApplicationStatus;
type Decision = "ACCEPTED" | "REJECTED";
type ApplicationWithEmail = ApplicationResponse & { candidateEmail?: string; email?: string };

const filterLabels: Record<StatusFilter, string> = {
  ALL: "Tất cả",
  PENDING: "Đang chờ",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
  WITHDRAWN: "Đã rút",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

function getEmail(application: ApplicationWithEmail) {
  return application.candidateEmail ?? application.email;
}

export function JobApplicationsClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const jobId = params.id;
  const page = Number(searchParams.get("page") ?? 0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [coverLetterTarget, setCoverLetterTarget] = useState<ApplicationWithEmail | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{
    application: ApplicationWithEmail;
    decision: Decision;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: job } = useSWR<JobResponse>(
    jobId ? `/jobs/${jobId}` : null,
    (url: string) => apiFetch<JobResponse>(url),
    { revalidateOnFocus: false }
  );

  const { data, error, isLoading, mutate } = useSWR<Page<ApplicationWithEmail>>(
    jobId ? `/jobs/${jobId}/applications?page=${page}&size=${PAGE_SIZE}` : null,
    (url: string) => apiFetch<Page<ApplicationWithEmail>>(url),
    { revalidateOnFocus: false }
  );

  const filteredApplications = useMemo(
    () => {
      const applications = data?.content ?? [];
      return statusFilter === "ALL"
        ? applications
        : applications.filter((application) => application.status === statusFilter);
    },
    [data?.content, statusFilter]
  );
  async function handleDecision() {
    if (!decisionTarget) return;
    setActionLoading(true);
    try {
      await apiFetch<ApplicationResponse>(`/applications/${decisionTarget.application.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: decisionTarget.decision }),
      });
      toast.success(
        decisionTarget.decision === "ACCEPTED" ? "Đã chấp nhận ứng viên" : "Đã từ chối ứng viên"
      );
      setDecisionTarget(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không cập nhật được trạng thái ứng viên");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/employer/jobs" className="text-sm font-medium text-primary hover:underline">
            ← Về danh sách tin
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Ứng viên cho: {job?.title ?? "Đang tải"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi hồ sơ ứng tuyển và phản hồi nhanh cho ứng viên phù hợp.
          </p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
        <TabsList className="bg-white">
          {(Object.keys(filterLabels) as StatusFilter[]).map((status) => (
            <TabsTrigger key={status} value={status}>
              {filterLabels[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Ứng viên</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Ngày ứng tuyển</th>
                <th className="px-4 py-3 font-semibold">Cover letter</th>
                <th className="px-4 py-3 font-semibold w-16">CV</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} className="px-4 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-danger">
                    Không tải được danh sách ứng viên. Vui lòng thử lại.
                  </td>
                </tr>
              )}

              {!isLoading && !error && filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-foreground">Chưa có ứng viên nào</p>
                      <p className="text-sm text-muted-foreground">
                        {statusFilter === "ALL"
                          ? "Tin tuyển dụng này chưa nhận được hồ sơ ứng tuyển."
                          : "Không có hồ sơ nào ở trạng thái đã chọn."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                filteredApplications.map((application) => {
                  const email = getEmail(application);
                  return (
                    <tr key={application.id} className="transition-colors hover:bg-page/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                              {getInitial(application.candidateName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{application.candidateName}</p>
                            {email && (
                              <a href={`mailto:${email}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                                <Mail className="h-3 w-3" />
                                {email}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{formatDate(application.appliedAt)}</td>
                      <td className="max-w-[200px] px-4 py-4 text-muted-foreground">
                        {application.coverLetter ? (
                          <button
                            type="button"
                            onClick={() => setCoverLetterTarget(application)}
                            className="line-clamp-2 text-left hover:text-primary hover:underline"
                          >
                            {application.coverLetter}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {application.cvUrl ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              CV
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <ApplicationStatusBadge status={application.status} />
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {application.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => setDecisionTarget({ application, decision: "ACCEPTED" })}
                            >
                              <Check className="mr-1.5 h-4 w-4" />
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-danger text-white hover:bg-danger/90"
                              onClick={() => setDecisionTarget({ application, decision: "REJECTED" })}
                            >
                              <X className="mr-1.5 h-4 w-4" />
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {data && <Pagination page={data.number} totalPages={data.totalPages} />}

      <Dialog open={!!coverLetterTarget} onOpenChange={(open) => !open && setCoverLetterTarget(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Cover letter</DialogTitle>
            <DialogDescription>
              {coverLetterTarget?.candidateName} gửi kèm hồ sơ ứng tuyển.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-page p-4 text-sm text-foreground">
            {coverLetterTarget?.coverLetter}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!decisionTarget}
        onOpenChange={(open) => !open && setDecisionTarget(null)}
        title={decisionTarget?.decision === "ACCEPTED" ? "Chấp nhận ứng viên?" : "Từ chối ứng viên?"}
        description={
          decisionTarget?.decision === "ACCEPTED"
            ? `Ứng viên "${decisionTarget?.application.candidateName}" sẽ được chuyển sang trạng thái đã chấp nhận.`
            : `Ứng viên "${decisionTarget?.application.candidateName}" sẽ được chuyển sang trạng thái đã từ chối.`
        }
        confirmLabel={decisionTarget?.decision === "ACCEPTED" ? "Chấp nhận" : "Từ chối"}
        variant={decisionTarget?.decision === "REJECTED" ? "destructive" : "default"}
        loading={actionLoading}
        onConfirm={handleDecision}
      />
    </div>
  );
}
