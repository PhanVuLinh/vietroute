import React from "react";
import {
  Clock,
  ClipboardList,
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  AlertTriangle,
  Ban,
  HelpCircle,
} from "lucide-react";
import { StatusBadge, type StatusBadgeVariant } from "@/shared/components/common/StatusBadge";
import type { OrderStatus } from "@/core/types/logistics";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
  size?: "xs" | "sm" | "md";
}

interface StatusConfig {
  label: string;
  variant: StatusBadgeVariant;
  icon: React.ElementType;
  pulse?: boolean;
}

const ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    label: "Chờ phân công",
    variant: "amber",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Chờ phân công",
    variant: "amber",
    icon: Clock,
  },
  ASSIGNED: {
    label: "Đã phân công",
    variant: "blue",
    icon: ClipboardList,
  },
  ACCEPTED: {
    label: "Đã nhận đơn",
    variant: "blue",
    icon: CheckCircle2,
  },
  PICKING_UP: {
    label: "Đang lấy hàng",
    variant: "cyan",
    icon: PackageCheck,
  },
  IN_TRANSIT: {
    label: "Đang giao",
    variant: "amber",
    icon: Truck,
    pulse: true,
  },
  ARRIVED: {
    label: "Đã đến nơi",
    variant: "blue",
    icon: MapPin,
  },
  DELIVERED: {
    label: "Giao thành công",
    variant: "emerald",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Giao thất bại",
    variant: "rose",
    icon: AlertTriangle,
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "slate",
    icon: Ban,
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
  size = "xs",
}) => {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: String(status),
    variant: "slate" as StatusBadgeVariant,
    icon: HelpCircle,
  };

  return (
    <StatusBadge
      label={config.label}
      icon={config.icon}
      variant={config.variant}
      pulseDot={config.pulse}
      size={size}
      className={className}
    />
  );
};

