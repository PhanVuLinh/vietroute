import React, { useState, useMemo } from "react";
import { BarChart3, PieChart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type {
  HourlyOrderStat,
  StatusDistributionItem,
  AnalyticsSummary,
} from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface DeliveryPerformanceProps {
  hourlyOrders?: HourlyOrderStat[];
  statusDistribution?: StatusDistributionItem[];
  summary?: AnalyticsSummary;
  isLoading?: boolean;
  className?: string;
}

export const DeliveryPerformance: React.FC<DeliveryPerformanceProps> = ({
  hourlyOrders = [],
  statusDistribution = [],
  summary,
  isLoading,
  className,
}) => {
  const [hoveredHour, setHoveredHour] = useState<HourlyOrderStat | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<StatusDistributionItem | null>(null);

  // Tính toán thông số cho Biểu đồ cột (Đơn hàng theo giờ)
  const maxCount = Math.max(...hourlyOrders.map((h) => h.count), 1);
  const chartHeight = 140;
  const chartWidth = 480;
  const barWidth = 24;
  const gap = (chartWidth - hourlyOrders.length * barWidth) / (hourlyOrders.length + 1);

  // Bảng màu cho Donut Chart
  const statusColors: Record<string, { stroke: string; bg: string; text: string }> = useMemo(
    () => ({
      DELIVERED: { stroke: "#10b981", bg: "bg-emerald-500", text: "text-emerald-600" }, // Xanh lá
      IN_TRANSIT: { stroke: "#3b82f6", bg: "bg-blue-500", text: "text-blue-600" },      // Xanh dương
      PENDING: { stroke: "#eab308", bg: "bg-yellow-500", text: "text-yellow-600" },       // Vàng
      ASSIGNED: { stroke: "#6366f1", bg: "bg-indigo-500", text: "text-indigo-600" },     // Tím/Indigo
      FAILED: { stroke: "#ef4444", bg: "bg-rose-500", text: "text-rose-600" },            // Đỏ
    }),
    []
  );

  // Tính toán Donut SVG segments
  const totalDistribution = statusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    return statusDistribution.map((item, index) => {
      const priorPercent = statusDistribution
        .slice(0, index)
        .reduce((sum, curr) => sum + curr.percentage, 0);
      const strokeDasharray = `${(item.count / totalDistribution) * circumference} ${circumference}`;
      const strokeDashoffset = -(priorPercent / 100) * circumference;
      const color = statusColors[item.status] || { stroke: "#94a3b8", bg: "bg-slate-400", text: "text-slate-500" };

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
        color,
      };
    });
  }, [statusDistribution, totalDistribution, circumference, statusColors]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Hiệu suất giao hàng</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phân bổ tải đơn hàng và tỷ lệ hoàn tất chuyến vận chuyển
          </p>
        </div>

        {summary && (
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-muted-foreground">Tỷ lệ đúng giờ (OTD):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {summary.onTimeDeliveryRate}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-muted-foreground">Khai thác đội xe:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {summary.fleetUtilizationRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ============================================================
            1. BIỂU ĐỒ 1: ĐƠN HÀNG THEO GIỜ (7 COLS TRÊN DESKTOP)
        ============================================================ */}
        <Card className="lg:col-span-7 border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
            <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Đơn hàng theo giờ</span>
            </CardTitle>
            <span className="text-[11px] font-medium text-muted-foreground">
              {hoveredHour
                ? `Khung giờ ${hoveredHour.hour}: ${hoveredHour.count} đơn hàng`
                : "Khung giờ cao điểm: 08:00 (12 đơn)"}
            </span>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-end">
            {isLoading ? (
              <div className="h-[180px] flex items-end justify-between gap-2 p-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <Skeleton key={i} className="w-6" style={{ height: `${20 + (i * 15) % 80}%` }} />
                ))}
              </div>
            ) : hourlyOrders.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                Chưa ghi nhận dữ liệu đơn hàng theo giờ
              </div>
            ) : (
              <div className="w-full overflow-x-auto pb-1">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
                  className="w-full h-[180px] overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
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

                  {/* Columns */}
                  {hourlyOrders.map((item, index) => {
                    const x = gap + index * (barWidth + gap);
                    const barH = (item.count / maxCount) * (chartHeight - 20);
                    const y = chartHeight - barH;
                    const isHovered = hoveredHour?.hour === item.hour;

                    return (
                      <g
                        key={item.hour}
                        onMouseEnter={() => setHoveredHour(item)}
                        onMouseLeave={() => setHoveredHour(null)}
                        className="cursor-pointer transition-all duration-200"
                      >
                        {/* Cột dữ liệu */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barH}
                          rx="4"
                          fill={isHovered ? "url(#barGradientHover)" : "url(#barGradient)"}
                          className="transition-all duration-200"
                        />

                        {/* Số lượng trên đỉnh cột khi hover */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className={cn(
                            "text-[10px] font-bold fill-foreground transition-opacity",
                            isHovered ? "opacity-100 font-extrabold" : "opacity-70"
                          )}
                        >
                          {item.count}
                        </text>

                        {/* Nhãn trục X (Giờ) */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight + 18}
                          textAnchor="middle"
                          className={cn(
                            "text-[10px] fill-muted-foreground transition-colors",
                            isHovered ? "fill-primary font-bold" : ""
                          )}
                        >
                          {item.hour}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================================
            2. BIỂU ĐỒ 2: TỶ LỆ GIAO HÀNG (DONUT 5 COLS TRÊN DESKTOP)
        ============================================================ */}
        <Card className="lg:col-span-5 border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
            <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>Tỷ lệ giao hàng</span>
            </CardTitle>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              56% Thành công
            </span>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {isLoading ? (
              <div className="flex items-center gap-6 w-full justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ) : statusDistribution.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                Chưa có dữ liệu phân bổ trạng thái
              </div>
            ) : (
              <>
                {/* SVG Donut Circle */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg width="136" height="136" viewBox="0 0 136 136" className="rotate-[-90deg]">
                    <circle
                      cx="68"
                      cy="68"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="16"
                      strokeOpacity="0.08"
                    />
                    {donutSegments.map((seg) => (
                      <circle
                        key={seg.status}
                        cx="68"
                        cy="68"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color.stroke}
                        strokeWidth="16"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        onMouseEnter={() => setHoveredStatus(seg)}
                        onMouseLeave={() => setHoveredStatus(null)}
                      />
                    ))}
                  </svg>

                  {/* Trung tâm Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <span className="text-xl font-bold text-foreground tracking-tight">
                      {hoveredStatus ? hoveredStatus.count : totalDistribution}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      {hoveredStatus ? hoveredStatus.label : "Tổng đơn"}
                    </span>
                  </div>
                </div>

                {/* Chú thích Donut (Legend) */}
                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {statusDistribution.map((item) => {
                    const color = statusColors[item.status] || {
                      bg: "bg-slate-400",
                      text: "text-slate-500",
                    };
                    const isHovered = hoveredStatus?.status === item.status;

                    return (
                      <div
                        key={item.status}
                        onMouseEnter={() => setHoveredStatus(item)}
                        onMouseLeave={() => setHoveredStatus(null)}
                        className={cn(
                          "flex items-center justify-between p-1 rounded transition-colors cursor-pointer",
                          isHovered ? "bg-accent font-semibold" : "hover:bg-accent/40"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", color.bg)} />
                          <span className="text-muted-foreground truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-semibold text-foreground">{item.count}</span>
                          <span className="text-[11px] text-muted-foreground w-9 text-right">
                            {item.percentage}%
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
      </div>
    </div>
  );
};
