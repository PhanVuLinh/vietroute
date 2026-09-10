import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  routeService,
  driverService,
  vehicleService,
  warehouseService,
  orderService,
} from "@/mocks/adapters/serviceFactory";
import { MOCK_ROUTE_TEMPLATES, type RouteTemplate } from "@/mocks/data/routeTemplates";
import type {
  Route,
  RouteStatus,
  RouteStop,
  RouteStopStatus,
  Driver,
  Vehicle,
  Warehouse,
  Order,
} from "@/core/types/logistics";

export interface EnrichedRoute extends Route {
  driver?: Driver;
  vehicle?: Vehicle;
  warehouse?: Warehouse;
  completedStopsCount: number;
  totalStopsCount: number;
  progressPercent: number;
}

export function useRoutes() {
  const queryClient = useQueryClient();

  // Filters & selection state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<RouteStatus | "ALL">("ALL");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("ALL");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // 1. Fetch Danh sách Routes
  const routesQuery = useQuery<Route[]>({
    queryKey: ["routes", "list"],
    queryFn: async () => {
      const res = await routeService.getRoutes();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 2. Fetch Drivers
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "list"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Vehicles
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "list"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch Warehouses
  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "list"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 5. Fetch Orders để phục vụ gom đơn tạo tuyến
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders", "list"],
    queryFn: async () => {
      const res = await orderService.getOrders({ pageSize: 100 });
      const data = res.data as any;
      if (Array.isArray(data)) return data;
      if (data?.items && Array.isArray(data.items)) return data.items;
      return [];
    },
    staleTime: 60 * 1000,
  });

  const rawRoutes = useMemo(() => (Array.isArray(routesQuery.data) ? routesQuery.data : []), [routesQuery.data]);
  const rawDrivers = useMemo(() => (Array.isArray(driversQuery.data) ? driversQuery.data : []), [driversQuery.data]);
  const rawVehicles = useMemo(() => (Array.isArray(vehiclesQuery.data) ? vehiclesQuery.data : []), [vehiclesQuery.data]);
  const rawWarehouses = useMemo(() => (Array.isArray(warehousesQuery.data) ? warehousesQuery.data : []), [warehousesQuery.data]);
  const rawOrders = useMemo(() => (Array.isArray(ordersQuery.data) ? ordersQuery.data : []), [ordersQuery.data]);

  // Lọc các đơn hàng chưa giao (PENDING hoặc CONFIRMED)
  const pendingOrders = useMemo(() => {
    const list = Array.isArray(rawOrders) ? rawOrders : [];
    return list.filter(
      (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "ASSIGNED"
    );
  }, [rawOrders]);

  // 6. Kết hợp & Bổ sung thông tin chi tiết cho từng tuyến
  const enrichedRoutes: EnrichedRoute[] = useMemo(() => {
    return rawRoutes.map((route) => {
      const driver = rawDrivers.find((d) => d.id === route.driverId);
      const vehicle = rawVehicles.find((v) => v.id === route.vehicleId);
      const warehouse = rawWarehouses.find((w) => w.id === route.warehouseId);

      const stops = route.stops || [];
      const totalStopsCount = stops.length;
      const completedStopsCount = stops.filter(
        (s) => s.status === "COMPLETED" || s.status === "SKIPPED"
      ).length;
      const progressPercent =
        totalStopsCount > 0 ? Math.round((completedStopsCount / totalStopsCount) * 100) : 0;

      return {
        ...route,
        driver,
        vehicle,
        warehouse,
        totalStopsCount,
        completedStopsCount,
        progressPercent,
      };
    });
  }, [rawRoutes, rawDrivers, rawVehicles, rawWarehouses]);

  // 7. Lọc danh sách tuyến đường
  const filteredRoutes = useMemo(() => {
    return enrichedRoutes.filter((route) => {
      if (selectedStatus !== "ALL" && route.status !== selectedStatus) {
        return false;
      }
      if (selectedWarehouseId !== "ALL" && route.warehouseId !== selectedWarehouseId) {
        return false;
      }
      if (selectedDriverId !== "ALL" && route.driverId !== selectedDriverId) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = route.routeCode.toLowerCase().includes(q);
        const matchName = (route.routeName || "").toLowerCase().includes(q);
        const matchDriver = (route.driver?.fullName || "").toLowerCase().includes(q);
        const matchPlate = (route.vehicle?.licensePlate || "").toLowerCase().includes(q);
        const matchCity = (route.warehouse?.city || "").toLowerCase().includes(q);
        const matchWarehouse = (route.warehouse?.name || "").toLowerCase().includes(q);

        const matchStops = (route.stops || []).some(
          (s) =>
            (s.customerName || "").toLowerCase().includes(q) ||
            (s.address || "").toLowerCase().includes(q) ||
            (s.orderCode || "").toLowerCase().includes(q)
        );

        if (
          !matchCode &&
          !matchName &&
          !matchDriver &&
          !matchPlate &&
          !matchCity &&
          !matchWarehouse &&
          !matchStops
        ) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedRoutes, selectedStatus, selectedWarehouseId, selectedDriverId, searchQuery]);

  // 8. Tuyến đang được chọn
  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) return null;
    return enrichedRoutes.find((r) => r.id === selectedRouteId) || null;
  }, [enrichedRoutes, selectedRouteId]);

  // 9. Tính toán KPI tổng quan tuyến đường
  const stats = useMemo(() => {
    const total = enrichedRoutes.length;
    const active = enrichedRoutes.filter((r) => r.status === "ACTIVE").length;
    const planned = enrichedRoutes.filter((r) => r.status === "PLANNED").length;
    const completed = enrichedRoutes.filter((r) => r.status === "COMPLETED").length;
    const cancelled = enrichedRoutes.filter((r) => r.status === "CANCELLED").length;

    const totalDistanceKm = enrichedRoutes.reduce((acc, r) => acc + r.totalDistance, 0);
    const totalDurationMinutes = enrichedRoutes.reduce((acc, r) => acc + r.estimatedDuration, 0);
    const totalFuelEstLiters = enrichedRoutes.reduce((acc, r) => acc + (r.fuelEstLiters || 0), 0);
    const totalTollFeeVND = enrichedRoutes.reduce((acc, r) => acc + (r.tollFeeEstVND || 0), 0);

    let totalStops = 0;
    let completedStops = 0;

    enrichedRoutes.forEach((r) => {
      totalStops += r.totalStopsCount;
      completedStops += r.completedStopsCount;
    });

    const stopCompletionRatePercent =
      totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

    return {
      total,
      active,
      planned,
      completed,
      cancelled,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      totalDurationMinutes,
      totalFuelEstLiters: Math.round(totalFuelEstLiters * 10) / 10,
      totalTollFeeVND,
      totalStops,
      completedStops,
      stopCompletionRatePercent,
    };
  }, [enrichedRoutes]);

  // 10. Mutations
  const createRouteMutation = useMutation({
    mutationFn: async (newRoute: Omit<Route, "id">) => {
      const res = await routeService.createRoute(newRoute);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Route> }) => {
      const res = await routeService.updateRoute(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  const updateRouteStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RouteStatus }) => {
      const res = await routeService.updateRouteStatus(id, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateStopStatusMutation = useMutation({
    mutationFn: async ({
      routeId,
      stopId,
      status,
    }: {
      routeId: string;
      stopId: string;
      status: RouteStopStatus;
    }) => {
      const res = await routeService.updateStopStatus(routeId, stopId, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await routeService.deleteRoute(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  // Mutation Nhân bản tuyến đường (Duplicate Route)
  const duplicateRouteMutation = useMutation({
    mutationFn: async (routeToClone: EnrichedRoute) => {
      const newCode = `${routeToClone.routeCode}-CPY${Math.floor(10 + Math.random() * 90)}`;
      const clonedStops = (routeToClone.stops || []).map((s, idx) => ({
        ...s,
        id: `stop-${Date.now()}-${idx + 1}`,
        status: "PENDING" as RouteStopStatus,
        actualArrival: undefined,
      }));

      const newRoute: Omit<Route, "id"> = {
        routeCode: newCode,
        routeName: `${routeToClone.routeName || routeToClone.routeCode} (Nhân bản)`,
        driverId: routeToClone.driverId,
        vehicleId: routeToClone.vehicleId,
        warehouseId: routeToClone.warehouseId,
        totalDistance: routeToClone.totalDistance,
        estimatedDuration: routeToClone.estimatedDuration,
        fuelEstLiters: routeToClone.fuelEstLiters,
        tollFeeEstVND: routeToClone.tollFeeEstVND,
        totalWeightKg: routeToClone.totalWeightKg,
        totalVolumeM3: routeToClone.totalVolumeM3,
        trafficAlerts: routeToClone.trafficAlerts,
        polyline: routeToClone.polyline,
        status: "PLANNED",
        stops: clonedStops,
      };

      const res = await routeService.createRoute(newRoute);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
    },
  });

  const optimizeStopsMutation = useMutation({
    mutationFn: async ({
      originCoords,
      stops,
    }: {
      originCoords: [number, number];
      stops: RouteStop[];
    }) => {
      const res = await routeService.optimizeStops(originCoords, stops);
      return res.data;
    },
  });

  return {
    routes: filteredRoutes,
    allRoutes: enrichedRoutes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    stats,
    drivers: rawDrivers,
    vehicles: rawVehicles,
    warehouses: rawWarehouses,
    orders: rawOrders,
    pendingOrders,
    routeTemplates: MOCK_ROUTE_TEMPLATES,
    isLoading: routesQuery.isLoading,
    isError: routesQuery.isError,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedWarehouseId,
    setSelectedWarehouseId,
    selectedDriverId,
    setSelectedDriverId,
    refetch: routesQuery.refetch,
    createRoute: createRouteMutation.mutateAsync,
    isCreating: createRouteMutation.isPending,
    updateRoute: updateRouteMutation.mutateAsync,
    isUpdating: updateRouteMutation.isPending,
    updateRouteStatus: updateRouteStatusMutation.mutateAsync,
    isUpdatingRouteStatus: updateRouteStatusMutation.isPending,
    updateStopStatus: updateStopStatusMutation.mutateAsync,
    isUpdatingStopStatus: updateStopStatusMutation.isPending,
    deleteRoute: deleteRouteMutation.mutateAsync,
    isDeleting: deleteRouteMutation.isPending,
    duplicateRoute: duplicateRouteMutation.mutateAsync,
    isDuplicating: duplicateRouteMutation.isPending,
    optimizeStops: optimizeStopsMutation.mutateAsync,
    isOptimizing: optimizeStopsMutation.isPending,
  };
}
