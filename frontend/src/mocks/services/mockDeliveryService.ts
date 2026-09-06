import type { ApiPaginatedResponse, ApiResponse } from "@/core/types/api";
import type { Delivery, DeliveryStatus, DeliveryStatusHistoryItem } from "@/core/types/logistics";
import { MOCK_DELIVERIES } from "../data/deliveries";
import { MOCK_DELIVERY_HISTORY } from "../data/deliveryStatusHistory";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface DeliveryFilterParams {
  status?: DeliveryStatus;
  driverId?: string;
  vehicleId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const mockDeliveryService = {
  /** Lấy danh sách chuyến giao có phân trang */
  async getDeliveries(
    params?: DeliveryFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiPaginatedResponse<Delivery>> {
    await simulateLatency(options);
    let filtered = [...MOCK_DELIVERIES];

    if (params?.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }
    if (params?.driverId) {
      filtered = filtered.filter((d) => d.driverId === params.driverId);
    }
    if (params?.vehicleId) {
      filtered = filtered.filter((d) => d.vehicleId === params.vehicleId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.deliveryCode.toLowerCase().includes(q) ||
          d.orderId.toLowerCase().includes(q)
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
      message: "Lấy danh sách chuyến giao thành công",
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  },

  /** Lấy chi tiết chuyến giao theo ID */
  async getDeliveryById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Delivery | null>> {
    await simulateLatency(options);
    const delivery = MOCK_DELIVERIES.find((d) => d.id === id || d.deliveryCode === id) || null;
    return {
      success: Boolean(delivery),
      statusCode: delivery ? 200 : 404,
      message: delivery ? "Lấy thông tin chuyến giao thành công" : "Không tìm thấy chuyến giao",
      data: delivery,
    };
  },

  /** Lấy dòng thời gian lịch sử trạng thái của chuyến giao */
  async getDeliveryHistory(
    deliveryId: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<DeliveryStatusHistoryItem[]>> {
    await simulateLatency(options);
    const history = MOCK_DELIVERY_HISTORY.filter((h) => h.deliveryId === deliveryId);
    return {
      success: true,
      statusCode: 200,
      message: "Lấy lịch sử trạng thái thành công",
      data: history,
    };
  },

  /** Cập nhật trạng thái chuyến giao */
  async updateDeliveryStatus(
    id: string,
    status: DeliveryStatus,
    note?: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Delivery | null>> {
    await simulateLatency(options);
    const delivery = MOCK_DELIVERIES.find((d) => d.id === id);
    if (!delivery) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy chuyến giao để cập nhật",
        data: null,
      };
    }

    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();

    if (status === "DELIVERED") {
      delivery.completedAt = delivery.updatedAt;
    }

    // Tự động ghi nhận bước lịch sử mới
    MOCK_DELIVERY_HISTORY.push({
      id: `hist-${delivery.id}-${Date.now()}`,
      deliveryId: delivery.id,
      status,
      timestamp: delivery.updatedAt,
      description: note || `Cập nhật trạng thái thủ công sang ${status}`,
    });

    return {
      success: true,
      statusCode: 200,
      message: `Đã cập nhật trạng thái chuyến giao sang ${status}`,
      data: { ...delivery },
    };
  },
};
