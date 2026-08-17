"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Share2, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ApplyDialog } from "@/components/apply/apply-dialog";

interface JobDetailActionsProps {
  jobId: number;
  jobTitle: string;
  status: "OPEN" | "CLOSED";
}

function JobDetailActionsInner({ jobId, jobTitle, status }: JobDetailActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAuthStore();
  const [applyOpen, setApplyOpen] = useState(false);

  const isCandidate = user?.roles?.includes("CANDIDATE");

  // Deep-link support: `/jobs/[id]?apply=1` opens the apply dialog directly.
  useEffect(() => {
    if (searchParams.get("apply") !== "1") return;

    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(`${pathname}?apply=1`)}`);
      return;
    }

    if (isCandidate && status === "OPEN") {
      setApplyOpen(true);
    }
    // Only run once on mount / when the query param first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleApply = () => {
    if (!accessToken) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isCandidate) {
      setApplyOpen(true);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
    } catch {
      toast.error("Không thể sao chép liên kết. Hãy sao chép thủ công từ thanh địa chỉ.");
    }
  };

  const handleApplyOpenChange = (open: boolean) => {
    setApplyOpen(open);
    // Clean up the `?apply=1` query param once the dialog is dismissed so a
    // refresh doesn't re-trigger it.
    if (!open && searchParams.get("apply") === "1") {
      router.replace(pathname);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {status === "OPEN" && (!accessToken || isCandidate) && (
        <Button
          onClick={handleApply}
          className="h-12 w-full text-base font-semibold shadow-card"
        >
          <Send className="w-4 h-4 mr-2" />
          Ứng tuyển ngay
        </Button>
      )}

      <Button
        variant="outline"
        onClick={handleShare}
        className="h-10 w-full border-border text-text-primary"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Chia sẻ tin tuyển dụng
      </Button>

      {isCandidate && (
        <ApplyDialog
          jobId={jobId}
          jobTitle={jobTitle}
          open={applyOpen}
          onOpenChange={handleApplyOpenChange}
        />
      )}
    </div>
  );
}

export function JobDetailActions(props: JobDetailActionsProps) {
  return (
    <Suspense fallback={<div className="h-11" />}>
      <JobDetailActionsInner {...props} />
    </Suspense>
  );
}
