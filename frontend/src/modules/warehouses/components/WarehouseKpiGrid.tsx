import React from "react";
import {
  Building2,
  Boxes,
  Gauge,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { WarehouseStatus } from "@/core/types/logistics";

interface WarehouseKpiGridProps {
  stats: {
    total: number;
    active: number;
    maintenance: number;
    full: number;
    highOccupancyCount: number;
    totalCapacityTons: number;
    totalUsedCapacityTons: number;
    avgOccupancyPercent: number;
    totalAreaSqM: number;
    totalPallets: number;
    usedPallets: number;
    totalDockDoors: number;
    totalDailyInboundTons?: number;
    totalDailyOutboundTons?: number;
    totalYardParkingCapacity?: number;
    totalYardParkingOccupied?: number;
    northCount: number;
    centralCount: number;
    southCount: number;
  };
  selectedStatus?: WarehouseStatus | "ALL";
  onSelectStatus?: (status: WarehouseStatus | "ALL") => void;
}

export const WarehouseKpiGrid: React.FC<WarehouseKpiGridProps> = ({
  stats,
  selectedStatus = "ALL",
  onSelectStatus,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Tổng Hub & Kho */}
      <Card className="border border-border/80 shadow-2xs hover:border-primary/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Hệ thống kho & Hub</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap truncate">
                kho ({(stats.totalAreaSqM / 1000).toFixed(1)}k m²)
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">
              Bắc {stats.northCount} • Trung {stats.centralCount} • Nam {stats.southCount}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ml-1">
            <Building2 className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Tổng sức chứa toàn mạng lưới */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Tổng công suất kho</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-primary tabular-nums whitespace-nowrap">
                {stats.totalCapacityTons.toLocaleString("vi-VN")}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">Tấn</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate whitespace-nowrap">
              {stats.totalPallets.toLocaleString("vi-VN")} Pallets • {stats.totalDockDoors} Cửa Dock
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 ml-1">
            <Boxes className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Tỷ lệ lấp đầy & Thông lượng */}
      <Card className="border border-border/80 shadow-2xs hover:border-purple-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 flex-1 pr-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Lấp đầy bình quân</p>
              <span
                className={`text-xs font-bold font-mono ${
                  stats.avgOccupancyPercent >= 85
                    ? "text-rose-600"
                    : stats.avgOccupancyPercent >= 70
                    ? "text-amber-600"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {stats.avgOccupancyPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.avgOccupancyPercent >= 85
                    ? "bg-rose-500"
                    : stats.avgOccupancyPercent >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${stats.avgOccupancyPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate whitespace-nowrap">
              Nhập {stats.totalDailyInboundTons || 0}T • Xuất {stats.totalDailyOutboundTons || 0}T
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Gauge className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Cảnh báo đầy tải / Quá tải */}
      <Card
        onClick={() => {
          if (onSelectStatus) {
            onSelectStatus(selectedStatus === "FULL" ? "ALL" : "FULL");
          }
        }}
        className={`border shadow-2xs transition-all cursor-pointer h-full flex flex-col justify-between ${
          stats.full > 0 || stats.highOccupancyCount > 0
            ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/70"
            : "border-border/80 hover:border-emerald-500/40"
        }`}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 truncate">
              <span>Cảnh báo đầy tải</span>
              {stats.full > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              )}
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                {stats.highOccupancyCount}
              </span>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate whitespace-nowrap">
                kho &gt;85% ({stats.full} quá tải)
              </span>
            </div>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 truncate whitespace-nowrap">
              Lọc kho cần phân luồng
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 ml-1">
            <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Bảo trì / Nâng cấp */}
      <Card
        onClick={() => {
          if (onSelectStatus) {
            onSelectStatus(selectedStatus === "MAINTENANCE" ? "ALL" : "MAINTENANCE");
          }
        }}
        className={`border shadow-2xs transition-all cursor-pointer col-span-2 sm:col-span-1 h-full flex flex-col justify-between ${
          stats.maintenance > 0
            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
            : "border-border/80 hover:border-amber-500/40"
        }`}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Bảo trì mặt bãi</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
                {stats.maintenance}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">kho nâng cấp</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">
              {stats.active} kho vận hành tốt
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 ml-1">
            <Wrench className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
