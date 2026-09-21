import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { NotificationFilters, NotificationCategory } from "../types/notification";
import { CATEGORY_META } from "../types/notification";

interface NotificationFiltersBarProps {
  filters: NotificationFilters;
  onUpdateFilters: (patch: Partial<NotificationFilters>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const NotificationFiltersBar: React.FC<NotificationFiltersBarProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults,
}) => {
  const activeFilterCount =
    (filters.category !== "ALL" ? 1 : 0) +
    (filters.priority !== "ALL" ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
        <Input
          placeholder="Tìm kiếm thông báo..."
          value={filters.searchQuery}
          onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
          className="pl-9 h-9 text-xs bg-background/50 border-border/50"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onUpdateFilters({ searchQuery: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <Select
        value={filters.category}
        onValueChange={(val) => onUpdateFilters({ category: val as NotificationCategory })}
      >
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs border-border/50">
          <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Phân loại" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(CATEGORY_META) as NotificationCategory[]).map((cat) => (
            <SelectItem key={cat} value={cat} className="text-xs">
              {CATEGORY_META[cat].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select
        value={filters.priority}
        onValueChange={(val) =>
          onUpdateFilters({ priority: val as NotificationFilters["priority"] })
        }
      >
        <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs border-border/50">
          <SelectValue placeholder="Mức ưu tiên" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
          <SelectItem value="URGENT" className="text-xs">Khẩn cấp</SelectItem>
          <SelectItem value="HIGH" className="text-xs">Cao</SelectItem>
          <SelectItem value="NORMAL" className="text-xs">Bình thường</SelectItem>
          <SelectItem value="LOW" className="text-xs">Thấp</SelectItem>
        </SelectContent>
      </Select>

      {/* Results count & Reset */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
          {totalResults} kết quả
        </span>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3 w-3" />
            Xóa bộ lọc
            <Badge variant="secondary" className="text-[9px] h-4 px-1 font-bold ml-0.5">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
};
