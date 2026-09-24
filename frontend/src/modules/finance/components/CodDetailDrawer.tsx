import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  User,
  Wallet,
} from "lucide-react";
import { useCodDetail } from "../hooks/useFinance";
import { formatDateTime } from "@/shared/utils/formatters";

interface CodDetailDrawerProps {
  reconciliationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSubmission?: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SETTLED":
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Đã tất toán</Badge>;
    case "DISCREPANCY":
      return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Có chênh lệch</Badge>;
    case "PARTIAL":
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Nộp một phần</Badge>;
    case "PENDING":
    default:
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">Chờ đối soát</Badge>;
  }
};

export const CodDetailDrawer: React.FC<CodDetailDrawerProps> = ({
  reconciliationId,
  open,
  onOpenChange,
  onOpenSubmission,
}) => {
  const { data: rec, isLoading } = useCodDetail(reconciliationId);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-1/3 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
        ) : !rec ? (
          <div className="text-center py-10 text-muted-foreground">Không tìm thấy thông tin phiên đối soát.</div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">{rec.reconciliationCode}</span>
                {getStatusBadge(rec.status)}
              </div>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <span>Chi tiết Đối soát COD</span>
              </SheetTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Ngày tạo ca: {formatDateTime(rec.date)}</span>
              </p>
            </SheetHeader>

            {/* Thông tin tài xế & Người xác nhận */}
            <div className="rounded-xl border bg-card p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground border-b pb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Thông tin nhân sự giao dịch</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Tài xế giao hàng:</span>
                  <span className="font-bold text-foreground text-sm">{rec.driverName}</span>
                  <span className="block text-muted-foreground font-mono">{rec.driverPhone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Kế toán / Thủ quỹ duyệt:</span>
                  <span className="font-semibold text-foreground text-sm">{rec.cashierName || "Chưa xác nhận"}</span>
                  {rec.confirmedAt && (
                    <span className="block text-emerald-600 font-medium mt-0.5">
                      Duyệt: {formatDateTime(rec.confirmedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tổng quan tài chính */}
            <div className="rounded-xl border bg-card p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground border-b pb-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Tổng hợp dòng tiền COD</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground block text-[11px]">Tổng COD theo đơn:</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    {rec.totalCodAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10">
                  <span className="text-emerald-700 dark:text-emerald-300 block text-[11px]">Tài xế đã thu:</span>
                  <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {rec.collectedAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                  <span className="text-blue-700 dark:text-blue-300 block text-[11px]">Đã nộp vào quỹ:</span>
                  <span className="font-mono font-bold text-base text-blue-600 dark:text-blue-400">
                    {rec.submittedAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className={`p-2.5 rounded-lg ${
                  rec.discrepancy === 0 ? "bg-muted/40" : "bg-rose-500/10"
                }`}>
                  <span className="text-muted-foreground block text-[11px]">Chênh lệch:</span>
                  <span className={`font-mono font-bold text-base ${
                    rec.discrepancy === 0 ? "text-muted-foreground" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {rec.discrepancy.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {rec.notes && (
                <div className="pt-2 border-t text-muted-foreground">
                  <span className="font-semibold text-foreground">Ghi chú: </span>
                  <span>{rec.notes}</span>
                </div>
              )}
            </div>

            {/* Danh sách các đơn hàng trong ca */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Danh sách đơn hàng ({rec.entries?.length || 0})</span>
                </h4>
              </div>

              <div className="space-y-2">
                {rec.entries?.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border bg-card hover:bg-muted/20 transition-all text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{item.orderCode}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {item.paymentMethod === "CASH" ? "Tiền mặt" : item.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Ví điện tử"}
                        </Badge>
                      </div>
                      <div className="text-right font-mono font-bold text-foreground">
                        {item.actualCollected.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                      <span>Khách: {item.receiverName} ({item.receiverPhone})</span>
                      <span>Dự kiến: {item.expectedCod.toLocaleString("vi-VN")} đ</span>
                    </div>
                    {item.isDiscrepant && (
                      <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.discrepancyReason || "Có chênh lệch tiền thu với đơn hàng gốc"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t flex gap-3">
              {rec.status !== "SETTLED" && onOpenSubmission && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenSubmission();
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Thực hiện đối soát / Nộp tiền</span>
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
