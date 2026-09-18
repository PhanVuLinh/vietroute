import React from "react";
import { Search, X, RotateCcw, ArrowUpDown } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Warehouse } from "@/core/types/logistics";
import type { OrderFiltersState } from "../hooks/useOrderFilters";

interface OrdersToolbarProps {
  filters: OrderFiltersState;
  onUpdateFilters: (filters: Partial<OrderFiltersState>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  warehouses: Warehouse[];
  totalResults: number;
}

export const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  activeFilterCount,
  warehouses,
  totalResults,
}) => {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3 shadow-2xs">
      {/* Top row: Search input + Results counter + Reset button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, khách hàng, số điện thoại, địa chỉ..."
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            className="h-9 pl-9 pr-8 text-xs bg-background"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: "" })}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 sm:ml-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 select-none">
            Tìm thấy <b className="text-foreground font-mono">{totalResults}</b> đơn hàng
          </span>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-8.5 text-xs font-semibold gap-1.5 cursor-pointer hover:border-destructive/40 hover:text-destructive shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đặt lại ({activeFilterCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row: Filter Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 border-t border-border/50 text-xs">
        {/* Lọc trạng thái */}
        <Select
          value={filters.status}
          onValueChange={(val) => onUpdateFilters({ status: val as OrderFiltersState["status"] })}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ phân công</SelectItem>
            <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
            <SelectItem value="IN_TRANSIT">Đang giao hàng</SelectItem>
            <SelectItem value="DELIVERED">Giao thành công</SelectItem>
            <SelectItem value="FAILED">Giao thất bại</SelectItem>
            <SelectItem value="DELAYED">Sắp trễ / Quá hạn</SelectItem>
          </SelectContent>
        </Select>

        {/* Lọc kho xuất phát */}
        <Select
          value={filters.warehouseId}
          onValueChange={(val) => onUpdateFilters({ warehouseId: val })}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Kho xuất phát" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả kho hàng</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lọc mức độ ưu tiên */}
        <Select
          value={filters.priority}
          onValueChange={(val) => onUpdateFilters({ priority: val as OrderFiltersState["priority"] })}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Mức ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả mức ưu tiên</SelectItem>
            <SelectItem value="URGENT">Khẩn cấp</SelectItem>
            <SelectItem value="HIGH">Ưu tiên cao</SelectItem>
            <SelectItem value="NORMAL">Bình thường</SelectItem>
            <SelectItem value="LOW">Tiêu chuẩn</SelectItem>
          </SelectContent>
        </Select>

        {/* Lọc SLA */}
        <Select
          value={filters.sla}
          onValueChange={(val) => onUpdateFilters({ sla: val as OrderFiltersState["sla"] })}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Tình trạng SLA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả SLA</SelectItem>
            <SelectItem value="ON_TIME">Trong hạn an toàn</SelectItem>
            <SelectItem value="WARNING">Sắp trễ (≤ 45 phút)</SelectItem>
            <SelectItem value="BREACHED">Đã trễ hạn cam kết</SelectItem>
          </SelectContent>
        </Select>

        {/* Sắp xếp (Sorting) */}
        <Select
          value={filters.sortBy}
          onValueChange={(val) => onUpdateFilters({ sortBy: val as OrderFiltersState["sortBy"] })}
        >
          <SelectTrigger className="h-8 text-xs bg-background col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 truncate">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Sắp xếp" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEFAULT">Ưu tiên SLA (Mặc định)</SelectItem>
            <SelectItem value="CREATED_DESC">Mới tạo nhất</SelectItem>
            <SelectItem value="DEADLINE_ASC">Hạn giao sớm nhất</SelectItem>
            <SelectItem value="WEIGHT_DESC">Khối lượng lớn nhất</SelectItem>
            <SelectItem value="COD_DESC">Tiền COD cao nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
