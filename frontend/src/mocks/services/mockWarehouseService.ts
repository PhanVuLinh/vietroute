import type { ApiResponse } from "@/core/types/api";
import type { Warehouse } from "@/core/types/logistics";
import { MOCK_WAREHOUSES } from "../data/warehouses";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export const mockWarehouseService = {
  /** Lấy danh sách toàn bộ kho bãi & Hub trung chuyển */
  async getWarehouses(
    params?: { city?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<Warehouse[]>> {
    await simulateLatency(options);
    let result = [...MOCK_WAREHOUSES];

    if (params?.city) {
      result = result.filter((w) => w.city.toLowerCase().includes(params.city!.toLowerCase()));
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách kho bãi thành công",
      data: result,
    };
  },

  /** Lấy chi tiết kho theo ID */
  async getWarehouseById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Warehouse | null>> {
    await simulateLatency(options);
    const warehouse = MOCK_WAREHOUSES.find((w) => w.id === id) || null;
    return {
      success: Boolean(warehouse),
      statusCode: warehouse ? 200 : 404,
      message: warehouse ? "Lấy thông tin kho bãi thành công" : "Không tìm thấy kho bãi",
      data: warehouse,
    };
  },
};
