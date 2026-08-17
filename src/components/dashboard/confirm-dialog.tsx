"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  /**
   * When set, forces a "type to confirm" strict flow: the confirm button
   * stays disabled until the user types this exact text (e.g. job title).
   */
  requireTextMatch?: string;
  requireTextLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  variant = "default",
  loading = false,
  onConfirm,
  requireTextMatch,
  requireTextLabel,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (!open) setTypedText("");
  }, [open]);

  const strict = Boolean(requireTextMatch);
  const isConfirmDisabled = loading || (strict && typedText !== requireTextMatch);

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent className="rounded-2xl border bg-white shadow-card">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">{title}</DialogTitle>
          {description && <DialogDescription className="text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>

        {strict && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {requireTextLabel || `Gõ "${requireTextMatch}" để xác nhận`}
            </label>
            <Input
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requireTextMatch}
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className={cn(variant === "destructive" && "bg-danger text-white hover:bg-danger/90")}
            onClick={() => onConfirm()}
            disabled={isConfirmDisabled}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
