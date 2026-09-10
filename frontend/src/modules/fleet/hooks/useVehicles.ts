import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { vehicleService, driverService } from "@/mocks/adapters/serviceFactory";
import type { Vehicle, VehicleStatus, VehicleType, Driver, VehicleInspectionStatus } from "@/core/types/logistics";
import { evaluateVehicleInspection } from "@/shared/utils/inspectionUtils";

export interface EnrichedVehicle extends Vehicle {
  driver?: Driver;
}

export function useVehicles() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<VehicleType | "ALL">("ALL");
  const [selectedInspectionStatus, setSelectedInspectionStatus] = useState<VehicleInspectionStatus | "ALL">("ALL");

  // 1. Fetch danh sách xe
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "list"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 2. Fetch danh sách tài xế để tra cứu phụ trách
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "vehicles-lookup"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Map tra cứu tài xế O(1)
  const driverMap = useMemo(() => {
    const map = new Map<string, Driver>();
    if (driversQuery.data) {
      for (const d of driversQuery.data) {
        map.set(d.id, d);
      }
    }
    return map;
  }, [driversQuery.data]);

  // Kết hợp thông tin xe và tài xế
  const enrichedVehicles = useMemo<EnrichedVehicle[]>(() => {
    if (!vehiclesQuery.data) return [];
    return vehiclesQuery.data.map((vehicle) => {
      const driver = vehicle.driverId ? driverMap.get(vehicle.driverId) : undefined;
      return {
        ...vehicle,
        driver,
      };
    });
  }, [vehiclesQuery.data, driverMap]);

  // Lọc dữ liệu theo tìm kiếm & bộ lọc
  const filteredVehicles = useMemo(() => {
    return enrichedVehicles.filter((vehicle) => {
      // 1. Lọc theo trạng thái vận hành
      if (selectedStatus !== "ALL" && vehicle.status !== selectedStatus) {
        return false;
      }

      // 2. Lọc theo loại xe
      if (selectedType !== "ALL" && vehicle.type !== selectedType) {
        return false;
      }

      // 3. Lọc theo trạng thái đăng kiểm
      if (selectedInspectionStatus !== "ALL") {
        const evaluation = evaluateVehicleInspection({ inspectionExpiryDate: vehicle.inspectionExpiryDate });
        if (evaluation.status !== selectedInspectionStatus) {
          return false;
        }
      }

      // 4. Tìm kiếm theo Biển số, Mã xe, Hãng/Model, Tên tài xế, Số tem đăng kiểm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchPlate = vehicle.licensePlate.toLowerCase().includes(query);
        const matchCode = vehicle.vehicleCode.toLowerCase().includes(query);
        const matchBrand = vehicle.brand.toLowerCase().includes(query);
        const matchModel = vehicle.model.toLowerCase().includes(query);
        const matchDriver = vehicle.driver?.fullName.toLowerCase().includes(query);
        const matchCert = (vehicle.inspectionCertificateNumber || "").toLowerCase().includes(query);

        if (!matchPlate && !matchCode && !matchBrand && !matchModel && !matchDriver && !matchCert) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedVehicles, selectedStatus, selectedType, selectedInspectionStatus, searchQuery]);

  // Thống kê KPI đội xe
  const stats = useMemo(() => {
    const total = enrichedVehicles.length;
    const available = enrichedVehicles.filter((v) => v.status === "AVAILABLE").length;
    const enRoute = enrichedVehicles.filter((v) => v.status === "EN_ROUTE").length;
    const loading = enrichedVehicles.filter((v) => v.status === "LOADING").length;
    const maintenance = enrichedVehicles.filter((v) => v.status === "MAINTENANCE").length;
    const offline = enrichedVehicles.filter((v) => v.status === "OFFLINE").length;

    // Thống kê hạn đăng kiểm
    const inspectionExpiredCount = enrichedVehicles.filter(
      (v) => evaluateVehicleInspection({ inspectionExpiryDate: v.inspectionExpiryDate }).isExpired
    ).length;

    const inspectionExpiringSoonCount = enrichedVehicles.filter(
      (v) => evaluateVehicleInspection({ inspectionExpiryDate: v.inspectionExpiryDate }).isExpiringSoon
    ).length;

    const avgFuel =
      total > 0
        ? Math.round(enrichedVehicles.reduce((acc, v) => acc + v.fuelPercent, 0) / total)
        : 0;

    const totalCapacityTons = (
      enrichedVehicles.reduce((acc, v) => acc + v.capacityWeight, 0) / 1000
    ).toFixed(1);

    return {
      total,
      available,
      enRoute,
      loading,
      maintenance,
      offline,
      inspectionExpiredCount,
      inspectionExpiringSoonCount,
      avgFuel,
      totalCapacityTons: Number(totalCapacityTons),
    };
  }, [enrichedVehicles]);

  // Mutation cập nhật trạng thái xe
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VehicleStatus }) => {
      const res = await vehicleService.updateVehicleStatus(id, status);
      return res.data;
    },
    onSuccess: (updatedVehicle) => {
      queryClient.setQueryData<Vehicle[]>(["vehicles", "list"], (old) => {
        if (!old || !updatedVehicle) return old;
        return old.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v));
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Mutation tạo mới phương tiện
  const createVehicleMutation = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, "id">) => {
      const res = await vehicleService.createVehicle(newVehicle);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  // Mutation cập nhật phương tiện
  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehicle> }) => {
      const res = await vehicleService.updateVehicle(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  // Mutation xóa phương tiện
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await vehicleService.deleteVehicle(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  return {
    vehicles: filteredVehicles,
    allVehicles: enrichedVehicles,
    drivers: driversQuery.data || [],
    stats,
    isLoading: vehiclesQuery.isLoading || driversQuery.isLoading,
    isError: vehiclesQuery.isError || driversQuery.isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    selectedInspectionStatus,
    setSelectedInspectionStatus,
    refetchAll: () => {
      vehiclesQuery.refetch();
      driversQuery.refetch();
    },
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    createVehicle: createVehicleMutation.mutateAsync,
    isCreating: createVehicleMutation.isPending,
    updateVehicle: updateVehicleMutation.mutateAsync,
    isUpdating: updateVehicleMutation.isPending,
    deleteVehicle: deleteVehicleMutation.mutateAsync,
    isDeleting: deleteVehicleMutation.isPending,
  };
}
