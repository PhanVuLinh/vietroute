import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import type { OrderStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="warning" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Chờ phân công
        </Badge>
      );
    case "ASSIGNED":
      return (
        <Badge variant="info" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Đã phân công
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="info" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Đã nhận đơn
        </Badge>
      );
    case "PICKING_UP":
      return (
        <Badge variant="info" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Đang lấy hàng
        </Badge>
      );
    case "IN_TRANSIT":
      return (
        <Badge variant="info" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Đang giao
        </Badge>
      );
    case "ARRIVED":
      return (
        <Badge variant="info" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Đã đến nơi
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge variant="success" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Giao thành công
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className={cn("text-[10px] px-2 py-0.5 font-semibold", className)}>
          Giao thất bại
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5 text-muted-foreground", className)}>
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5", className)}>
          {status}
        </Badge>
      );
  }
};
