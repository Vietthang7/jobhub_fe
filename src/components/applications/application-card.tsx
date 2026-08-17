"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, MoreVertical, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationResponse } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

interface ApplicationCardProps {
  application: ApplicationResponse;
  onWithdraw: (id: number) => Promise<void>;
}

function formatAppliedDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function ApplicationCard({ application, onWithdraw }: ApplicationCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleConfirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      await onWithdraw(application.id);
      setConfirmOpen(false);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <Card className="p-5 transition-shadow hover:shadow-card-hover">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={`/jobs/${application.jobId}`}
              className="line-clamp-1 text-base font-semibold text-foreground transition-colors hover:text-primary"
            >
              {application.jobTitle}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {application.candidateName || "Ứng viên JobHub"}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Ngày {formatAppliedDate(application.appliedAt)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <StatusBadge status={application.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mở menu đơn ứng tuyển">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {application.cvUrl && (
                  <DropdownMenuItem asChild>
                    <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                      Xem CV
                    </a>
                  </DropdownMenuItem>
                )}
                {application.status === "PENDING" && (
                  <DropdownMenuItem
                    className="text-danger focus:text-danger"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Rút đơn
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {application.coverLetter && (
          <div className="mt-4 rounded-lg bg-secondary/40 p-4">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-foreground"
            >
              Thư giới thiệu
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </button>
            <p className={cn("mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground", !expanded && "line-clamp-2")}>
              {application.coverLetter}
            </p>
          </div>
        )}
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rút đơn ứng tuyển?</DialogTitle>
            <DialogDescription>
              Sau khi rút đơn, nhà tuyển dụng sẽ không tiếp tục xử lý hồ sơ ứng tuyển này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={withdrawing}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmWithdraw} disabled={withdrawing}>
              {withdrawing ? "Đang rút..." : "Rút đơn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
