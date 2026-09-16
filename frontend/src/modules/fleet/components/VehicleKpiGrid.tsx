import React from "react";
import { Truck, CheckCircle2, Navigation, Wrench, ShieldAlert, AlertTriangle } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";
import type { VehicleInspectionStatus } from "@/core/types/logistics";

interface VehicleKpiGridProps {
  stats: {
    total: number;
    available: number;
    enRoute: number;
    loading: number;
    maintenance: number;
    offline: number;
    inspectionExpiredCount?: number;
    inspectionExpiringSoonCount?: number;
    avgFuel: number;
    totalCapacityTons: number;
  };
  selectedInspectionStatus?: VehicleInspectionStatus | "ALL";
  onSelectInspectionStatus?: (status: VehicleInspectionStatus | "ALL") => void;
  isLoading?: boolean;
}

export const VehicleKpiGrid: React.FC<VehicleKpiGridProps> = ({
  stats,
  selectedInspectionStatus = "ALL",
  onSelectInspectionStatus,
  isLoading = false,
}) => {
  const expiredCount = stats.inspectionExpiredCount || 0;
  const expiringCount = stats.inspectionExpiringSoonCount || 0;

  const handleInspectionClick = () => {
    if (!onSelectInspectionStatus) return;
    if (expiredCount > 0 && selectedInspectionStatus !== "EXPIRED") {
      onSelectInspectionStatus("EXPIRED");
    } else if (expiringCount > 0 && selectedInspectionStatus !== "EXPIRING_SOON") {
      onSelectInspectionStatus("EXPIRING_SOON");
    } else {
      onSelectInspectionStatus("ALL");
    }
  };

  return (
    <StatGrid columns={5}>
      {/* 1. Tổng phương tiện */}
      <StatCard
        id="kpi-total-vehicles"
        title="Tổng hạm đội"
        value={stats.total}
        unit={`xe (${stats.totalCapacityTons}T)`}
        icon={Truck}
        description="Quy mô phương tiện vận tải"
        variant="primary"
        isLoading={isLoading}
      />

      {/* 2. Đang chạy tuyến */}
      <StatCard
        id="kpi-en-route"
        title="Đang chạy tuyến"
        value={stats.enRoute}
        unit="trên đường"
        icon={Navigation}
        description="Đang di chuyển chở hàng"
        variant="blue"
        isLoading={isLoading}
      />

      {/* 3. Sẵn sàng điều động */}
      <StatCard
        id="kpi-available-vehicles"
        title="Sẵn sàng điều động"
        value={stats.available}
        unit="tại bãi/kho"
        icon={CheckCircle2}
        description="Sẵn sàng gán đơn hàng"
        variant="emerald"
        isLoading={isLoading}
      />

      {/* 4. Cảnh báo Đăng kiểm & Pháp lý */}
      <StatCard
        id="kpi-inspection-warning"
        title="Hạn Đăng kiểm"
        value={expiredCount > 0 ? expiredCount : expiringCount > 0 ? expiringCount : "100%"}
        unit={
          expiredCount > 0
            ? `quá hạn (${expiringCount} sắp hết)`
            : expiringCount > 0
            ? "sắp hết hạn"
            : "chuẩn pháp lý"
        }
        icon={expiredCount > 0 ? ShieldAlert : expiringCount > 0 ? AlertTriangle : CheckCircle2}
        badge={
          expiredCount > 0
            ? { text: "NGHIÊM CẤM CHẠY", variant: "destructive" }
            : expiringCount > 0
            ? { text: "CẦN KIỂM ĐỊNH", variant: "warning" }
            : { text: "HỢP LỆ", variant: "success" }
        }
        description="Lọc xe cần đăng kiểm"
        variant={expiredCount > 0 ? "rose" : expiringCount > 0 ? "amber" : "emerald"}
        isLoading={isLoading}
        isSelected={
          selectedInspectionStatus === "EXPIRED" || selectedInspectionStatus === "EXPIRING_SOON"
        }
        onClick={onSelectInspectionStatus ? handleInspectionClick : undefined}
      />

      {/* 5. Bảo dưỡng / Xưởng */}
      <StatCard
        id="kpi-maintenance-vehicles"
        title="Bảo dưỡng / Xưởng"
        value={stats.maintenance}
        unit="xe bảo dưỡng"
        icon={Wrench}
        description="Đang sửa chữa định kỳ"
        variant="amber"
        isLoading={isLoading}
        className="col-span-2 sm:col-span-1"
      />
    </StatGrid>
  );
};
