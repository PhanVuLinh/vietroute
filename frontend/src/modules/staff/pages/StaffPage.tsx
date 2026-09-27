import React, { useState } from "react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useStaffList, useRoles, useStaffMutations } from "../hooks/useStaff";
import { StaffKpiGrid } from "../components/StaffKpiGrid";
import { StaffFilterBar } from "../components/StaffFilterBar";
import { StaffTable } from "../components/StaffTable";
import { StaffFormDialog } from "../components/StaffFormDialog";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import type { StaffMember, StaffFilterParams } from "../types/staff";

export const StaffPage: React.FC = () => {
  usePageTitle("Quản lý Nhân sự Vận hành");

  const [filters, setFilters] = useState<StaffFilterParams>({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Modal xác nhận xóa hoặc khóa tài khoản
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<StaffMember | null>(null);
  const [confirmToggleStaff, setConfirmToggleStaff] = useState<StaffMember | null>(null);

  const { data: staffList = [], isLoading, refetch, isRefetching } = useStaffList(filters);
  const { data: roles = [] } = useRoles();
  const { createStaff, updateStaff, updateStatus, deleteStaff } = useStaffMutations();

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingStaff) {
      await updateStaff.mutateAsync({ id: editingStaff.id, data });
    } else {
      await createStaff.mutateAsync(data);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmToggleStaff) return;
    const newStatus = confirmToggleStaff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateStatus.mutateAsync({ id: confirmToggleStaff.id, status: newStatus });
    setConfirmToggleStaff(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteStaff) return;
    await deleteStaff.mutateAsync(confirmDeleteStaff.id);
    setConfirmDeleteStaff(null);
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản lý Đội ngũ Nhân sự Vận hành
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Danh bạ nhân sự, phân bổ chức vụ, tài khoản truy cập và quyền hạn các phân hệ VietRoute
            </p>
          </div>
        </div>

        {/* 4 Thẻ KPI Thống kê */}
        <StaffKpiGrid staffList={staffList} isLoading={isLoading} />

        {/* Thanh tìm kiếm & bộ lọc */}
        <StaffFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onAddNewStaff={handleAddNew}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
        />

        {/* Bảng dữ liệu nhân viên */}
        <StaffTable
          staffList={staffList}
          isLoading={isLoading}
          onEditStaff={handleEdit}
          onToggleStatus={(staff) => setConfirmToggleStaff(staff)}
          onDeleteStaff={(staff) => setConfirmDeleteStaff(staff)}
        />

        {/* Modal thêm mới / sửa nhân sự */}
        <StaffFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          editingStaff={editingStaff}
          roles={roles}
          isSubmitting={createStaff.isPending || updateStaff.isPending}
        />

        {/* Dialog xác nhận khóa/mở tài khoản */}
        <ConfirmDialog
          isOpen={!!confirmToggleStaff}
          onClose={() => setConfirmToggleStaff(null)}
          onConfirm={handleConfirmToggleStatus}
          title={
            confirmToggleStaff?.status === "ACTIVE"
              ? "Khóa tài khoản nhân sự"
              : "Kích hoạt lại tài khoản"
          }
          description={`Bạn có chắc chắn muốn ${
            confirmToggleStaff?.status === "ACTIVE" ? "tạm khóa" : "kích hoạt"
          } tài khoản của nhân viên "${confirmToggleStaff?.fullName}" (${confirmToggleStaff?.email})?`}
          confirmText={confirmToggleStaff?.status === "ACTIVE" ? "Khóa tài khoản" : "Kích hoạt"}
          variant={confirmToggleStaff?.status === "ACTIVE" ? "destructive" : "default"}
          isLoading={updateStatus.isPending}
        />

        {/* Dialog xác nhận xóa nhân sự */}
        <ConfirmDialog
          isOpen={!!confirmDeleteStaff}
          onClose={() => setConfirmDeleteStaff(null)}
          onConfirm={handleConfirmDelete}
          title="Xóa nhân viên khỏi hệ thống"
          description={`Thao tác này sẽ xóa vĩnh viễn tài khoản nhân sự "${confirmDeleteStaff?.fullName}" (${confirmDeleteStaff?.email}). Hành động này không thể hoàn tác!`}
          confirmText="Xác nhận xóa"
          variant="destructive"
          isLoading={deleteStaff.isPending}
        />
      </div>
    </PageContainer>
  );
};
