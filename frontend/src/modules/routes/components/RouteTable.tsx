import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Route as RouteIcon,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { RouteTableRow } from "./RouteTableRow";
import { TablePagination, TableToolbar } from "@/shared/components/common";

import type { RouteStatus, Warehouse, Driver } from "@/core/types/logistics";
import type { EnrichedRoute } from "../hooks/useRoutes";

interface RouteTableProps {
  routes: EnrichedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (route: EnrichedRoute) => void;
  onViewDetail: (route: EnrichedRoute) => void;
  onFocusMap?: (route: EnrichedRoute) => void;
  onEdit: (route: EnrichedRoute) => void;
  onDuplicate?: (route: EnrichedRoute) => void;
  onUpdateStatus: (id: string, status: RouteStatus) => void;
  onDelete: (route: EnrichedRoute) => void;
  onAddNew?: () => void;
  warehouses: Warehouse[];
  drivers: Driver[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: RouteStatus | "ALL";
  setSelectedStatus: (status: RouteStatus | "ALL") => void;
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

type SortField = "code" | "distance" | "duration" | "stops" | "status";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

export const RouteTable: React.FC<RouteTableProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onViewDetail,
  onFocusMap,
  onEdit,
  onDuplicate,
  onUpdateStatus,
  onDelete,
  onAddNew,
  warehouses,
  drivers,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedWarehouseId,
  setSelectedWarehouseId,
  selectedDriverId,
  setSelectedDriverId,
  isLoading = false,
  onRefresh,
}) => {
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sắp xếp danh sách tuyến
  const sortedRoutes = useMemo(() => {
    const list = [...routes];
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case "code":
          valA = a.routeCode.toLowerCase();
          valB = b.routeCode.toLowerCase();
          break;
        case "distance":
          valA = a.totalDistance;
          valB = b.totalDistance;
          break;
        case "duration":
          valA = a.estimatedDuration;
          valB = b.estimatedDuration;
          break;
        case "stops":
          valA = a.totalStopsCount;
          valB = b.totalStopsCount;
          break;
        case "status":
          // Sắp xếp ưu tiên ACTIVE -> PLANNED -> COMPLETED -> CANCELLED
          const priority: Record<RouteStatus, number> = {
            ACTIVE: 1,
            PLANNED: 2,
            COMPLETED: 3,
            CANCELLED: 4,
          };
          valA = priority[a.status] || 99;
          valB = priority[b.status] || 99;
          break;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [routes, sortField, sortDirection]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(sortedRoutes.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRoutes = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedRoutes.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedRoutes, safePage]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedWarehouseId !== "ALL" ||
    selectedDriverId !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedWarehouseId("ALL");
    setSelectedDriverId("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Header Toolbar & Filters */}
      <TableToolbar
        variant="header"
        filtersPosition="bottom"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Tìm theo mã tuyến, tên lộ trình, tài xế, biển số xe, điểm dừng..."
        totalItems={sortedRoutes.length}
        itemName="tuyến đường"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        resetLabel="Xóa lọc"
        actions={
          onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          )
        }
        filters={
          <>
            {/* Lọc Trạng thái */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val as RouteStatus | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang chạy (Active)</SelectItem>
                <SelectItem value="PLANNED">Đã lập lịch (Planned)</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc Kho xuất phát */}
            <Select
              value={selectedWarehouseId}
              onValueChange={(val) => {
                setSelectedWarehouseId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <SelectValue placeholder="Kho xuất phát" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả kho xuất phát</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lọc Tài xế */}
            <Select
              value={selectedDriverId}
              onValueChange={(val) => {
                setSelectedDriverId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="Tài xế" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả tài xế</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* 2. Table Data with Horizontal Scroll protection */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none whitespace-nowrap">
              <th
                onClick={() => handleSort("code")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[220px]"
              >
                <div className="flex items-center gap-1.5">
                  <RouteIcon className="h-3.5 w-3.5" />
                  <span>Tuyến đường & Kho xuất</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 min-w-[170px]">Tài xế & Xe</th>

              <th
                onClick={() => handleSort("stops")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[170px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tiến độ chặng dừng</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th
                onClick={() => handleSort("distance")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Cự ly & Thời gian</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 min-w-[140px]">Dầu & Phí BOT</th>

              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Trạng thái</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 text-right w-10">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoutes.length > 0 ? (
              paginatedRoutes.map((route) => (
                <RouteTableRow
                  key={route.id}
                  route={route}
                  isSelected={selectedRouteId === route.id}
                  onSelect={onSelectRoute}
                  onViewDetail={onViewDetail}
                  onFocusMap={onFocusMap}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                  <RouteIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground text-sm">Không tìm thấy tuyến đường phù hợp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc kho bãi, trạng thái.
                  </p>
                  {hasActiveFilters ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-3 h-8 text-xs"
                    >
                      Đặt lại bộ lọc
                    </Button>
                  ) : onAddNew ? (
                    <Button
                      size="sm"
                      onClick={onAddNew}
                      className="mt-3 h-8 text-xs gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Lập tuyến đường mới</span>
                    </Button>
                  ) : null}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <TablePagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={sortedRoutes.length}
        itemName="tuyến đường"
        onPageChange={setCurrentPage}
        pageSize={ITEMS_PER_PAGE}
      />
    </div>
  );
};
