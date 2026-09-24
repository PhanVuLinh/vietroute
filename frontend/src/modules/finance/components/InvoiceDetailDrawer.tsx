import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Percent,
  Receipt,
  XCircle,
  Printer,
  BellRing,
  ExternalLink,
  QrCode,
} from "lucide-react";
import {
  useInvoiceDetail,
  useUpdateInvoiceStatusMutation,
  useSendSingleInvoiceReminderMutation,
} from "../hooks/useFinance";
import { formatDateTime } from "@/shared/utils/formatters";
import { InvoicePrintModal } from "./InvoicePrintModal";

interface InvoiceDetailDrawerProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInvoiceStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Đã thanh toán</Badge>;
    case "OVERDUE":
      return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Quá hạn</Badge>;
    case "CANCELLED":
      return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30">Đã hủy</Badge>;
    case "DRAFT":
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Bản nháp</Badge>;
    case "PENDING_PAYMENT":
    default:
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">Chờ thanh toán</Badge>;
  }
};

export const InvoiceDetailDrawer: React.FC<InvoiceDetailDrawerProps> = ({
  invoiceId,
  open,
  onOpenChange,
}) => {
  const { data: invoice, isLoading } = useInvoiceDetail(invoiceId);
  const updateStatusMutation = useUpdateInvoiceStatusMutation();
  const sendReminderMutation = useSendSingleInvoiceReminderMutation();

  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!open) return null;

  const handleSendReminder = async () => {
    if (!invoice) return;
    await sendReminderMutation.mutateAsync(invoice.id);
  };


  const handleMarkAsPaid = async (full: boolean = true) => {
    if (!invoice) return;
    const amount = full ? invoice.totalAmount : Number(paymentAmount);
    await updateStatusMutation.mutateAsync({
      id: invoice.id,
      status: full || amount >= invoice.totalAmount ? "PAID" : "PENDING_PAYMENT",
      paid_amount: amount,
    });
    setShowPaymentInput(false);
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;
    await updateStatusMutation.mutateAsync({
      id: invoice.id,
      status: "CANCELLED",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-1/3 bg-muted rounded" />
            <div className="h-28 bg-muted rounded" />
            <div className="h-44 bg-muted rounded" />
          </div>
        ) : !invoice ? (
          <div className="text-center py-10 text-muted-foreground">Không tìm thấy thông tin hóa đơn.</div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">{invoice.invoiceCode}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>In Hóa đơn VAT</span>
                  </Button>
                  {getInvoiceStatusBadge(invoice.status)}
                </div>
              </div>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span>Chi tiết Hóa đơn B2B</span>
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Ngày phát hành: {formatDateTime(invoice.issueDate)}
                </span>
                <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                  <Clock className="h-3.5 w-3.5" />
                  Hạn thanh toán: {formatDateTime(invoice.dueDate)}
                </span>
              </div>
            </SheetHeader>

            {/* Thông tin khách hàng doanh nghiệp */}
            <div className="rounded-xl border bg-card p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground border-b pb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Khách hàng Doanh nghiệp</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Đơn vị / Công ty:</span>
                  <span className="font-bold text-foreground text-sm">{invoice.customerName}</span>
                  {invoice.customerTaxCode && (
                    <span className="block text-muted-foreground font-mono mt-0.5">
                      MST: {invoice.customerTaxCode}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Liên hệ:</span>
                  <span className="font-medium text-foreground">{invoice.customerPhone || "Chưa cập nhật"}</span>
                  <span className="block text-muted-foreground truncate mt-0.5" title={invoice.customerAddress}>
                    {invoice.customerAddress || "Chưa cập nhật địa chỉ"}
                  </span>
                </div>
              </div>
              {invoice.paymentTerms && (
                <div className="pt-2 border-t text-muted-foreground">
                  <span className="font-semibold text-foreground">Điều khoản thanh toán: </span>
                  <span>{invoice.paymentTerms}</span>
                </div>
              )}
            </div>

            {/* Danh mục hàng hóa / Dịch vụ */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Chi tiết dịch vụ & Phí vận chuyển ({invoice.items?.length || 0})</span>
              </h4>

              <div className="border rounded-xl overflow-hidden bg-card text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground font-semibold">
                      <th className="py-2.5 px-3">Mô tả dịch vụ</th>
                      <th className="py-2.5 px-2 text-center w-16">SL</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-medium text-foreground">{item.description}</td>
                          <td className="py-2.5 px-2 text-center text-muted-foreground font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {item.unitPrice.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                            {item.amount.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          Không có dòng sản phẩm/dịch vụ nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng hợp tài chính hóa đơn */}
            <div className="rounded-xl border bg-card p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Cộng tiền dịch vụ (Tạm tính):</span>
                <span className="font-mono font-medium text-foreground">{invoice.subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" /> Thuế GTGT (VAT 8%):
                </span>
                <span className="font-mono font-medium text-foreground">+{invoice.vatAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Chiết khấu thương mại:</span>
                  <span className="font-mono font-medium">-{invoice.discountAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold text-sm text-foreground">Tổng tiền thanh toán:</span>
                <span className="font-mono font-extrabold text-base text-primary">
                  {invoice.totalAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground pt-1">
                <span>Đã thanh toán:</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {invoice.paidAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed pt-2">
                <span className="font-bold text-rose-600 dark:text-rose-400">Còn nợ:</span>
                <span className="font-mono font-extrabold text-base text-rose-600 dark:text-rose-400">
                  {invoice.remainingAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* Ghi chú */}
            {invoice.notes && (
              <div className="text-xs text-muted-foreground rounded-lg bg-muted/40 p-3 border">
                <span className="font-semibold text-foreground">Ghi chú: </span>
                <span>{invoice.notes}</span>
              </div>
            )}

            {/* Thao tác thanh toán & duyệt */}
            {invoice.status !== "CANCELLED" && (
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Thao tác kế toán
                  </span>
                  {invoice.status !== "PAID" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPaymentInput(!showPaymentInput)}
                    >
                      {showPaymentInput ? "Ẩn nhập số tiền lẻ" : "Nhập số tiền lẻ"}
                    </Button>
                  )}
                </div>

                {showPaymentInput && invoice.status !== "PAID" && (
                  <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border">
                    <div className="flex-1">
                      <Label htmlFor="partial-pay" className="text-xs">Số tiền thanh toán (VNĐ)</Label>
                      <Input
                        id="partial-pay"
                        type="number"
                        placeholder={invoice.remainingAmount.toString()}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : "")}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 self-end text-xs"
                      disabled={!paymentAmount || Number(paymentAmount) <= 0 || updateStatusMutation.isPending}
                      onClick={() => handleMarkAsPaid(false)}
                    >
                      Xác nhận thu
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {invoice.status !== "PAID" && (
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleMarkAsPaid(true)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Xác nhận Đã thu đủ ({invoice.totalAmount.toLocaleString("vi-VN")} đ)
                    </Button>
                  )}

                  {invoice.status !== "PAID" && (
                    <Button
                      variant="outline"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs gap-1.5 border-amber-500/40"
                      disabled={sendReminderMutation.isPending}
                      onClick={handleSendReminder}
                    >
                      <BellRing className={`h-3.5 w-3.5 ${sendReminderMutation.isPending ? "animate-bounce" : ""}`} />
                      <span>{sendReminderMutation.isPending ? "Đang gửi..." : "Gửi thông báo nhắc nợ"}</span>
                    </Button>
                  )}

                  {invoice.status !== "PAID" && (
                    <Button
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs gap-1"
                      disabled={updateStatusMutation.isPending}
                      onClick={handleCancelInvoice}
                    >
                      <XCircle className="h-4 w-4" />
                      Hủy hóa đơn
                    </Button>
                  )}
                </div>

                {/* Nút mở cổng thanh toán công khai */}
                <div className="pt-1">
                  <a
                    href={`/portal/pay/${invoice.invoiceCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Mở Cổng Thanh Toán VietQR Dành Cho Khách Hàng</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}


            {/* Modal In Hóa Đơn VAT Điện Tử */}
            <InvoicePrintModal
              invoice={invoice}
              open={isPrintModalOpen}
              onOpenChange={setIsPrintModalOpen}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
