import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTrackingStore } from "@/shared/stores/trackingStore";
import { mockGpsStreamer } from "@/mocks/services/mockGpsStreamer";
import {
  vehicleService,
  driverService,
  warehouseService,
  routeService,
  deliveryService,
  orderService,
} from "@/mocks/adapters/serviceFactory";
import type {
  Vehicle,
  Driver,
  Warehouse,
  Route,
  Delivery,
  Order,
  VehicleTelemetry,
} from "@/core/types/logistics";

export type TrackingFilterStatus = "ALL" | "MOVING" | "IDLE" | "ALERT";

export interface EnrichedTrackedVehicle {
  telemetry: VehicleTelemetry;
  vehicle?: Vehicle;
  driver?: Driver;
  route?: Route;
  status: "MOVING" | "IDLE" | "ALERT";
}

export const REGIONS = {
  ALL: { name: "Toàn quốc", center: [107.5, 16.0] as [number, number], zoom: 5.5 },
  HN: { name: "Hà Nội", center: [105.84, 21.0285] as [number, number], zoom: 12 },
  HCM: { name: "TP. Hồ Chí Minh", center: [106.68, 10.78] as [number, number], zoom: 12 },
  DAD: { name: "Đà Nẵng", center: [108.2022, 16.0544] as [number, number], zoom: 12.5 },
};

export type RegionKey = keyof typeof REGIONS;

