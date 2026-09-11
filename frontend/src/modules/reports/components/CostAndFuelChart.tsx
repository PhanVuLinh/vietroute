import React, { useState } from "react";
import { Fuel, Coins, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FuelAndCostData } from "../hooks/useReports";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";

interface CostAndFuelChartProps {
  data?: FuelAndCostData[];
  isLoading?: boolean;
  className?: string;
}

export const CostAndFuelChart: React.FC<CostAndFuelChartProps> = ({
  data = [],
  isLoading = false,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxFuel = Math.max(...data.map((d) => d.fuelLiters), 1);
  const chartHeight = 160;
  const chartWidth = 540;
  const barWidth = 26;
  const gap = (chartWidth - data.length * barWidth) / (data.length + 1);

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  const totalFuelLiters = data.reduce((acc, curr) => acc + curr.fuelLiters, 0);
  const totalTollFee = data.reduce((acc, curr) => acc + curr.tollFeeVND, 0);

  return (
    <Card className={cn("border-border/80 shadow-2xs flex flex-col justify-between", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
        <div className="space-y-0.5">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Fuel className="h-4 w-4 text-amber-500" />
            <span>Chi phí Vận hành & Nhiên liệu tiêu thụ</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Lượng dầu diesel (lít) và chi phí BOT qua các trạm thu phí
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
            <span className="text-muted-foreground">Nhiên liệu:</span>
            <strong className="font-mono text-foreground">{totalFuelLiters} L</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-500" />
            <span className="text-muted-foreground">Phí BOT:</span>
            <strong className="font-mono text-indigo-600 dark:text-indigo-400">{formatCurrency(totalTollFee)}</strong>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-end">
        {isLoading ? (
          <div className="h-[190px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[190px] flex items-center justify-center text-xs text-muted-foreground">
            Chưa có dữ liệu chi phí vận hành
          </div>
        ) : (
          <div className="w-full overflow-x-auto relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
              className="w-full h-[190px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="fuelGradientHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Đường lưới Grid */}
              {[0.25, 0.5, 0.75, 1].map((p, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={chartHeight - chartHeight * p}
                  x2={chartWidth}
                  y2={chartHeight - chartHeight * p}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Các cột bar */}
              {data.map((item, index) => {
                const x = gap + index * (barWidth + gap);
                const barH = (item.fuelLiters / maxFuel) * (chartHeight - 25);
                const y = chartHeight - barH;
                const isHovered = hoveredIndex === index;

                return (
                  <g
                    key={item.period}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {/* Cột tiêu thụ dầu */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      fill={isHovered ? "url(#fuelGradientHover)" : "url(#fuelGradient)"}
                    />

                    {/* Số lít trên đỉnh cột */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className={cn(
                        "text-[10px] font-bold font-mono transition-opacity",
                        isHovered ? "fill-amber-600 dark:fill-amber-400 font-extrabold" : "fill-foreground/70"
                      )}
                    >
                      {item.fuelLiters}L
                    </text>

                    {/* Nhãn trục X */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 18}
                      textAnchor="middle"
                      className={cn(
                        "text-[10px] font-medium transition-colors truncate",
                        isHovered ? "fill-primary font-bold" : "fill-muted-foreground"
                      )}
                    >
                      {item.period}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip info */}
            {hoveredItem && (
              <div className="mt-2 p-2.5 bg-accent/60 border border-border rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{hoveredItem.period}:</span>
                  <span className="text-muted-foreground">Cự ly: <strong className="font-mono text-foreground">{hoveredItem.distanceKm} km</strong></span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3 text-amber-500" />
                    <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">{hoveredItem.fuelLiters} Lít</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-indigo-500" />
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(hoveredItem.tollFeeVND)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Suất tiêu hao: <strong className="text-emerald-600 font-mono">{hoveredItem.avgCostPerKm.toLocaleString()} ₫/km</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Insight */}
        {!hoveredItem && (
          <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Thuật toán tối ưu đa điểm giúp giảm 8.4% chi phí dầu so với định mức hãng.</span>
            </div>
            <div className="text-[11px] font-mono">
              Chi phí trung bình: <strong>3,950 ₫ / km</strong>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
