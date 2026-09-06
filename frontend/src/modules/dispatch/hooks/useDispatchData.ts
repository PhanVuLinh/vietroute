import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  orderService,
  driverService,
  vehicleService,
  warehouseService,
  dispatchService,
  deliveryService,
  notificationService,
} from "@/mocks/adapters/serviceFactory";
import type {
  Order,
  Driver,
  Vehicle,
  Warehouse,
  DriverAssignment,
  Delivery,
  NotificationItem,
} from "@/core/types/logistics";

export interface AssignOrderParams {
  orderId: string;
  driverId: string;
  vehicleId: string;
  deliveryId?: string;
  assignmentType?: "MANUAL" | "AI_RECOMMENDED";
}

export function useDispatchData() {
  const queryClient = useQueryClient();

  // 1. Toàn bộ danh sách đơn hàng
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders", "dispatch"],
    queryFn: async () => {
      const res = await orderService.getOrders({ pageSize: 60 });
      return res.data.items;
    },
    staleTime: 30 * 1000,
  });

  // 2. Danh sách tài xế
  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers", "dispatch"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 3. Danh sách phương tiện
  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles", "dispatch"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 4. Danh sách kho bãi
  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ["warehouses", "dispatch"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
    staleTime: 120 * 1000,
  });

  // 5. Danh sách phân công hiện tại
  const assignmentsQuery = useQuery<DriverAssignment[]>({
    queryKey: ["assignments", "dispatch"],
    queryFn: async () => {
      const res = await dispatchService.getAssignments();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 6. Danh sách chuyến giao hàng
  const deliveriesQuery = useQuery<Delivery[]>({
    queryKey: ["deliveries", "dispatch"],
    queryFn: async () => {
      const res = await deliveryService.getDeliveries({ pageSize: 60 });
      return res.data.items;
    },
    staleTime: 30 * 1000,
  });

  // 7. Thông báo & Cảnh báo điều phối
  const notificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ["notifications", "dispatch"],
    queryFn: async () => {
      const res = await notificationService.getNotifications();
      return res.data;
    },
    staleTime: 20 * 1000,
  });

  // Bảng tra cứu Map O(1)
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    if (vehiclesQuery.data) {
      for (const v of vehiclesQuery.data) {
        map.set(v.id, v);
      }
    }
    return map;
  }, [vehiclesQuery.data]);

  const warehouseMap = useMemo(() => {
    const map = new Map<string, Warehouse>();
    if (warehousesQuery.data) {
      for (const w of warehousesQuery.data) {
        map.set(w.id, w);
      }
    }
    return map;
  }, [warehousesQuery.data]);

  // Map Delivery theo Order ID
  const deliveryByOrderId = useMemo(() => {
    const map = new Map<string, Delivery>();
    if (deliveriesQuery.data) {
      for (const d of deliveriesQuery.data) {
        map.set(d.orderId, d);
      }
    }
    return map;
  }, [deliveriesQuery.data]);

  // Cảnh báo điều phối nóng
  const dispatchAlerts = useMemo(() => {
    if (!notificationsQuery.data) return [];
    return notificationsQuery.data
      .filter((n) => n.priority === "URGENT" || n.priority === "HIGH")
      .slice(0, 4);
  }, [notificationsQuery.data]);

  // Phân công đơn hàng (Mutation)
  const assignOrderMutation = useMutation({
    mutationFn: async ({
      orderId,
      driverId,
      vehicleId,
      deliveryId,
      assignmentType = "MANUAL",
    }: AssignOrderParams) => {
      const actualDeliveryId =
        deliveryId || deliveryByOrderId.get(orderId)?.id || `del-${orderId}`;

      // 1. Ghi nhận phân công chuyến giao
      const assignRes = await dispatchService.assignDelivery(
        actualDeliveryId,
        driverId,
        vehicleId,
        assignmentType
      );

      // 2. Cập nhật trạng thái đơn hàng sang ASSIGNED
      await orderService.updateOrderStatus(orderId, "ASSIGNED");

      return {
        assignment: assignRes.data,
        orderId,
        driverId,
        vehicleId,
      };
    },
    onSuccess: ({ orderId, driverId, vehicleId }) => {
      // Cập nhật optimistic local cache
      queryClient.setQueryData<Order[]>(["orders", "dispatch"], (old) => {
        if (!old) return [];
        return old.map((o) =>
          o.id === orderId ? { ...o, status: "ASSIGNED", updatedAt: new Date().toISOString() } : o
        );
      });

      queryClient.setQueryData<Driver[]>(["drivers", "dispatch"], (old) => {
        if (!old) return [];
        return old.map((d) =>
          d.id === driverId
            ? {
                ...d,
                status: "BUSY",
                currentDeliveryCount: d.currentDeliveryCount + 1,
                currentVehicleId: vehicleId,
              }
            : d
        );
      });

      // Invalidate queries để đảm bảo tính nhất quán trên toàn hệ thống
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

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
    assignmentsQuery.refetch();
    deliveriesQuery.refetch();
    notificationsQuery.refetch();
  };

  return {
    orders: ordersQuery.data || [],
    drivers: driversQuery.data || [],
    vehicles: vehiclesQuery.data || [],
    warehouses: warehousesQuery.data || [],
    assignments: assignmentsQuery.data || [],
    deliveries: deliveriesQuery.data || [],
    alerts: dispatchAlerts,
    vehicleMap,
    warehouseMap,
    deliveryByOrderId,
    isLoading,
    isError,
    refetchAll,
    assignOrderMutation,
  };
}
