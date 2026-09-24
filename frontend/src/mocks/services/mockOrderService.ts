import type { ApiPaginatedResponse, ApiResponse } from "@/core/types/api";
import type { Order, OrderPriority, OrderStatus } from "@/core/types/logistics";
import { MOCK_ORDERS } from "../data/orders";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface OrderFilterParams {
  status?: OrderStatus;
  priority?: OrderPriority;
  warehouseId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const mockOrderService = {
  /** Lấy danh sách đơn hàng có phân trang và bộ lọc nâng cao */
  async getOrders(
    params?: OrderFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiPaginatedResponse<Order>> {
    await simulateLatency(options);
    let filtered = [...MOCK_ORDERS];

    if (params?.status) {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    if (params?.priority) {
      filtered = filtered.filter((o) => o.priority === params.priority);
    }
    if (params?.warehouseId) {
      filtered = filtered.filter((o) => o.warehouseId === params.warehouseId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.receiverName.toLowerCase().includes(q) ||
          o.receiverPhone.includes(q) ||
          o.receiverAddress.toLowerCase().includes(q)
      );
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 15;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách đơn hàng thành công",
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  },

  /** Lấy chi tiết đơn hàng theo ID */
  async getOrderById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Order | null>> {
    await simulateLatency(options);
    const order = MOCK_ORDERS.find((o) => o.id === id || o.orderCode === id) || null;
    return {
      success: Boolean(order),
      statusCode: order ? 200 : 404,
      message: order ? "Lấy chi tiết đơn hàng thành công" : "Không tìm thấy đơn hàng",
      data: order,
    };
  },

  /** Cập nhật trạng thái đơn hàng */
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Order | null>> {
    await simulateLatency(options);
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy đơn hàng để cập nhật",
        data: null,
      };
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return {
      success: true,
      statusCode: 200,
      message: `Đã cập nhật trạng thái đơn hàng sang ${status}`,
      data: { ...order },
    };
  },

  /** Tạo đơn hàng mới */
  async createOrder(
    input: {
      receiverName: string;
      receiverPhone: string;
      receiverAddress: string;
      warehouseId: string;
      totalWeight: number;
      totalVolume?: number;
      itemCount?: number;
      codAmount?: number;
      priority?: OrderPriority;
      deliveryWindowEnd: string;
      receiverLatitude?: number;
      receiverLongitude?: number;
    },
    options?: MockServiceOptions
  ): Promise<ApiResponse<Order>> {
    await simulateLatency(options);

    const now = new Date().toISOString();
    const newId = `ord-${Date.now()}`;
    const newCode = `VR-2026-${(MOCK_ORDERS.length + 1).toString().padStart(3, "0")}`;

    const itemsCount = input.itemCount || 1;
    const itemWeight = Math.round((input.totalWeight / itemsCount) * 10) / 10;

    const newOrder: Order = {
      id: newId,
      orderCode: newCode,
      customerId: "cus-hn-01",
      warehouseId: input.warehouseId,
      receiverName: input.receiverName,
      receiverPhone: input.receiverPhone,
      receiverAddress: input.receiverAddress,
      receiverLatitude: input.receiverLatitude || 21.0285,
      receiverLongitude: input.receiverLongitude || 105.8544,
      totalWeight: input.totalWeight,
      totalVolume: input.totalVolume || 0.05,
      codAmount: input.codAmount || 0,
      priority: input.priority || "NORMAL",
      deliveryWindowStart: now,
      deliveryWindowEnd: input.deliveryWindowEnd,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      items: Array.from({ length: itemsCount }).map((_, idx) => ({
        id: `item-${newId}-${idx + 1}`,
        orderId: newId,
        productName: `Kiện hàng bưu phẩm số ${idx + 1}`,
        quantity: 1,
        weight: itemWeight,
        volume: 0.02,
        isFragile: false,
        isLiquid: false,
        requiresSpecialHandling: false,
      })),
    };

    MOCK_ORDERS.unshift(newOrder);

    return {
      success: true,
      statusCode: 201,
      message: "Tạo đơn hàng mới thành công",
      data: newOrder,
    };
  },

  /** Ký nhận e-POD */
  async submitPod(
    id: string,
    podData: any,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Order | null>> {
    await simulateLatency(options);
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy đơn hàng",
        data: null,
      };
    }

    order.status = "DELIVERED";
    order.updatedAt = new Date().toISOString();
    (order as any).pod = podData;

    return {
      success: true,
      statusCode: 200,
      message: "Hoàn tất e-POD thành công",
      data: { ...order },
    };
  },
};
