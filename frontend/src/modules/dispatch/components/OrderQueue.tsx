import React from "react";
import { Search, X, RotateCcw, Package, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Order, Warehouse } from "@/core/types/logistics";
import type { OrderFilterState } from "../hooks/useOrderFilter";
import { OrderQueueItem } from "./OrderQueueItem";

interface OrderQueueProps {
  orders: Order[];
  warehouses: Warehouse[];
  selectedOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  onViewOrderDetail: (order: Order) => void;
  filters: OrderFilterState;
  onFilterChange: (filters: Partial<OrderFilterState>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  isLoading?: boolean;
  className?: string;
}

export const OrderQueue: React.FC<OrderQueueProps> = ({
  orders,
  warehouses,
  selectedOrderId,
  onSelectOrder,
  onViewOrderDetail,
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  isLoading,
  className,
}) => {
  const warehouseMap = new Map<string, string>();
  for (const w of warehouses) {
    warehouseMap.set(w.id, w.name);
  }

  return (
    <Card className={`flex flex-col h-[680px] lg:h-[720px] overflow-hidden border-border/80 shadow-xs ${className || ""}`}>
      {/* Header: Title + Count */}
      <CardHeader className="py-3 px-4 border-b border-border/60 shrink-0 bg-card/70 backdrop-blur-xs flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span>Đơn cần điều phối</span>
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs font-semibold px-1.5 py-0">
            {orders.length}
          </Badge>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 text-xs font-medium text-muted-foreground hover:text-foreground gap-1 px-2 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Đặt lại ({activeFilterCount})</span>
          </Button>
        )}
      </CardHeader>

      {/* Toolbar: Search + Quick Filters */}
      <div className="p-3 border-b border-border/50 bg-card/40 space-y-2 shrink-0">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, người nhận, địa chỉ..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="h-8 pl-8 pr-8 text-xs bg-background"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns: Trạng thái & Kho */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Lọc Trạng thái */}
          <Select
            value={filters.status}
            onValueChange={(val) => onFilterChange({ status: val as OrderFilterState["status"] })}
          >
            <SelectTrigger className="h-7 text-[11px] bg-background">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ phân công</SelectItem>
              <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
              <SelectItem value="IN_TRANSIT">Đang giao</SelectItem>
              <SelectItem value="DELAYED">Sắp trễ / Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc Kho hàng */}
          <Select
            value={filters.warehouseId}
            onValueChange={(val) => onFilterChange({ warehouseId: val })}
          >
            <SelectTrigger className="h-7 text-[11px] bg-background">
              <SelectValue placeholder="Kho bãi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả các kho</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Scrollable List */}
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <Layers className="h-8 w-8 mb-2 opacity-40" />
            <span className="text-xs font-medium">Không tìm thấy đơn hàng phù hợp</span>
            <span className="text-[11px] text-muted-foreground/80 mt-0.5">
              Thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc
            </span>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="mt-3 text-xs h-7 cursor-pointer"
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        ) : (
          orders.map((order) => (
            <OrderQueueItem
              key={order.id}
              order={order}
              warehouseName={warehouseMap.get(order.warehouseId) || "Kho VietRoute"}
              isSelected={selectedOrderId === order.id}
              onClick={() => onSelectOrder(order)}
              onViewDetail={(e) => {
                e.stopPropagation();
                onViewOrderDetail(order);
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
