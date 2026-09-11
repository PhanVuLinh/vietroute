import React from "react";
import {
  CheckCircle2,
  Package,
  Navigation,
  Fuel,
  Coins,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";

interface ReportsKpiGridProps {
  stats: {
    totalOrders: number;
    otdRate: number;
    fleetUtil: number;
    totalDistanceKm: number;
    totalFuelLiters: number;
    totalTollFeeVND: number;
    totalCodVND: number;
    avgFuelConsumptionPer100Km: number;
    estimatedSavedCostVND: number;
  };
  isLoading?: boolean;
}

export const ReportsKpiGrid: React.FC<ReportsKpiGridProps> = ({ stats, isLoading = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">
      {/* 1. Tỷ lệ giao đúng hạn OTD */}
      <Card className="border border-border/80 shadow-2xs hover:border-emerald-500/40 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground truncate">Tỷ lệ đúng hẹn</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                ≥98% OTD
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={cn(
                "text-2xl font-bold font-mono tracking-tight tabular-nums whitespace-nowrap",
                stats.otdRate >= 97 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )}>
                {isLoading ? "--" : `${stats.otdRate}%`}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 whitespace-nowrap">
                <TrendingUp className="h-3 w-3 shrink-0" /> +1.4%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">So với cùng kỳ trước</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Tổng sản lượng đơn */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground truncate">Tổng đơn xử lý</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {isLoading ? "--" : stats.totalOrders}
              </span>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">đơn hàng</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Tỷ lệ hoàn tất 96.0%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Package className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Tổng cự ly lăn bánh */}
      <Card className="border border-border/80 shadow-2xs hover:border-indigo-500/40 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground truncate">Tổng cự ly lăn bánh</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {isLoading ? "--" : stats.totalDistanceKm.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">km</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Khai thác: <strong className="text-primary font-mono">{stats.fleetUtil}%</strong></p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Navigation className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Nhiên liệu tiêu thụ */}
      <Card className="border border-border/80 shadow-2xs hover:border-amber-500/40 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground truncate">Nhiên liệu tiêu thụ</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-500/15 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap shrink-0">
                <Sparkles className="h-2.5 w-2.5 shrink-0" /> -8.4%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {isLoading ? "--" : stats.totalFuelLiters.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">lít</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Định mức: {stats.avgFuelConsumptionPer100Km}L / 100km</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Fuel className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Tiền thu hộ COD & Doanh số */}
      <Card className="border border-border/80 shadow-2xs hover:border-purple-500/40 transition-colors bg-card relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground truncate" title="Tổng tiền thu hộ COD">Tiền thu hộ COD</p>
            <div className="flex items-baseline gap-1" title={formatCurrency(stats.totalCodVND)}>
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {isLoading ? "--" : `${(stats.totalCodVND / 1000000).toFixed(1)} tr ₫`}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Tiết kiệm: <strong className="text-emerald-600 font-mono whitespace-nowrap">14.5 tr ₫</strong></p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Coins className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
