import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  orderService,
  driverService,
  vehicleService,
  warehouseService,
  deliveryService,
  dispatchService,
} from "@/mocks/adapters/serviceFactory";
import type {
  Order,
  Driver,
  Vehicle,
  Warehouse,
  Delivery,
  DriverAssignment,
} from "@/core/types/logistics";

export interface EnrichedOrder extends Order {
  warehouse?: Warehouse;
  delivery?: Delivery;
  driver?: Driver;
  vehicle?: Vehicle;
}

export function useOrders() {
  // 1. Danh sách đơn hàng
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders", "list"],
    queryFn: async () => {
      const res = await orderService.getOrders({ pageSize: 100 });
      return res.data.items;
    },
    staleTime: 30 * 1000,
  });

  // 2. Danh sách tài xế
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "orders-lookup"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 3. Danh sách phương tiện
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "orders-lookup"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 120 * 1000,
  });

  // 4. Danh sách kho bãi
  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "orders-lookup"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 120 * 1000,
  });

  // 5. Danh sách chuyến giao
  const deliveriesQuery = useQuery<Delivery[]>({
    queryKey: ["deliveries", "orders-lookup"],
    queryFn: async () => {
      const res = await deliveryService.getDeliveries({ pageSize: 100 });
      return res.data.items;
    },
    staleTime: 30 * 1000,
  });

  // 6. Danh sách phân công
  const assignmentsQuery = useQuery<DriverAssignment[]>({
    queryKey: ["assignments", "orders-lookup"],
    queryFn: async () => {
      const res = await dispatchService.getAssignments();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Tạo các bảng tra cứu O(1)
  const warehouseMap = useMemo(() => {
    const map = new Map<string, Warehouse>();
    if (warehousesQuery.data) {
      for (const w of warehousesQuery.data) map.set(w.id, w);
    }
    return map;
  }, [warehousesQuery.data]);

  const driverMap = useMemo(() => {
    const map = new Map<string, Driver>();
    if (driversQuery.data) {
      for (const d of driversQuery.data) map.set(d.id, d);
    }
    return map;
  }, [driversQuery.data]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (vehiclesQuery.data) {
      for (const v of vehiclesQuery.data) map.set(v.id, v);
    }
    return map;
  }, [vehiclesQuery.data]);

  const deliveryByOrderId = useMemo(() => {
    const map = new Map<string, Delivery>();
    if (deliveriesQuery.data) {
      for (const d of deliveriesQuery.data) map.set(d.orderId, d);
    }
    return map;
  }, [deliveriesQuery.data]);

  // Kết hợp đơn hàng với kho, chuyến giao, tài xế và phương tiện
  const enrichedOrders = useMemo<EnrichedOrder[]>(() => {
    if (!ordersQuery.data) return [];

    return ordersQuery.data.map((order) => {
      const warehouse = warehouseMap.get(order.warehouseId);
      const delivery = deliveryByOrderId.get(order.id);
      const driver = delivery?.driverId ? driverMap.get(delivery.driverId) : undefined;
      const vehicle = delivery?.vehicleId
        ? vehicleMap.get(delivery.vehicleId)
        : driver?.currentVehicleId
        ? vehicleMap.get(driver.currentVehicleId)
        : undefined;

      return {
        ...order,
        warehouse,
        delivery,
        driver,
        vehicle,
      };
    });
  }, [ordersQuery.data, warehouseMap, deliveryByOrderId, driverMap, vehicleMap]);

  const isLoading =
    ordersQuery.isLoading ||
    driversQuery.isLoading ||
    vehiclesQuery.isLoading ||
    warehousesQuery.isLoading;

  const isError =
    ordersQuery.isError ||
    driversQuery.isError ||
    vehiclesQuery.isError ||
    warehousesQuery.isError;

  const refetchAll = () => {
    ordersQuery.refetch();
    driversQuery.refetch();
    vehiclesQuery.refetch();
    warehousesQuery.refetch();
    deliveriesQuery.refetch();
    assignmentsQuery.refetch();
  };

  return {
    orders: enrichedOrders,
    rawOrders: ordersQuery.data || [],
    warehouses: warehousesQuery.data || [],
    drivers: driversQuery.data || [],
    vehicles: vehiclesQuery.data || [],
    deliveries: deliveriesQuery.data || [],
    warehouseMap,
    driverMap,
    vehicleMap,
    isLoading,
    isError,
    refetchAll,
  };
}
