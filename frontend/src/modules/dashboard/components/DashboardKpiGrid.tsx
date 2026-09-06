import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { AnalyticsSummary } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface DashboardKpiGridProps {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({
  summary,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/70 p-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      id: "kpi-total-orders",
      title: "Tổng đơn hôm nay",
      value: summary.totalOrdersToday,
      unit: "đơn",
      trend: "+8.5%",
      trendPositive: true,
      description: "So với cùng giờ hôm qua",
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "hover:border-blue-500/40",
      path: "/orders",
      isHighlight: false,
    },
    {
      id: "kpi-in-transit",
      title: "Đang giao",
      value: summary.inTransitOrders,
      unit: "đơn",
      trend: `${Math.round((summary.inTransitOrders / (summary.totalOrdersToday || 1)) * 100)}%`,
      trendPositive: true,
      description: "Đang trên lộ trình",
      icon: Truck,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10 dark:bg-sky-500/15",
      border: "hover:border-sky-500/40",
      path: "/orders",
      isHighlight: false,
    },
    {
      id: "kpi-delivered",
      title: "Giao thành công",
      value: summary.deliveredOrders,
      unit: "đơn",
      trend: `${Math.round((summary.deliveredOrders / (summary.totalOrdersToday || 1)) * 100)}%`,
      trendPositive: true,
      description: "Đã ký nhận đầy đủ",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "hover:border-emerald-500/40",
      path: "/orders",
      isHighlight: false,
    },
    {
      id: "kpi-delayed",
      title: "Có nguy cơ trễ",
      value: summary.delayedOrders,
      unit: "đơn",
      trend: "Cảnh báo",
      trendPositive: false,
      description: "Cần hỗ trợ điều phối",
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/15 dark:bg-amber-500/20",
      border: "border-amber-500/50 hover:border-amber-500 shadow-xs shadow-amber-500/10",
      path: "/orders",
      isHighlight: true, // Điểm nhấn nghiệp vụ vận hành
    },
    {
      id: "kpi-active-drivers",
      title: "Tài xế đang hoạt động",
      value: summary.activeDrivers,
      unit: "tài xế",
      trend: `${summary.fleetUtilizationRate}%`,
      trendPositive: true,
      description: "Tỷ lệ khai thác xe",
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
      border: "hover:border-indigo-500/40",
      path: "/drivers",
      isHighlight: false,
    },
    {
      id: "kpi-available-drivers",
      title: "Tài xế sẵn sàng",
      value: summary.availableDrivers,
      unit: "tài xế",
      trend: "Trực tuyến",
      trendPositive: true,
      description: "Chờ nhận chuyến mới",
      icon: UserCheck,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10 dark:bg-teal-500/15",
      border: "hover:border-teal-500/40",
      path: "/drivers",
      isHighlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <Card
            key={kpi.id}
            id={kpi.id}
            onClick={() => navigate(kpi.path)}
            className={cn(
              "group relative overflow-hidden transition-all duration-200 cursor-pointer select-none",
              "border bg-card hover:-translate-y-0.5 hover:shadow-md",
              kpi.isHighlight
                ? cn(
                    "border-amber-500/60 bg-gradient-to-br from-amber-500/[0.07] via-card to-amber-500/[0.03]",
                    "dark:from-amber-500/[0.12] dark:via-card dark:to-amber-500/[0.05]"
                  )
                : "border-border/70",
              kpi.border
            )}
          >
            <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full">
              {/* Top row: Title + Icon */}
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground leading-snug line-clamp-1 group-hover:text-foreground transition-colors">
                  {kpi.title}
                </span>
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                    kpi.bg,
                    kpi.color
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>

              {/* Middle row: Big Number */}
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {kpi.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {kpi.unit}
                </span>
              </div>

              {/* Bottom row: Trend or Description */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-border/40">
                <span className="text-muted-foreground truncate max-w-[100px] sm:max-w-[120px]">
                  {kpi.description}
                </span>
                {kpi.isHighlight ? (
                  <Badge
                    variant="warning"
                    className="h-4.5 px-1.5 text-[10px] font-semibold gap-0.5 tracking-tight animate-pulse"
                  >
                    {kpi.trend}
                  </Badge>
                ) : (
                  <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {kpi.trend}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
