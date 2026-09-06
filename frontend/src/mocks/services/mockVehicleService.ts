import type { ApiResponse } from "@/core/types/api";
import type { Vehicle, VehicleStatus, VehicleType } from "@/core/types/logistics";
import { MOCK_VEHICLES } from "../data/vehicles";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface VehicleFilterParams {
  type?: VehicleType;
  status?: VehicleStatus;
  search?: string;
}

export const mockVehicleService = {
  /** Lấy danh sách phương tiện có hỗ trợ lọc */
  async getVehicles(
    params?: VehicleFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Vehicle[]>> {
    await simulateLatency(options);
    let result = [...MOCK_VEHICLES];

    if (params?.type) {
      result = result.filter((v) => v.type === params.type);
    }
    if (params?.status) {
      result = result.filter((v) => v.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.licensePlate.toLowerCase().includes(q) ||
          v.vehicleCode.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách phương tiện thành công",
      data: result,
    };
  },

  /** Lấy chi tiết phương tiện */
  async getVehicleById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Vehicle | null>> {
    await simulateLatency(options);
    const vehicle = MOCK_VEHICLES.find((v) => v.id === id) || null;
    return {
      success: Boolean(vehicle),
      statusCode: vehicle ? 200 : 404,
      message: vehicle ? "Lấy thông tin phương tiện thành công" : "Không tìm thấy phương tiện",
      data: vehicle,
    };
  },

  /** Cập nhật trạng thái xe */
  async updateVehicleStatus(
    id: string,
    status: VehicleStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Vehicle | null>> {
    await simulateLatency(options);
    const vehicle = MOCK_VEHICLES.find((v) => v.id === id);
    if (!vehicle) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy phương tiện để cập nhật",
        data: null,
      };
    }

    vehicle.status = status;
    return {
      success: true,
      statusCode: 200,
      message: `Đã cập nhật trạng thái phương tiện sang ${status}`,
      data: { ...vehicle },
    };
  },
};
