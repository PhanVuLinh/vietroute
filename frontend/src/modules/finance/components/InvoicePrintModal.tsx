import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Printer, Download, X, QrCode, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import type { InvoiceItem } from "../types/finance";
import { formatCurrency, formatDateTime } from "@/shared/utils/formatters";
import { readMoneyInWords } from "@/shared/utils/vietnameseCurrency";

interface InvoicePrintModalProps {
  invoice: InvoiceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const vietQrUrl = `https://img.vietqr.io/image/ICB-108876543210-compact2.png?amount=${invoice.totalAmount}&addInfo=Thanh%20toan%20HD%20${invoice.invoiceCode}&accountName=VIETROUTE%20LOGISTICS`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-border bg-card">
        {/* Thanh công cụ Preview (sẽ bị ẩn khi in) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/30 sticky top-0 z-20 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm text-foreground">
              Xem trước Hóa đơn VAT Điện tử — {invoice.invoiceCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-semibold cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In Hóa Đơn / Xuất PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Khung Hóa đơn Chuẩn A4 Doanh nghiệp */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 select-text" ref={printContentRef} id="invoice-print-area">
          {/* Header công ty & Tên hóa đơn */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                VR
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-blue-900 uppercase">
                  CÔNG TY CỔ PHẦN CÔNG NGHỆ LOGISTICS VIETROUTE
                </h1>
                <p className="text-xs text-slate-600">Mã số thuế: <strong className="text-slate-900">0109887766</strong></p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Tòa nhà VietRoute Tower, Số 88 Đường Cầu Giấy, Hà Nội | Hotline: 1900-8888
                </p>
                <p className="text-[11px] text-slate-500">
                  Email: billing@vietroute.vn | Website: https://vietroute.vn
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                Hóa đơn điện tử (e-Invoice)
              </span>
              <p className="text-xs text-slate-500">Mẫu số: <strong className="text-slate-900">01GTKT0/001</strong></p>
              <p className="text-xs text-slate-500">Ký hiệu: <strong className="text-slate-900">1C26TVE</strong></p>
              <p className="text-xs text-slate-500">Số hóa đơn: <strong className="text-rose-600 text-sm font-mono">{invoice.invoiceCode}</strong></p>
            </div>
          </div>

          {/* Tiêu đề Hóa đơn */}
          <div className="text-center my-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              HÓA ĐƠN GIÁ TRỊ GIA TĂNG
            </h2>
            <p className="text-xs text-slate-500 italic mt-0.5">
              Ngày lập: {formatDateTime(invoice.createdAt || new Date().toISOString())}
            </p>
          </div>

          {/* Thông tin Bên Mua Hàng */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs space-y-1.5">
            <div className="flex">
              <span className="w-36 text-slate-500 shrink-0 font-medium">Đơn vị mua hàng:</span>
              <strong className="text-slate-900 font-semibold">{invoice.customerName}</strong>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 shrink-0 font-medium">Mã số thuế:</span>
              <span className="font-mono font-medium text-slate-800">{invoice.customerTaxCode || "Đang cập nhật"}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 shrink-0 font-medium">Địa chỉ:</span>
              <span className="text-slate-700">{invoice.customerAddress || "Hà Nội, Việt Nam"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 mt-1">
              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0 font-medium">Hình thức thanh toán:</span>
                <span className="text-slate-800 font-medium">{invoice.paymentTerms || "Chuyển khoản (TM/CK)"}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 shrink-0 font-medium">Hạn thanh toán:</span>
                <span className="text-rose-600 font-bold font-mono">
                  {new Date(invoice.dueDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Bảng Chi tiết Hàng hóa / Dịch vụ */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Tên dịch vụ cước vận chuyển & logistics</th>
                  <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">ĐVT</th>
                  <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">Số lượng</th>
                  <th className="py-2.5 px-3 w-28 text-right border-r border-slate-300">Đơn giá (VNĐ)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900">
                        {it.description}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600">
                        Chuyến
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono text-slate-800">
                        {it.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right border-r border-slate-200 font-mono text-slate-800">
                        {it.unitPrice.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {it.amount.toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-medium text-slate-500">1</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900">
                      Dịch vụ vận tải cước theo hợp đồng logistics trọn gói
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600">Gói</td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono text-slate-800">1</td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-mono text-slate-800">
                      {invoice.subtotal.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {invoice.subtotal.toLocaleString("vi-VN")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tổng tiền & Tính thuế */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-300 pb-6 mb-6">
            {/* Mã VietQR Thanh Toán Ngân Hàng */}
            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <img
                  src={vietQrUrl}
                  alt="Mã VietQR Thanh Toán"
                  className="w-28 h-28 object-contain"
                />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <span>Quét mã VietQR chuyển khoản</span>
                </div>
                <p className="text-[11px] text-slate-600">Ngân hàng: <strong>VietinBank (ICB)</strong></p>
                <p className="text-[11px] text-slate-600">Số tài khoản: <strong className="font-mono">108876543210</strong></p>
                <p className="text-[11px] text-slate-600">Người thụ hưởng: <strong className="text-slate-800">VIETROUTE LOGISTICS</strong></p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Chuẩn Napas247 tự động điền tiền & nội dung
                </p>
              </div>
            </div>

            {/* Chi tiết cộng tiền */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Cộng tiền hàng (Subtotal):</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế suất GTGT (VAT 8%):</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(invoice.vatAmount)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Chiết khấu thương mại:</span>
                  <span className="font-mono font-medium">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t-2 border-slate-300">
                <span className="text-blue-900">TỔNG CỘNG THANH TOÁN:</span>
                <span className="font-mono text-base text-rose-600">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <span>Đã thanh toán:</span>
                  <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Đọc số tiền bằng chữ tiếng Việt */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 mb-8 text-xs">
            <span className="text-slate-600 font-medium">Số tiền viết bằng chữ: </span>
            <strong className="text-blue-950 font-bold italic">
              {readMoneyInWords(invoice.totalAmount)}
            </strong>
          </div>

          {/* Chữ ký số 2 bên */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 uppercase">Người mua hàng</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên hoặc chữ ký số)</p>
            </div>

            <div className="space-y-1 relative flex flex-col items-center">
              <p className="font-bold text-slate-800 uppercase">Người bán hàng</p>
              <p className="text-[11px] text-slate-400 italic">(Ký, đóng dấu hoặc chữ ký số)</p>

              {/* Dấu mộc điện tử */}
              <div className="mt-4 border-2 border-dashed border-emerald-600 bg-emerald-50/60 p-2.5 rounded-lg max-w-[220px] text-left">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Đã Ký Điện Tử Hợp Lệ</span>
                </div>
                <p className="text-[9px] text-slate-600 mt-1 leading-tight">
                  Ký bởi: CÔNG TY CỔ PHẦN CÔNG NGHỆ LOGISTICS VIETROUTE
                </p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                  Ngày ký: {new Date(invoice.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer hóa đơn */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-4 mt-12">
            Hóa đơn điện tử được khởi tạo và lưu trữ theo Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC của Bộ Tài Chính.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
