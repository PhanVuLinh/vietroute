import React from "react";
import {
  CheckCircle2,
  Package,
  Navigation,
  Fuel,
  Coins,
  Sparkles,
} from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";

interface ReportsKpiGridProps {
  stats: {
    totalOrders: number;
    otdRate: number;
    fleetUtil: number;
    totalDistanceKm: number;
    totalFuelLiters: number;
    totalTollFeeVND: number;
    totalCodVND: number;
    avgFuelConsumptionPer100Km: number;
    estimatedSavedCostVND: number;
  };
  isLoading?: boolean;
}

export const ReportsKpiGrid: React.FC<ReportsKpiGridProps> = ({ stats, isLoading = false }) => {
  return (
    <StatGrid columns={5}>
      {/* 1. Tỷ lệ giao đúng hạn OTD */}
      <StatCard
        id="kpi-report-otd"
        title="Tỷ lệ đúng hẹn"
        value={`${stats.otdRate}%`}
        icon={CheckCircle2}
        badge={{ text: "≥98% OTD", variant: "success" }}
        trend={{ value: "+1.4%", direction: "up" }}
        description="So với cùng kỳ trước"
        variant="emerald"
        isLoading={isLoading}
      />

      {/* 2. Tổng sản lượng đơn */}
      <StatCard
        id="kpi-report-orders"
        title="Tổng đơn xử lý"
        value={stats.totalOrders}
        unit="đơn hàng"
        icon={Package}
        description="Tỷ lệ hoàn tất 96.0%"
        variant="blue"
        isLoading={isLoading}
      />

      {/* 3. Tổng cự ly lăn bánh */}
      <StatCard
        id="kpi-report-distance"
        title="Tổng cự ly lăn bánh"
        value={stats.totalDistanceKm.toLocaleString("vi-VN")}
        unit="km"
        icon={Navigation}
        description={`Khai thác: ${stats.fleetUtil}%`}
        variant="indigo"
        isLoading={isLoading}
      />

      {/* 4. Nhiên liệu tiêu thụ */}
      <StatCard
        id="kpi-report-fuel"
        title="Nhiên liệu tiêu thụ"
        value={stats.totalFuelLiters.toLocaleString("vi-VN")}
        unit="lít"
        icon={Fuel}
        badge={{ text: "-8.4%", variant: "warning", icon: Sparkles }}
        description={`Định mức: ${stats.avgFuelConsumptionPer100Km}L / 100km`}
        variant="amber"
        isLoading={isLoading}
      />

      {/* 5. Tiền thu hộ COD & Doanh số */}
      <StatCard
        id="kpi-report-cod"
        title="Tiền thu hộ COD"
        value={`${(stats.totalCodVND / 1000000).toFixed(1)} tr ₫`}
        icon={Coins}
        description={`Tiết kiệm: ${(stats.estimatedSavedCostVND / 1000000).toFixed(1)} tr ₫`}
        variant="purple"
        isLoading={isLoading}
      />
    </StatGrid>
  );
};
