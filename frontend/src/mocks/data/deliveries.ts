import type { Delivery, DeliveryStatus } from "@/core/types/logistics";
import { MOCK_ORDERS } from "./orders";
import { MOCK_DRIVERS } from "./drivers";
import { MOCK_VEHICLES } from "./vehicles";

// Ánh xạ trạng thái Order sang trạng thái Delivery tương ứng
function mapOrderStatusToDeliveryStatus(orderStatus: string, index: number): DeliveryStatus {
  switch (orderStatus) {
    case "PENDING":
      return "PENDING";
    case "CONFIRMED":
      return "PENDING";
    case "ASSIGNED":
      return index % 2 === 0 ? "ASSIGNED" : "ACCEPTED";
    case "PICKING_UP":
      return "PICKING_UP";
    case "IN_TRANSIT":
      return index % 3 === 0 ? "ARRIVED" : "IN_TRANSIT";
    case "DELIVERED":
      return "DELIVERED";
    case "FAILED":
      return index % 2 === 0 ? "DELIVERY_FAILED" : "RETURNING";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function generateMockDeliveries(): Delivery[] {
  const deliveries: Delivery[] = [];

  MOCK_ORDERS.forEach((order, idx) => {
    const paddedId = (idx + 1).toString().padStart(3, "0");
    const deliveryCode = `DEL-2026-${paddedId}`;
    const status = mapOrderStatusToDeliveryStatus(order.status, idx);

    let driverId: string | undefined;
    let vehicleId: string | undefined;
    let startedAt: string | undefined;
    let completedAt: string | undefined;
    let failedReason: string | undefined;

    // Nếu đơn đã phân công trở đi thì gán tài xế và xe thích hợp
    if (status !== "PENDING" && status !== "CANCELLED") {
      // Chọn tài xế theo khu vực kho của đơn hàng
      let driver: (typeof MOCK_DRIVERS)[number];
      if (order.warehouseId === "wh-hcm-cl" || order.warehouseId === "wh-hcm-tb") {
        driver = MOCK_DRIVERS[4 + (idx % 3)]; // Tài xế TP.HCM
      } else if (order.warehouseId === "wh-dad-hc") {
        driver = MOCK_DRIVERS[8 + (idx % 2)]; // Tài xế Đà Nẵng
      } else if (order.warehouseId === "wh-qng-qn") {
        driver = MOCK_DRIVERS[11]; // Tài xế Quảng Ngãi
      } else if (order.warehouseId === "wh-ct-cr") {
        driver = MOCK_DRIVERS[13]; // Tài xế Cần Thơ
      } else {
        driver = MOCK_DRIVERS[idx % 3]; // Tài xế Hà Nội
      }

      driverId = driver.id;
      vehicleId = driver.currentVehicleId || MOCK_VEHICLES[idx % MOCK_VEHICLES.length].id;
      startedAt = `2026-09-06T08:${(15 + (idx % 40)).toString().padStart(2, "0")}:00Z`;

      if (status === "DELIVERED") {
        completedAt = `2026-09-06T10:${(20 + (idx % 35)).toString().padStart(2, "0")}:00Z`;
      } else if (status === "DELIVERY_FAILED" || status === "RETURNING") {
        failedReason = idx % 2 === 0
          ? "Khách hàng không nghe máy sau 3 lần gọi"
          : "Khách hàng dời lịch nhận hàng sang ngày mai";
      }
    }

    deliveries.push({
      id: `del-${paddedId}`,
      deliveryCode,
      orderId: order.id,
      driverId,
      vehicleId,
      status,
      startedAt,
      completedAt,
      failedReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });

  return deliveries;
}

export const MOCK_DELIVERIES: Delivery[] = generateMockDeliveries();
