import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { Order } from "@/core/types/logistics";
import { useDispatchData } from "../hooks/useDispatchData";
import { useOrderFilter } from "../hooks/useOrderFilter";
import type { DriverCandidate } from "../utils/driverScoring";
import { DispatchHeader } from "../components/DispatchHeader";
import { DispatchSummaryBar } from "../components/DispatchSummaryBar";
import { OrderQueue } from "../components/OrderQueue";
import { DispatchMap } from "../components/DispatchMap";
import { DriverRecommendationPanel } from "../components/DriverRecommendationPanel";
import { OrderDetailDrawer } from "@/modules/orders/components/OrderDetailDrawer";
import { AssignmentConfirmationDialog } from "../components/AssignmentConfirmationDialog";
import { DispatchAlerts } from "../components/DispatchAlerts";
import { AiDispatchInsight } from "../components/AiDispatchInsight";
import { toast } from "@/shared/components/feedback";

export const DispatchPage: React.FC = () => {
  usePageTitle("Điều phối giao hàng");

  // 1. Data Layer
  const {
    orders,
    drivers,
    vehicles,
    warehouses,
    warehouseMap,
    alerts,
    isLoading,
    isError,
    refetchAll,
    assignOrderMutation,
  } = useDispatchData();

  // 2. Filter & Search Layer
  const {
    filters,
    setFilters,
    filteredOrders,
    activeFilterCount,
    resetFilters,
  } = useOrderFilter(orders);

  // 3. UI State
  const [searchParams] = useSearchParams();
  const urlOrderId = searchParams.get("orderId");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(urlOrderId);
  const [selectedCandidate, setSelectedCandidate] = useState<DriverCandidate | null>(null);
  const [orderDetailToView, setOrderDetailToView] = useState<Order | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [mode, setMode] = useState<"MANUAL" | "AUTO">("MANUAL");
  const [mobileTab, setMobileTab] = useState<"ORDERS" | "MAP" | "DRIVERS">("ORDERS");
  const [activeSummaryFilter, setActiveSummaryFilter] = useState<string>("ALL");

  // Đồng bộ urlOrderId nếu param thay đổi
  useEffect(() => {
    if (urlOrderId) {
      setSelectedOrderId(urlOrderId);
    }
  }, [urlOrderId]);

  // Đơn hàng đang được chọn (Tự động chọn đơn đầu tiên cần xử lý nếu chưa chọn)
  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = filteredOrders.find((o) => o.id === selectedOrderId);
      if (found) return found;
    }
    return (
      filteredOrders.find((o) => o.status === "PENDING" || o.status === "CONFIRMED") ||
      filteredOrders[0] ||
      null
    );
  }, [filteredOrders, selectedOrderId]);

  // 4. Tính toán số liệu Summary Bar
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED"
  ).length;
  const assignedOrdersCount = orders.filter((o) => o.status === "ASSIGNED").length;
  const delayedOrdersCount = orders.filter(
    (o) => o.priority === "URGENT" || o.status === "FAILED"
  ).length;
  const availableDriversCount = drivers.filter((d) => d.status === "AVAILABLE").length;
  const busyDriversCount = drivers.filter((d) => d.status === "BUSY").length;
  const overloadedDriversCount = drivers.filter((d) => d.currentDeliveryCount >= 4).length;

  // Xử lý click thẻ Summary để lọc nhanh danh sách đơn
  const handleSummaryFilterClick = (filterType: string) => {
    setActiveSummaryFilter(filterType);
    if (filterType === "PENDING") {
      setFilters({ ...filters, status: "PENDING" });
      setMobileTab("ORDERS");
    } else if (filterType === "ASSIGNED") {
      setFilters({ ...filters, status: "ASSIGNED" });
      setMobileTab("ORDERS");
    } else if (filterType === "DELAYED") {
      setFilters({ ...filters, status: "DELAYED" });
      setMobileTab("ORDERS");
    } else if (filterType === "DRIVERS_AVAILABLE" || filterType === "DRIVERS_BUSY" || filterType === "DRIVERS_OVERLOADED") {
      setMobileTab("DRIVERS");
    }
  };

  // Mở Dialog phân công
  const handleStartAssign = (order: Order, candidate: DriverCandidate) => {
    setSelectedOrderId(order.id);
    setSelectedCandidate(candidate);
    setIsAssignDialogOpen(true);
  };

  // Thực thi phân công đơn
  const handleConfirmAssignment = async () => {
    if (!selectedOrder || !selectedCandidate) return;

    try {
      await assignOrderMutation.mutateAsync({
        orderId: selectedOrder.id,
        driverId: selectedCandidate.driver.id,
        vehicleId: selectedCandidate.vehicle?.id || "veh-01",
        assignmentType: selectedCandidate.isBestMatch ? "AI_RECOMMENDED" : "MANUAL",
      });

      setIsAssignDialogOpen(false);
      toast.success(
        "Điều phối thành công",
        `Đã phân công đơn ${selectedOrder.orderCode} cho tài xế ${selectedCandidate.driver.fullName}.`
      );

      // Chuyển sang đơn tiếp theo chưa phân công
      const nextPending = orders.find(
        (o) => o.id !== selectedOrder.id && (o.status === "PENDING" || o.status === "CONFIRMED")
      );
      setSelectedOrderId(nextPending ? nextPending.id : null);
    } catch {
      toast.error("Lỗi điều phối", "Không thể phân công đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <PageContainer className="space-y-4 pb-8">
      {/* 1. Header Trang Điều Phối */}
      <DispatchHeader
        mode={mode}
        onModeChange={setMode}
        onRefresh={refetchAll}
        isRefreshing={isLoading}
      />

      {/* 2. Cảnh báo lỗi kết nối service */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <div>
              <AlertTitle>Không thể đồng bộ dữ liệu điều phối</AlertTitle>
              <AlertDescription className="text-xs">
                Mất kết nối máy chủ dịch vụ vận hành. Vui lòng thử lại.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              className="h-7 text-xs font-semibold gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Thử lại</span>
            </Button>
          </div>
        </Alert>
      )}

      {/* 3. Operations Summary Bar (6 chỉ số tương tác) */}
      <DispatchSummaryBar
        pendingOrdersCount={pendingOrdersCount}
        assignedOrdersCount={assignedOrdersCount}
        delayedOrdersCount={delayedOrdersCount}
        availableDriversCount={availableDriversCount}
        busyDriversCount={busyDriversCount}
        overloadedDriversCount={overloadedDriversCount}
        activeFilter={activeSummaryFilter}
        onFilterClick={handleSummaryFilterClick}
      />

      {/* 4. AI Assisted Dispatch Card */}
      <AiDispatchInsight
        onApplyRecommendation={() => {
          setFilters({ ...filters, warehouseId: "ALL" });
        }}
      />

      {/* 5. Cảnh báo vận hành điều phối tức thời */}
      <DispatchAlerts alerts={alerts} />

      {/* 6. Tabs điều hướng trên màn hình nhỏ (Mobile & Tablet) */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as typeof mobileTab)}>
          <TabsList className="grid grid-cols-3 w-full h-9">
            <TabsTrigger value="ORDERS" className="text-xs font-semibold">
              Đơn hàng ({filteredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="MAP" className="text-xs font-semibold">
              Bản đồ
            </TabsTrigger>
            <TabsTrigger value="DRIVERS" className="text-xs font-semibold">
              Đề xuất ({drivers.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 7. BỐ CỤC CHÍNH COMMAND CENTER 3 CỘT (35% / 40% / 25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ============================================================
            CỘT 1 (35%): DANH SÁCH ĐƠN CẦN ĐIỀU PHỐI (ORDER QUEUE)
        ============================================================ */}
        <div
          className={`lg:col-span-4 ${
            mobileTab === "ORDERS" ? "block" : "hidden lg:block"
          }`}
        >
          <OrderQueue
            orders={filteredOrders}
            warehouses={warehouses}
            selectedOrderId={selectedOrder?.id || null}
            onSelectOrder={(order) => {
              setSelectedOrderId(order.id);
              setMobileTab("MAP");
            }}
            onViewOrderDetail={(order) => setOrderDetailToView(order)}
            filters={filters}
            onFilterChange={(f) => setFilters({ ...filters, ...f })}
            onResetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            isLoading={isLoading}
          />
        </div>

        {/* ============================================================
            CỘT 2 (40%): BẢN ĐỒ LỘ TRÌNH REALTIME (DISPATCH MAP)
        ============================================================ */}
        <div
          className={`lg:col-span-5 ${
            mobileTab === "MAP" ? "block" : "hidden lg:block"
          }`}
        >
          <DispatchMap
            selectedOrder={selectedOrder}
            selectedWarehouse={
              selectedOrder ? warehouseMap.get(selectedOrder.warehouseId) : undefined
            }
            recommendedDriver={selectedCandidate}
            warehouses={warehouses}
            drivers={drivers}
            onSelectDriverMarker={(driverId) => {
              const driver = drivers.find((d) => d.id === driverId);
              if (driver && selectedOrder) {
                // Tự động highlight tài xế
              }
            }}
          />
        </div>

        {/* ============================================================
            CỘT 3 (25%): BẢNG ĐỀ XUẤT TÀI XẾ (DRIVER RECOMMENDATION)
        ============================================================ */}
        <div
          className={`lg:col-span-3 ${
            mobileTab === "DRIVERS" ? "block" : "hidden lg:block"
          }`}
        >
          <DriverRecommendationPanel
            selectedOrder={selectedOrder}
            drivers={drivers}
            vehicles={vehicles}
            warehouses={warehouses}
            onAssignDriver={handleStartAssign}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 8. Order Detail Drawer (Sheet) */}
      <OrderDetailDrawer
        order={orderDetailToView}
        warehouse={orderDetailToView ? warehouseMap.get(orderDetailToView.warehouseId) : undefined}
        isOpen={Boolean(orderDetailToView)}
        onClose={() => setOrderDetailToView(null)}
        onAssignDriver={(order) => {
          setSelectedOrderId(order.id);
          setMobileTab("DRIVERS");
        }}
      />

      {/* 9. Assignment Confirmation Dialog */}
      <AssignmentConfirmationDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        order={selectedOrder}
        candidate={selectedCandidate}
        warehouse={selectedOrder ? warehouseMap.get(selectedOrder.warehouseId) : undefined}
        onConfirm={handleConfirmAssignment}
        isSubmitting={assignOrderMutation.isPending}
      />
    </PageContainer>
  );
};
