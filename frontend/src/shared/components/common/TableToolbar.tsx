import React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export interface TableToolbarProps {
  /** Giá trị tìm kiếm hiện tại */
  searchValue: string;
  /** Callback khi giá trị tìm kiếm thay đổi */
  onSearchChange: (value: string) => void;
  /** Gợi ý ô tìm kiếm */
  searchPlaceholder?: string;
  /** Tổng số bản ghi tìm thấy */
  totalItems?: number;
  /** Tên thực thể để hiển thị kết quả (VD: "đơn hàng", "tài xế") */
  itemName?: string;
  /** Có đang áp dụng bộ lọc nào không */
  hasActiveFilters?: boolean;
  /** Số lượng bộ lọc đang kích hoạt */
  activeFilterCount?: number;
  /** Callback đưa các bộ lọc về mặc định */
  onResetFilters?: () => void;
  /** Nhãn nút đặt lại bộ lọc */
  resetLabel?: string;
  /** Các bộ lọc bổ sung (Select, DatePicker, v.v.) */
  filters?: React.ReactNode;
  /** Vị trí hiển thị filters: "inline" cùng hàng search hoặc "bottom" hàng dưới */
  filtersPosition?: "inline" | "bottom";
  /** Các nút hành động bên phải (Làm mới, Thêm mới, Xuất file) */
  actions?: React.ReactNode;
  /** Biến thể giao diện: card độc lập, header gắn đầu bảng hoặc inline */
  variant?: "card" | "header" | "inline";
  className?: string;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  totalItems,
  itemName = "kết quả",
  hasActiveFilters = false,
  activeFilterCount,
  onResetFilters,
  resetLabel = "Xóa lọc",
  filters,
  filtersPosition = "inline",
  actions,
  variant = "card",
  className,
}) => {
  const isFilterActive =
    hasActiveFilters || (activeFilterCount !== undefined && activeFilterCount > 0);

  const containerClasses = {
    card: "bg-card p-3 rounded-xl border border-border shadow-2xs space-y-2.5",
    header: "p-3.5 sm:p-4 border-b border-border/70 space-y-3",
    inline: "flex flex-wrap items-center gap-2.5",
  }[variant];

  // Nếu filtersPosition === "inline", filters nằm cạnh ô Search
  if (filtersPosition === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5",
          containerClasses,
          className
        )}
      >
        <div className="flex flex-1 items-center gap-2 flex-wrap min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] sm:min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Inline Filter Dropdowns */}
          {filters}

          {/* Reset Filters Button */}
          {isFilterActive && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>{resetLabel}</span>
              {activeFilterCount !== undefined && activeFilterCount > 0 && (
                <span className="ml-1 font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Right Actions & Counter */}
        {(actions || totalItems !== undefined) && (
          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 ml-auto">
            {totalItems !== undefined && (
              <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 select-none">
                Tìm thấy <b className="text-foreground font-mono">{totalItems}</b> {itemName}
              </span>
            )}
            {actions}
          </div>
        )}
      </div>
    );
  }

  // Nếu filtersPosition === "bottom", hàng trên là Search + Actions, hàng dưới là Filter Dropdowns
  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-8.5 text-xs"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Counter, Reset button, and Actions */}
        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
          {totalItems !== undefined && (
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline">
              Tìm thấy <b className="text-foreground">{totalItems}</b> {itemName}
            </span>
          )}

          {isFilterActive && onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-8.5 text-xs font-semibold gap-1.5 cursor-pointer hover:border-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{resetLabel}</span>
              {activeFilterCount !== undefined && activeFilterCount > 0 && (
                <span className="ml-0.5 font-mono text-[10px]">({activeFilterCount})</span>
              )}
            </Button>
          )}

          {actions}
        </div>
      </div>

      {/* Bottom row: Filter Selects */}
      {filters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          {filters}
        </div>
      )}
    </div>
  );
};
