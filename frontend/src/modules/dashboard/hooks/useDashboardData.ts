import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  analyticsService,
  driverService,
  vehicleService,
  notificationService,
  warehouseService,
} from "@/mocks/adapters/serviceFactory";
import type {
  AnalyticsDashboardData,
  Driver,
  Vehicle,
  NotificationItem,
  Warehouse,
} from "@/core/types/logistics";

export interface DashboardDriverItem extends Driver {
  vehiclePlate?: string;
  vehicleModel?: string;
  estimatedEtaMinutes?: number;
}

export function useDashboardData(selectedWarehouseId: string = "ALL") {
  // 1. Chỉ số thống kê & hiệu suất
  const analyticsQuery = useQuery<AnalyticsDashboardData>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const res = await analyticsService.getDashboardAnalytics();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 2. Danh sách tài xế
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "dashboard"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 3. Danh sách phương tiện (để map biển số xe)
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "dashboard"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 4. Danh sách thông báo & cảnh báo vận hành
  const notificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ["notifications", "dashboard"],
    queryFn: async () => {
      const res = await notificationService.getNotifications();
      return res.data;
    },
    staleTime: 15 * 1000,
  });

  // 5. Danh sách kho bãi
  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "dashboard"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 120 * 1000,
  });

  // Bảng tra cứu phương tiện O(1)
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (vehiclesQuery.data) {
      for (const v of vehiclesQuery.data) {
        map.set(v.id, v);
      }
    }
    return map;
  }, [vehiclesQuery.data]);

  // Kết hợp tài xế và biển số xe
  const enrichedDrivers = useMemo<DashboardDriverItem[]>(() => {
    if (!driversQuery.data) return [];
    return driversQuery.data.map((driver, index) => {
      const vehicle = driver.currentVehicleId ? vehicleMap.get(driver.currentVehicleId) : undefined;
      // Giả lập ETA theo số thứ tự để hiển thị trực quan (10-35 phút)
      const baseEta = 10 + (index * 5) % 25;
      return {
        ...driver,
        vehiclePlate: vehicle?.licensePlate || "Chưa gán xe",
        vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
        estimatedEtaMinutes: driver.status === "BUSY" ? baseEta : undefined,
      };
    });
  }, [driversQuery.data, vehicleMap]);

  // Lọc thông báo ưu tiên Cần xử lý (URGENT / HIGH)
  const urgentAlerts = useMemo<NotificationItem[]>(() => {
    if (!notificationsQuery.data) return [];
    return notificationsQuery.data
      .filter((n) => n.priority === "URGENT" || n.priority === "HIGH")
      .slice(0, 5);
  }, [notificationsQuery.data]);

  const isLoading =
    analyticsQuery.isLoading ||
    driversQuery.isLoading ||
    vehiclesQuery.isLoading ||
    warehousesQuery.isLoading;

  const isError =
    analyticsQuery.isError ||
    driversQuery.isError ||
    vehiclesQuery.isError ||
    warehousesQuery.isError;

  const refetchAll = () => {
    analyticsQuery.refetch();
    driversQuery.refetch();
    vehiclesQuery.refetch();
    notificationsQuery.refetch();
    warehousesQuery.refetch();
  };

  return {
    analytics: analyticsQuery.data,
    drivers: enrichedDrivers,
    rawDrivers: driversQuery.data || [],
    vehicles: vehiclesQuery.data || [],
    vehicleMap,
    alerts: urgentAlerts,
    warehouses: warehousesQuery.data || [],
    isLoading,
    isError,
    analyticsError: analyticsQuery.isError,
    driversError: driversQuery.isError,
    alertsError: notificationsQuery.isError,
    refetchAll,
    selectedWarehouseId,
  };
}
