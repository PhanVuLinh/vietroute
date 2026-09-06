import type { ApiResponse } from "@/core/types/api";
import type { Route, RouteStatus } from "@/core/types/logistics";
import { MOCK_ROUTES } from "../data/routes";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface RouteFilterParams {
  status?: RouteStatus;
  driverId?: string;
  warehouseId?: string;
}

export const mockRouteService = {
  /** Lấy danh sách tuyến đường vận chuyển */
  async getRoutes(
    params?: RouteFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route[]>> {
    await simulateLatency(options);
    let result = [...MOCK_ROUTES];

    if (params?.status) {
      result = result.filter((r) => r.status === params.status);
    }
    if (params?.driverId) {
      result = result.filter((r) => r.driverId === params.driverId);
    }
    if (params?.warehouseId) {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách tuyến đường thành công",
      data: result,
    };
  },

  /** Lấy chi tiết tuyến đường bao gồm các điểm dừng (stops) */
  async getRouteById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Route | null>> {
    await simulateLatency(options);
    const route = MOCK_ROUTES.find((r) => r.id === id || r.routeCode === id) || null;
    return {
      success: Boolean(route),
      statusCode: route ? 200 : 404,
      message: route ? "Lấy chi tiết tuyến đường thành công" : "Không tìm thấy tuyến đường",
      data: route,
    };
  },
};
