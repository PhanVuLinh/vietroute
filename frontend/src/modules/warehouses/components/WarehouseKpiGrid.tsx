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
        unit={`kho (${((stats.totalAreaSqM || 0) / 1000).toFixed(1)}k m²)`}
        icon={Building2}
        description={`Bắc ${stats.northCount || 0} • Trung ${stats.centralCount || 0} • Nam ${stats.southCount || 0}`}
        variant="primary"
        isLoading={isLoading}
        isSelected={selectedStatus === "ALL"}
        onClick={onSelectStatus ? () => onSelectStatus("ALL") : undefined}
      />

      {/* 2. Tổng sức chứa toàn mạng lưới */}
      <StatCard
        id="kpi-capacity"
        title="Tổng công suất kho"
        value={(stats.totalCapacityTons || 0).toLocaleString("vi-VN")}
        unit="Tấn"
        icon={Boxes}
        description={`${(stats.totalPallets || 0).toLocaleString("vi-VN")} Pallets • ${stats.totalDockDoors || 0} Cửa Dock`}
        variant="blue"
        isLoading={isLoading}
      />

      {/* 3. Tỷ lệ lấp đầy & Thông lượng */}
      <StatCard
        id="kpi-occupancy"
        title="Lấp đầy bình quân"
        value={`${stats.avgOccupancyPercent || 0}%`}
        icon={Gauge}
        progress={{
          value: stats.avgOccupancyPercent || 0,
          color:
            (stats.avgOccupancyPercent || 0) >= 85
              ? "bg-rose-500"
              : (stats.avgOccupancyPercent || 0) >= 70
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
        value={stats.highOccupancyCount || 0}
        unit={`kho >85% (${stats.full || 0} quá tải)`}
        icon={AlertTriangle}
        badge={
          (stats.full || 0) > 0
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
        value={stats.maintenance || 0}
        unit="kho nâng cấp"
        icon={Wrench}
        description={`${stats.active || 0} kho vận hành tốt`}
        variant="amber"
        isLoading={isLoading}
        isSelected={selectedStatus === "MAINTENANCE"}
        onClick={
          onSelectStatus
            ? () => onSelectStatus(selectedStatus === "MAINTENANCE" ? "ALL" : "MAINTENANCE")
            : undefined
        }
      />
    </StatGrid>
  );
};
