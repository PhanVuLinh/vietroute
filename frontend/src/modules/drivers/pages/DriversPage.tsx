import React, { useState } from "react";
import { UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useDrivers, type EnrichedDriver } from "../hooks/useDrivers";
import { DriverKpiGrid } from "../components/DriverKpiGrid";
import { DriversTable } from "../components/DriversTable";
import { DriversMobileList } from "../components/DriversMobileList";
import { DriverDetailDrawer } from "../components/DriverDetailDrawer";
import { CreateDriverDialog } from "../components/CreateDriverDialog";
import type { Driver, DriverStatus } from "@/core/types/logistics";

export const DriversPage: React.FC = () => {
  usePageTitle("Quản lý tài xế");

  const {
    drivers,
    vehicles,
    stats,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedLicense,
    setSelectedLicense,
    refetchAll,
    updateStatus,
    createDriver,
    updateDriver,
  } = useDrivers();

  // State quản lý Drawer & Dialog
  const [selectedDriver, setSelectedDriver] = useState<EnrichedDriver | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<EnrichedDriver | null>(null);

  // Mở Drawer chi tiết
  const handleViewDetail = (driver: EnrichedDriver) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  };

  // Mở Dialog sửa
  const handleEdit = (driver: EnrichedDriver) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  // Mở Dialog thêm mới
  const handleOpenCreate = () => {
    setEditingDriver(null);
    setIsDialogOpen(true);
  };

  // Xử lý submit form tạo / sửa
  const handleFormSubmit = async (driverData: Omit<Driver, "id">, driverId?: string) => {
    if (driverId) {
      await updateDriver({ id: driverId, data: driverData });
    } else {
      await createDriver(driverData);
    }
  };

  // Xử lý đổi trạng thái nhanh
  const handleUpdateStatus = async (id: string, status: DriverStatus) => {
    await updateStatus({ id, status });
    if (selectedDriver && selectedDriver.id === id) {
      setSelectedDriver((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedLicense("ALL");
  };

  return (
    <PageContainer
      title="Quản lý đội ngũ tài xế"
      subtitle="Theo dõi trạng thái trực tuyến, giấy phép lái xe, phương tiện phụ trách và hiệu suất giao hàng."
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
            <UserPlus className="h-3.5 w-3.5" />
            Thêm tài xế
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. Lỗi nếu fetch thất bại */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không thể tải dữ liệu tài xế</AlertTitle>
            <AlertDescription className="text-xs">
              Đã xảy ra sự cố khi kết nối tới dịch vụ quản lý nhân sự. Vui lòng thử lại.
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
          <DriverKpiGrid stats={stats} />
        )}

        {/* 3. Danh sách tài xế */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <DriversTable
                drivers={drivers}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedLicense={selectedLicense}
                onLicenseChange={setSelectedLicense}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Mobile Cards List View */}
            <div className="block md:hidden">
              <DriversMobileList
                drivers={drivers}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </>
        )}
      </div>

      {/* Drawer xem chi tiết hồ sơ */}
      <DriverDetailDrawer
        driver={selectedDriver}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEdit}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Modal thêm mới / chỉnh sửa */}
      <CreateDriverDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingDriver={editingDriver}
        vehicles={vehicles}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
};
