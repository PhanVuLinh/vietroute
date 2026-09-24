import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { AlertCircle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { useSubmitCodMutation } from "../hooks/useFinance";
import type { CodReconciliationItem } from "../types/finance";
import { useAuthStore } from "@/shared/stores/authStore";

interface CodSubmissionDialogProps {
  reconciliation: CodReconciliationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CodSubmissionDialog: React.FC<CodSubmissionDialogProps> = ({
  reconciliation,
  open,
  onOpenChange,
}) => {
  const { user } = useAuthStore();
  const submitMutation = useSubmitCodMutation();

  const [submittedAmount, setSubmittedAmount] = useState<number>(0);
  const [cashierName, setCashierName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (reconciliation) {
      setSubmittedAmount(reconciliation.submittedAmount || reconciliation.collectedAmount);
      setCashierName(reconciliation.cashierName || user?.full_name || "Phan Vũ Linh");
      setNotes(reconciliation.notes || "");
    }
  }, [reconciliation, user]);

  if (!reconciliation) return null;

  const discrepancy = reconciliation.collectedAmount - (Number(submittedAmount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMutation.mutateAsync({
      id: reconciliation.id,
      data: {
        submitted_amount: Number(submittedAmount) || 0,
        cashier_name: cashierName,
        notes,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span>Xác nhận Nộp tiền COD cuối ca</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Thông tin phiên */}
            <div className="rounded-lg bg-muted/60 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã phiên đối soát:</span>
                <span className="font-mono font-bold text-foreground">{reconciliation.reconciliationCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tài xế bàn giao:</span>
                <span className="font-semibold text-foreground">{reconciliation.driverName} ({reconciliation.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền COD cần thu:</span>
                <span className="font-mono font-semibold">{reconciliation.totalCodAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tài xế thực thu từ khách:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {reconciliation.collectedAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* Số tiền thực nộp */}
            <div className="space-y-2">
              <Label htmlFor="submitted_amount" className="text-xs font-semibold">
                Số tiền nộp vào quỹ (VNĐ) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="submitted_amount"
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={submittedAmount}
                  onChange={(e) => setSubmittedAmount(Number(e.target.value))}
                  className="font-mono text-base font-bold pl-8"
                />
                <DollarSign className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
              </div>
            </div>

            {/* Báo cáo chênh lệch Realtime */}
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              discrepancy === 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
            }`}>
              {discrepancy === 0 ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              )}
              <div className="flex-1">
                <div className="font-bold">
                  {discrepancy === 0
                    ? "Khớp hoàn toàn (0đ chênh lệch)"
                    : `Chênh lệch: ${Math.abs(discrepancy).toLocaleString("vi-VN")} đ (${
                        discrepancy > 0 ? "Tài xế nộp thiếu" : "Tài xế nộp dư"
                      })`}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {discrepancy === 0
                    ? "Phiên đối soát sẽ tự động chuyển sang trạng thái HOÀN TẤT (SETTLED)."
                    : "Phiên đối soát sẽ chuyển sang CÓ CHÊNH LỆCH (DISCREPANCY) và lưu vào hồ sơ giải trình."}
                </div>
              </div>
            </div>

            {/* Kế toán xác nhận */}
            <div className="space-y-1.5">
              <Label htmlFor="cashier_name" className="text-xs">
                Kế toán / Thủ quỹ xác nhận
              </Label>
              <Input
                id="cashier_name"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                placeholder="Họ tên người nhận tiền..."
              />
            </div>

            {/* Ghi chú & Giải trình */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">
                Ghi chú / Giải trình chênh lệch
              </Label>
              <Textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lý do chênh lệch hoặc số biên lai nộp tiền..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitMutation.isPending ? "Đang lưu..." : "Xác nhận đối soát"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
