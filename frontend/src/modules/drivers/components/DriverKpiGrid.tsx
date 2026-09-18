import React from "react";
import { Users, CheckCircle2, Truck, Coffee, Award } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";

interface DriverKpiGridProps {
  stats: {
    total: number;
    available: number;
    busy: number;
    onBreak: number;
    offline: number;
    suspended: number;
    avgOnTime: number;
    totalCompletedToday: number;
  };
  isLoading?: boolean;
}

export const DriverKpiGrid: React.FC<DriverKpiGridProps> = ({ stats, isLoading = false }) => {
  return (
    <StatGrid columns={5}>
      {/* 1. Tổng tài xế */}
      <StatCard
        id="kpi-total-drivers"
        title="Tổng nhân sự"
        value={stats.total}
        unit="tài xế"
        icon={Users}
        description="Đội ngũ vận hành toàn quốc"
        variant="primary"
        isLoading={isLoading}
      />

      {/* 2. Sẵn sàng nhận đơn */}
      <StatCard
        id="kpi-available-drivers"
        title="Sẵn sàng nhận đơn"
        value={stats.available}
        unit="trực tuyến"
        icon={CheckCircle2}
        description="Sẵn sàng điều phối ngay"
        variant="emerald"
        isLoading={isLoading}
      />

      {/* 3. Đang chạy tuyến */}
      <StatCard
        id="kpi-busy-drivers"
        title="Đang chạy tuyến"
        value={stats.busy}
        unit="đang giao"
        icon={Truck}
        description="Đang di chuyển trên đường"
        variant="blue"
        isLoading={isLoading}
      />

      {/* 4. Nghỉ ca & Ngoại tuyến */}
      <StatCard
        id="kpi-off-drivers"
        title="Nghỉ ca / Offline"
        value={stats.onBreak + stats.offline}
        unit="vắng mặt"
        icon={Coffee}
        description={`Nghỉ ca ${stats.onBreak} • Ngoại tuyến ${stats.offline}`}
        variant="amber"
        isLoading={isLoading}
      />

      {/* 5. Tỷ lệ đúng hạn OTD */}
      <StatCard
        id="kpi-otd-driver"
        title="OTD Trung bình"
        value={stats.total === 0 ? "—" : `${stats.avgOnTime || 0}%`}
        unit={stats.total === 0 ? "" : "đạt chuẩn"}
        icon={Award}
        description={stats.total === 0 ? "Chưa có chuyến giao" : "Tỷ lệ giao hàng đúng hẹn"}
        variant={stats.total === 0 ? "default" : "violet"}
        isLoading={isLoading}
      />
    </StatGrid>
  );
};
