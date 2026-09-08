import { useState, useMemo, useEffect } from "react";
import type { OrderPriority, OrderStatus } from "@/core/types/logistics";
import type { EnrichedOrder } from "./useOrders";
import { calculateOrderSla } from "../utils/slaCalculator";

export interface OrderFiltersState {
  search: string;
  status: "ALL" | OrderStatus | "DELAYED";
  warehouseId: string;
  priority: "ALL" | OrderPriority;
  sla: "ALL" | "ON_TIME" | "WARNING" | "BREACHED";
  sortBy: "DEFAULT" | "CREATED_DESC" | "DEADLINE_ASC" | "WEIGHT_DESC" | "COD_DESC";
  page: number;
  pageSize: number;
}

export function useOrderFilters(orders: EnrichedOrder[]) {
  const [filters, setFilters] = useState<OrderFiltersState>({
    search: "",
    status: "ALL",
    warehouseId: "ALL",
    priority: "ALL",
    sla: "ALL",
    sortBy: "DEFAULT",
    page: 1,
    pageSize: 10,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      // Khi gõ tìm kiếm thì reset về trang 1
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 250);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // 1. Lọc dữ liệu
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tìm kiếm theo mã đơn, khách hàng, SĐT, địa chỉ
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesCode = order.orderCode.toLowerCase().includes(q);
        const matchesName = order.receiverName.toLowerCase().includes(q);
        const matchesPhone = order.receiverPhone.includes(q);
        const matchesAddress = order.receiverAddress.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesPhone && !matchesAddress) {
          return false;
        }
      }

      // Lọc trạng thái
      if (filters.status !== "ALL") {
        if (filters.status === "DELAYED") {
          const sla = calculateOrderSla(order);
          if (sla.status !== "BREACHED" && sla.status !== "WARNING" && order.status !== "FAILED") {
            return false;
          }
        } else if (order.status !== filters.status) {
          return false;
        }
      }

      // Lọc kho
      if (filters.warehouseId !== "ALL" && order.warehouseId !== filters.warehouseId) {
        return false;
      }

      // Lọc độ ưu tiên
      if (filters.priority !== "ALL" && order.priority !== filters.priority) {
        return false;
      }

      // Lọc SLA
      if (filters.sla !== "ALL") {
        const sla = calculateOrderSla(order);
        if (sla.status !== filters.sla) {
          return false;
        }
      }

      return true;
    });
  }, [orders, debouncedSearch, filters.status, filters.warehouseId, filters.priority, filters.sla]);

  // 2. Sắp xếp dữ liệu (Sorting)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (filters.sortBy === "CREATED_DESC") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (filters.sortBy === "DEADLINE_ASC") {
        return new Date(a.deliveryWindowEnd).getTime() - new Date(b.deliveryWindowEnd).getTime();
      }

      if (filters.sortBy === "WEIGHT_DESC") {
        return b.totalWeight - a.totalWeight;
      }

      if (filters.sortBy === "COD_DESC") {
        return b.codAmount - a.codAmount;
      }

      // Mặc định (DEFAULT): Ưu tiên đơn đã trễ -> sắp trễ -> Critical -> High -> Normal -> Low
      const slaA = calculateOrderSla(a);
      const slaB = calculateOrderSla(b);

      const slaWeight = { BREACHED: 5, WARNING: 4, ON_TIME: 3, COMPLETED: 1, FAILED: 2 };
      const diffSla = slaWeight[slaB.status] - slaWeight[slaA.status];
      if (diffSla !== 0) return diffSla;

      const priorityWeight = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      const diffPriority = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (diffPriority !== 0) return diffPriority;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredOrders, filters.sortBy]);

  // 3. Phân trang (Pagination)
  const totalCount = sortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const currentPage = Math.min(filters.page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * filters.pageSize;
    return sortedOrders.slice(start, start + filters.pageSize);
  }, [sortedOrders, currentPage, filters.pageSize]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.status !== "ALL") count++;
    if (filters.warehouseId !== "ALL") count++;
    if (filters.priority !== "ALL") count++;
    if (filters.sla !== "ALL") count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      warehouseId: "ALL",
      priority: "ALL",
      sla: "ALL",
      sortBy: "DEFAULT",
      page: 1,
      pageSize: 10,
    });
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const updateFilters = (newFilters: Partial<OrderFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    filters,
    updateFilters,
    paginatedOrders,
    allFilteredOrders: sortedOrders,
    totalCount,
    totalPages,
    currentPage,
    setPage,
    activeFilterCount,
    resetFilters,
  };
}
