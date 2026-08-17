"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { ApiError } from "@/lib/api/client";
import { useCvMutations } from "@/hooks/use-cvs";
import type { CandidateCv } from "@/lib/api/schema";

interface DeleteCvDialogProps {
  cv: CandidateCv | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCvDialog({ cv, open, onOpenChange }: DeleteCvDialogProps) {
  const { deleteCv } = useCvMutations();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!cv) return;

    setLoading(true);
    try {
      const result = await deleteCv(cv.id);
      toast.success("Đã xoá CV");

      if (result.nextDefaultCvId) {
        toast.info(`Đã cập nhật CV mặc định thành CV ID ${result.nextDefaultCvId}`);
      }

      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const description = cv?.default
    ? "Đây là CV mặc định. Sau khi xoá, CV mới nhất còn lại sẽ tự làm mặc định. Bạn có chắc chắn muốn xoá?"
    : `Bạn có chắc chắn muốn xoá CV "${cv?.name ?? ""}"? Hành động này không thể hoàn tác.`;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => !loading && onOpenChange(next)}
      title="Xoá CV"
      description={description}
      confirmLabel="Xoá"
      cancelLabel="Hủy"
      variant="destructive"
      loading={loading}
      onConfirm={handleConfirm}
    />
  );
}
