import React, { useState } from "react";
import { AlertTriangle, Trash2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "destructive",
  isLoading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thực thi thao tác xác nhận:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  const iconConfig = {
    destructive: {
      icon: Trash2,
      bg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    },
    default: {
      icon: AlertCircle,
      bg: "bg-primary/15 text-primary border border-primary/30",
    },
  }[variant];

  const Icon = iconConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-row items-start gap-3.5 space-y-0 text-left">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
              iconConfig.bg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <DialogTitle className="text-base font-bold text-foreground leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-5 sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="cursor-pointer gap-1.5"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
