import React, { useState } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Building2 } from "lucide-react";
import { useDepartmentList, useDepartmentMutations } from "../hooks/useDepartments";
import { DepartmentKpiGrid } from "../components/DepartmentKpiGrid";
import { DepartmentFilterBar } from "../components/DepartmentFilterBar";
import { DepartmentTable } from "../components/DepartmentTable";
import { DepartmentFormDialog } from "../components/DepartmentFormDialog";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import type { DepartmentItem, CreateDepartmentInput, UpdateDepartmentInput } from "../types/department";

export const DepartmentsPage: React.FC = () => {
  usePageTitle("Quản lý Phòng Ban & Cơ Cấu");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentItem | null>(null);

  const { data: departments = [], isLoading } = useDepartmentList({
    search: searchQuery,
    status: statusFilter,
  });

  const { createDepartment, updateDepartment, deleteDepartment } = useDepartmentMutations();

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDepartment(dept);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateDepartmentInput | UpdateDepartmentInput) => {
    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          data,
        });
      } else {
        await createDepartment.mutateAsync(data as CreateDepartmentInput);
      }
      setIsDialogOpen(false);
      setEditingDepartment(null);
    } catch {
      // toast error handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartment) return;
    try {
      await deleteDepartment.mutateAsync(deletingDepartment.id);
      setDeletingDepartment(null);
    } catch {
      // toast error handled in hook
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span>Quản lý Phòng Ban & Cơ Cấu</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cơ cấu tổ chức doanh nghiệp, phân bổ trưởng bộ phận và quản lý nhân sự theo từng khối nghiệp vụ
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <DepartmentKpiGrid departments={departments} />

        {/* Filter bar */}
        <DepartmentFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onOpenCreate={handleOpenCreate}
        />

        {/* Department Table */}
        <DepartmentTable
          departments={departments}
          onEdit={handleOpenEdit}
          onDelete={(dept) => setDeletingDepartment(dept)}
          isLoading={isLoading}
        />

        {/* Dialog Thêm/Sửa phòng ban */}
        <DepartmentFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingDepartment(null);
          }}
          onSubmit={handleFormSubmit}
          editingDepartment={editingDepartment}
          isSubmitting={createDepartment.isPending || updateDepartment.isPending}
        />

        {/* Modal xác nhận xóa phòng ban */}
        <ConfirmDialog
          isOpen={Boolean(deletingDepartment)}
          onClose={() => setDeletingDepartment(null)}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa phòng ban"
          description={`Bạn có chắc chắn muốn xóa phòng ban "${deletingDepartment?.name}" (${deletingDepartment?.code})? Thao tác này sẽ loại bỏ bộ phận khỏi cơ cấu tổ chức và không thể hoàn tác.`}
          confirmText="Xác nhận xóa"
          variant="destructive"
          isLoading={deleteDepartment.isPending}
        />
      </div>
    </PageContainer>
  );
};
