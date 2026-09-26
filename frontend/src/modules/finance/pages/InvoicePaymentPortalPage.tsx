import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Printer,
  QrCode,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  usePublicInvoice,
  useSimulatePublicInvoicePaymentMutation,
} from "../hooks/useFinance";
import { formatCurrency } from "@/shared/utils/formatters";
import { InvoicePrintModal } from "../components/InvoicePrintModal";
import { toast } from "@/shared/components/feedback/Toast";

export const InvoicePaymentPortalPage: React.FC = () => {
  const { invoiceCode: routeCode } = useParams<{ invoiceCode?: string }>();
  const invoiceCode = routeCode || "INV-2026-002";

  const { data: invoice, isLoading } = usePublicInvoice(invoiceCode);
  const payMutation = useSimulatePublicInvoicePaymentMutation(invoiceCode);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Đã sao chép", text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = async () => {
    try {
      await payMutation.mutateAsync({
        paymentMethod: "VIETQR_NAPAS247",
        transactionRef: `NAPAS-${Date.now().toString().slice(-6)}`,
      });
    } catch {
      // toast đã được gọi trong mutation
    }
  };

  const isPaid = invoice?.status === "PAID";
  const isOverdue = invoice?.isOverdue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground selection:bg-primary/20">
      {/* 1. Header Cổng Thanh Toán Chuẩn Fintech */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/85 backdrop-blur-md shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-foreground tracking-tight">
                  VietRoute
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Payment Portal
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Cổng thanh toán cước vận tải B2B trực tuyến
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Mã hóa bảo mật Napas 256-bit
            </span>
            <Link to="/login">
              <Button size="sm" variant="outline" className="h-8 text-xs cursor-pointer">
                Đăng nhập quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Nội dung chính */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="rounded-3xl bg-card border border-border shadow-xl p-8 space-y-6 animate-pulse">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        ) : !invoice ? (
          <div className="rounded-3xl bg-card border border-border shadow-xl p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Receipt className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Không tìm thấy thông tin hóa đơn</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Hóa đơn <b>{invoiceCode}</b> không tồn tại trên hệ thống hoặc đã bị gỡ bỏ. Vui lòng liên hệ bộ phận Kế toán VietRoute qua hotline <b>1900.6868</b>.
            </p>
            <Link to="/">
              <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                Về trang chủ VietRoute
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Banner trạng thái hóa đơn */}
            {isPaid ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-emerald-800 dark:text-emerald-300">
                        Hóa Đơn Đã Được Thanh Toán Đầy Đủ
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                        ĐÃ TẤT TOÁN
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Số tiền {formatCurrency(invoice.totalAmount)} đã được ghi nhận vào hệ thống kế toán VietRoute.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>In / Xem Hóa Đơn VAT</span>
                </Button>
              </div>
            ) : isOverdue ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-rose-800 dark:text-rose-300">
                        Hóa Đơn Đã Quá Hạn Thanh Toán ({invoice.overdueDays} ngày)
                      </span>
                      <Badge className="bg-rose-600 text-white text-[10px] font-bold">
                        QUÁ HẠN
                      </Badge>
                    </div>
                    <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                      Hạn chót thanh toán: <b>{new Date(invoice.dueDate).toLocaleDateString("vi-VN")}</b>. Quý đối tác vui lòng quét mã VietQR bên dưới để thanh toán ngay tránh gián đoạn hợp đồng vận chuyển.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border-2 border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-blue-800 dark:text-blue-300">
                        Hóa Đơn Đang Chờ Thanh Toán
                      </span>
                      <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                        CHỜ THANH TOÁN
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                      Hạn thanh toán: <b>{new Date(invoice.dueDate).toLocaleDateString("vi-VN")}</b> (Còn {invoice.daysUntilDue} ngày).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Khung chia 2 cột: Chi tiết cước và Thẻ VietQR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột trái: Thông tin khách hàng & Bảng kê dịch vụ (7 cột) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-3xl bg-card border border-border shadow-xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Mã Hóa Đơn Vận Tải
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-extrabold text-primary">
                          {invoice.invoiceCode}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          Điều khoản: {invoice.paymentTerms || "Net 30"}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Ngày phát hành</span>
                      <span className="text-xs font-bold text-foreground">
                        {new Date(invoice.issueDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin đối tác */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{invoice.customerName}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground text-[11px]">
                      <div>
                        Mã số thuế: <b className="text-foreground">{invoice.customerTaxCode || "0300588569"}</b>
                      </div>
                      <div>
                        Số điện thoại: <b className="text-foreground">{invoice.customerPhone || "N/A"}</b>
                      </div>
                      <div className="sm:col-span-2">
                        Địa chỉ: <span className="text-foreground">{invoice.customerAddress || "Việt Nam"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bảng chi tiết dịch vụ vận chuyển */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Chi Tiết Dòng Cước Vận Chuyển
                    </span>
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/70 text-muted-foreground font-semibold text-[11px] border-b">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Dịch vụ cước</th>
                            <th className="py-2.5 px-2 text-center w-12">SL</th>
                            <th className="py-2.5 px-3 text-right">Đơn giá</th>
                            <th className="py-2.5 px-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((it: any, idx: number) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="py-2.5 px-3 text-foreground font-medium">
                                  {it.description}
                                </td>
                                <td className="py-2.5 px-2 text-center text-muted-foreground">
                                  {it.quantity}
                                </td>
                                <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                                  {formatCurrency(it.unitPrice)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-foreground font-mono">
                                  {formatCurrency(it.amount)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-3 px-3 text-center text-muted-foreground">
                                Cước vận chuyển trọn gói
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tổng cộng & Thuế VAT */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cộng tiền hàng (Subtotal):</span>
                      <span className="font-mono font-medium">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Thuế giá trị gia tăng (VAT 8%):</span>
                      <span className="font-mono font-medium">{formatCurrency(invoice.vatAmount)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Chiết khấu đối tác VIP:</span>
                        <span className="font-mono">-{formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                      <span>Tổng tiền thanh toán:</span>
                      <span className="font-mono text-primary text-lg">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Nút hành động xem hóa đơn VAT */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="text-xs gap-1.5 cursor-pointer font-medium"
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" />
                      <span>Xem Hóa Đơn Điện Tử A4</span>
                    </Button>

                    <span className="text-[11px] text-muted-foreground italic">
                      Hóa đơn điện tử có mã của Cơ quan Thuế
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột phải: Thẻ VietQR Napas247 Chuyên Nghiệp (5 cột) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-card border-2 border-primary/40 shadow-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
                  {/* Dải gradient trang trí */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">
                          Quét Mã VietQR Napas247
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Thanh toán chuyển khoản 24/7</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                      GẠCH NỢ TỰ ĐỘNG
                    </Badge>
                  </div>

                  {/* QR Image Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner space-y-2">
                    {invoice.bankDetails?.vietQrUrl ? (
                      <div className="relative group">
                        <img
                          src={invoice.bankDetails.vietQrUrl}
                          alt="VietQR Napas247"
                          className="w-56 h-auto object-contain rounded-lg transition-transform group-hover:scale-102"
                        />
                        {isPaid && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center rounded-lg">
                            <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl">
                              <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <span className="font-extrabold text-emerald-700 text-base mt-2">
                              ĐÃ GẠCH NỢ
                            </span>
                            <span className="text-[11px] text-emerald-600 font-mono">
                              {invoice.invoiceCode}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-56 w-56 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                        Đang tạo mã VietQR...
                      </div>
                    )}
                    <span className="text-[11px] text-slate-600 font-medium text-center">
                      Mở ứng dụng Ngân hàng bất kỳ để quét mã thanh toán tức thời
                    </span>
                  </div>

                  {/* Chi tiết tài khoản ngân hàng */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/80">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Ngân hàng thụ hưởng:</span>
                        <span className="font-bold text-foreground">{invoice.bankDetails?.bankShortName || "VietinBank"}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono font-bold">
                        BIN: {invoice.bankDetails?.bankBin || "970415"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/80">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Số tài khoản:</span>
                        <span className="font-mono font-extrabold text-base text-primary">
                          {invoice.bankDetails?.accountNumber || "113002899999"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(invoice.bankDetails?.accountNumber || "113002899999", "account")}
                        className="h-8 px-2.5 text-xs cursor-pointer hover:bg-muted"
                      >
                        {copiedField === "account" ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/80">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Chủ tài khoản:</span>
                        <span className="font-bold text-foreground text-[11px]">
                          {invoice.bankDetails?.accountName || "CONG TY CP VIETROUTE LOGISTICS"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/80">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Nội dung chuyển khoản (bắt buộc):</span>
                        <span className="font-mono font-extrabold text-xs text-primary">
                          {invoice.bankDetails?.transferContent || `VIETROUTE ${invoice.invoiceCode}`}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(invoice.bankDetails?.transferContent || `VIETROUTE ${invoice.invoiceCode}`, "content")}
                        className="h-8 px-2.5 text-xs cursor-pointer hover:bg-muted"
                      >
                        {copiedField === "content" ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                      <div>
                        <span className="text-[10px] text-primary uppercase font-bold block">Số tiền cần thanh toán:</span>
                        <span className="font-mono font-extrabold text-base text-primary">
                          {formatCurrency(invoice.remainingAmount)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(invoice.remainingAmount.toString(), "amount")}
                        className="h-8 px-2.5 text-xs cursor-pointer hover:bg-muted"
                      >
                        {copiedField === "amount" ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Nút giả lập thanh toán tức thời (Demo Webhook 1-click) */}
                  {!isPaid && (
                    <div className="pt-2">
                      <Button
                        onClick={handleSimulatePayment}
                        disabled={payMutation.isPending}
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                      >
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span>
                          {payMutation.isPending ? "Đang xử lý gạch nợ..." : "⚡ Giả lập Quét QR Thanh Toán Ngay (Demo 1-Chạm)"}
                        </span>
                      </Button>
                      <span className="text-[10px] text-muted-foreground text-center block mt-1.5">
                        Kích hoạt Webhook gạch nợ tức thì và đồng bộ CSDL thời gian thực
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal in hóa đơn VAT */}
      {invoice && (
        <InvoicePrintModal
          open={isPrintModalOpen}
          onOpenChange={setIsPrintModalOpen}
          invoice={invoice}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p>© 2026 VietRoute Logistics Platform. Bản quyền thuộc về VietRoute.</p>
          <p className="text-[11px] text-muted-foreground/70">
            Hệ thống thanh toán trực tuyến bảo mật Napas247 • Hotline hỗ trợ tài chính B2B: <b>1900.6868</b>
          </p>
        </div>
      </footer>
    </div>
  );
};
