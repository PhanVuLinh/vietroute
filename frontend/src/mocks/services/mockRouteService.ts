import type { ApiResponse } from "@/core/types/api";
import type { Route, RouteStatus, RouteStop, RouteStopStatus } from "@/core/types/logistics";
import { MOCK_ROUTES } from "../data/routes";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface RouteFilterParams {
  status?: RouteStatus | "ALL";
  driverId?: string;
  warehouseId?: string;
  searchQuery?: string;
}

let routesInMemory: Route[] = [...MOCK_ROUTES];

export const mockRouteService = {
  /** Lấy danh sách tuyến đường vận chuyển */
  async getRoutes(
    params?: RouteFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route[]>> {
    await simulateLatency(options);
    let result = [...routesInMemory];

    if (params?.status && params.status !== "ALL") {
      result = result.filter((r) => r.status === params.status);
    }
    if (params?.driverId && params.driverId !== "ALL") {
      result = result.filter((r) => r.driverId === params.driverId);
    }
    if (params?.warehouseId && params.warehouseId !== "ALL") {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.routeCode.toLowerCase().includes(q) ||
          (r.routeName || "").toLowerCase().includes(q)
      );
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
    const route = routesInMemory.find((r) => r.id === id || r.routeCode === id) || null;
    return {
      success: Boolean(route),
      statusCode: route ? 200 : 404,
      message: route ? "Lấy chi tiết tuyến đường thành công" : "Không tìm thấy tuyến đường",
      data: route ? { ...route } : null,
    };
  },

  /** Tạo tuyến đường mới */
  async createRoute(
    data: Omit<Route, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route>> {
    await simulateLatency(options);
    const id = `route-${Date.now()}`;
    const newRoute: Route = {
      ...data,
      id,
    };
    routesInMemory = [newRoute, ...routesInMemory];
    return {
      success: true,
      statusCode: 201,
      message: `Lập tuyến đường ${newRoute.routeCode} thành công`,
      data: { ...newRoute },
    };
  },

  /** Cập nhật tuyến đường */
  async updateRoute(
    id: string,
    data: Partial<Route>,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route>> {
    await simulateLatency(options);
    const idx = routesInMemory.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy tuyến đường với ID: ${id}`);
    }
    const updated: Route = {
      ...routesInMemory[idx],
      ...data,
    };
    routesInMemory = [
      ...routesInMemory.slice(0, idx),
      updated,
      ...routesInMemory.slice(idx + 1),
    ];
    return {
      success: true,
      statusCode: 200,
      message: "Cập nhật tuyến đường thành công",
      data: { ...updated },
    };
  },

  /** Cập nhật trạng thái toàn tuyến */
  async updateRouteStatus(
    id: string,
    status: RouteStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route>> {
    await simulateLatency(options);
    const idx = routesInMemory.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy tuyến đường với ID: ${id}`);
    }
    const now = new Date().toISOString();
    const updated: Route = {
      ...routesInMemory[idx],
      status,
      startedAt: status === "ACTIVE" && !routesInMemory[idx].startedAt ? now : routesInMemory[idx].startedAt,
      completedAt: status === "COMPLETED" ? now : routesInMemory[idx].completedAt,
    };
    routesInMemory = [
      ...routesInMemory.slice(0, idx),
      updated,
      ...routesInMemory.slice(idx + 1),
    ];
    return {
      success: true,
      statusCode: 200,
      message: `Đổi trạng thái tuyến thành ${status}`,
      data: { ...updated },
    };
  },

  /** Cập nhật trạng thái điểm dừng (Stop) */
  async updateStopStatus(
    routeId: string,
    stopId: string,
    status: RouteStopStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Route>> {
    await simulateLatency(options);
    const routeIdx = routesInMemory.findIndex((r) => r.id === routeId);
    if (routeIdx === -1) {
      throw new Error(`Không tìm thấy tuyến đường với ID: ${routeId}`);
    }
    const route = routesInMemory[routeIdx];
    const now = new Date().toISOString();

    const updatedStops = (route.stops || []).map((s) => {
      if (s.id === stopId) {
        return {
          ...s,
          status,
          actualArrival: status === "ARRIVED" || status === "COMPLETED" ? now : s.actualArrival,
        };
      }
      return s;
    });

    // Tự động hoàn thành tuyến nếu tất cả điểm dừng đã giao xong
    const allDone = updatedStops.every((s) => s.status === "COMPLETED" || s.status === "SKIPPED");
    const updatedRoute: Route = {
      ...route,
      stops: updatedStops,
      status: allDone && route.status === "ACTIVE" ? "COMPLETED" : route.status,
      completedAt: allDone ? now : route.completedAt,
    };

    routesInMemory = [
      ...routesInMemory.slice(0, routeIdx),
      updatedRoute,
      ...routesInMemory.slice(routeIdx + 1),
    ];

    return {
      success: true,
      statusCode: 200,
      message: "Cập nhật tiến độ chặng dừng thành công",
      data: { ...updatedRoute },
    };
  },

  /** Xóa tuyến đường */
  async deleteRoute(id: string, options?: MockServiceOptions): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    routesInMemory = routesInMemory.filter((r) => r.id !== id);
    return {
      success: true,
      statusCode: 200,
      message: "Xóa tuyến đường thành công",
      data: true,
    };
  },

  /** Thuật toán Tối ưu hóa thứ tự chặng dừng (Nearest-Neighbor Traveling Salesperson TSP) */
  async optimizeStops(
    originCoords: [number, number],
    stops: RouteStop[],
    options?: MockServiceOptions
  ): Promise<ApiResponse<RouteStop[]>> {
    await simulateLatency(options);

    // Thuật toán Greedy Nearest Neighbor: tìm điểm gần nhất kế tiếp
    let currentPoint = originCoords;
    const remaining = [...stops];
    const optimized: RouteStop[] = [];

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const s = remaining[i];
        // Tính khoảng cách Euclidean xấp xỉ
        const d = Math.sqrt(
          Math.pow(s.longitude - currentPoint[0], 2) +
          Math.pow(s.latitude - currentPoint[1], 2)
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }

      const nextStop = remaining.splice(nearestIdx, 1)[0];
      currentPoint = [nextStop.longitude, nextStop.latitude];
      optimized.push({
        ...nextStop,
        sequence: optimized.length + 1,
      });
    }

    return {
      success: true,
      statusCode: 200,
      message: "Đã tối ưu thứ tự lộ trình giao hàng thành công (Giảm 18-25% quãng đường)",
      data: optimized,
    };
  },
};
