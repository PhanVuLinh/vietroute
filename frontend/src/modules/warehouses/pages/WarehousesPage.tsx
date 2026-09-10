import React, { useState } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  AlertCircle,
  Table as TableIcon,
  Map as MapIcon,
  Columns2,
  Layers,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useWarehouses } from "../hooks/useWarehouses";
import { WarehouseKpiGrid } from "../components/WarehouseKpiGrid";
import { WarehouseTable } from "../components/WarehouseTable";
import { WarehouseMobileCards } from "../components/WarehouseMobileCards";
import { WarehouseMap } from "../components/WarehouseMap";
import { WarehouseDetailDrawer } from "../components/WarehouseDetailDrawer";
import { CreateWarehouseDialog } from "../components/CreateWarehouseDialog";
import type { Warehouse, WarehouseStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

type ViewMode = "TABLE" | "MAP" | "SPLIT";

export const WarehousesPage: React.FC = () => {
  usePageTitle("Quản lý kho bãi & Hub");

  const {
    warehouses,
    allWarehouses,
    selectedWarehouse,
    selectedWarehouseId,
    setSelectedWarehouseId,
    stats,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    refetch,
    createWarehouse,
    updateWarehouse,
    updateStatus,
    deleteWarehouse,
  } = useWarehouses();

  // Chế độ hiển thị: Danh sách / Bản đồ / Chia đôi màn hình
  const [viewMode, setViewMode] = useState<ViewMode>("TABLE");

  // State quản lý Drawer & Dialog
  const [activeDrawerWarehouse, setActiveDrawerWarehouse] = useState<Warehouse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // Mở Drawer chi tiết
  const handleViewDetail = (wh: Warehouse) => {
    setActiveDrawerWarehouse(wh);
    setSelectedWarehouseId(wh.id);
    setIsDrawerOpen(true);
  };

  // Mở Dialog sửa
  const handleEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setIsDialogOpen(true);
  };

  // Mở Dialog tạo mới
  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setIsDialogOpen(true);
  };

  // Submit tạo / sửa
  const handleFormSubmit = async (whData: Omit<Warehouse, "id">, warehouseId?: string) => {
    if (warehouseId) {
      await updateWarehouse({ id: warehouseId, data: whData });
    } else {
      await createWarehouse(whData);
    }
  };

  // Đổi trạng thái nhanh
  const handleUpdateStatus = async (id: string, status: WarehouseStatus) => {
    await updateStatus({ id, status });
    if (activeDrawerWarehouse && activeDrawerWarehouse.id === id) {
      setActiveDrawerWarehouse((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Xóa kho
  const handleDelete = async (wh: Warehouse) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${wh.name}" (${wh.code}) khỏi hệ thống?`)) {
      await deleteWarehouse(wh.id);
      if (selectedWarehouseId === wh.id) {
        setSelectedWarehouseId(null);
      }
      if (activeDrawerWarehouse?.id === wh.id) {
        setIsDrawerOpen(false);
      }
    }
  };

  // Focus map
  const handleFocusMap = (wh: Warehouse) => {
    setSelectedWarehouseId(wh.id);
    if (viewMode === "TABLE") {
      setViewMode("SPLIT");
    }
  };

  return (
    <PageContainer
      title="Quản lý Kho bãi & Hub trung chuyển"
      subtitle="Mạng lưới trung tâm phân phối, kho trung chuyển 3 miền và giám sát tỷ lệ lấp đầy (Occupancy Rate)."
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
            <span>Thêm kho mới</span>
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
              <span>Không thể kết nối đến máy chủ quản lý kho bãi.</span>
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
          <WarehouseKpiGrid
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
                  <WarehouseTable
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                    onSelectWarehouse={(wh) => setSelectedWarehouseId(wh.id)}
                    onViewDetail={handleViewDetail}
                    onFocusMap={handleFocusMap}
                    onEdit={handleEdit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    onAddNew={handleOpenCreate}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    isLoading={isLoading}
                    onRefresh={refetch}
                  />
                </div>
                <div className="block md:hidden">
                  <WarehouseMobileCards
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                    onSelectWarehouse={(wh) => setSelectedWarehouseId(wh.id)}
                    onViewDetail={handleViewDetail}
                    onFocusMap={handleFocusMap}
                    onEdit={handleEdit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {/* VIEW MODE: MAP ONLY */}
            {viewMode === "MAP" && (
              <div className="h-[calc(100vh-280px)] min-h-[550px] w-full rounded-xl overflow-hidden relative">
                <WarehouseMap
                  warehouses={warehouses}
                  selectedWarehouseId={selectedWarehouseId}
                  onSelectWarehouse={(id) => {
                    setSelectedWarehouseId(id);
                    const wh = warehouses.find((w) => w.id === id);
                    if (wh) {
                      setActiveDrawerWarehouse(wh);
                    }
                  }}
                  className="h-full w-full"
                />

                {/* Selected Warehouse Bottom Card in Map Mode */}
                {selectedWarehouse && (
                  <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-card/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{selectedWarehouse.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{selectedWarehouse.code} • {selectedWarehouse.city}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedWarehouseId(null)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Công suất:</span>
                        <span className="font-bold font-mono text-foreground">{selectedWarehouse.usedCapacity}/{selectedWarehouse.capacity} Tấn</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Tỷ lệ lấp đầy:</span>
                        <span className="font-bold font-mono text-primary">
                          {selectedWarehouse.capacity > 0 ? Math.round((selectedWarehouse.usedCapacity / selectedWarehouse.capacity) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetail(selectedWarehouse)}
                        className="flex-1 h-8 text-xs font-semibold"
                      >
                        Xem chi tiết Hub
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(selectedWarehouse)}
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
                  <WarehouseMap
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                    onSelectWarehouse={(id) => setSelectedWarehouseId(id)}
                    className="h-full w-full"
                  />
                </div>

                {/* Right side: Table (7 cols) */}
                <div className="lg:col-span-7 h-full overflow-y-auto">
                  <div className="hidden md:block">
                    <WarehouseTable
                      warehouses={warehouses}
                      selectedWarehouseId={selectedWarehouseId}
                      onSelectWarehouse={(wh) => setSelectedWarehouseId(wh.id)}
                      onViewDetail={handleViewDetail}
                      onFocusMap={handleFocusMap}
                      onEdit={handleEdit}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDelete}
                      onAddNew={handleOpenCreate}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedRegion={selectedRegion}
                      setSelectedRegion={setSelectedRegion}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      selectedStatus={selectedStatus}
                      setSelectedStatus={setSelectedStatus}
                      isLoading={isLoading}
                      onRefresh={refetch}
                    />
                  </div>
                  <div className="block md:hidden">
                    <WarehouseMobileCards
                      warehouses={warehouses}
                      selectedWarehouseId={selectedWarehouseId}
                      onSelectWarehouse={(wh) => setSelectedWarehouseId(wh.id)}
                      onViewDetail={handleViewDetail}
                      onFocusMap={handleFocusMap}
                      onEdit={handleEdit}
                      onUpdateStatus={handleUpdateStatus}
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
      <WarehouseDetailDrawer
        warehouse={activeDrawerWarehouse}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEdit}
        onUpdateStatus={handleUpdateStatus}
        onFocusMap={handleFocusMap}
      />

      {/* Create / Edit Dialog */}
      <CreateWarehouseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingWarehouse={editingWarehouse}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
};
