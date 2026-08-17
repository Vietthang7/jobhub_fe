"use client";

import { useState } from "react";
import { Edit, Eye, ExternalLink, FileText, MoreVertical, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CvPreview } from "@/components/cvs/preview";
import { formatFileSize } from "@/lib/api/cvs";
import type { CandidateCv } from "@/lib/api/schema";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString("vi-VN");
  }
  if (diffDay > 0) return `${diffDay} ngày trước`;
  if (diffHour > 0) return `${diffHour} giờ trước`;
  if (diffMin > 0) return `${diffMin} phút trước`;
  return "Vừa xong";
}

interface CvListItemProps {
  cv: CandidateCv;
  onRename: (cv: CandidateCv) => void;
  onDelete: (cv: CandidateCv) => void;
  onSetDefault: (cv: CandidateCv) => void;
}

export function CvListItem({ cv, onRename, onDelete, onSetDefault }: CvListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-card transition-shadow hover:shadow-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">{cv.name}</p>
              {cv.default && (
                <Badge className="shrink-0">Mặc định</Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {cv.originalFilename} · {formatFileSize(cv.fileSize)} · {formatRelativeTime(cv.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Preview — mở dialog với CvPreview component */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="mr-1 h-4 w-4" />
            Xem trước
          </Button>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onRename(cv);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Đổi tên
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={cv.default}
                onClick={() => {
                  setMenuOpen(false);
                  onSetDefault(cv);
                }}
              >
                <Star className="mr-2 h-4 w-4" />
                Đặt làm mặc định
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger focus:text-danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(cv);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden [&>button:last-child]:hidden">
          <CvPreview cv={cv} onClose={() => setPreviewOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
