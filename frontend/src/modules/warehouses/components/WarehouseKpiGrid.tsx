import React from "react";
import {
  Building2,
  Boxes,
  Gauge,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";
import type { WarehouseStatus } from "@/core/types/logistics";

interface WarehouseKpiGridProps {
  stats: {
    total: number;
    active: number;
    maintenance: number;
    full: number;
    highOccupancyCount: number;
    totalCapacityTons: number;
    totalUsedCapacityTons: number;
    avgOccupancyPercent: number;
    totalAreaSqM: number;
    totalPallets: number;
    usedPallets: number;
    totalDockDoors: number;
    totalDailyInboundTons?: number;
    totalDailyOutboundTons?: number;
    totalYardParkingCapacity?: number;
    totalYardParkingOccupied?: number;
    northCount: number;
    centralCount: number;
    southCount: number;
  };
  selectedStatus?: WarehouseStatus | "ALL";
  onSelectStatus?: (status: WarehouseStatus | "ALL") => void;
  isLoading?: boolean;
}

export const WarehouseKpiGrid: React.FC<WarehouseKpiGridProps> = ({
  stats,
  selectedStatus = "ALL",
  onSelectStatus,
  isLoading = false,
}) => {
  return (
    <StatGrid columns={5}>
      {/* 1. Tổng Hub & Kho */}
      <StatCard
        id="kpi-total-warehouses"
        title="Hệ thống kho & Hub"
        value={stats.total}
        unit={`kho (${(stats.totalAreaSqM / 1000).toFixed(1)}k m²)`}
        icon={Building2}
        description={`Bắc ${stats.northCount} • Trung ${stats.centralCount} • Nam ${stats.southCount}`}
        variant="primary"
        isLoading={isLoading}
        isSelected={selectedStatus === "ALL"}
        onClick={onSelectStatus ? () => onSelectStatus("ALL") : undefined}
      />

      {/* 2. Tổng sức chứa toàn mạng lưới */}
      <StatCard
        id="kpi-capacity"
        title="Tổng công suất kho"
        value={stats.totalCapacityTons.toLocaleString("vi-VN")}
        unit="Tấn"
        icon={Boxes}
        description={`${stats.totalPallets.toLocaleString("vi-VN")} Pallets • ${stats.totalDockDoors} Cửa Dock`}
        variant="blue"
        isLoading={isLoading}
      />

      {/* 3. Tỷ lệ lấp đầy & Thông lượng */}
      <StatCard
        id="kpi-occupancy"
        title="Lấp đầy bình quân"
        value={`${stats.avgOccupancyPercent}%`}
        icon={Gauge}
        progress={{
          value: stats.avgOccupancyPercent,
          color:
            stats.avgOccupancyPercent >= 85
              ? "bg-rose-500"
              : stats.avgOccupancyPercent >= 70
              ? "bg-amber-500"
              : "bg-emerald-500",
        }}
        description={`Nhập ${stats.totalDailyInboundTons || 0}T • Xuất ${stats.totalDailyOutboundTons || 0}T`}
        variant="purple"
        isLoading={isLoading}
      />

      {/* 4. Cảnh báo đầy tải / Quá tải */}
      <StatCard
        id="kpi-full-warning"
        title="Cảnh báo đầy tải"
        value={stats.highOccupancyCount}
        unit={`kho >85% (${stats.full} quá tải)`}
        icon={AlertTriangle}
        badge={
          stats.full > 0
            ? { text: "QUÁ TẢI", variant: "destructive" }
            : undefined
        }
        description="Lọc kho cần phân luồng"
        variant="rose"
        isLoading={isLoading}
        isSelected={selectedStatus === "FULL"}
        onClick={
          onSelectStatus
            ? () => onSelectStatus(selectedStatus === "FULL" ? "ALL" : "FULL")
            : undefined
        }
      />

      {/* 5. Bảo trì / Nâng cấp */}
      <StatCard
        id="kpi-maintenance"
        title="Bảo trì mặt bãi"
        value={stats.maintenance}
        unit="kho nâng cấp"
        icon={Wrench}
        description={`${stats.active} kho vận hành tốt`}
        variant="amber"
        isLoading={isLoading}
        isSelected={selectedStatus === "MAINTENANCE"}
        onClick={
          onSelectStatus
            ? () => onSelectStatus(selectedStatus === "MAINTENANCE" ? "ALL" : "MAINTENANCE")
            : undefined
        }
        className="col-span-2 sm:col-span-1"
      />
    </StatGrid>
  );
};
