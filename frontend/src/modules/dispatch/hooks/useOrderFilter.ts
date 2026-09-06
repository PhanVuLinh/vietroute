import { useState, useMemo, useEffect } from "react";
import type { Order, OrderPriority, OrderStatus } from "@/core/types/logistics";

export interface OrderFilterState {
  search: string;
  status: "ALL" | OrderStatus | "DELAYED";
  priority: "ALL" | OrderPriority;
  warehouseId: string;
}

export function useOrderFilter(orders: Order[]) {
  const [filters, setFilters] = useState<OrderFilterState>({
    search: "",
    status: "ALL",
    priority: "ALL",
    warehouseId: "ALL",
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 250);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Bộ lọc dữ liệu đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tìm kiếm chuỗi ký tự
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesCode = order.orderCode.toLowerCase().includes(q);
        const matchesName = order.receiverName.toLowerCase().includes(q);
        const matchesAddress = order.receiverAddress.toLowerCase().includes(q);
        const matchesPhone = order.receiverPhone.includes(q);
        if (!matchesCode && !matchesName && !matchesAddress && !matchesPhone) {
          return false;
        }
      }

      // 2. Lọc trạng thái
      if (filters.status !== "ALL") {
        if (filters.status === "DELAYED") {
          // Quy ước: đơn có priority URGENT hoặc nằm trong danh sách trễ
          if (order.priority !== "URGENT" && order.status !== "FAILED") {
            return false;
          }
        } else if (order.status !== filters.status) {
          return false;
        }
      }

      // 3. Lọc mức độ ưu tiên
      if (filters.priority !== "ALL") {
        if (order.priority !== filters.priority) {
          return false;
        }
      }

      // 4. Lọc theo kho
      if (filters.warehouseId !== "ALL") {
        if (order.warehouseId !== filters.warehouseId) {
          return false;
        }
      }

      return true;
    });
  }, [orders, debouncedSearch, filters.status, filters.priority, filters.warehouseId]);

  // Sắp xếp đơn: Đơn cần xử lý trước (Chờ phân công > Sắp trễ > Critical > High > Normal)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      // Đơn PENDING/CONFIRMED ưu tiên hơn đơn đã ASSIGNED/DELIVERED
      const isPendingA = a.status === "PENDING" || a.status === "CONFIRMED";
      const isPendingB = b.status === "PENDING" || b.status === "CONFIRMED";
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;

      // Sắp xếp mức độ ưu tiên: URGENT (Critical) > HIGH > NORMAL > LOW
      const priorityWeight: Record<OrderPriority, number> = {
        URGENT: 4,
        HIGH: 3,
        NORMAL: 2,
        LOW: 1,
      };

      const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (weightDiff !== 0) return weightDiff;

      // Nếu cùng ưu tiên, đơn tạo trước xếp trước
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [filteredOrders]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.status !== "ALL") count++;
    if (filters.priority !== "ALL") count++;
    if (filters.warehouseId !== "ALL") count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      priority: "ALL",
      warehouseId: "ALL",
    });
  };

  return {
    filters,
    setFilters,
    filteredOrders: sortedOrders,
    rawCount: orders.length,
    activeFilterCount,
    resetFilters,
  };
}
