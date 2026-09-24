import React from "react";
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
} from "lucide-react";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPriorityBadge } from "./OrderPriorityBadge";
import { OrderSlaIndicator } from "./OrderSlaIndicator";
import { OrderStatusTimeline } from "./OrderStatusTimeline";
import { formatCurrency, formatDateTime } from "@/shared/utils/formatters";
import { WaybillPrintModal } from "./WaybillPrintModal";

interface OrderDetailDrawerProps {
  order: EnrichedOrder | any | null;
  warehouse?: any;
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver?: (order: any) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onAssignDriver,
}) => {
  const navigate = useNavigate();
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);

  if (!isOpen || !order) return null;

  const isPending = order.status === "PENDING" || order.status === "CONFIRMED";

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
                  {order.orderCode}
                </span>
                <OrderPriorityBadge priority={order.priority} />
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-muted-foreground font-mono">
                  Tạo lúc: {formatDateTime(order.createdAt)}
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
                  <span className="font-medium text-foreground">{order.receiverName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Số điện thoại:</span>
                  <a
                    href={`tel:${order.receiverPhone}`}
                    className="font-mono font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {order.receiverPhone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Địa chỉ nhận hàng:</span>
                <div className="flex items-start gap-1.5 text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{order.receiverAddress}</span>
                </div>
                {order.receiverLatitude && order.receiverLongitude && (
                  <span className="text-[11px] text-muted-foreground font-mono block mt-1">
                    Tọa độ GPS: [{order.receiverLatitude.toFixed(5)}, {order.receiverLongitude.toFixed(5)}]
                  </span>
                )}
              </div>
            </div>

            {/* 3. Kho xuất phát */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Warehouse className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Kho xuất hàng</span>
              </div>
              <div className="text-foreground/80">
                <div className="font-medium text-foreground text-sm">
                  {order.warehouse?.name || order.warehouseId}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {order.warehouse?.address || "Hệ thống trung chuyển VietRoute"}
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
                  Tổng: <span className="text-foreground font-semibold">{order.totalWeight} kg</span>
                  {order.totalVolume && (
                    <span> • {order.totalVolume} m³</span>
                  )}
                </div>
              </div>

              {/* Items List */}
              {order.items && order.items.length > 0 ? (
                <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
                  {order.items.map((item: any, idx: number) => (
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
                  Không có chi tiết từng bưu kiện. Khối lượng toàn đơn: {order.totalWeight} kg.
                </div>
              )}

              {/* COD */}
              <div className="pt-2 border-t border-border flex items-center justify-between font-medium">
                <span className="text-muted-foreground">Tiền thu hộ (COD):</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold tabular-nums">
                  {order.codAmount > 0 ? formatCurrency(order.codAmount) : "Không thu hộ (0 đ)"}
                </span>
              </div>
            </div>

            {/* 5. Tài xế & Phương tiện */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Truck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Tài xế & Phương tiện vận chuyển</span>
              </div>

              {order.driver ? (
                <div className="grid grid-cols-2 gap-3 text-foreground/80">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Tài xế phụ trách:</span>
                    <span className="font-medium text-foreground">{order.driver.fullName}</span>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {order.driver.phone}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Phương tiện:</span>
                    <span className="font-mono font-medium text-primary">
                      {order.vehicle?.licensePlate || "Xe tải nội bộ"}
                    </span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {order.vehicle?.type || "Tải trọng: 1.5 Tấn"}
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
                        navigate(`/dispatch?orderId=${order.id}`);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-colors"
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
                <OrderSlaIndicator order={order} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-foreground/80">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Bắt đầu khung giờ:</span>
                  <span className="font-mono text-foreground">
                    {formatDateTime(order.deliveryWindowStart)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Hạn chót giao hàng:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    {formatDateTime(order.deliveryWindowEnd)}
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
              <OrderStatusTimeline order={order} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => window.open(`/track/${order.orderCode}`, "_blank")}
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
                    onAssignDriver(order);
                  } else {
                    navigate(`/dispatch?orderId=${order.id}`);
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
            order={order}
            open={isWaybillOpen}
            onOpenChange={setIsWaybillOpen}
          />
        </div>
      </div>
    </div>
  );
};
