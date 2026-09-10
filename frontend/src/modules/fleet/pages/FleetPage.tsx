import React, { useState } from "react";
import { Truck, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useVehicles, type EnrichedVehicle } from "../hooks/useVehicles";
import { VehicleKpiGrid } from "../components/VehicleKpiGrid";
import { VehiclesTable } from "../components/VehiclesTable";
import { VehiclesMobileList } from "../components/VehiclesMobileList";
import { VehicleDetailDrawer } from "../components/VehicleDetailDrawer";
import { CreateVehicleDialog } from "../components/CreateVehicleDialog";
import type { Vehicle, VehicleStatus } from "@/core/types/logistics";

export const FleetPage: React.FC = () => {
  usePageTitle("Quản lý phương tiện");

  const {
    vehicles,
    drivers,
    stats,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    refetchAll,
    updateStatus,
    createVehicle,
    updateVehicle,
  } = useVehicles();

  // State quản lý Drawer & Dialog
  const [selectedVehicle, setSelectedVehicle] = useState<EnrichedVehicle | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<EnrichedVehicle | null>(null);

  // Mở Drawer chi tiết
  const handleViewDetail = (vehicle: EnrichedVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDrawerOpen(true);
  };

  // Mở Dialog sửa
  const handleEdit = (vehicle: EnrichedVehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  // Mở Dialog tạo mới
  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setIsDialogOpen(true);
  };

  // Submit tạo / sửa
  const handleFormSubmit = async (vehicleData: Omit<Vehicle, "id">, vehicleId?: string) => {
    if (vehicleId) {
      await updateVehicle({ id: vehicleId, data: vehicleData });
    } else {
      await createVehicle(vehicleData);
    }
  };

  // Đổi trạng thái nhanh
  const handleUpdateStatus = async (id: string, status: VehicleStatus) => {
    await updateStatus({ id, status });
    if (selectedVehicle && selectedVehicle.id === id) {
      setSelectedVehicle((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedType("ALL");
  };

  return (
    <PageContainer
      title="Quản lý phương tiện & Hạm đội xe"
      subtitle="Theo dõi phân bổ xe tải, trọng tải định mức, mức tiêu hao nhiên liệu và kế hoạch bảo dưỡng định kỳ."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer hover:bg-accent"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            Làm mới
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs shadow-primary/25 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Đăng ký xe mới
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. Thông báo lỗi */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không thể tải dữ liệu phương tiện</AlertTitle>
            <AlertDescription className="text-xs">
              Đã xảy ra sự cố khi kết nối tới dịch vụ quản lý hạm đội. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        )}

        {/* 2. KPI Summary Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <VehicleKpiGrid stats={stats} />
        )}

        {/* 3. Danh sách phương tiện */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <VehiclesTable
                vehicles={vehicles}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Mobile Cards List View */}
            <div className="block md:hidden">
              <VehiclesMobileList
                vehicles={vehicles}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </>
        )}
      </div>

      {/* Drawer xem chi tiết phương tiện */}
      <VehicleDetailDrawer
        vehicle={selectedVehicle}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEdit}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Modal thêm mới / chỉnh sửa xe */}
      <CreateVehicleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingVehicle={editingVehicle}
        drivers={drivers}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
};
