import React, { useState } from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { RegionDistribution } from "../hooks/useReports";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";

interface RegionalVolumeChartProps {
  regions?: RegionDistribution[];
  isLoading?: boolean;
  className?: string;
}

export const RegionalVolumeChart: React.FC<RegionalVolumeChartProps> = ({
  regions = [],
  isLoading = false,
  className,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionDistribution | null>(null);

  const totalOrders = regions.reduce((sum, r) => sum + r.orderCount, 0) || 1;

  // SVG Donut Calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = regions.map((item, index) => {
    const priorPercent = regions
      .slice(0, index)
      .reduce((sum, curr) => sum + curr.percentage, 0);
    const strokeDasharray = `${(item.orderCount / totalOrders) * circumference} ${circumference}`;
    const strokeDashoffset = -(priorPercent / 100) * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card className={cn("border-border/80 shadow-2xs flex flex-col justify-between", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
        <div className="space-y-0.5">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Phân Bổ Sản Lượng Theo Vùng Miền</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Tỷ trọng luân chuyển hàng hóa 3 miền Bắc - Trung - Nam
          </p>
        </div>
        <span className="text-[11px] font-semibold text-primary font-mono">
          {totalOrders} đơn hàng
        </span>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
        {isLoading ? (
          <div className="flex items-center gap-6 w-full justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : (
          <>
            {/* SVG Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg width="130" height="130" viewBox="0 0 130 130" className="rotate-[-90deg]">
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeOpacity="0.08"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.region}
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setHoveredRegion(seg)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                ))}
              </svg>

              {/* Trung tâm Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-xl font-bold text-foreground font-mono">
                  {hoveredRegion ? `${hoveredRegion.percentage}%` : totalOrders}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {hoveredRegion ? hoveredRegion.name.split(" ")[1] : "Tổng đơn"}
                </span>
              </div>
            </div>

            {/* Chú thích Legend & Doanh thu */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {regions.map((item) => {
                const isHovered = hoveredRegion?.region === item.region;
                return (
                  <div
                    key={item.region}
                    onMouseEnter={() => setHoveredRegion(item)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={cn(
                      "p-2 rounded-xl border border-border/50 transition-all cursor-pointer",
                      isHovered ? "bg-accent border-primary/40 shadow-xs" : "hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-foreground text-xs">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-xs">{item.percentage}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1 pl-4.5 font-mono">
                      <span>{item.orderCount} đơn hàng</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(item.revenueVND)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
