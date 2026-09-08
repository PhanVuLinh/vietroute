import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { deliveryService } from "@/mocks/adapters/serviceFactory";
import type { DeliveryStatus, DeliveryStatusHistoryItem } from "@/core/types/logistics";
import type { EnrichedOrder } from "../hooks/useOrders";

interface OrderStatusTimelineProps {
  order: EnrichedOrder;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
  const deliveryId = order.delivery?.id;

  const { data: historyItems = [], isLoading } = useQuery<DeliveryStatusHistoryItem[]>({
    queryKey: ["delivery-history", deliveryId],
    queryFn: async () => {
      if (!deliveryId) return [];
      const res = await deliveryService.getDeliveryHistory(deliveryId);
      return res.data;
    },
    enabled: Boolean(deliveryId),
    staleTime: 30 * 1000,
  });

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Nếu chưa có history từ delivery (ví dụ đơn mới tạo PENDING), ta hiển thị timeline tổng quan từ Order
  const displayItems = React.useMemo(() => {
    if (historyItems.length > 0) {
      return historyItems;
    }

    // Fallback events
    const items: DeliveryStatusHistoryItem[] = [
      {
        id: "created",
        deliveryId: deliveryId || "",
        status: "PENDING" as DeliveryStatus,
        timestamp: order.createdAt,
        description: "Đơn hàng được khởi tạo trên hệ thống",
      },
    ];

    if (order.status !== "PENDING") {
      items.push({
        id: "current-status",
        deliveryId: deliveryId || "",
        status: (order.delivery?.status || order.status) as DeliveryStatus,
        timestamp: order.updatedAt,
        description: `Đơn hàng đang ở trạng thái ${order.status}`,
      });
    }

    return items;
  }, [historyItems, order, deliveryId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "DELIVERY_FAILED":
      case "FAILED":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "IN_TRANSIT":
      case "PICKING_UP":
        return <Truck className="w-4 h-4 text-cyan-400" />;
      case "ASSIGNED":
      case "ACCEPTED":
        return <MapPin className="w-4 h-4 text-amber-400" />;
      default:
        return <Package className="w-4 h-4 text-primary-400" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "DELIVERY_FAILED":
      case "FAILED":
      case "CANCELLED":
        return "bg-rose-500/10 border-rose-500/30";
      case "IN_TRANSIT":
      case "PICKING_UP":
        return "bg-cyan-500/10 border-cyan-500/30";
      case "ASSIGNED":
      case "ACCEPTED":
        return "bg-amber-500/10 border-amber-500/30";
      default:
        return "bg-primary-500/10 border-primary-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 flex items-center justify-center text-xs text-slate-400">
        <Clock className="w-4 h-4 animate-spin mr-2 text-primary-400" />
        Đang tải lịch sử hành trình...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {displayItems.map((item, index) => {
          const isLatest = index === displayItems.length - 1;

          return (
            <div key={item.id || index} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${getStatusBgColor(
                  item.status
                )} bg-slate-950 transition-transform ${
                  isLatest ? "ring-2 ring-primary-500/30 scale-110" : ""
                }`}
              >
                {getStatusIcon(item.status)}
              </div>

              {/* Content */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">
                    {item.description}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatTime(item.timestamp)}
                  </span>
                </div>

                {item.note && (
                  <p className="text-xs text-slate-400 mt-1 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    Ghi chú: {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
