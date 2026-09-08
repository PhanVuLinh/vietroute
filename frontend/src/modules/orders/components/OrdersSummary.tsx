import React from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

interface OrdersSummaryProps {
  totalCount: number;
  pendingCount: number;
  inTransitCount: number;
  deliveredCount: number;
  delayedCount: number;
  failedCount: number;
  activeStatusFilter: string;
  onSelectFilter: (status: "ALL" | "PENDING" | "IN_TRANSIT" | "DELIVERED" | "DELAYED" | "FAILED") => void;
}

export const OrdersSummary: React.FC<OrdersSummaryProps> = ({
  totalCount,
  pendingCount,
  inTransitCount,
  deliveredCount,
  delayedCount,
  failedCount,
  activeStatusFilter,
  onSelectFilter,
}) => {
  const items = [
    {
      key: "ALL" as const,
      title: "Tổng đơn",
      count: totalCount,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/[0.06]",
      hint: "Toàn bộ mạng lưới",
    },
    {
      key: "PENDING" as const,
      title: "Chờ phân công",
      count: pendingCount,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.06]",
      hint: "Cần gán tài xế",
    },
    {
      key: "IN_TRANSIT" as const,
      title: "Đang giao",
      count: inTransitCount,
      icon: Truck,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "hover:border-sky-500/50",
      activeBorder: "border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/[0.06]",
      hint: "Đang trên tuyến",
    },
    {
      key: "DELIVERED" as const,
      title: "Giao thành công",
      count: deliveredCount,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.06]",
      hint: "Đã hoàn tất",
    },
    {
      key: "DELAYED" as const,
      title: "Có nguy cơ trễ",
      count: delayedCount,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/15",
      border: "hover:border-amber-500/50",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.08]",
      hint: "Sắp quá hạn SLA",
      isHighlight: true,
    },
    {
      key: "FAILED" as const,
      title: "Giao thất bại",
      count: failedCount,
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/15",
      border: "hover:border-rose-500/50",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/[0.08]",
      hint: "Cần xử lý hoàn hàng",
      isDestructive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeStatusFilter === item.key;

        return (
          <Card
            key={item.key}
            onClick={() => onSelectFilter(item.key)}
            className={cn(
              "group transition-all duration-200 cursor-pointer select-none border shadow-2xs hover:shadow-xs",
              isActive ? item.activeBorder : cn("border-border/70 bg-card", item.border),
              item.isHighlight && "border-amber-500/40 bg-amber-500/[0.02]"
            )}
          >
            <CardContent className="p-3 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {item.title}
                </span>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                    item.bg,
                    item.color
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">đơn</span>
                </div>

                {item.isHighlight && item.count > 0 && (
                  <Badge variant="warning" className="text-[9px] px-1 py-0 animate-pulse font-bold">
                    Cảnh báo
                  </Badge>
                )}
                {item.isDestructive && item.count > 0 && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold">
                    Sự cố
                  </Badge>
                )}
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground truncate">
                {item.hint}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
