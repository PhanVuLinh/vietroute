import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Truck,
  X,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { VehicleTableRow } from "./VehicleTableRow";
import { TablePagination } from "@/shared/components/common";
import type { EnrichedVehicle } from "../hooks/useVehicles";
import type { VehicleStatus, VehicleType, VehicleInspectionStatus } from "@/core/types/logistics";

interface VehiclesTableProps {
  vehicles: EnrichedVehicle[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatus: VehicleStatus | "ALL";
  onStatusChange: (val: VehicleStatus | "ALL") => void;
  selectedType: VehicleType | "ALL";
  onTypeChange: (val: VehicleType | "ALL") => void;
  selectedInspectionStatus?: VehicleInspectionStatus | "ALL";
  onInspectionStatusChange?: (val: VehicleInspectionStatus | "ALL") => void;
  onViewDetail: (vehicle: EnrichedVehicle) => void;
  onEdit: (vehicle: EnrichedVehicle) => void;
  onUpdateStatus: (id: string, status: VehicleStatus) => void;
  onResetFilters: () => void;
}

export const VehiclesTable: React.FC<VehiclesTableProps> = ({
  vehicles,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedInspectionStatus = "ALL",
  onInspectionStatusChange,
  onViewDetail,
  onEdit,
  onUpdateStatus,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedType, selectedInspectionStatus]);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize));
  const paginatedVehicles = vehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "ALL" ||
    selectedType !== "ALL" ||
    selectedInspectionStatus !== "ALL";

  return (
    <div className="space-y-3">
      {/* 1. Thanh công cụ tìm kiếm và lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo biển số, tem đăng kiểm, hãng xe..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Lọc theo Loại xe */}
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="h-9 min-w-[130px] w-auto text-xs shrink-0">
              <Truck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả loại xe</SelectItem>
              <SelectItem value="TRUCK" className="text-xs">Xe tải</SelectItem>
              <SelectItem value="VAN" className="text-xs">Xe Van</SelectItem>
              <SelectItem value="CAR" className="text-xs">Xe bán tải/con</SelectItem>
              <SelectItem value="MOTORBIKE" className="text-xs">Xe máy</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc theo Trạng thái vận hành */}
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 min-w-[150px] w-auto text-xs shrink-0">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả trạng thái</SelectItem>
              <SelectItem value="AVAILABLE" className="text-xs">Sẵn sàng</SelectItem>
              <SelectItem value="EN_ROUTE" className="text-xs">Đang chạy tuyến</SelectItem>
              <SelectItem value="LOADING" className="text-xs">Bốc dỡ hàng</SelectItem>
              <SelectItem value="MAINTENANCE" className="text-xs">Đang bảo dưỡng</SelectItem>
              <SelectItem value="OFFLINE" className="text-xs">Không khả dụng</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc theo Hạn Đăng kiểm */}
          {onInspectionStatusChange && (
            <Select value={selectedInspectionStatus} onValueChange={onInspectionStatusChange}>
              <SelectTrigger className="h-9 min-w-[160px] w-auto text-xs shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Đăng kiểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả đăng kiểm</SelectItem>
                <SelectItem value="VALID" className="text-xs text-emerald-600 font-medium">Đăng kiểm: Còn hạn</SelectItem>
                <SelectItem value="EXPIRING_SOON" className="text-xs text-amber-600 font-semibold">Sắp hết hạn (&lt;30 ngày)</SelectItem>
                <SelectItem value="EXPIRED" className="text-xs text-rose-600 font-bold">ĐÃ QUÁ HẠN</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Nút đặt lại bộ lọc */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 self-end sm:self-auto cursor-pointer shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt lại
          </Button>
        )}
      </div>

      {/* 2. Bảng dữ liệu Desktop */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap select-none">
                <th className="py-3 px-4 min-w-[170px]">Biển số & Phân loại</th>
                <th className="py-3 px-4 min-w-[150px]">Tải trọng / Thể tích</th>
                <th className="py-3 px-4 min-w-[130px]">Nhiên liệu</th>
                <th className="py-3 px-4 min-w-[160px]">Đăng kiểm & Pháp lý</th>
                <th className="py-3 px-4 min-w-[140px]">Bảo dưỡng tiếp theo</th>
                <th className="py-3 px-4 min-w-[140px]">Tài xế phụ trách</th>
                <th className="py-3 px-4 min-w-[130px]">Trạng thái</th>
                <th className="py-3 px-4 text-right min-w-[90px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle) => (
                  <VehicleTableRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                    onUpdateStatus={onUpdateStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Truck className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Không tìm thấy phương tiện phù hợp</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Thử điều chỉnh lại từ khóa hoặc xóa các tiêu chí lọc đang chọn.
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
          totalItems={vehicles.length}
          itemName="phương tiện"
          onPageChange={setCurrentPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};
