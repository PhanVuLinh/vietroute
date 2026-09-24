import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/mocks/adapters/serviceFactory";
import type { EnrichedCustomer, CustomerFilterParams } from "../types/customer";

const PAGE_SIZE = 10;

export function useCustomers() {
  const customersQuery = useQuery<EnrichedCustomer[]>({
    queryKey: ["customers", "list"],
    queryFn: async () => {
      const res = await customerService.getCustomers();
      const raw = res.data as any;
      if (Array.isArray(raw)) {
        return raw;
      }
      if (raw && Array.isArray(raw.items)) {
        return raw.items;
      }
      return [];
    },
    staleTime: 60 * 1000,
  });

  const [filters, setFilters] = useState<CustomerFilterParams>({
    searchQuery: "",
    type: "ALL",
    tier: "ALL",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const updateFilters = useCallback((patch: Partial<CustomerFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: "", type: "ALL", tier: "ALL", sortBy: "name", sortOrder: "asc" });
    setCurrentPage(1);
  }, []);

  // Filter + Sort
  const filteredCustomers = useMemo(() => {
    const raw = customersQuery.data;
    let result: EnrichedCustomer[] = Array.isArray(raw)
      ? raw
      : raw && Array.isArray((raw as any).items)
      ? (raw as any).items
      : [];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    if (filters.type !== "ALL") {
      result = result.filter((c) => c.type === filters.type);
    }

    if (filters.tier !== "ALL") {
      result = result.filter((c) => c.tier === filters.tier);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name, "vi");
          break;
        case "totalOrders":
          cmp = a.stats.totalOrders - b.stats.totalOrders;
          break;
        case "totalRevenue":
          cmp = a.stats.totalRevenue - b.stats.totalRevenue;
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return filters.sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [customersQuery.data, filters]);

  // Stats
  const stats = useMemo(() => {
    const raw = customersQuery.data;
    const all: EnrichedCustomer[] = Array.isArray(raw)
      ? raw
      : raw && Array.isArray((raw as any).items)
      ? (raw as any).items
      : [];
    let enterprise = 0;
    let individual = 0;
    let vip = 0;
    let totalRevenue = 0;

    for (const c of all) {
      if (c.type === "ENTERPRISE") enterprise++;
      else individual++;
      if (c.tier === "VIP" || c.tier === "GOLD") vip++;
      totalRevenue += c.stats.totalRevenue;
    }

    return { total: all.length, enterprise, individual, vip, totalRevenue };
  }, [customersQuery.data]);

  // Pagination
  const totalCount = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredCustomers, currentPage]
  );

  return {
    customers: paginatedCustomers,
    allCustomers: customersQuery.data || [],
    stats,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setPage: setCurrentPage,
    totalCount,
    totalPages,
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    refetch: customersQuery.refetch,
  };
}
