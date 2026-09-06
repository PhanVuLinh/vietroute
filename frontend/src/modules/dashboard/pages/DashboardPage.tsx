import React, { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardKpiGrid } from "../components/DashboardKpiGrid";
import { RealtimeMapCard } from "../components/RealtimeMapCard";
import { ActiveDriversPanel } from "../components/ActiveDriversPanel";
import { OperationsAlerts } from "../components/OperationsAlerts";
import { DeliveryPerformance } from "../components/DeliveryPerformance";
import { AiInsightCard } from "../components/AiInsightCard";

export const DashboardPage: React.FC = () => {
  usePageTitle("Trung tâm điều phối");

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("TODAY");

  const {
    analytics,
    drivers,
    rawDrivers,
    alerts,
    warehouses,
    isLoading,
    isError,
    refetchAll,
  } = useDashboardData(selectedWarehouse);

  return (
    <PageContainer className="space-y-5">
      {/* 1. Page Header (Tiêu đề, Bộ lọc, Nút Điều phối & Tạo đơn) */}
      <DashboardHeader
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        onWarehouseChange={setSelectedWarehouse}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
      />

      {/* 2. Trạng thái lỗi nếu có sự cố kết nối service */}
      {isError && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <AlertTitle>Không thể tải dữ liệu tổng quan vận hành</AlertTitle>
              <AlertDescription className="text-xs">
                Đã xảy ra sự cố khi kết nối tới dịch vụ phân tích logistics. Vui lòng kiểm tra lại đường truyền.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              className="h-8 gap-1.5 self-start sm:self-center border-destructive/40 hover:bg-destructive/10 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </Button>
          </div>
        </Alert>
      )}

      {/* 3. 6 Thẻ KPI vận hành cốt lõi */}
      <DashboardKpiGrid summary={analytics?.summary} isLoading={isLoading} />

      {/* 4. Thẻ phân tích dự báo từ AI (Enterprise Workflow) */}
      <AiInsightCard />

      {/* 5. Khu vực chính: Bản đồ Realtime (60%) & Đội xe đang hoạt động (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <RealtimeMapCard
          warehouses={warehouses}
          drivers={rawDrivers}
          className="lg:col-span-7"
        />
        <ActiveDriversPanel
          drivers={drivers}
          isLoading={isLoading}
          className="lg:col-span-5"
        />
      </div>

      {/* 6. Khu vực cảnh báo: Cần xử lý */}
      <OperationsAlerts alerts={alerts} isLoading={isLoading} />

      {/* 7. Hiệu suất giao hàng: 2 biểu đồ SVG (Đơn hàng theo giờ & Tỷ lệ giao hàng) */}
      <DeliveryPerformance
        hourlyOrders={analytics?.hourlyOrders}
        statusDistribution={analytics?.statusDistribution}
        summary={analytics?.summary}
        isLoading={isLoading}
      />
    </PageContainer>
  );
};
