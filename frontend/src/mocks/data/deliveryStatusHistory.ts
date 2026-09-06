import type { DeliveryStatus, DeliveryStatusHistoryItem } from "@/core/types/logistics";
import { MOCK_DELIVERIES } from "./deliveries";

const STATUS_PROGRESSION: { status: DeliveryStatus; description: string; minuteOffset: number }[] = [
  { status: "PENDING", description: "Đơn hàng tiếp nhận vào hệ thống VietRoute, đang chờ phân bổ xe", minuteOffset: 0 },
  { status: "ASSIGNED", description: "Điều phối viên đã chỉ định tài xế và phương tiện vận chuyển", minuteOffset: 25 },
  { status: "ACCEPTED", description: "Tài xế đã xác nhận tiếp nhận đơn trên ứng dụng", minuteOffset: 38 },
  { status: "PICKING_UP", description: "Tài xế đã đến kho trung tâm, đang kiểm đếm và bốc dỡ hàng lên xe", minuteOffset: 65 },
  { status: "IN_TRANSIT", description: "Hàng đã xuất kho, phương tiện đang di chuyển trên tuyến đường giao", minuteOffset: 95 },
  { status: "ARRIVED", description: "Phương tiện đã đến địa chỉ nhận của khách hàng", minuteOffset: 125 },
  { status: "DELIVERED", description: "Giao hàng thành công, khách hàng đã ký nhận và thanh toán tiền thu hộ", minuteOffset: 140 },
];

function generateMockHistory(): DeliveryStatusHistoryItem[] {
  const history: DeliveryStatusHistoryItem[] = [];

  MOCK_DELIVERIES.forEach((delivery) => {
    const baseTime = new Date(delivery.createdAt).getTime();

    // Tìm vị trí của status hiện tại trong chuỗi tiến trình chuẩn
    let targetIndex = STATUS_PROGRESSION.findIndex((item) => item.status === delivery.status);
    
    // Xử lý các trạng thái nhánh (FAILED, RETURNING, CANCELLED)
    if (delivery.status === "DELIVERY_FAILED") {
      targetIndex = 5; // Đến bước ARRIVED rồi FAILED
    } else if (delivery.status === "RETURNING") {
      targetIndex = 5; // Đến bước ARRIVED rồi RETURNING
    } else if (delivery.status === "CANCELLED") {
      targetIndex = 1; // Hủy ở giai đoạn đầu
    }

    if (targetIndex < 0) targetIndex = 0;

    // Sinh các bước lịch sử tuần tự đến mốc hiện tại
    for (let i = 0; i <= targetIndex; i++) {
      const step = STATUS_PROGRESSION[i];
      const stepTime = new Date(baseTime + step.minuteOffset * 60 * 1000).toISOString();

      history.push({
        id: `hist-${delivery.id}-${i + 1}`,
        deliveryId: delivery.id,
        status: step.status,
        timestamp: stepTime,
        description: step.description,
      });
    }

    // Nếu là trạng thái thất bại thì thêm bước thất bại cụ thể
    if (delivery.status === "DELIVERY_FAILED") {
      history.push({
        id: `hist-${delivery.id}-fail`,
        deliveryId: delivery.id,
        status: "DELIVERY_FAILED",
        timestamp: new Date(baseTime + 135 * 60 * 1000).toISOString(),
        description: `Giao hàng không thành công: ${delivery.failedReason || "Lý do bất khả kháng"}`,
      });
    } else if (delivery.status === "RETURNING") {
      history.push({
        id: `hist-${delivery.id}-return`,
        deliveryId: delivery.id,
        status: "RETURNING",
        timestamp: new Date(baseTime + 145 * 60 * 1000).toISOString(),
        description: "Hàng đang được chuyển hoàn về kho xuất phát",
      });
    }
  });

  return history;
}

export const MOCK_DELIVERY_HISTORY: DeliveryStatusHistoryItem[] = generateMockHistory();
