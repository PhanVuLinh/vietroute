import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/mocks/adapters/serviceFactory";
import type { Order, OrderPriority, OrderStatus } from "@/core/types/logistics";

export interface CreateOrderPayload {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  warehouseId: string;
  totalWeight: number;
  itemCount: number;
  codAmount: number;
  deliveryWindowEnd: string;
  priority: OrderPriority;
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  // 1. Mutation Tạo đơn hàng mới
  const createOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const res = await (orderService as unknown as { createOrder: (data: unknown) => Promise<{ data: Order }> }).createOrder({
        receiverName: payload.receiverName,
        receiverPhone: payload.receiverPhone,
        receiverAddress: payload.receiverAddress,
        warehouseId: payload.warehouseId,
        totalWeight: payload.totalWeight,
        itemCount: payload.itemCount,
        codAmount: payload.codAmount,
        deliveryWindowEnd: payload.deliveryWindowEnd,
        priority: payload.priority,
      });
      return res.data;
    },
    onSuccess: (newOrder) => {
      // Cập nhật ngay vào cache danh sách đơn
      queryClient.setQueryData<Order[]>(["orders", "list"], (old) => {
        if (!old) return [newOrder];
        return [newOrder, ...old];
      });

      // Invalidate các queries liên quan
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  // 2. Mutation Cập nhật trạng thái đơn
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await orderService.updateOrderStatus(id, status);
      return res.data;
    },
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<Order[]>(["orders", "list"], (old) => {
        if (!old) return [];
        return old.map((o) => (o.id === updated.id ? updated : o));
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    createOrderMutation,
    updateOrderStatusMutation,
  };
}
