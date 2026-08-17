"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { useCvMutations } from "@/hooks/use-cvs";
import type { CandidateCv } from "@/lib/api/schema";

interface RenameCvDialogProps {
  cv: CandidateCv | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameCvDialog({ cv, open, onOpenChange }: RenameCvDialogProps) {
  const { renameCv } = useCvMutations();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill name when cv changes or dialog opens
  useEffect(() => {
    if (cv && open) {
      setName(cv.name);
      setNameError(null);
    }
  }, [cv, open]);

  const handleOpenChange = (next: boolean) => {
    if (loading) return;
    if (!next) {
      setName("");
      setNameError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!cv) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Tên CV không được để trống");
      return;
    }

    // No change — just close
    if (trimmedName === cv.name) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      await renameCv(cv.id, trimmedName);
      toast.success("Đã đổi tên CV");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Đổi tên CV</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Nhập tên mới cho CV của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rename-cv-name">Tên CV</Label>
          <Input
            id="rename-cv-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="Nhập tên CV"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleSubmit();
              }
            }}
          />
          {nameError && <p className="text-xs text-danger">{nameError}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
