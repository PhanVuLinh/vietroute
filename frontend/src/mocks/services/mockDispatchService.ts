import type { ApiResponse } from "@/core/types/api";
import type { AssignmentType, DriverAssignment } from "@/core/types/logistics";
import { MOCK_ASSIGNMENTS } from "../data/assignments";
import { MOCK_DELIVERIES } from "../data/deliveries";
import { MOCK_DRIVERS } from "../data/drivers";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export const mockDispatchService = {
  /** Lấy danh sách toàn bộ các lượt phân công */
  async getAssignments(options?: MockServiceOptions): Promise<ApiResponse<DriverAssignment[]>> {
    await simulateLatency(options);
    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách phân công thành công",
      data: MOCK_ASSIGNMENTS,
    };
  },

  /** Thực hiện phân bổ đơn hàng cho tài xế và phương tiện */
  async assignDelivery(
    deliveryId: string,
    driverId: string,
    vehicleId: string,
    assignmentType: AssignmentType = "MANUAL",
    options?: MockServiceOptions
  ): Promise<ApiResponse<DriverAssignment>> {
    await simulateLatency(options);

    const delivery = MOCK_DELIVERIES.find((d) => d.id === deliveryId);
    if (delivery) {
      delivery.driverId = driverId;
      delivery.vehicleId = vehicleId;
      delivery.status = "ASSIGNED";
      delivery.updatedAt = new Date().toISOString();
    }

    const driver = MOCK_DRIVERS.find((d) => d.id === driverId);
    if (driver) {
      driver.status = "BUSY";
      driver.currentDeliveryCount += 1;
    }

    const newAssignment: DriverAssignment = {
      id: `asg-${Date.now()}`,
      deliveryId,
      driverId,
      vehicleId,
      score: assignmentType === "AI_RECOMMENDED" ? 95 : 85,
      assignmentType,
      assignedAt: new Date().toISOString(),
    };

    MOCK_ASSIGNMENTS.unshift(newAssignment);

    return {
      success: true,
      statusCode: 201,
      message: "Phân bổ đơn hàng cho tài xế thành công",
      data: newAssignment,
    };
  },

  /** Phân bổ tự động hàng loạt */
  async autoDispatchBatch(options?: MockServiceOptions): Promise<ApiResponse<{ assignedCount: number; assignments: any[]; message: string }>> {
    await simulateLatency(options);
    return {
      success: true,
      statusCode: 200,
      message: "Đã phân bổ tự động thành công",
      data: {
        assignedCount: 3,
        assignments: [],
        message: "Đã phân công tự động 3 đơn hàng",
      },
    };
  },
};
