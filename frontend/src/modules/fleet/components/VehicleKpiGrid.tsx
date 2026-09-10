import React from "react";
import { Truck, CheckCircle2, Navigation, Wrench, Fuel } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

interface VehicleKpiGridProps {
  stats: {
    total: number;
    available: number;
    enRoute: number;
    loading: number;
    maintenance: number;
    offline: number;
    avgFuel: number;
    totalCapacityTons: number;
  };
}

export const VehicleKpiGrid: React.FC<VehicleKpiGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Tổng phương tiện */}
      <Card className="border border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tổng hạm đội</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">xe ({stats.totalCapacityTons}T)</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Truck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Đang chạy tuyến */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Đang chạy tuyến</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-primary tabular-nums">
                {stats.enRoute}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">trên đường</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Navigation className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Sẵn sàng điều động */}
      <Card className="border border-border/80 shadow-2xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sẵn sàng điều động</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.available}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">tại bãi/kho</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Đang bảo dưỡng */}
      <Card className="border border-border/80 shadow-2xs hover:border-amber-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Bảo dưỡng / Sửa chữa</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {stats.maintenance}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">trong xưởng</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Nhiên liệu bình quân */}
      <Card className="border border-border/80 shadow-2xs hover:border-violet-500/40 transition-colors col-span-2 md:col-span-1">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Nhiên liệu TB</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-violet-600 dark:text-violet-400 tabular-nums">
                {stats.avgFuel}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">bình xăng</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <Fuel className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
