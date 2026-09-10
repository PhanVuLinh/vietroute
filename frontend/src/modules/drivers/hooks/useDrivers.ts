import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { driverService, vehicleService } from "@/mocks/adapters/serviceFactory";
import type { Driver, DriverStatus, Vehicle } from "@/core/types/logistics";

export interface EnrichedDriver extends Driver {
  vehicle?: Vehicle;
}

export function useDrivers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<DriverStatus | "ALL">("ALL");
  const [selectedLicense, setSelectedLicense] = useState<string>("ALL");

  // 1. Fetch danh sách tài xế
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "list"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 2. Fetch danh sách phương tiện để liên kết
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "drivers-lookup"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Map tra cứu xe nhanh O(1)
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (vehiclesQuery.data) {
      for (const v of vehiclesQuery.data) {
        map.set(v.id, v);
      }
    }
    return map;
  }, [vehiclesQuery.data]);

  // Kết hợp thông tin tài xế và phương tiện
  const enrichedDrivers = useMemo<EnrichedDriver[]>(() => {
    if (!driversQuery.data) return [];
    return driversQuery.data.map((driver) => {
      const vehicle = driver.currentVehicleId
        ? vehicleMap.get(driver.currentVehicleId)
        : undefined;
      return {
        ...driver,
        vehicle,
      };
    });
  }, [driversQuery.data, vehicleMap]);

  // Lọc dữ liệu theo tìm kiếm & bộ lọc
  const filteredDrivers = useMemo(() => {
    return enrichedDrivers.filter((driver) => {
      // 1. Lọc theo trạng thái
      if (selectedStatus !== "ALL" && driver.status !== selectedStatus) {
        return false;
      }

      // 2. Lọc theo hạng bằng lái
      if (selectedLicense !== "ALL" && driver.licenseType !== selectedLicense) {
        return false;
      }

      // 3. Tìm kiếm theo tên, mã tài xế, SĐT, biển số xe
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = driver.fullName.toLowerCase().includes(query);
        const matchCode = driver.driverCode.toLowerCase().includes(query);
        const matchPhone = driver.phone.includes(query);
        const matchPlate = driver.vehicle?.licensePlate.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchPhone && !matchPlate) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedDrivers, selectedStatus, selectedLicense, searchQuery]);

  // Thống kê số lượng KPI
  const stats = useMemo(() => {
    const total = enrichedDrivers.length;
    const available = enrichedDrivers.filter((d) => d.status === "AVAILABLE").length;
    const busy = enrichedDrivers.filter((d) => d.status === "BUSY").length;
    const onBreak = enrichedDrivers.filter((d) => d.status === "ON_BREAK").length;
    const offline = enrichedDrivers.filter((d) => d.status === "OFFLINE").length;
    const suspended = enrichedDrivers.filter((d) => d.status === "SUSPENDED").length;

    const avgOnTime =
      total > 0
        ? (enrichedDrivers.reduce((acc, d) => acc + d.onTimeRate, 0) / total).toFixed(1)
        : "0.0";

    const totalCompletedToday = enrichedDrivers.reduce(
      (acc, d) => acc + d.todayCompletedDeliveries,
      0
    );

    return {
      total,
      available,
      busy,
      onBreak,
      offline,
      suspended,
      avgOnTime: Number(avgOnTime),
      totalCompletedToday,
    };
  }, [enrichedDrivers]);

  // Mutation cập nhật trạng thái tài xế
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DriverStatus }) => {
      const res = await driverService.updateDriverStatus(id, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Mutation tạo mới tài xế
  const createDriverMutation = useMutation({
    mutationFn: async (newDriver: Omit<Driver, "id">) => {
      const res = await driverService.createDriver(newDriver);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  // Mutation cập nhật thông tin tài xế
  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Driver> }) => {
      const res = await driverService.updateDriver(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  // Mutation xóa tài xế
  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await driverService.deleteDriver(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  return {
    drivers: filteredDrivers,
    allDrivers: enrichedDrivers,
    vehicles: vehiclesQuery.data || [],
    stats,
    isLoading: driversQuery.isLoading || vehiclesQuery.isLoading,
    isError: driversQuery.isError || vehiclesQuery.isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedLicense,
    setSelectedLicense,
    refetchAll: () => {
      driversQuery.refetch();
      vehiclesQuery.refetch();
    },
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    createDriver: createDriverMutation.mutateAsync,
    isCreating: createDriverMutation.isPending,
    updateDriver: updateDriverMutation.mutateAsync,
    isUpdating: updateDriverMutation.isPending,
    deleteDriver: deleteDriverMutation.mutateAsync,
    isDeleting: deleteDriverMutation.isPending,
  };
}
