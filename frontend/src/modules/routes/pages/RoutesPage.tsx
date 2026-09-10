import React, { useState } from "react";
import {
  Route as RouteIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  Table as TableIcon,
  Map as MapIcon,
  Columns2,
  Navigation,
  Fuel,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useRoutes, type EnrichedRoute } from "../hooks/useRoutes";
import { RouteKpiGrid } from "../components/RouteKpiGrid";
import { RouteTable } from "../components/RouteTable";
import { RouteMobileCards } from "../components/RouteMobileCards";
import { RouteMap } from "../components/RouteMap";
import { RouteDetailDrawer } from "../components/RouteDetailDrawer";
import { CreateRouteDialog } from "../components/CreateRouteDialog";
import type { Route, RouteStatus, RouteStopStatus } from "@/core/types/logistics";

type ViewMode = "TABLE" | "MAP" | "SPLIT";

export const RoutesPage: React.FC = () => {
  usePageTitle("Quản lý & Tối ưu Tuyến đường Vận chuyển");

  const {
    routes,
    allRoutes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    stats,
    drivers,
    vehicles,
    warehouses,
    orders,
    pendingOrders,
    routeTemplates,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedWarehouseId,
    setSelectedWarehouseId,
    selectedDriverId,
    setSelectedDriverId,
    refetch,
    createRoute,
    updateRoute,
    updateRouteStatus,
    updateStopStatus,
    deleteRoute,
    duplicateRoute,
    optimizeStops,
  } = useRoutes();

  // Chế độ hiển thị: Danh sách / Bản đồ / Chia đôi màn hình
  const [viewMode, setViewMode] = useState<ViewMode>("TABLE");

  // State quản lý Drawer & Dialog
  const [activeDrawerRoute, setActiveDrawerRoute] = useState<EnrichedRoute | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Mở Drawer chi tiết tuyến đường & chặng dừng
  const handleViewDetail = (route: EnrichedRoute) => {
    setActiveDrawerRoute(route);
    setSelectedRouteId(route.id);
    setIsDrawerOpen(true);
  };

  // Mở Modal chỉnh sửa tuyến
  const handleEdit = (route: EnrichedRoute) => {
    setEditingRoute(route);
    setIsDialogOpen(true);
  };

  // Nhân bản tuyến đường (Duplicate)
  const handleDuplicate = async (route: EnrichedRoute) => {
    await duplicateRoute(route);
  };

  // Mở Modal lập tuyến mới
  const handleOpenCreate = () => {
    setEditingRoute(null);
    setIsDialogOpen(true);
  };

  // Submit tạo mới / cập nhật tuyến
  const handleFormSubmit = async (routeData: Partial<Route>) => {
    if (editingRoute) {
      await updateRoute({ id: editingRoute.id, data: routeData });
    } else {
      await createRoute(routeData as Omit<Route, "id">);
    }
  };

  // Cập nhật trạng thái tuyến đường (PLANNED, ACTIVE, COMPLETED, CANCELLED)
  const handleUpdateRouteStatus = async (id: string, status: RouteStatus) => {
    await updateRouteStatus({ id, status });
    if (activeDrawerRoute && activeDrawerRoute.id === id) {
      setActiveDrawerRoute((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Cập nhật trạng thái của 1 điểm dừng (PENDING, ARRIVED, COMPLETED, SKIPPED)
  const handleUpdateStopStatus = async (
    routeId: string,
    stopId: string,
    status: RouteStopStatus
  ) => {
    await updateStopStatus({ routeId, stopId, status });
    if (activeDrawerRoute && activeDrawerRoute.id === routeId) {
      const updatedStops = (activeDrawerRoute.stops || []).map((s) =>
        s.id === stopId ? { ...s, status } : s
      );
      const completedCount = updatedStops.filter(
        (s) => s.status === "COMPLETED" || s.status === "SKIPPED"
      ).length;
      const totalCount = updatedStops.length;
      const progressPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      setActiveDrawerRoute((prev) =>
        prev
          ? {
              ...prev,
              stops: updatedStops,
              completedStopsCount: completedCount,
              progressPercent,
            }
          : null
      );
    }
  };

  // Xóa tuyến đường
  const handleDelete = async (route: EnrichedRoute) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa tuyến đường "${route.routeName || route.routeCode}" (${route.routeCode}) khỏi hệ thống?`
      )
    ) {
      await deleteRoute(route.id);
      if (selectedRouteId === route.id) {
        setSelectedRouteId(null);
      }
      if (activeDrawerRoute?.id === route.id) {
        setIsDrawerOpen(false);
      }
    }
  };

  // Xem trên bản đồ (chuyển sang chế độ kết hợp SPLIT)
  const handleFocusMap = (route: EnrichedRoute) => {
    setSelectedRouteId(route.id);
    if (viewMode === "TABLE") {
      setViewMode("SPLIT");
    }
  };

  return (
    <PageContainer
      title="Quản lý & Tối ưu Tuyến đường Vận chuyển"
      subtitle="Quy hoạch chặng giao nhận đa điểm dừng, định mức tiêu hao nhiên liệu, phí BOT đường bộ và thuật toán TSP tối ưu."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="bg-muted/80 p-0.5 rounded-lg border border-border flex items-center">
            <Button
              variant={viewMode === "TABLE" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("TABLE")}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Danh sách</span>
            </Button>
            <Button
              variant={viewMode === "SPLIT" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("SPLIT")}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kết hợp</span>
            </Button>
            <Button
              variant={viewMode === "MAP" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("MAP")}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bản đồ</span>
            </Button>
          </div>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 px-3 text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Lập tuyến mới</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Không thể kết nối đến máy chủ quản lý tuyến đường.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 text-xs gap-1 border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
              >
                <RefreshCw className="h-3 w-3" />
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 1. KPI Grid (5 Cards) */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <RouteKpiGrid
            stats={stats}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />
        )}

        {/* 2. Main Content based on ViewMode */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : (
          <div>
            {/* VIEW MODE: TABLE ONLY */}
            {viewMode === "TABLE" && (
              <div className="space-y-4">
                <div className="hidden md:block">
                  <RouteTable
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(r) => setSelectedRouteId(r.id)}
                    onViewDetail={handleViewDetail}
                    onFocusMap={handleFocusMap}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onUpdateStatus={handleUpdateRouteStatus}
                    onDelete={handleDelete}
                    onAddNew={handleOpenCreate}
                    warehouses={warehouses}
                    drivers={drivers}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedWarehouseId={selectedWarehouseId}
                    setSelectedWarehouseId={setSelectedWarehouseId}
                    selectedDriverId={selectedDriverId}
                    setSelectedDriverId={setSelectedDriverId}
                    isLoading={isLoading}
                    onRefresh={refetch}
                  />
                </div>
                <div className="block md:hidden">
                  <RouteMobileCards
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(r) => setSelectedRouteId(r.id)}
                    onViewDetail={handleViewDetail}
                    onFocusMap={handleFocusMap}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onUpdateStatus={handleUpdateRouteStatus}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {/* VIEW MODE: MAP ONLY */}
            {viewMode === "MAP" && (
              <div className="h-[calc(100vh-280px)] min-h-[550px] w-full rounded-xl overflow-hidden relative">
                <RouteMap
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => {
                    setSelectedRouteId(id);
                    const r = routes.find((route) => route.id === id);
                    if (r) {
                      setActiveDrawerRoute(r);
                    }
                  }}
                  className="h-full w-full"
                />

                {/* Selected Route Floating Card in Map Mode */}
                {selectedRoute && (
                  <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-card/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          {selectedRoute.routeName || selectedRoute.routeCode}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedRoute.routeCode} • {selectedRoute.warehouse?.name}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRouteId(null)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Tiến độ chặng:</span>
                        <span className="font-bold font-mono text-foreground">
                          {selectedRoute.completedStopsCount} / {selectedRoute.totalStopsCount} ({selectedRoute.progressPercent}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Cự ly & Dầu:</span>
                        <span className="font-bold font-mono text-primary">
                          {selectedRoute.totalDistance}km (~{selectedRoute.fuelEstLiters || 0}L)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetail(selectedRoute)}
                        className="flex-1 h-8 text-xs font-semibold"
                      >
                        Xem chi tiết & Chặng
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(selectedRoute)}
                        className="h-8 text-xs"
                      >
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE: SPLIT (BẢN ĐỒ + DANH SÁCH SONG SONG) */}
            {viewMode === "SPLIT" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-280px)] min-h-[600px]">
                {/* Left side: Interactive Map (5 cols) */}
                <div className="lg:col-span-5 h-[350px] lg:h-full rounded-xl overflow-hidden">
                  <RouteMap
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => setSelectedRouteId(id)}
                    className="h-full w-full"
                  />
                </div>

                {/* Right side: Table (7 cols) */}
                <div className="lg:col-span-7 h-full overflow-y-auto">
                  <div className="hidden md:block">
                    <RouteTable
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={(r) => setSelectedRouteId(r.id)}
                      onViewDetail={handleViewDetail}
                      onFocusMap={handleFocusMap}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onUpdateStatus={handleUpdateRouteStatus}
                      onDelete={handleDelete}
                      onAddNew={handleOpenCreate}
                      warehouses={warehouses}
                      drivers={drivers}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedStatus={selectedStatus}
                      setSelectedStatus={setSelectedStatus}
                      selectedWarehouseId={selectedWarehouseId}
                      setSelectedWarehouseId={setSelectedWarehouseId}
                      selectedDriverId={selectedDriverId}
                      setSelectedDriverId={setSelectedDriverId}
                      isLoading={isLoading}
                      onRefresh={refetch}
                    />
                  </div>
                  <div className="block md:hidden">
                    <RouteMobileCards
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={(r) => setSelectedRouteId(r.id)}
                      onViewDetail={handleViewDetail}
                      onFocusMap={handleFocusMap}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onUpdateStatus={handleUpdateRouteStatus}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <RouteDetailDrawer
        route={activeDrawerRoute}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEdit}
        onUpdateRouteStatus={handleUpdateRouteStatus}
        onUpdateStopStatus={handleUpdateStopStatus}
        onFocusMap={handleFocusMap}
      />

      {/* Create / Edit Dialog */}
      <CreateRouteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        onOptimizeStops={optimizeStops}
        initialRoute={editingRoute}
        warehouses={warehouses}
        drivers={drivers}
        vehicles={vehicles}
        pendingOrders={pendingOrders}
        routeTemplates={routeTemplates}
      />
    </PageContainer>
  );
};
