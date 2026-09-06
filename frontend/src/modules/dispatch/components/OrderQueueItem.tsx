import React from "react";
import {
  Clock,
  MapPin,
  Building2,
  Weight,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { Order, OrderPriority, OrderStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface OrderQueueItemProps {
  order: Order;
  warehouseName: string;
  isSelected: boolean;
  onClick: () => void;
  onViewDetail: (e: React.MouseEvent) => void;
}

export const OrderQueueItem: React.FC<OrderQueueItemProps> = ({
  order,
  warehouseName,
  isSelected,
  onClick,
  onViewDetail,
}) => {
  // Huy hiệu mức độ ưu tiên
  const getPriorityBadge = (priority: OrderPriority) => {
    switch (priority) {
      case "URGENT":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-bold gap-1 animate-pulse">
            <AlertCircle className="h-2.5 w-2.5" />
            Khẩn cấp
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-semibold">
            Ưu tiên cao
          </Badge>
        );
      case "NORMAL":
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
            Bình thường
          </Badge>
        );
      case "LOW":
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground font-normal">
            Tiêu chuẩn
          </Badge>
        );
    }
  };

  // Huy hiệu trạng thái đơn
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-semibold">
            Chờ phân công
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge variant="info" className="text-[10px] px-1.5 py-0 font-semibold">
            Đã phân công
          </Badge>
        );
      case "IN_TRANSIT":
      case "PICKING_UP":
        return (
          <Badge variant="info" className="text-[10px] px-1.5 py-0 font-semibold">
            Đang giao
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="success" className="text-[10px] px-1.5 py-0 font-semibold">
            Đã hoàn tất
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-semibold">
            Thất bại
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {status}
          </Badge>
        );
    }
  };

  // Tính thời gian deadline hiển thị
  const formatDeadline = (isoString?: string) => {
    if (!isoString) return "Trong ngày";
    try {
      const d = new Date(isoString);
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return `Trước ${h}:${m}`;
    } catch {
      return "Trong ngày";
    }
  };

  const isUrgent = order.priority === "URGENT";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none",
        isSelected
          ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
          : isUrgent
          ? "border-amber-500/40 bg-amber-500/[0.02] hover:border-amber-500/60 hover:bg-amber-500/[0.05]"
          : "border-border/70 bg-card hover:border-border hover:bg-accent/40"
      )}
    >
      {/* Top row: Order Code + Priority + Status */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-border/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono font-bold text-xs text-foreground tracking-tight group-hover:text-primary transition-colors">
            {order.orderCode}
          </span>
          {getPriorityBadge(order.priority)}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {getStatusBadge(order.status)}
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewDetail}
            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Xem chi tiết đơn hàng"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Middle: Customer + Weight + Deadline */}
      <div className="py-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground truncate max-w-[180px]">
            {order.receiverName}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <Weight className="h-3 w-3 text-muted-foreground/70" />
            {order.totalWeight} kg
          </span>
        </div>

        {/* Route Line: Warehouse -> Receiver Address */}
        <div className="space-y-0.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="h-3 w-3 text-blue-500 shrink-0" />
            <span className="truncate">{warehouseName}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
            <span className="truncate text-foreground/80">{order.receiverAddress}</span>
          </div>
        </div>
      </div>

      {/* Bottom: Countdown / Deadline hint */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5 text-primary" />
          <span>Hạn giao: {formatDeadline(order.deliveryWindowEnd)}</span>
        </span>
        {order.status === "PENDING" && (
          <span className="text-primary font-semibold group-hover:underline">
            Bấm để chọn tài xế →
          </span>
        )}
      </div>
    </div>
  );
};
