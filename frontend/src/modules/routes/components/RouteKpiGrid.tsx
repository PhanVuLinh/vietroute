import React from "react";
import {
  Route as RouteIcon,
  Navigation,
  CheckCircle2,
  Fuel,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { RouteStatus } from "@/core/types/logistics";

interface RouteKpiGridProps {
  stats: {
    total: number;
    active: number;
    planned: number;
    completed: number;
    cancelled: number;
    totalDistanceKm: number;
    totalDurationMinutes: number;
    totalFuelEstLiters: number;
    totalTollFeeVND: number;
    totalStops: number;
    completedStops: number;
    stopCompletionRatePercent: number;
  };
  selectedStatus?: RouteStatus | "ALL";
  onSelectStatus?: (status: RouteStatus | "ALL") => void;
}

export const RouteKpiGrid: React.FC<RouteKpiGridProps> = ({
  stats,
  selectedStatus = "ALL",
  onSelectStatus,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Tổng Tuyến Vận Chuyển */}
      <Card
        onClick={() => onSelectStatus && onSelectStatus("ALL")}
        className={`border shadow-2xs transition-colors cursor-pointer h-full flex flex-col justify-between ${
          selectedStatus === "ALL"
            ? "border-primary/60 bg-primary/5"
            : "border-border/80 hover:border-primary/40"
        }`}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Tuyến vận chuyển</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">tuyến</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">
              Lập lịch {stats.planned} • Đang chạy {stats.active}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ml-1">
            <RouteIcon className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Tuyến Đang Chạy (In-Transit) */}
      <Card
        onClick={() => onSelectStatus && onSelectStatus(selectedStatus === "ACTIVE" ? "ALL" : "ACTIVE")}
        className={`border shadow-2xs transition-all cursor-pointer h-full flex flex-col justify-between ${
          selectedStatus === "ACTIVE" || stats.active > 0
            ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500/80"
            : "border-border/80 hover:border-amber-500/40"
        }`}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 truncate">
              <span>Đang chạy trên đường</span>
              {stats.active > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              )}
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
                {stats.active}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">xe lăn bánh</span>
            </div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 truncate whitespace-nowrap">
              Lọc tuyến đang chạy
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 ml-1">
            <Navigation className="h-4.5 w-4.5 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Tuyến Đã Hoàn Thành */}
      <Card
        onClick={() => onSelectStatus && onSelectStatus(selectedStatus === "COMPLETED" ? "ALL" : "COMPLETED")}
        className={`border shadow-2xs transition-all cursor-pointer h-full flex flex-col justify-between ${
          selectedStatus === "COMPLETED"
            ? "border-emerald-500/60 bg-emerald-500/5"
            : "border-border/80 hover:border-emerald-500/40"
        }`}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Đã giao hoàn tất</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                {stats.completed}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">tuyến</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">
              Đạt đúng cam kết ETA
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Tổng Quãng Đường & Chi Phí Vận Hành */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Tổng cự ly & Chi phí</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-primary tabular-nums whitespace-nowrap">
                {stats.totalDistanceKm}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">km</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate whitespace-nowrap">
              {stats.totalFuelEstLiters}L Dầu • {(stats.totalTollFeeVND / 1000).toLocaleString()}k BOT
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 ml-1">
            <Fuel className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Tỷ Lệ Hoàn Thành Chặng Dừng */}
      <Card className="border border-border/80 shadow-2xs hover:border-purple-500/40 transition-colors col-span-2 sm:col-span-1 h-full flex flex-col justify-between">
        <CardContent className="p-3.5 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 flex-1 pr-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Tiến độ chặng giao</p>
              <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                {stats.stopCompletionRatePercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.stopCompletionRatePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate whitespace-nowrap">
              Đã giao {stats.completedStops} / {stats.totalStops} điểm
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <MapPin className="h-4.5 w-4.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
