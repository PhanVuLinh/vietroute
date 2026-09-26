import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Phone,
  MapPin,
  Warehouse,
  Package,
  Truck,
  Clock,
  Send,
  AlertCircle,
  FileText,
  ShieldAlert,
  ExternalLink,
  Printer,
  FileCheck,
  FileSignature,
  CheckCircle2,
} from "lucide-react";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPriorityBadge } from "./OrderPriorityBadge";
import { OrderSlaIndicator } from "./OrderSlaIndicator";
import { OrderStatusTimeline } from "./OrderStatusTimeline";
import { formatCurrency, formatDateTime } from "@/shared/utils/formatters";
import { WaybillPrintModal } from "./WaybillPrintModal";
import { ProofOfDeliveryModal } from "@/modules/driver/components/ProofOfDeliveryModal";
import type { DriverStop, PodData } from "@/modules/driver/types/driverPortal";
import { orderService } from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback/Toast";
import { Badge } from "@/shared/components/ui/badge";

interface OrderDetailDrawerProps {
  order: EnrichedOrder | any | null;
  warehouse?: any;
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver?: (order: any) => void;
  onOrderUpdated?: (updatedOrder: any) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onAssignDriver,
  onOrderUpdated,
}) => {
  const navigate = useNavigate();
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(order);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  const isPending = currentOrder.status === "PENDING" || currentOrder.status === "CONFIRMED";

  const handleConfirmPod = async (_stopId: string, pod: PodData) => {
    try {
      const res = await (orderService as any).submitPod(currentOrder.id, pod);
      const updated = res?.data || {
        ...currentOrder,
        status: "DELIVERED",
        pod,
      };
      setCurrentOrder(updated);
      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
      toast.success(`Đã hoàn tất e-POD cho đơn hàng ${currentOrder.orderCode}!`);
      setIsPodModalOpen(false);
    } catch (err: any) {
      toast.error("Không thể lưu e-POD: " + (err?.message || "Lỗi kết nối máy chủ"));
    }
  };

  const stopAdapter: DriverStop = {
    id: currentOrder.id,
    sequence: 1,
    orderId: currentOrder.id,
    orderCode: currentOrder.orderCode,
    customerName: currentOrder.receiverName || "Khách nhận hàng",
    customerPhone: currentOrder.receiverPhone || "",
    address: currentOrder.receiverAddress || "",
    lat: currentOrder.receiverLatitude || 21.0285,
    lng: currentOrder.receiverLongitude || 105.8544,
    weightKg: currentOrder.totalWeight || 0,
    packagesCount: currentOrder.items?.length || 1,
    codAmount: currentOrder.codAmount || 0,
    priority: (currentOrder.priority as any) || "NORMAL",
    status: currentOrder.status === "DELIVERED" ? "DELIVERED" : "DELIVERING",
    estimatedArrival: "Trong ngày",
    timeWindow: currentOrder.deliveryWindowStart
      ? `${formatDateTime(currentOrder.deliveryWindowStart)} - ${formatDateTime(currentOrder.deliveryWindowEnd)}`
      : "08:00 - 18:00",
    itemsSummary:
      currentOrder.items?.map((it: any) => `${it.productName} (x${it.quantity})`).join(", ") ||
      `Kiện hàng ${currentOrder.totalWeight} kg`,
    pod: currentOrder.pod,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* 1. Header */}
          <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-base font-bold text-primary">
                  {currentOrder.orderCode}
                </span>
                <OrderPriorityBadge priority={currentOrder.priority} />
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={currentOrder.status} />
                <span className="text-xs text-muted-foreground font-mono">
                  Tạo lúc: {formatDateTime(currentOrder.createdAt)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* 2. Thông tin khách hàng / Người nhận */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>Thông tin người nhận</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-foreground/80">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Họ và tên:</span>
                  <span className="font-medium text-foreground">{currentOrder.receiverName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Số điện thoại:</span>
                  <a
                    href={`tel:${currentOrder.receiverPhone}`}
                    className="font-mono font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {currentOrder.receiverPhone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Địa chỉ nhận hàng:</span>
                <div className="flex items-start gap-1.5 text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{currentOrder.receiverAddress}</span>
                </div>
                {currentOrder.receiverLatitude && currentOrder.receiverLongitude && (
                  <span className="text-[11px] text-muted-foreground font-mono block mt-1">
                    Tọa độ GPS: [{currentOrder.receiverLatitude.toFixed(5)}, {currentOrder.receiverLongitude.toFixed(5)}]
                  </span>
                )}
              </div>
            </div>

            {/* 2.1 Bằng chứng giao hàng điện tử (e-POD) nếu đã có */}
            {currentOrder.pod && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Bằng chứng giao hàng điện tử (e-POD)</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px] gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    ĐÃ XÁC THỰC
                  </Badge>
                </div>

                {/* Thông tin bàn giao */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-card/60 p-3 rounded-xl border border-emerald-500/20">
                  <div>
                    <span className="text-muted-foreground block text-[10px] mb-0.5">Người ký nhận thực tế:</span>
                    <span className="font-semibold text-foreground text-xs">{currentOrder.pod.receiverName}</span>
                    {currentOrder.pod.receiverRelation && (
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        Quan hệ: {currentOrder.pod.receiverRelation === "SELF" ? "Chính chủ" : currentOrder.pod.receiverRelation === "FAMILY" ? "Người thân" : currentOrder.pod.receiverRelation === "SECURITY" ? "Bảo vệ / Lễ tân" : currentOrder.pod.receiverRelation}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] mb-0.5">Thời gian ký nhận:</span>
                    <span className="font-mono text-foreground text-xs">
                      {formatDateTime(currentOrder.pod.completedAt)}
                    </span>
                  </div>
                </div>

                {/* Tiền COD & Phương thức */}
                {currentOrder.pod.codAmount > 0 && (
                  <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Tiền COD đã thu:</span>
                    <div className="flex items-center gap-2 font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      <span>{currentOrder.pod.codAmount.toLocaleString("vi-VN")} đ</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-sans font-semibold">
                        {currentOrder.pod.codPaymentMethod === "BANK_TRANSFER" ? "VietQR Chuyển khoản" : "Tiền mặt"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chữ ký số và Ảnh kiện hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Chữ ký số */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span>Chữ ký điện tử người nhận:</span>
                    </span>
                    <div className="h-28 rounded-xl border border-border bg-white flex items-center justify-center p-2 overflow-hidden shadow-xs">
                      {currentOrder.pod.signatureUrl ? (
                        <img
                          src={currentOrder.pod.signatureUrl}
                          alt="Chữ ký người nhận"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Đã ký số xác thực</span>
                      )}
                    </div>
                  </div>

                  {/* Ảnh chụp kiện hàng */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <span>Ảnh chụp hiện trường bàn giao:</span>
                    </span>
                    <div className="h-28 rounded-xl border border-border bg-muted/40 flex items-center justify-center overflow-hidden">
                      {currentOrder.pod.photoUrl ? (
                        <a href={currentOrder.pod.photoUrl} target="_blank" rel="noreferrer" className="w-full h-full block group relative">
                          <img
                            src={currentOrder.pod.photoUrl}
                            alt="Ảnh kiện hàng"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-medium transition-opacity">
                            Xem ảnh gốc
                          </div>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Không đính kèm ảnh</span>
                      )}
                    </div>
                  </div>
                </div>

                {currentOrder.pod.notes && (
                  <div className="text-xs text-muted-foreground bg-card p-2.5 rounded-xl border border-border">
                    <span className="font-semibold text-foreground">Ghi chú giao nhận: </span>
                    <span>{currentOrder.pod.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Kho xuất phát */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Warehouse className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Kho xuất hàng</span>
              </div>
              <div className="text-foreground/80">
                <div className="font-medium text-foreground text-sm">
                  {currentOrder.warehouse?.name || currentOrder.warehouseId}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {currentOrder.warehouse?.address || "Hệ thống trung chuyển VietRoute"}
                </div>
              </div>
            </div>

            {/* 4. Hàng hóa & Bưu phẩm */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Hàng hóa & Bưu phẩm</span>
                </div>
                <div className="text-muted-foreground font-medium tabular-nums">
                  Tổng: <span className="text-foreground font-semibold">{currentOrder.totalWeight} kg</span>
                  {currentOrder.totalVolume && (
                    <span> • {currentOrder.totalVolume} m³</span>
                  )}
                </div>
              </div>

              {/* Items List */}
              {currentOrder.items && currentOrder.items.length > 0 ? (
                <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
                  {currentOrder.items.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-3 bg-muted/20 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{item.productName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>Số lượng: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.weight} kg</span>
                          {item.isFragile && (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" /> Dễ vỡ
                            </span>
                          )}
                          {item.requiresSpecialHandling && (
                            <span className="text-rose-600 dark:text-rose-400">Bảo quản đặc biệt</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  Không có chi tiết từng bưu kiện. Khối lượng toàn đơn: {currentOrder.totalWeight} kg.
                </div>
              )}

              {/* COD */}
              <div className="pt-2 border-t border-border flex items-center justify-between font-medium">
                <span className="text-muted-foreground">Tiền thu hộ (COD):</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold tabular-nums">
                  {currentOrder.codAmount > 0 ? formatCurrency(currentOrder.codAmount) : "Không thu hộ (0 đ)"}
                </span>
              </div>
            </div>

            {/* 5. Tài xế & Phương tiện */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Truck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Tài xế & Phương tiện vận chuyển</span>
              </div>

              {currentOrder.driver ? (
                <div className="grid grid-cols-2 gap-3 text-foreground/80">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Tài xế phụ trách:</span>
                    <span className="font-medium text-foreground">{currentOrder.driver.fullName}</span>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {currentOrder.driver.phone}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Phương tiện:</span>
                    <span className="font-mono font-medium text-primary">
                      {currentOrder.vehicle?.licensePlate || "Xe tải nội bộ"}
                    </span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {currentOrder.vehicle?.type || "Tải trọng: 1.5 Tấn"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Chưa phân công tài xế hoặc phương tiện cho đơn này</span>
                  </div>
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/dispatch?orderId=${currentOrder.id}`);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-colors cursor-pointer"
                    >
                      Điều phối ngay
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 6. Thời gian cam kết & SLA */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  <span>Thời gian cam kết (SLA)</span>
                </div>
                <OrderSlaIndicator order={currentOrder} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-foreground/80">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Bắt đầu khung giờ:</span>
                  <span className="font-mono text-foreground">
                    {formatDateTime(currentOrder.deliveryWindowStart)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Hạn chót giao hàng:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    {formatDateTime(currentOrder.deliveryWindowEnd)}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Lịch sử trạng thái & Hành trình */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>Lịch sử trạng thái & Hành trình</span>
              </div>
              <OrderStatusTimeline order={currentOrder} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Nút ký nhận e-POD */}
              <button
                type="button"
                onClick={() => setIsPodModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                title="Xác nhận giao hàng và ký nhận điện tử e-POD"
              >
                {currentOrder.pod ? (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Cập nhật e-POD</span>
                  </>
                ) : (
                  <>
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Ký nhận e-POD</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsWaybillOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="In Phiếu gửi hàng / Vận đơn dán kiện A5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Gửi (A5)</span>
              </button>

              <button
                type="button"
                onClick={() => window.open(`/track/${currentOrder.orderCode}`, "_blank")}
                className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Mở link tra cứu vận đơn cho khách hàng"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link tra cứu khách</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-foreground/80 hover:text-foreground bg-muted hover:bg-accent border border-border rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {isPending && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onAssignDriver) {
                    onAssignDriver(currentOrder);
                  } else {
                    navigate(`/dispatch?orderId=${currentOrder.id}`);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{onAssignDriver ? "Điều phối đơn hàng" : "Chuyển tới Điều phối"}</span>
              </button>
            )}
          </div>

          {/* Modal In Vận Đơn Dán Kiện Hàng */}
          <WaybillPrintModal
            order={currentOrder}
            open={isWaybillOpen}
            onOpenChange={setIsWaybillOpen}
          />

          {/* Modal Xác nhận Giao hàng điện tử e-POD */}
          {isPodModalOpen && (
            <ProofOfDeliveryModal
              isOpen={isPodModalOpen}
              stop={stopAdapter}
              onClose={() => setIsPodModalOpen(false)}
              onConfirmPod={handleConfirmPod}
            />
          )}
        </div>
      </div>
    </div>
  );
};
