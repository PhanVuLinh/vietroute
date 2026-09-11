import React from "react";
import {
  Clock,
  Send,
  AlertTriangle,
  UserCheck,
  Truck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

interface DispatchSummaryBarProps {
  pendingOrdersCount: number;
  assignedOrdersCount: number;
  delayedOrdersCount: number;
  availableDriversCount: number;
  busyDriversCount: number;
  overloadedDriversCount: number;
  activeFilter?: string;
  onFilterClick: (
    filterType:
      | "PENDING"
      | "ASSIGNED"
      | "DELAYED"
      | "DRIVERS_AVAILABLE"
      | "DRIVERS_BUSY"
      | "DRIVERS_OVERLOADED"
  ) => void;
}

export const DispatchSummaryBar: React.FC<DispatchSummaryBarProps> = ({
  pendingOrdersCount,
  assignedOrdersCount,
  delayedOrdersCount,
  availableDriversCount,
  busyDriversCount,
  overloadedDriversCount,
  activeFilter,
  onFilterClick,
}) => {
  const items = [
    {
      key: "PENDING" as const,
      label: "Chờ phân công",
      count: pendingOrdersCount,
      unit: "đơn",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.06]",
      hint: "Ưu tiên xử lý",
    },
    {
      key: "ASSIGNED" as const,
      label: "Đang phân công",
      count: assignedOrdersCount,
      unit: "đơn",
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/[0.06]",
      hint: "Chờ xuất bến",
    },
    {
      key: "DELAYED" as const,
      label: "Sắp trễ",
      count: delayedOrdersCount,
      unit: "đơn",
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/15",
      border: "hover:border-rose-500/50",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/[0.08]",
      hint: "Cần can thiệp ngay",
      isAlert: true,
    },
    {
      key: "DRIVERS_AVAILABLE" as const,
      label: "Tài xế sẵn sàng",
      count: availableDriversCount,
      unit: "tài xế",
      icon: UserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.06]",
      hint: "Sẵn sàng nhận chuyến",
    },
    {
      key: "DRIVERS_BUSY" as const,
      label: "Tài xế đang giao",
      count: busyDriversCount,
      unit: "tài xế",
      icon: Truck,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "hover:border-sky-500/50",
      activeBorder: "border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/[0.06]",
      hint: "Đang trên tuyến",
    },
    {
      key: "DRIVERS_OVERLOADED" as const,
      label: "Tài xế quá tải",
      count: overloadedDriversCount,
      unit: "tài xế",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/15",
      border: "hover:border-orange-500/50",
      activeBorder: "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/[0.08]",
      hint: ">= 4 đơn đang giữ",
      isWarning: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.key;

        return (
          <Card
            key={item.key}
            onClick={() => onFilterClick(item.key)}
            className={cn(
              "group transition-all duration-200 cursor-pointer select-none border shadow-2xs hover:shadow-xs h-full flex flex-col justify-between",
              isActive ? item.activeBorder : cn("border-border/70 bg-card", item.border),
              item.isAlert && "border-rose-500/30"
            )}
          >
            <CardContent className="p-2.5 sm:p-3 flex flex-col justify-between h-full flex-1 gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate" title={item.label}>
                  {item.label}
                </span>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105",
                    item.bg,
                    item.color
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-1">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums whitespace-nowrap">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {item.unit}
                  </span>
                </div>

                {item.isAlert && item.count > 0 && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 animate-pulse whitespace-nowrap shrink-0">
                    Khẩn
                  </Badge>
                )}
              </div>

              <div className="mt-auto pt-1 border-t border-border/40 text-[10px] text-muted-foreground truncate" title={item.hint}>
                {item.hint}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
