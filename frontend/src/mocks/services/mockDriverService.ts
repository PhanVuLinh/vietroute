import type { ApiResponse } from "@/core/types/api";
import type { Driver, DriverStatus } from "@/core/types/logistics";
import { MOCK_DRIVERS } from "../data/drivers";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface DriverFilterParams {
  status?: DriverStatus;
  search?: string;
}

export const mockDriverService = {
  /** Lấy danh sách tài xế có hỗ trợ lọc theo trạng thái và tìm kiếm */
  async getDrivers(
    params?: DriverFilterParams,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Driver[]>> {
    await simulateLatency(options);
    let result = MOCK_DRIVERS.map((d) => ({ ...d }));

    if (params?.status) {
      result = result.filter((d) => d.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.driverCode.toLowerCase().includes(q) ||
          d.phone.includes(q)
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách tài xế thành công",
      data: result,
    };
  },

  /** Lấy chi tiết tài xế theo ID */
  async getDriverById(id: string, options?: MockServiceOptions): Promise<ApiResponse<Driver | null>> {
    await simulateLatency(options);
    const driver = MOCK_DRIVERS.find((d) => d.id === id) || null;
    return {
      success: Boolean(driver),
      statusCode: driver ? 200 : 404,
      message: driver ? "Lấy thông tin tài xế thành công" : "Không tìm thấy tài xế",
      data: driver ? { ...driver } : null,
    };
  },

  /** Cập nhật trạng thái làm việc của tài xế */
  async updateDriverStatus(
    id: string,
    status: DriverStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Driver | null>> {
    await simulateLatency(options);
    const index = MOCK_DRIVERS.findIndex((d) => d.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy tài xế để cập nhật",
        data: null,
      };
    }

    MOCK_DRIVERS[index] = {
      ...MOCK_DRIVERS[index],
      status,
    };

    return {
      success: true,
      statusCode: 200,
      message: `Đã cập nhật trạng thái tài xế sang ${status}`,
      data: { ...MOCK_DRIVERS[index] },
    };
  },

  /** Tạo mới tài xế */
  async createDriver(
    data: Omit<Driver, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Driver>> {
    await simulateLatency(options);
    const newId = `drv-${Date.now()}`;
    const newDriver: Driver = {
      ...data,
      id: newId,
    };
    MOCK_DRIVERS.unshift(newDriver);
    return {
      success: true,
      statusCode: 201,
      message: "Tạo mới tài xế thành công",
      data: newDriver,
    };
  },

  /** Cập nhật thông tin tài xế */
  async updateDriver(
    id: string,
    data: Partial<Driver>,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Driver | null>> {
    await simulateLatency(options);
    const index = MOCK_DRIVERS.findIndex((d) => d.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy tài xế",
        data: null,
      };
    }
    MOCK_DRIVERS[index] = {
      ...MOCK_DRIVERS[index],
      ...data,
    };
    return {
      success: true,
      statusCode: 200,
      message: "Cập nhật tài xế thành công",
      data: { ...MOCK_DRIVERS[index] },
    };
  },

  /** Xóa tài xế */
  async deleteDriver(
    id: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const index = MOCK_DRIVERS.findIndex((d) => d.id === id);
    if (index === -1) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy tài xế để xóa",
        data: false,
      };
    }
    MOCK_DRIVERS.splice(index, 1);
    return {
      success: true,
      statusCode: 200,
      message: "Đã xóa tài xế thành công",
      data: true,
    };
  },
};

