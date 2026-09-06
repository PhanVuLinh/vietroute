import type { AssignmentType, DriverAssignment } from "@/core/types/logistics";
import { MOCK_DELIVERIES } from "./deliveries";

const ASSIGNMENT_TYPES: AssignmentType[] = ["AI_RECOMMENDED", "RULE_BASED", "MANUAL", "AI_RECOMMENDED"];

function generateMockAssignments(): DriverAssignment[] {
  const assignments: DriverAssignment[] = [];

  // Chỉ tạo assignment cho các delivery có driverId
  const assignedDeliveries = MOCK_DELIVERIES.filter((d) => d.driverId && d.vehicleId);

  assignedDeliveries.forEach((delivery, idx) => {
    const paddedId = (idx + 1).toString().padStart(3, "0");
    const assignmentType = ASSIGNMENT_TYPES[idx % ASSIGNMENT_TYPES.length];
    const score = assignmentType === "AI_RECOMMENDED" 
      ? 92 + (idx % 8) 
      : (assignmentType === "RULE_BASED" ? 85 + (idx % 10) : 75 + (idx % 15));

    const assignedAt = delivery.startedAt || delivery.createdAt;
    const acceptedAt = delivery.status !== "PENDING" ? new Date(new Date(assignedAt).getTime() + 12 * 60 * 1000).toISOString() : undefined;

    assignments.push({
      id: `asg-${paddedId}`,
      deliveryId: delivery.id,
      driverId: delivery.driverId!,
      vehicleId: delivery.vehicleId!,
      score,
      assignmentType,
      assignedAt,
      acceptedAt,
    });
  });

  // Thêm 2 bản ghi từ chối để kiểm thử các trường hợp từ chối gán đơn (Rejection reason)
  assignments.push({
    id: "asg-rej-01",
    deliveryId: "del-012",
    driverId: "drv-04",
    vehicleId: "veh-04",
    score: 78,
    assignmentType: "MANUAL",
    assignedAt: "2026-09-06T07:45:00Z",
    rejectedAt: "2026-09-06T07:55:00Z",
    rejectionReason: "Tài xế đang trong ca nghỉ theo quy định an toàn",
  });

  assignments.push({
    id: "asg-rej-02",
    deliveryId: "del-019",
    driverId: "drv-10",
    vehicleId: "veh-10",
    score: 81,
    assignmentType: "AI_RECOMMENDED",
    assignedAt: "2026-09-06T08:10:00Z",
    rejectedAt: "2026-09-06T08:18:00Z",
    rejectionReason: "Phương tiện chưa hoàn tất thủ tục bốc hàng chuyến trước",
  });

  return assignments;
}

export const MOCK_ASSIGNMENTS: DriverAssignment[] = generateMockAssignments();
