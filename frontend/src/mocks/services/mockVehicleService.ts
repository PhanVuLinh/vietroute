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
    let result = MOCK_VEHICLES.map((v) => ({ ...v }));

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
      data: vehicle ? { ...vehicle } : null,
    };
  },

  /** Cập nhật trạng thái xe */
  async updateVehicleStatus(
    id: string,
    status: VehicleStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Vehicle | null>> {
    await simulateLatency(options);
    const index = MOCK_VEHICLES.findIndex((v) => v.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy phương tiện để cập nhật",
        data: null,
      };
    }

    MOCK_VEHICLES[index] = {
      ...MOCK_VEHICLES[index],
      status,
    };

    return {
      success: true,
      statusCode: 200,
      message: `Đã cập nhật trạng thái phương tiện sang ${status}`,
      data: { ...MOCK_VEHICLES[index] },
    };
  },

  /** Tạo mới phương tiện */
  async createVehicle(
    data: Omit<Vehicle, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Vehicle>> {
    await simulateLatency(options);
    const newId = `veh-${Date.now()}`;
    const newVehicle: Vehicle = {
      ...data,
      id: newId,
    };
    MOCK_VEHICLES.unshift(newVehicle);
    return {
      success: true,
      statusCode: 201,
      message: "Thêm mới phương tiện thành công",
      data: newVehicle,
    };
  },

  /** Cập nhật thông tin phương tiện */
  async updateVehicle(
    id: string,
    data: Partial<Vehicle>,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Vehicle | null>> {
    await simulateLatency(options);
    const index = MOCK_VEHICLES.findIndex((v) => v.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy phương tiện",
        data: null,
      };
    }
    MOCK_VEHICLES[index] = {
      ...MOCK_VEHICLES[index],
      ...data,
    };
    return {
      success: true,
      statusCode: 200,
      message: "Cập nhật phương tiện thành công",
      data: { ...MOCK_VEHICLES[index] },
    };
  },

  /** Xóa phương tiện */
  async deleteVehicle(
    id: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const index = MOCK_VEHICLES.findIndex((v) => v.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy phương tiện để xóa",
        data: false,
      };
    }
    MOCK_VEHICLES.splice(index, 1);
    return {
      success: true,
      statusCode: 200,
      message: "Đã xóa phương tiện thành công",
      data: true,
    };
  },
};

