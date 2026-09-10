import React from "react";
import { CheckCircle2, Truck, Package, Wrench, PowerOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { VehicleStatus } from "@/core/types/logistics";

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<
  VehicleStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/25 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  EN_ROUTE: {
    label: "Đang chạy tuyến",
    icon: Truck,
    bgClass: "bg-primary/10 dark:bg-primary/15",
    textClass: "text-primary dark:text-primary-300",
    borderClass: "border-primary/25 dark:border-primary/30",
    dotClass: "bg-primary animate-pulse",
  },
  LOADING: {
    label: "Đang bốc dỡ hàng",
    icon: Package,
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/15",
    textClass: "text-cyan-700 dark:text-cyan-300",
    borderClass: "border-cyan-500/25 dark:border-cyan-500/30",
    dotClass: "bg-cyan-500",
  },
  MAINTENANCE: {
    label: "Đang bảo dưỡng",
    icon: Wrench,
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/25 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  OFFLINE: {
    label: "Không khả dụng",
    icon: PowerOff,
    bgClass: "bg-muted/60 dark:bg-muted/40",
    textClass: "text-muted-foreground",
    borderClass: "border-border",
    dotClass: "bg-muted-foreground/60",
  },
};

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all select-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      )}
      <Icon className="h-3 w-3 shrink-0 opacity-85" />
      <span>{config.label}</span>
    </span>
  );
};
