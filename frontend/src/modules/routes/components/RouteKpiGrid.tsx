import React from "react";
import {
  Route as RouteIcon,
  Navigation,
  CheckCircle2,
  Fuel,
  MapPin,
} from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";
import { formatCurrency } from "@/shared/utils/formatters";
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
  isLoading?: boolean;
}

export const RouteKpiGrid: React.FC<RouteKpiGridProps> = ({
  stats,
  selectedStatus = "ALL",
  onSelectStatus,
  isLoading = false,
}) => {
  return (
    <StatGrid columns={5}>
      {/* 1. Tổng Tuyến Vận Chuyển */}
      <StatCard
        id="kpi-total-routes"
        title="Tuyến vận chuyển"
        value={stats.total}
        unit="tuyến"
        icon={RouteIcon}
        description={`Lập lịch ${stats.planned} • Đang chạy ${stats.active}`}
        variant="primary"
        isLoading={isLoading}
        isSelected={selectedStatus === "ALL"}
        onClick={onSelectStatus ? () => onSelectStatus("ALL") : undefined}
      />

      {/* 2. Tuyến Đang Chạy (Active) */}
      <StatCard
        id="kpi-active-routes"
        title="Đang chạy trên đường"
        value={stats.active}
        unit="xe lăn bánh"
        icon={Navigation}
        description="Lọc tuyến đang chạy"
        variant="amber"
        isLoading={isLoading}
        isSelected={selectedStatus === "ACTIVE"}
        onClick={
          onSelectStatus
            ? () => onSelectStatus(selectedStatus === "ACTIVE" ? "ALL" : "ACTIVE")
            : undefined
        }
      />

      {/* 3. Tuyến Đã Hoàn Thành */}
      <StatCard
        id="kpi-completed-routes"
        title="Đã giao hoàn tất"
        value={stats.completed}
        unit="tuyến"
        icon={CheckCircle2}
        description="Đạt đúng cam kết ETA"
        variant="emerald"
        isLoading={isLoading}
        isSelected={selectedStatus === "COMPLETED"}
        onClick={
          onSelectStatus
            ? () => onSelectStatus(selectedStatus === "COMPLETED" ? "ALL" : "COMPLETED")
            : undefined
        }
      />

      {/* 4. Tổng Quãng Đường & Chi Phí Vận Hành */}
      <StatCard
        id="kpi-distance-fuel"
        title="Tổng cự ly & Chi phí"
        value={(stats.totalDistanceKm || 0).toLocaleString("vi-VN")}
        unit="km"
        icon={Fuel}
        description={`${stats.totalFuelEstLiters || 0}L Dầu • ${formatCurrency(stats.totalTollFeeVND || 0)} BOT`}
        variant="blue"
        isLoading={isLoading}
      />

      {/* 5. Tỷ Lệ Hoàn Thành Chặng Dừng */}
      <StatCard
        id="kpi-stop-progress"
        title="Tiến độ chặng giao"
        value={stats.total === 0 ? "—" : `${stats.stopCompletionRatePercent || 0}%`}
        icon={MapPin}
        progress={
          stats.total > 0
            ? {
                value: stats.stopCompletionRatePercent || 0,
                color: "bg-purple-500",
              }
            : undefined
        }
        description={stats.total === 0 ? "Chưa có chặng giao" : `Đã giao ${stats.completedStops || 0} / ${stats.totalStops || 0} điểm`}
        variant="purple"
        isLoading={isLoading}
      />
    </StatGrid>
  );
};
