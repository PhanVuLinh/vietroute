import React from "react";
import { Truck, Gauge, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { VehiclePerformanceStat } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface FleetUtilizationCardProps {
  data?: VehiclePerformanceStat[];
  overallRate?: number;
  isLoading?: boolean;
  className?: string;
}

export const FleetUtilizationCard: React.FC<FleetUtilizationCardProps> = ({
  data = [],
  overallRate = 84.5,
  isLoading = false,
  className,
}) => {
  return (
    <Card className={cn("border-border/80 shadow-2xs flex flex-col justify-between", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
        <div className="space-y-0.5">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-600" />
            <span>Khai Thác Công Suất Đội Xe</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Tỷ lệ vận hành và tổng km lăn bánh thực tế theo phương tiện
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Toàn đội:</span>
          <span className="font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            {overallRate}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-3.5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Chưa có dữ liệu hiệu suất đội xe
          </div>
        ) : (
          data.map((item) => {
            const isHigh = item.utilizationRate >= 85;
            const isMedium = item.utilizationRate >= 70 && item.utilizationRate < 85;

            const progressColor = isHigh
              ? "bg-emerald-500"
              : isMedium
              ? "bg-blue-500"
              : "bg-amber-500";

            return (
              <div key={item.plateNumber} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-bold font-mono text-foreground">{item.plateNumber}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-muted-foreground">
                      {item.mileage.toLocaleString()} km
                    </span>
                    <strong className={cn(
                      "font-bold",
                      isHigh ? "text-emerald-600 dark:text-emerald-400" : isMedium ? "text-blue-600 dark:text-blue-400" : "text-amber-600"
                    )}>
                      {item.utilizationRate}%
                    </strong>
                  </div>
                </div>

                {/* Thanh tiến độ Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", progressColor)}
                    style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Footer info */}
        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>13/13 xe đang hoạt động ổn định, đủ hạn đăng kiểm.</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">Chu kỳ bảo dưỡng: 5,000 km</span>
        </div>
      </CardContent>
    </Card>
  );
};
