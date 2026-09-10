import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { warehouseService } from "@/mocks/adapters/serviceFactory";
import type {
  Warehouse,
  WarehouseStatus,
  WarehouseRegion,
  WarehouseType,
} from "@/core/types/logistics";

export interface WarehouseFilterState {
  searchQuery: string;
  selectedRegion: WarehouseRegion | "ALL";
  selectedType: WarehouseType | "ALL";
  selectedStatus: WarehouseStatus | "ALL";
}

export function useWarehouses() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<WarehouseRegion | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<WarehouseType | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<WarehouseStatus | "ALL">("ALL");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  // 1. Fetch danh sách kho bãi
  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "list"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const allWarehouses = useMemo(() => warehousesQuery.data || [], [warehousesQuery.data]);

  // 2. Lọc danh sách kho
  const filteredWarehouses = useMemo(() => {
    return allWarehouses.filter((wh) => {
      // Lọc theo Khu vực
      if (selectedRegion !== "ALL" && wh.region !== selectedRegion) {
        return false;
      }

      // Lọc theo Loại Hub
      if (selectedType !== "ALL" && wh.type !== selectedType) {
        return false;
      }

      // Lọc theo Trạng thái
      if (selectedStatus !== "ALL" && wh.status !== selectedStatus) {
        return false;
      }

      // Tìm kiếm theo Tên, Mã kho, Thành phố, Quản lý
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = wh.name.toLowerCase().includes(q);
        const matchCode = wh.code.toLowerCase().includes(q);
        const matchCity = wh.city.toLowerCase().includes(q);
        const matchAddress = wh.address.toLowerCase().includes(q);
        const matchManager = (wh.managerName || "").toLowerCase().includes(q);

        if (!matchName && !matchCode && !matchCity && !matchAddress && !matchManager) {
          return false;
        }
      }

      return true;
    });
  }, [allWarehouses, selectedRegion, selectedType, selectedStatus, searchQuery]);

  // 3. Kho đang được chọn
  const selectedWarehouse = useMemo(() => {
    if (!selectedWarehouseId) return null;
    return allWarehouses.find((w) => w.id === selectedWarehouseId) || null;
  }, [allWarehouses, selectedWarehouseId]);

  // 4. Thống kê KPI tổng quan mạng lưới kho
  const stats = useMemo(() => {
    const total = allWarehouses.length;
    const active = allWarehouses.filter((w) => w.status === "ACTIVE").length;
    const maintenance = allWarehouses.filter((w) => w.status === "MAINTENANCE").length;
    const full = allWarehouses.filter((w) => w.status === "FULL").length;

    const totalCapacityTons = allWarehouses.reduce((acc, w) => acc + w.capacity, 0);
    const totalUsedCapacityTons = allWarehouses.reduce((acc, w) => acc + w.usedCapacity, 0);
    const totalAreaSqM = allWarehouses.reduce((acc, w) => acc + (w.areaSqM || 0), 0);
    const totalPallets = allWarehouses.reduce((acc, w) => acc + (w.totalPallets || 0), 0);
    const usedPallets = allWarehouses.reduce((acc, w) => acc + (w.usedPallets || 0), 0);
    const totalDockDoors = allWarehouses.reduce((acc, w) => acc + (w.dockDoors || 0), 0);

    const avgOccupancyPercent =
      totalCapacityTons > 0
        ? Math.round((totalUsedCapacityTons / totalCapacityTons) * 100)
        : 0;

    const highOccupancyCount = allWarehouses.filter((w) => {
      const pct = w.capacity > 0 ? (w.usedCapacity / w.capacity) * 100 : 0;
      return pct >= 85;
    }).length;

    const northCount = allWarehouses.filter((w) => w.region === "NORTH").length;
    const centralCount = allWarehouses.filter((w) => w.region === "CENTRAL").length;
    const southCount = allWarehouses.filter((w) => w.region === "SOUTH").length;

    return {
      total,
      active,
      maintenance,
      full,
      highOccupancyCount,
      totalCapacityTons,
      totalUsedCapacityTons,
      avgOccupancyPercent,
      totalAreaSqM,
      totalPallets,
      usedPallets,
      totalDockDoors,
      northCount,
      centralCount,
      southCount,
    };
  }, [allWarehouses]);

  // 5. Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: async (newWh: Omit<Warehouse, "id">) => {
      const res = await warehouseService.createWarehouse(newWh);
      return res.data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Warehouse[]>(["warehouses", "list"], (old) => {
        if (!old) return [created];
        return [created, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Warehouse> }) => {
      const res = await warehouseService.updateWarehouse(id, data);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Warehouse[]>(["warehouses", "list"], (old) => {
        if (!old) return old;
        return old.map((w) => (w.id === updated.id ? updated : w));
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WarehouseStatus }) => {
      const res = await warehouseService.updateWarehouseStatus(id, status);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Warehouse[]>(["warehouses", "list"], (old) => {
        if (!old) return old;
        return old.map((w) => (w.id === updated.id ? updated : w));
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await warehouseService.deleteWarehouse(id);
      return res.data;
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Warehouse[]>(["warehouses", "list"], (old) => {
        if (!old) return [];
        return old.filter((w) => w.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });

  return {
    warehouses: filteredWarehouses,
    allWarehouses,
    selectedWarehouse,
    selectedWarehouseId,
    setSelectedWarehouseId,
    stats,
    isLoading: warehousesQuery.isLoading,
    isError: warehousesQuery.isError,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    refetch: warehousesQuery.refetch,
    createWarehouse: createWarehouseMutation.mutateAsync,
    isCreating: createWarehouseMutation.isPending,
    updateWarehouse: updateWarehouseMutation.mutateAsync,
    isUpdating: updateWarehouseMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    deleteWarehouse: deleteWarehouseMutation.mutateAsync,
    isDeleting: deleteWarehouseMutation.isPending,
  };
}