export function useTracking() {
  const telemetryDict = useTrackingStore((state) => state.vehicles);
  const selectedVehicleId = useTrackingStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useTrackingStore((state) => state.setSelectedVehicleId);

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<TrackingFilterStatus>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("HN");

  // 1. Tự động kích hoạt luồng GPS Streamer khi mở trang
  useEffect(() => {
    mockGpsStreamer.setSpeed(speedMultiplier);
    const stopStream = mockGpsStreamer.start(2000);
    setIsStreaming(true);

    return () => {
      stopStream();
      setIsStreaming(false);
    };
  }, []);

  // 2. Fetch danh mục xe, tài xế, kho, tuyến đường
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "tracking"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "tracking"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "tracking"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 120 * 1000,
  });

  const routesQuery = useQuery<Route[]>({
    queryKey: ["routes", "tracking"],
    queryFn: async () => {
      const res = await routeService.getRoutes();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders", "tracking"],
    queryFn: async () => {
      const res = await orderService.getOrders({ pageSize: 100 });
      return res.data.items;
    },
    staleTime: 60 * 1000,
  });

  // Bảng tra cứu Map O(1)
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (vehiclesQuery.data) {
      for (const v of vehiclesQuery.data) map.set(v.id, v);
    }
    return map;
  }, [vehiclesQuery.data]);

  const driverMap = useMemo(() => {
    const map = new Map<string, Driver>();
    if (driversQuery.data) {
      for (const d of driversQuery.data) map.set(d.id, d);
    }
    return map;
  }, [driversQuery.data]);

  const routeByVehicleId = useMemo(() => {
    const map = new Map<string, Route>();
    if (routesQuery.data) {
      for (const r of routesQuery.data) {
        if (r.vehicleId) map.set(r.vehicleId, r);
      }
    }
    return map;
  }, [routesQuery.data]);

  // Kết hợp danh sách xe có telemetry
  const enrichedTrackedVehicles = useMemo<EnrichedTrackedVehicle[]>(() => {
    const telemetryList = Object.values(telemetryDict);
    if (telemetryList.length === 0 && vehiclesQuery.data) {
      // Fallback khi chưa có telemetry từ streamer
      return vehiclesQuery.data.slice(0, 10).map((v) => {
        const driver = v.driverId ? driverMap.get(v.driverId) : undefined;
        const coords: [number, number] = driver?.currentLocation || [105.8544, 21.0285];
        return {
          telemetry: {
            vehicleId: v.id,
            driverId: driver?.id,
            driverName: driver?.fullName || "Tài xế VietRoute",
            plateNumber: v.licensePlate,
            coordinates: coords,
            bearing: 45,
            speedKmH: v.status === "EN_ROUTE" ? 45 : 0,
            fuelPercent: v.fuelPercent,
            updatedAt: new Date().toISOString(),
          },
          vehicle: v,
          driver,
          route: routeByVehicleId.get(v.id),
          status: v.status === "EN_ROUTE" ? "MOVING" : "IDLE",
        };
      });
    }

    return telemetryList.map((tel) => {
      const vehicle = vehicleMap.get(tel.vehicleId);
      const driver = tel.driverId ? driverMap.get(tel.driverId) : undefined;
      const route = routeByVehicleId.get(tel.vehicleId);

      let status: "MOVING" | "IDLE" | "ALERT" = "IDLE";
      if (tel.vehicleId === "veh-12" || tel.speedKmH > 60) {
        status = "ALERT";
      } else if (tel.speedKmH > 0) {
        status = "MOVING";
      }

      return {
        telemetry: tel,
        vehicle,
        driver,
        route,
        status,
      };
    });
  }, [telemetryDict, vehiclesQuery.data, vehicleMap, driverMap, routeByVehicleId]);

  // Lọc theo bộ lọc & tìm kiếm
  const filteredVehicles = useMemo(() => {
    return enrichedTrackedVehicles.filter((item) => {
      // Lọc trạng thái
      if (filterStatus === "MOVING" && item.status !== "MOVING") return false;
      if (filterStatus === "IDLE" && item.status !== "IDLE") return false;
      if (filterStatus === "ALERT" && item.status !== "ALERT") return false;

      // Tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPlate = item.telemetry.plateNumber.toLowerCase().includes(q);
        const matchDriver = (item.telemetry.driverName || "").toLowerCase().includes(q);
        const matchCode = (item.vehicle?.vehicleCode || "").toLowerCase().includes(q);
        if (!matchPlate && !matchDriver && !matchCode) return false;
      }

      return true;
    });
  }, [enrichedTrackedVehicles, filterStatus, searchQuery]);

  // Thông tin xe được chọn
  const selectedTrackedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return enrichedTrackedVehicles.find((v) => v.telemetry.vehicleId === selectedVehicleId) || null;
  }, [enrichedTrackedVehicles, selectedVehicleId]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = enrichedTrackedVehicles.length;
    const moving = enrichedTrackedVehicles.filter((v) => v.status === "MOVING").length;
    const idle = enrichedTrackedVehicles.filter((v) => v.status === "IDLE").length;
    const alert = enrichedTrackedVehicles.filter((v) => v.status === "ALERT").length;

    const movingVehicles = enrichedTrackedVehicles.filter((v) => v.telemetry.speedKmH > 0);
    const avgSpeed =
      movingVehicles.length > 0
        ? Math.round(
            movingVehicles.reduce((acc, v) => acc + v.telemetry.speedKmH, 0) / movingVehicles.length
          )
        : 0;

    return { total, moving, idle, alert, avgSpeed };
  }, [enrichedTrackedVehicles]);

  // Điều khiển Simulation
  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      mockGpsStreamer.stop();
      setIsStreaming(false);
    } else {
      mockGpsStreamer.start(2000);
      setIsStreaming(true);
    }
  }, [isStreaming]);

  const changeSpeed = useCallback((multiplier: number) => {
    setSpeedMultiplier(multiplier);
    mockGpsStreamer.setSpeed(multiplier);
  }, []);

  return {
    trackedVehicles: filteredVehicles,
    allTrackedVehicles: enrichedTrackedVehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedTrackedVehicle,
    warehouses: warehousesQuery.data || [],
    orders: ordersQuery.data || [],
    stats,
    isLoading: vehiclesQuery.isLoading || driversQuery.isLoading || warehousesQuery.isLoading,
    isStreaming,
    toggleStreaming,
    speedMultiplier,
    changeSpeed,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedRegion,
    setSelectedRegion,
  };
}
