"use client";

import { useState } from "react";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CvListItem } from "@/components/cvs/cv-list-item";
import { UploadCvDialog } from "@/components/cvs/upload-cv-dialog";
import { RenameCvDialog } from "@/components/cvs/rename-cv-dialog";
import { DeleteCvDialog } from "@/components/cvs/delete-cv-dialog";
import { useCandidateCvs, useCvMutations } from "@/hooks/use-cvs";
import { ApiError } from "@/lib/api/client";
import type { CandidateCv } from "@/lib/api/schema";

export default function ManageCvsClient() {
  return (
    <RequireAuth allowedRoles={["CANDIDATE"]}>
      <ManageCvsContent />
    </RequireAuth>
  );
}

function ManageCvsContent() {
  const { cvs, total, limit, isLoading, error } = useCandidateCvs();
  const { setDefaultCv } = useCvMutations();

  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameCv, setRenameCv] = useState<CandidateCv | null>(null);
  const [deleteCv, setDeleteCv] = useState<CandidateCv | null>(null);

  // Sort: default CV first, then by createdAt DESC
  const sortedCvs = [...cvs].sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSetDefault = async (cv: CandidateCv) => {
    try {
      await setDefaultCv(cv.id);
      toast.success("Đã đặt CV mặc định");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const maxCvs = limit || 5;
  const isAtLimit = total >= maxCvs;

  return (
    <main className="bg-page pb-16 pt-8">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Header */}
        <header className="mb-6 rounded-lg border bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Hồ sơ</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Quản lý CV</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? "Đang tải..." : `${total}/${maxCvs} CV`}
              </p>
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              disabled={isAtLimit}
              title={isAtLimit ? `Bạn đã đạt giới hạn ${maxCvs} CV` : undefined}
            >
              <Upload className="mr-2 h-4 w-4" />
              Tải CV lên
            </Button>
          </div>
        </header>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Không tải được danh sách CV</h2>
            <p className="mt-2 text-sm text-muted-foreground">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
            <Button onClick={() => window.location.reload()} className="mt-5">
              Thử lại
            </Button>
          </div>
        ) : sortedCvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Bạn chưa có CV nào</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tải CV lên để sử dụng khi ứng tuyển công việc.
            </p>
            <Button onClick={() => setUploadOpen(true)} className="mt-5">
              <Upload className="mr-2 h-4 w-4" />
              Tải CV lên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCvs.map((cv) => (
              <CvListItem
                key={cv.id}
                cv={cv}
                onRename={setRenameCv}
                onDelete={setDeleteCv}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UploadCvDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <RenameCvDialog cv={renameCv} open={!!renameCv} onOpenChange={(open) => !open && setRenameCv(null)} />
      <DeleteCvDialog cv={deleteCv} open={!!deleteCv} onOpenChange={(open) => !open && setDeleteCv(null)} />
    </main>
  );
}
