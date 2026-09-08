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
} from "lucide-react";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPriorityBadge } from "./OrderPriorityBadge";
import { OrderSlaIndicator } from "./OrderSlaIndicator";
import { OrderStatusTimeline } from "./OrderStatusTimeline";

interface OrderDetailDrawerProps {
  order: EnrichedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "--";
    try {
      return new Date(isoString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const isPending = order.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* 1. Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-base font-bold text-primary-400">
                  {order.orderCode}
                </span>
                <OrderPriorityBadge priority={order.priority} />
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-slate-400 font-mono">
                  Tạo lúc: {formatDateTime(order.createdAt)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* 2. Thông tin khách hàng / Người nhận */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <User className="w-4 h-4 text-primary-400" />
                <span>Thông tin người nhận</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block mb-0.5">Họ và tên:</span>
                  <span className="font-medium text-slate-100">{order.receiverName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Số điện thoại:</span>
                  <a
                    href={`tel:${order.receiverPhone}`}
                    className="font-mono font-medium text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {order.receiverPhone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Địa chỉ nhận hàng:</span>
                <div className="flex items-start gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{order.receiverAddress}</span>
                </div>
                {order.receiverLatitude && order.receiverLongitude && (
                  <span className="text-[11px] text-slate-500 font-mono block mt-1">
                    Tọa độ GPS: [{order.receiverLatitude.toFixed(5)}, {order.receiverLongitude.toFixed(5)}]
                  </span>
                )}
              </div>
            </div>

            {/* 3. Kho xuất phát */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <span>Kho xuất hàng</span>
              </div>
              <div className="text-slate-300">
                <div className="font-medium text-slate-100 text-sm">
                  {order.warehouse?.name || order.warehouseId}
                </div>
                <div className="text-slate-400 mt-0.5">
                  {order.warehouse?.address || "Hệ thống trung chuyển VietRoute"}
                </div>
              </div>
            </div>

            {/* 4. Hàng hóa & Bưu phẩm */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Hàng hóa & Bưu phẩm</span>
                </div>
                <div className="text-slate-400 font-medium">
                  Tổng: <span className="text-slate-200 font-semibold">{order.totalWeight} kg</span>
                  {order.totalVolume && (
                    <span> • {order.totalVolume} m³</span>
                  )}
                </div>
              </div>

              {/* Items List */}
              {order.items && order.items.length > 0 ? (
                <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-slate-900/40 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-200">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Số lượng: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.weight} kg</span>
                          {item.isFragile && (
                            <span className="text-amber-400 flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" /> Dễ vỡ
                            </span>
                          )}
                          {item.requiresSpecialHandling && (
                            <span className="text-rose-400">Bảo quản đặc biệt</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic">
                  Không có chi tiết từng bưu kiện. Khối lượng toàn đơn: {order.totalWeight} kg.
                </div>
              )}

              {/* COD */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-medium">
                <span className="text-slate-400">Tiền thu hộ (COD):</span>
                <span className="text-emerald-400 text-sm font-semibold">
                  {order.codAmount > 0 ? formatCurrency(order.codAmount) : "Không thu hộ (0 đ)"}
                </span>
              </div>
            </div>

            {/* 5. Tài xế & Phương tiện */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Tài xế & Phương tiện vận chuyển</span>
              </div>

              {order.driver ? (
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Tài xế phụ trách:</span>
                    <span className="font-medium text-slate-100">{order.driver.fullName}</span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {order.driver.phone}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Phương tiện:</span>
                    <span className="font-mono font-medium text-primary-400">
                      {order.vehicle?.licensePlate || "Xe tải nội bộ"}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {order.vehicle?.type || "Tải trọng: 1.5 Tấn"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
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
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors"
                    >
                      Điều phối ngay
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 6. Thời gian cam kết & SLA */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span>Thời gian cam kết (SLA)</span>
                </div>
                <OrderSlaIndicator order={order} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block mb-0.5">Bắt đầu khung giờ:</span>
                  <span className="font-mono text-slate-200">
                    {formatDateTime(order.deliveryWindowStart)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Hạn chót giao hàng:</span>
                  <span className="font-mono text-rose-300 font-semibold">
                    {formatDateTime(order.deliveryWindowEnd)}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Lịch sử trạng thái & Hành trình */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <FileText className="w-4 h-4 text-primary-400" />
                <span>Lịch sử trạng thái & Hành trình</span>
              </div>
              <OrderStatusTimeline order={order} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Đóng
            </button>

            {isPending && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/dispatch?orderId=${order.id}`);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-primary-400 hover:bg-primary-300 rounded-xl transition-colors shadow-lg shadow-primary-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chuyển tới Điều phối</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
