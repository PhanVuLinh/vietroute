import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCheck,
} from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/common";
import type { AnalyticsSummary } from "@/core/types/logistics";

interface DashboardKpiGridProps {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({
  summary,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <StatGrid columns={6}>
      {/* 1. Tổng đơn hôm nay */}
      <StatCard
        id="kpi-total-orders"
        title="Tổng đơn hôm nay"
        value={summary?.totalOrdersToday ?? 0}
        unit="đơn"
        icon={Package}
        trend={
          summary && summary.totalOrdersToday > 0
            ? { value: "+8.5%", direction: "up" }
            : undefined
        }
        description={
          summary && summary.totalOrdersToday > 0
            ? "So với hôm qua"
            : "Chưa phát sinh đơn"
        }
        actionText="Xem đơn hàng"
        variant="blue"
        isLoading={isLoading}
        onClick={() => navigate("/orders")}
      />

      {/* 2. Đang vận chuyển */}
      <StatCard
        id="kpi-in-transit"
        title="Đang vận chuyển"
        value={summary?.inTransitOrders ?? 0}
        unit="đơn"
        icon={Truck}
        badge={
          summary && summary.inTransitOrders > 0
            ? { text: "LIVE", variant: "warning" }
            : undefined
        }
        description="Đang trên lộ trình giao"
        actionText="Giám sát tuyến"
        variant="amber"
        isLoading={isLoading}
        onClick={() => navigate("/routes")}
      />

      {/* 3. Giao thành công */}
      <StatCard
        id="kpi-delivered"
        title="Giao thành công"
        value={summary?.deliveredOrders ?? 0}
        unit="đơn"
        icon={CheckCircle2}
        badge={
          summary && summary.totalOrdersToday > 0
            ? {
                text: `${Math.round(
                  (summary.deliveredOrders / summary.totalOrdersToday) * 100
                )}%`,
                variant: "success",
              }
            : undefined
        }
        description="Đạt chuẩn cam kết SLA"
        actionText="Chi tiết hoàn tất"
        variant="emerald"
        isLoading={isLoading}
        onClick={() => navigate("/orders")}
      />

      {/* 4. Giao trễ / Cần xử lý */}
      <StatCard
        id="kpi-delayed"
        title="Giao trễ / Sự cố"
        value={summary?.delayedOrders ?? 0}
        unit="đơn"
        icon={AlertTriangle}
        badge={
          summary && summary.delayedOrders > 0
            ? { text: "CẦN XỬ LÝ", variant: "destructive" }
            : undefined
        }
        description="Đơn quá hạn cam kết"
        actionText="Điều phối ngay"
        variant="rose"
        isLoading={isLoading}
        onClick={() => navigate("/dispatch")}
      />

      {/* 5. Tài xế đang chạy */}
      <StatCard
        id="kpi-active-drivers"
        title="Tài xế đang chạy"
        value={summary?.activeDrivers ?? 0}
        unit="người"
        icon={Users}
        description="Đang thực hiện chuyến"
        actionText="Đội ngũ trực"
        variant="primary"
        isLoading={isLoading}
        onClick={() => navigate("/drivers")}
      />

      {/* 6. Tài xế sẵn sàng */}
      <StatCard
        id="kpi-available-drivers"
        title="Tài xế sẵn sàng"
        value={summary?.availableDrivers ?? 0}
        unit="người"
        icon={UserCheck}
        description="Chờ nhận đơn điều động"
        actionText="Phân công tài xế"
        variant="emerald"
        isLoading={isLoading}
        onClick={() => navigate("/drivers")}
      />
    </StatGrid>
  );
};
