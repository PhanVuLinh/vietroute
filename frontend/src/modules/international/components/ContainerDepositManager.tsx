import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  RotateCcw,
  Search,
  FileText,
  Ship,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useContainerDeposits, useInternationalMutations } from "../hooks/useInternational";
import type { ContainerDepositItem } from "../types/international";

export const ContainerDepositManager: React.FC = () => {
  const { data: deposits = [], isLoading } = useContainerDeposits();
  const { refundContainerDeposit } = useInternationalMutations();
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog for handling deposit refund with damage deduction
  const [activeDeposit, setActiveDeposit] = useState<ContainerDepositItem | null>(null);
  const [deductedAmount, setDeductedAmount] = useState<number>(0);
  const [deductedReason, setDeductedReason] = useState("");

  const filteredDeposits = deposits.filter(
    (d) =>
      d.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHeldDeposit = deposits
    .filter((d) => d.refundStatus === "PENDING_REFUND")
    .reduce((sum, d) => sum + d.depositAmountVnd, 0);

  const totalRefunded = deposits
    .filter((d) => d.refundStatus !== "PENDING_REFUND")
    .reduce((sum, d) => sum + (d.refundedAmountVnd || d.depositAmountVnd), 0);

  const handleOpenRefundModal = (deposit: ContainerDepositItem) => {
    setActiveDeposit(deposit);
    setDeductedAmount(0);
    setDeductedReason("");
  };

  const handleConfirmRefund = async (isFull: boolean) => {
    if (!activeDeposit) return;
    if (isFull) {
      await refundContainerDeposit.mutateAsync({
        id: activeDeposit.id,
        data: {
          status: "REFUNDED_FULL",
          refundedAmountVnd: activeDeposit.depositAmountVnd,
        },
      });
    } else {
      const netRefund = Math.max(0, activeDeposit.depositAmountVnd - deductedAmount);
      await refundContainerDeposit.mutateAsync({
        id: activeDeposit.id,
        data: {
          status: "DEDUCTED_REPAIR",
          refundedAmountVnd: netRefund,
          deductedReason: deductedReason || "Trừ phí vệ sinh / sửa chữa vỏ theo biên bản EIR",
        },
      });
    }
    setActiveDeposit(null);
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "INTACT":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Vỏ sạch & Nguyên vẹn</Badge>;
      case "DENTED":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Móp sàn / Xước vách</Badge>;
      case "HOLE_REPAIRED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Thủng nóc / Phải vá</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{condition}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-xs text-muted-foreground">
        Đang đồng bộ hồ sơ cược vỏ container EIR...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tiền Cược Vỏ Đang Ký Quỹ</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-foreground font-mono">
              {totalHeldDeposit.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Đang chờ hãng tàu hoàn trả</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tiền Cược Đã Thu Hồi</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-emerald-600 font-mono">
              {totalRefunded.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Đã tất toán và hoàn tiền về quỹ</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Biên Bản EIR Giao Nhận</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-primary font-mono">
              {deposits.length} vỏ cont
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Có phiếu thu cược điện tử</div>
          </CardContent>
        </Card>
      </div>

      {/* Deposits Table */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Quản Lý Tiền Ký Cược Vỏ Hãng Tàu & Biên Bản EIR (Equipment Interchange Receipt)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi tiền cọc giữ vỏ, hạn nộp hồ sơ xin hoàn tiền cược và biên bản giám định hư hỏng vỏ cont
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm số cont, mã lô, số EIR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3.5">Số Container & Hãng Tàu</th>
                  <th className="py-2.5 px-3.5">Số Phiếu Thu Cược EIR</th>
                  <th className="py-2.5 px-3.5">Mã Lô Hàng</th>
                  <th className="py-2.5 px-3.5 text-right">Tiền Ký Cược</th>
                  <th className="py-2.5 px-3.5">Tình Trạng Vỏ (EIR)</th>
                  <th className="py-2.5 px-3.5">Hạn Hoàn Tiền</th>
                  <th className="py-2.5 px-3.5">Trạng Thái Hoàn Cọc</th>
                  <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDeposits.map((item) => {
                  const isPending = item.refundStatus === "PENDING_REFUND";

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Container & Carrier */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-foreground font-mono text-xs">
                          {item.containerNo}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Ship className="h-3 w-3" /> {item.carrier}
                        </div>
                      </td>

                      {/* EIR */}
                      <td className="py-3 px-3.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {item.receiptNumber}
                        </Badge>
                      </td>

                      {/* Shipment Code */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-primary">{item.shipmentCode}</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                        {item.depositAmountVnd.toLocaleString("vi-VN")} đ
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-3.5">{getConditionBadge(item.eirCondition)}</td>

                      {/* Due Date */}
                      <td className="py-3 px-3.5 text-muted-foreground">
                        {new Date(item.refundDueDate).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        {item.refundStatus === "REFUNDED_FULL" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" /> Đã Hoàn Đủ 100%
                          </Badge>
                        ) : item.refundStatus === "DEDUCTED_REPAIR" ? (
                          <div>
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                              Đã Trừ Phí Sửa Chữa
                            </Badge>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              Thu về: {(item.refundedAmountVnd || 0).toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                            Chờ Hãng Tàu Hoàn Cọc
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        {isPending ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRefundModal(item)}
                            className="h-7 px-2 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <RotateCcw className="h-3 w-3" /> Tất toán cọc
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Process Deposit Refund */}
      <Dialog open={Boolean(activeDeposit)} onOpenChange={(open) => !open && setActiveDeposit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Tất Toán Tiền Ký Cược Vỏ Container
            </DialogTitle>
          </DialogHeader>

          {activeDeposit && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số Container:</span>
                  <span className="font-bold text-foreground font-mono">{activeDeposit.containerNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hãng tàu:</span>
                  <span className="font-medium text-foreground">{activeDeposit.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền đã cược:</span>
                  <span className="font-bold text-primary font-mono">
                    {activeDeposit.depositAmountVnd.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-foreground">Số tiền khấu trừ sửa vỏ (nếu có)</label>
                <Input
                  type="number"
                  placeholder="Nhập 0 nếu không bị trừ..."
                  value={deductedAmount || ""}
                  onChange={(e) => setDeductedAmount(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>

              {deductedAmount > 0 && (
                <div className="space-y-2">
                  <label className="font-semibold text-foreground">Lý do khấu trừ (Ghi chú biên bản EIR)</label>
                  <Input
                    placeholder="VD: Móp vách ngoài, rách gioăng cao su cửa..."
                    value={deductedReason}
                    onChange={(e) => setDeductedReason(e.target.value)}
                    className="text-xs"
                  />
                  <div className="text-[11px] text-muted-foreground flex justify-between pt-1">
                    <span>Thực thu hoàn về:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {Math.max(0, activeDeposit.depositAmountVnd - deductedAmount).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDeposit(null)} className="text-xs h-8">
              Đóng
            </Button>
            {deductedAmount > 0 ? (
              <Button
                size="sm"
                onClick={() => handleConfirmRefund(false)}
                className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Xác nhận trừ phí & Thu cọc
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleConfirmRefund(true)}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Hoàn đủ 100% cọc
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
