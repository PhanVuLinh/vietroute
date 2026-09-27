import React from "react";
import { Search, Plus, ShieldCheck, RefreshCw } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Link } from "react-router-dom";
import type { StaffFilterParams } from "../types/staff";

interface StaffFilterBarProps {
  filters: StaffFilterParams;
  onFilterChange: (newFilters: StaffFilterParams) => void;
  onAddNewStaff: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const StaffFilterBar: React.FC<StaffFilterBarProps> = ({
  filters,
  onFilterChange,
  onAddNewStaff,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Tìm theo tên, mã NV, email, SĐT..."
            className="h-8 pl-8 text-xs bg-background/50"
          />
        </div>

        {/* Role Select */}
        <div className="w-[170px]">
          <Select
            value={filters.role || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, role: val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên (Admin)</SelectItem>
              <SelectItem value="MANAGER">Quản lý kho (Manager)</SelectItem>
              <SelectItem value="DISPATCHER">Điều phối viên</SelectItem>
              <SelectItem value="WAREHOUSE_STAFF">Thủ kho bến bãi</SelectItem>
              <SelectItem value="DRIVER">Tài xế vận tải</SelectItem>
              <SelectItem value="ACCOUNTANT">Kế toán đối soát</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Select */}
        <div className="w-[140px]">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, status: val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Tạm khóa</SelectItem>
              <SelectItem value="SUSPENDED">Đình chỉ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Link to Roles Page */}
        <Link to="/roles">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-purple-500/40 text-purple-600 hover:bg-purple-500/10 dark:text-purple-400 font-semibold cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Phân quyền & Vai trò</span>
          </Button>
        </Link>

        {/* Add Staff Button */}
        <Button
          size="sm"
          onClick={onAddNewStaff}
          className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Thêm nhân viên</span>
        </Button>
      </div>
    </div>
  );
};
