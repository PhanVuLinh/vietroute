import React, { useState } from "react";
import { Filter, UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { DriverTableRow } from "./DriverTableRow";
import { TablePagination, TableToolbar } from "@/shared/components/common";



import type { EnrichedDriver } from "../hooks/useDrivers";
import type { DriverStatus } from "@/core/types/logistics";

interface DriversTableProps {
  drivers: EnrichedDriver[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatus: DriverStatus | "ALL";
  onStatusChange: (val: DriverStatus | "ALL") => void;
  selectedLicense: string;
  onLicenseChange: (val: string) => void;
  onViewDetail: (driver: EnrichedDriver) => void;
  onEdit: (driver: EnrichedDriver) => void;
  onUpdateStatus: (id: string, status: DriverStatus) => void;
  onResetFilters: () => void;
}

export const DriversTable: React.FC<DriversTableProps> = ({
  drivers,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedLicense,
  onLicenseChange,
  onViewDetail,
  onEdit,
  onUpdateStatus,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Reset trang khi filter đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedLicense]);

  const totalPages = Math.max(1, Math.ceil(drivers.length / pageSize));
  const paginatedDrivers = drivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasActiveFilters =
    searchQuery !== "" || selectedStatus !== "ALL" || selectedLicense !== "ALL";

  return (
    <div className="space-y-3">
      {/* 1. Thanh công cụ tìm kiếm và lọc */}
      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm tài xế theo tên, mã, SĐT, biển số..."
        totalItems={drivers.length}
        itemName="tài xế"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        resetLabel="Đặt lại"
        filters={
          <>
            {/* Lọc theo Trạng thái */}
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 min-w-[175px] w-auto text-xs shrink-0">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả trạng thái</SelectItem>
                <SelectItem value="AVAILABLE" className="text-xs">Sẵn sàng</SelectItem>
                <SelectItem value="BUSY" className="text-xs">Đang giao hàng</SelectItem>
                <SelectItem value="ON_BREAK" className="text-xs">Nghỉ ca</SelectItem>
                <SelectItem value="OFFLINE" className="text-xs">Ngoại tuyến</SelectItem>
                <SelectItem value="SUSPENDED" className="text-xs">Tạm khóa</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc theo Hạng GPLX */}
            <Select value={selectedLicense} onValueChange={onLicenseChange}>
              <SelectTrigger className="h-9 min-w-[145px] w-auto text-xs shrink-0">
                <SelectValue placeholder="Hạng GPLX" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả hạng bằng</SelectItem>
                <SelectItem value="B2" className="text-xs">Hạng B2</SelectItem>
                <SelectItem value="C" className="text-xs">Hạng C</SelectItem>
                <SelectItem value="D" className="text-xs">Hạng D</SelectItem>
                <SelectItem value="E" className="text-xs">Hạng E</SelectItem>
                <SelectItem value="FC" className="text-xs">Hạng FC</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* 2. Bảng dữ liệu Desktop */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap select-none">
                <th className="py-3 px-4 min-w-[160px]">Tài xế & Mã hiệu</th>
                <th className="py-3 px-4 min-w-[130px]">Số điện thoại</th>
                <th className="py-3 px-4 min-w-[150px]">Giấy phép lái xe</th>
                <th className="py-3 px-4 min-w-[150px]">Phương tiện phụ trách</th>
                <th className="py-3 px-4 min-w-[130px]">Trạng thái</th>
                <th className="py-3 px-4 min-w-[140px]">Hiệu suất vận tải</th>
                <th className="py-3 px-4 text-right min-w-[90px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver) => (
                  <DriverTableRow
                    key={driver.id}
                    driver={driver}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                    onUpdateStatus={onUpdateStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <UserX className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Không tìm thấy tài xế phù hợp</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc đang chọn.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onResetFilters}
                          className="mt-2 text-xs h-8"
                        >
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Phân trang dùng chung */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={drivers.length}
          itemName="tài xế"
          onPageChange={setCurrentPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};
