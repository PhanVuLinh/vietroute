import React from "react";
import { Users, CheckCircle2, Truck, Coffee, Award } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

interface DriverKpiGridProps {
  stats: {
    total: number;
    available: number;
    busy: number;
    onBreak: number;
    offline: number;
    suspended: number;
    avgOnTime: number;
    totalCompletedToday: number;
  };
}

export const DriverKpiGrid: React.FC<DriverKpiGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Tổng tài xế */}
      <Card className="border border-border/80 shadow-2xs hover:border-primary/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Tổng nhân sự</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums whitespace-nowrap">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">tài xế</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Sẵn sàng nhận đơn */}
      <Card className="border border-border/80 shadow-2xs hover:border-emerald-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Sẵn sàng nhận đơn</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                {stats.available}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">trực tuyến</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Đang chạy tuyến */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Đang chạy tuyến</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-primary tabular-nums whitespace-nowrap">
                {stats.busy}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">đang giao</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Truck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Nghỉ ca & Ngoại tuyến */}
      <Card className="border border-border/80 shadow-2xs hover:border-amber-500/40 transition-colors h-full flex flex-col justify-between">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Nghỉ ca / Offline</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
                {stats.onBreak + stats.offline}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">vắng mặt</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Coffee className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Tỷ lệ đúng hạn OTD */}
      <Card className="border border-border/80 shadow-2xs hover:border-violet-500/40 transition-colors col-span-2 sm:col-span-1 h-full flex flex-col justify-between">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">OTD Trung bình</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-violet-600 dark:text-violet-400 tabular-nums whitespace-nowrap">
                {stats.avgOnTime}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">đạt chuẩn</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
