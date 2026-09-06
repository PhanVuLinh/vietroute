import React from "react";
import {
  Package,
  User,
  Clock,
  Send,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Order, Warehouse } from "@/core/types/logistics";
import type { DriverCandidate } from "../utils/driverScoring";

interface AssignmentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  candidate: DriverCandidate | null;
  warehouse?: Warehouse;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const AssignmentConfirmationDialog: React.FC<AssignmentConfirmationDialogProps> = ({
  isOpen,
  onClose,
  order,
  candidate,
  warehouse,
  onConfirm,
  isSubmitting,
}) => {
  if (!order || !candidate) return null;

  const { driver, vehicle, matchScore, estimatedEtaMinutes, isBestMatch } = candidate;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Xác nhận phân công đơn hàng
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Vui lòng kiểm tra lại thông tin trước khi chuyển lệnh giao cho tài xế
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Thẻ tóm tắt nghiệp vụ phân công */}
        <div className="py-3 space-y-3 text-xs">
          {/* 1. Thông tin đơn hàng */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                Đơn hàng
              </span>
              <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                {order.orderCode}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-muted-foreground">Người nhận:</span>
              <span className="font-semibold text-right text-foreground">{order.receiverName}</span>
              <span className="text-muted-foreground">Khối lượng:</span>
              <span className="font-semibold text-right text-foreground">{order.totalWeight} kg</span>
              <span className="text-muted-foreground">Điểm lấy hàng:</span>
              <span className="font-semibold text-right text-foreground truncate">
                {warehouse?.name || "Kho hàng VietRoute"}
              </span>
            </div>
          </div>

          {/* 2. Thông tin tài xế & phương tiện */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Tài xế tiếp nhận
              </span>
              <div className="flex items-center gap-1">
                {isBestMatch && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 py-0 gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    Đề xuất
                  </Badge>
                )}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {matchScore}% phù hợp
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-muted-foreground">Họ và tên:</span>
              <span className="font-semibold text-right text-foreground">
                {driver.fullName} ({driver.driverCode})
              </span>
              <span className="text-muted-foreground">Số điện thoại:</span>
              <span className="font-mono text-right text-foreground">{driver.phone}</span>
              <span className="text-muted-foreground">Biển số phương tiện:</span>
              <span className="font-mono font-bold text-right text-foreground">
                {vehicle?.licensePlate || "Chưa gán xe"}
              </span>
              <span className="text-muted-foreground">ETA tiếp cận kho:</span>
              <span className="font-semibold text-right text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                ~{estimatedEtaMinutes} phút
              </span>
            </div>
          </div>

          {/* Cảnh báo nếu tài xế đang giữ nhiều đơn */}
          {driver.currentDeliveryCount >= 3 && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Tài xế đang xử lý {driver.currentDeliveryCount} đơn hàng. Vẫn còn trong ngưỡng an toàn.</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            id="btn-confirm-assignment"
          >
            {isSubmitting ? (
              <span>Đang phân công...</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Xác nhận phân công</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
