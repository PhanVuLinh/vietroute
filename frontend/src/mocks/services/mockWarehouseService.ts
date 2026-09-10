import type { ApiResponse } from "@/core/types/api";
import type { Warehouse, WarehouseStatus, WarehouseRegion, WarehouseType } from "@/core/types/logistics";
import { MOCK_WAREHOUSES } from "../data/warehouses";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface WarehouseFilterParams {
  city?: string;
  region?: WarehouseRegion | "ALL";
  type?: WarehouseType | "ALL";
  status?: WarehouseStatus | "ALL";
}

let warehousesInMemory: Warehouse[] = [...MOCK_WAREHOUSES];

export const mockWarehouseService = {
  /** Lấy danh sách toàn bộ kho bãi & Hub trung chuyển */
  async getWarehouses(
    params?: WarehouseFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Warehouse[]>> {
    await simulateLatency(options);
    let result = [...warehousesInMemory];

    if (params?.city) {
      result = result.filter((w) => w.city.toLowerCase().includes(params.city!.toLowerCase()));
    }
    if (params?.region && params.region !== "ALL") {
      result = result.filter((w) => w.region === params.region);
    }
    if (params?.type && params.type !== "ALL") {
      result = result.filter((w) => w.type === params.type);
    }
    if (params?.status && params.status !== "ALL") {
      result = result.filter((w) => w.status === params.status);
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
    const warehouse = warehousesInMemory.find((w) => w.id === id) || null;
    return {
      success: Boolean(warehouse),
      statusCode: warehouse ? 200 : 404,
      message: warehouse ? "Lấy thông tin kho bãi thành công" : "Không tìm thấy kho bãi",
      data: warehouse ? { ...warehouse } : null,
    };
  },

  /** Tạo mới kho bãi */
  async createWarehouse(
    data: Omit<Warehouse, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Warehouse>> {
    await simulateLatency(options);
    const id = `wh-${Date.now()}`;
    const newWarehouse: Warehouse = {
      ...data,
      id,
    };
    warehousesInMemory = [newWarehouse, ...warehousesInMemory];
    return {
      success: true,
      statusCode: 201,
      message: `Đăng ký kho bãi ${newWarehouse.name} thành công`,
      data: { ...newWarehouse },
    };
  },

  /** Cập nhật thông tin kho */
  async updateWarehouse(
    id: string,
    data: Partial<Warehouse>,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Warehouse>> {
    await simulateLatency(options);
    const idx = warehousesInMemory.findIndex((w) => w.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy kho bãi với ID: ${id}`);
    }
    const updated: Warehouse = {
      ...warehousesInMemory[idx],
      ...data,
    };
    warehousesInMemory = [
      ...warehousesInMemory.slice(0, idx),
      updated,
      ...warehousesInMemory.slice(idx + 1),
    ];
    return {
      success: true,
      statusCode: 200,
      message: `Cập nhật thông tin kho ${updated.name} thành công`,
      data: { ...updated },
    };
  },

  /** Cập nhật nhanh trạng thái kho */
  async updateWarehouseStatus(
    id: string,
    status: WarehouseStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Warehouse>> {
    await simulateLatency(options);
    const idx = warehousesInMemory.findIndex((w) => w.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy kho bãi với ID: ${id}`);
    }
    const updated: Warehouse = {
      ...warehousesInMemory[idx],
      status,
    };
    warehousesInMemory = [
      ...warehousesInMemory.slice(0, idx),
      updated,
      ...warehousesInMemory.slice(idx + 1),
    ];
    return {
      success: true,
      statusCode: 200,
      message: `Cập nhật trạng thái kho ${updated.name} thành ${status}`,
      data: { ...updated },
    };
  },

  /** Xóa kho bãi */
  async deleteWarehouse(id: string, options?: MockServiceOptions): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const idx = warehousesInMemory.findIndex((w) => w.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy kho bãi với ID: ${id}`);
    }
    warehousesInMemory = warehousesInMemory.filter((w) => w.id !== id);
    return {
      success: true,
      statusCode: 200,
      message: "Xóa kho bãi thành công",
      data: true,
    };
  },
};

