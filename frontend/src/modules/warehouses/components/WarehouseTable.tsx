import React, { useState, useMemo } from "react";
import { ArrowUpDown, Building2, Boxes, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { WarehouseTableRow } from "./WarehouseTableRow";
import { TablePagination, TableToolbar } from "@/shared/components/common";



import type {
  Warehouse,
  WarehouseRegion,
  WarehouseType,
  WarehouseStatus,
} from "@/core/types/logistics";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  selectedWarehouseId: string | null;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  onViewDetail: (warehouse: Warehouse) => void;
  onFocusMap?: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onUpdateStatus: (id: string, status: WarehouseStatus) => void;
  onDelete: (warehouse: Warehouse) => void;
  onAddNew?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: WarehouseRegion | "ALL";
  setSelectedRegion: (region: WarehouseRegion | "ALL") => void;
  selectedType: WarehouseType | "ALL";
  setSelectedType: (type: WarehouseType | "ALL") => void;
  selectedStatus: WarehouseStatus | "ALL";
  setSelectedStatus: (status: WarehouseStatus | "ALL") => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

type SortField = "name" | "capacity" | "occupancy" | "dockDoors" | "region";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

export const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  onViewDetail,
  onFocusMap,
  onEdit,
  onUpdateStatus,
  onDelete,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  isLoading = false,
  onRefresh,
}) => {
  const [sortField, setSortField] = useState<SortField>("occupancy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sắp xếp danh sách
  const sortedWarehouses = useMemo(() => {
    const list = [...warehouses];
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "capacity":
          valA = a.capacity;
          valB = b.capacity;
          break;
        case "occupancy":
          valA = a.capacity > 0 ? a.usedCapacity / a.capacity : 0;
          valB = b.capacity > 0 ? b.usedCapacity / b.capacity : 0;
          break;
        case "dockDoors":
          valA = a.dockDoors || 0;
          valB = b.dockDoors || 0;
          break;
        case "region":
          valA = a.region || "";
          valB = b.region || "";
          break;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [warehouses, sortField, sortDirection]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(sortedWarehouses.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedWarehouses = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedWarehouses.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedWarehouses, safePage]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedRegion !== "ALL" ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("ALL");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
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
        searchPlaceholder="Tìm theo tên kho, mã số, thành phố, địa chỉ, quản lý..."
        totalItems={sortedWarehouses.length}
        itemName="kho bãi"
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
            {/* Lọc Khu vực */}
            <Select
              value={selectedRegion}
              onValueChange={(val) => {
                setSelectedRegion(val as WarehouseRegion | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[125px]">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả miền</SelectItem>
                <SelectItem value="NORTH">Miền Bắc</SelectItem>
                <SelectItem value="CENTRAL">Miền Trung</SelectItem>
                <SelectItem value="SOUTH">Miền Nam</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc Loại Hub */}
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val as WarehouseType | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[145px]">
                <SelectValue placeholder="Loại hình hub" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại hình</SelectItem>
                <SelectItem value="CENTRAL_HUB">Tổng kho phân phối</SelectItem>
                <SelectItem value="TRANSIT_HUB">Kho trung chuyển</SelectItem>
                <SelectItem value="LAST_MILE_HUB">Hub chặng cuối</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc Trạng thái */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val as WarehouseStatus | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="MAINTENANCE">Bảo trì bến bãi</SelectItem>
                <SelectItem value="FULL">Quá tải / Đầy tải</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* 2. Table Data with Horizontal Scroll protection */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[920px]">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none whitespace-nowrap">
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[230px]"
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Kho bãi & Hub</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 min-w-[170px]">Địa chỉ & Tỉnh thành</th>

              <th
                onClick={() => handleSort("occupancy")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[170px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Công suất & Lấp đầy</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th
                onClick={() => handleSort("dockDoors")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors min-w-[140px]"
              >
                <div className="flex items-center gap-1.5">
                  <Boxes className="h-3.5 w-3.5" />
                  <span>Cửa Dock & X/N</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 min-w-[130px]">Quản lý / Hotline</th>

              <th className="py-3 px-4 min-w-[120px]">Trạng thái</th>

              <th className="py-3 px-4 text-right w-10">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWarehouses.length > 0 ? (
              paginatedWarehouses.map((wh) => (
                <WarehouseTableRow
                  key={wh.id}
                  warehouse={wh}
                  isSelected={selectedWarehouseId === wh.id}
                  onSelect={onSelectWarehouse}
                  onViewDetail={onViewDetail}
                  onFocusMap={onFocusMap}
                  onEdit={onEdit}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                  <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground text-sm">Không tìm thấy kho bãi phù hợp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc khu vực, trạng thái.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-3 h-8 text-xs"
                    >
                      Đặt lại bộ lọc
                    </Button>
                  )}
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
        totalItems={sortedWarehouses.length}
        itemName="kho bãi"
        onPageChange={setCurrentPage}
        pageSize={ITEMS_PER_PAGE}
      />
    </div>
  );
};
