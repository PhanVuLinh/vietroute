import React, { useState } from "react";
import { CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { OnTimeRateTrend } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface OtdTrendChartProps {
  trends?: OnTimeRateTrend[];
  targetRate?: number;
  isLoading?: boolean;
  className?: string;
}

export const OtdTrendChart: React.FC<OtdTrendChartProps> = ({
  trends = [],
  targetRate = 98.0,
  isLoading = false,
  className,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    rate: number;
    index: number;
    x: number;
    y: number;
  } | null>(null);

  // Kích thước SVG
  const chartWidth = 560;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Min & Max scale cho OTD (từ 92% đến 100%)
  const minRate = 92;
  const maxRate = 100;

  // Tính tọa độ các điểm
  const points = trends.map((item, index) => {
    const x = paddingLeft + (index / Math.max(trends.length - 1, 1)) * innerWidth;
    const normalizedY = (item.rate - minRate) / (maxRate - minRate);
    const y = paddingTop + (1 - Math.max(0, Math.min(1, normalizedY))) * innerHeight;
    return { ...item, x, y, index };
  });

  // Tạo đường dẫn SVG Path (Line & Area)
  const linePathD = points.length > 0
    ? points.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, "")
    : "";

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : "";

  // Tọa độ đường Target line (98%)
  const targetY = paddingTop + (1 - (targetRate - minRate) / (maxRate - minRate)) * innerHeight;

  // Điểm OTD mới nhất
  const currentOtd = trends.length > 0 ? trends[trends.length - 1].rate : 97.2;

  return (
    <Card className={cn("border-border/80 shadow-2xs flex flex-col justify-between", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
        <div className="space-y-0.5">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Xu hướng Đúng hẹn (OTD - On-Time Delivery)</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Tỷ lệ đơn hàng giao thành công trong khung giờ cam kết (SLA)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Thực tế:</span>
            <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {currentOtd}%
            </strong>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-rose-500" />
            <span className="text-muted-foreground">Mục tiêu:</span>
            <strong className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
              {targetRate}%
            </strong>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-end">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : trends.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
            Chưa có dữ liệu xu hướng OTD
          </div>
        ) : (
          <div className="w-full overflow-x-auto relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-[200px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="otdAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines ngang */}
              {[94, 96, 98, 100].map((rate) => {
                const y = paddingTop + (1 - (rate - minRate) / (maxRate - minRate)) * innerHeight;
                return (
                  <g key={rate}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-muted-foreground font-mono"
                    >
                      {rate}%
                    </text>
                  </g>
                );
              })}

              {/* Đường Ngưỡng mục tiêu (Benchmark Target Line 98%) */}
              <line
                x1={paddingLeft}
                y1={targetY}
                x2={chartWidth - paddingRight}
                y2={targetY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                strokeOpacity="0.8"
              />
              <text
                x={chartWidth - paddingRight + 4}
                y={targetY + 3}
                className="text-[9px] font-bold fill-rose-500 font-mono"
              >
                Target {targetRate}%
              </text>

              {/* Vùng diện tích Area Gradient */}
              <path d={areaPathD} fill="url(#otdAreaGradient)" />

              {/* Đường cong Line Chart */}
              <path
                d={linePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Các điểm dữ liệu & Tooltip tương tác */}
              {points.map((pt) => {
                const isHovered = hoveredPoint?.date === pt.date;
                const isBelowTarget = pt.rate < targetRate;

                return (
                  <g key={pt.date}>
                    {/* Đường vertical marker khi hover */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={paddingTop + innerHeight}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        strokeOpacity="0.7"
                      />
                    )}

                    {/* Điểm tròn */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={isBelowTarget ? "#f59e0b" : "#10b981"}
                      stroke="var(--color-card, #ffffff)"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Nhãn trục X (Ngày) */}
                    <text
                      x={pt.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className={cn(
                        "text-[10px] font-mono transition-colors",
                        isHovered ? "fill-primary font-bold" : "fill-muted-foreground"
                      )}
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip Card khi hover điểm */}
              {hoveredPoint && (
                <g transform={`translate(${Math.min(hoveredPoint.x - 45, chartWidth - 110)}, ${Math.max(hoveredPoint.y - 45, 10)})`}>
                  <rect
                    width="90"
                    height="32"
                    rx="6"
                    className="fill-popover stroke-border"
                    strokeWidth="1"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                  />
                  <text x="45" y="14" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">
                    Ngày {hoveredPoint.date}
                  </text>
                  <text x="45" y="26" textAnchor="middle" className="text-[11px] font-bold font-mono fill-emerald-600 dark:fill-emerald-400">
                    OTD: {hoveredPoint.rate}%
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* Footer Insight */}
        <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tỷ lệ OTD duy trì ổn định &gt;97% suốt 7 ngày qua.</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px]">
            <AlertTriangle className="h-3 w-3" />
            <span>Ngày 03/09 ghi nhận giảm nhẹ 95.4% do mưa bão cục bộ.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
