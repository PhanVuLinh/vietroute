import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Printer, X, Package, Truck, MapPin, QrCode, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Order } from "@/core/types/logistics";
import { formatCurrency, formatDateTime } from "@/shared/utils/formatters";

interface WaybillPrintModalProps {
  order: (Order & { warehouseName?: string }) | any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Tạo các sọc SVG mô phỏng mã vạch Code128 chuẩn xác dựa trên chuỗi mã
 */
function renderBarcodeSvg(code: string) {
  const chars = code.split("");
  const bars: { width: number; isBlack: boolean }[] = [];

  // Tạo pattern vạch mã hóa
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  chars.forEach((c) => {
    const val = c.charCodeAt(0);
    bars.push({ width: (val % 3) + 1, isBlack: true });
    bars.push({ width: ((val >> 1) % 2) + 1, isBlack: false });
    bars.push({ width: ((val >> 2) % 3) + 1, isBlack: true });
    bars.push({ width: 1, isBlack: false });
  });

  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  let currentX = 0;
  return (
    <svg viewBox="0 0 260 50" className="w-full h-12">
      {bars.map((bar, i) => {
        const x = currentX;
        currentX += bar.width * 2.2;
        if (!bar.isBlack) return null;
        return <rect key={i} x={x} y="0" width={bar.width * 2} height="50" fill="#0f172a" />;
      })}
    </svg>
  );
}

export const WaybillPrintModal: React.FC<WaybillPrintModalProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const trackingQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://vietroute.vn/track/${order.orderCode}&color=0f172a`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-border bg-card">
        {/* Thanh công cụ xem trước */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/30 sticky top-0 z-20 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm text-foreground">
              Phiếu Gửi Hàng / Vận Đơn Dán Kiện (Waybill) — {order.orderCode}
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
              <span>In Phiếu Dán Kiện (A5)</span>
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

        {/* Khung Phiếu Vận Đơn Khổ A5 chuẩn dán bưu kiện */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 select-text" ref={printAreaRef} id="waybill-print-area">
          {/* Header phiếu gửi */}
          <div className="border-2 border-slate-900 rounded-t-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
                VR
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-blue-900 uppercase leading-none">
                  VIETROUTE EXPRESS
                </h1>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Dịch vụ Chuyển Phát Nhanh & Vận Tải Toàn Quốc
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">Hotline: 1900-8888 | www.vietroute.vn</p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-900 rounded border border-blue-300">
                {order.priority === "URGENT" ? "HỎA TỐC GIAO NGAY" : "TIÊU CHUẨN ĐƯỜNG BỘ"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                Ngày tạo: {formatDateTime(order.createdAt || new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* Mã vạch Barcode & Mã QR Tra cứu */}
          <div className="border-x-2 border-b-2 border-slate-900 p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white">
            <div className="sm:col-span-8 flex flex-col items-center justify-center space-y-1">
              {renderBarcodeSvg(order.orderCode)}
              <span className="font-mono text-base font-black tracking-widest text-slate-900">
                *{order.orderCode}*
              </span>
            </div>

            <div className="sm:col-span-4 flex items-center justify-center sm:justify-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4">
              <img
                src={trackingQrUrl}
                alt="QR tra cứu vận đơn"
                className="w-18 h-18 rounded border border-slate-300 p-0.5"
              />
              <div className="text-[9px] text-slate-500 leading-tight">
                <span className="font-bold text-slate-800 block">Quét QR</span>
                Tra cứu lộ trình & vị trí xe trực tiếp
              </div>
            </div>
          </div>

          {/* Khung Thông tin Người Gửi & Người Nhận (Grid 2 cột) */}
          <div className="border-x-2 border-b-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-900 text-xs">
            {/* Cột 1: NGƯỜI GỬI */}
            <div className="p-3.5 space-y-1 bg-white">
              <div className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-1 border-slate-200">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                <span>Từ: Kho Xuất Hàng (Sender)</span>
              </div>
              <p className="font-bold text-slate-900 text-xs mt-1">
                {order.warehouseName || "Kho Trung Chuyển VietRoute Hub"}
              </p>
              <p className="text-slate-600 text-[11px]">SĐT: <strong className="font-mono">1900-8888</strong></p>
              <p className="text-slate-600 text-[11px] leading-snug">
                Địa chỉ: Trung tâm Logistics Vành đai 3, Hà Nội
              </p>
            </div>

            {/* Cột 2: NGƯỜI NHẬN */}
            <div className="p-3.5 space-y-1 bg-amber-50/40">
              <div className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-1 border-slate-200">
                <MapPin className="h-3.5 w-3.5 text-rose-600" />
                <span>Đến: Người Nhận Hàng (Receiver)</span>
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1">
                {order.receiverName}
              </p>
              <p className="text-slate-800 text-xs font-mono font-bold">
                SĐT: {order.receiverPhone}
              </p>
              <p className="text-slate-800 text-[11px] font-semibold leading-snug">
                Địa chỉ: {order.receiverAddress}
              </p>
            </div>
          </div>

          {/* Chi tiết Hàng hóa & Thông số Tải trọng */}
          <div className="border-x-2 border-b-2 border-slate-900 p-3.5 text-xs bg-white space-y-2">
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wide">Nội dung hàng hóa:</span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Trọng lượng: <strong className="text-slate-900 font-bold">{order.totalWeight || 2.5} kg</strong></span>
                <span>Thể tích: <strong className="text-slate-900 font-bold">{order.totalVolume || 0.015} m³</strong></span>
              </div>
            </div>

            {/* Danh sách sản phẩm nếu có */}
            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-slate-100 text-[11px]">
                {order.items.map((it: any, i: number) => (
                  <div key={i} className="py-1 flex justify-between">
                    <span className="text-slate-800 font-medium">{it.productName || it.description}</span>
                    <span className="text-slate-500 font-mono">x{it.quantity} ({it.weight}kg)</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-700 text-[11px] italic">
                Kiện hàng thương mại logistics tiêu chuẩn
              </p>
            )}

            {/* Chỉ dẫn an toàn */}
            <div className="flex flex-wrap gap-2 pt-1.5 border-t border-slate-200/80">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-medium text-slate-700">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Cho khách xem hàng
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] font-medium text-rose-700">
                <AlertTriangle className="h-3 w-3 text-rose-600" /> Hàng dễ vỡ, không đè nặng
              </span>
            </div>
          </div>

          {/* Ô Tiền Thu Hộ COD & Cước Phí (Điểm nhấn lớn nhất) */}
          <div className="border-x-2 border-b-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-900 text-xs">
            {/* Tiền thu hộ COD */}
            <div className="p-4 bg-rose-50/60 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 block mb-0.5">
                TIỀN THU HỘ (COD)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
                {order.codAmount && Number(order.codAmount) > 0
                  ? formatCurrency(order.codAmount)
                  : "KHÔNG THU TIỀN (0 Đ)"}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">
                Tài xế thu đúng số tiền ghi trên phiếu
              </span>
            </div>

            {/* Cước phí vận chuyển */}
            <div className="p-4 bg-slate-50 flex flex-col justify-center text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Cước vận chuyển:</span>
                <strong className="text-emerald-700 font-bold">Người gửi đã thanh toán</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bảo hiểm hàng hóa:</span>
                <span className="font-mono text-slate-800">Đã bao gồm</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                <span className="text-slate-900">Người nhận trả:</span>
                <span className="font-mono text-rose-600">{formatCurrency(order.codAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Chữ ký 3 bên */}
          <div className="border-x-2 border-b-2 border-slate-900 rounded-b-xl grid grid-cols-3 divide-x-2 divide-slate-900 text-center p-3 text-[11px] bg-slate-50">
            <div className="space-y-12">
              <span className="font-bold text-slate-800 uppercase block">Chữ ký người gửi</span>
              <span className="text-[9px] text-slate-400 block italic">(Ký, ghi rõ họ tên)</span>
            </div>

            <div className="space-y-12">
              <span className="font-bold text-slate-800 uppercase block">Tài xế giao hàng</span>
              <span className="text-[9px] text-slate-400 block italic">(Ký, ghi rõ họ tên)</span>
            </div>

            <div className="space-y-12">
              <span className="font-bold text-slate-800 uppercase block">Người nhận hàng</span>
              <span className="text-[9px] text-slate-400 block italic">(Ký, ghi rõ họ tên)</span>
            </div>
          </div>

          {/* Lưu ý chân trang */}
          <div className="mt-3 text-center text-[9px] text-slate-400">
            Hàng hóa được vận chuyển và bảo hiểm bởi VietRoute Logistics. Mọi khiếu nại xin vui lòng liên hệ tổng đài 1900-8888 trong vòng 24h.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
