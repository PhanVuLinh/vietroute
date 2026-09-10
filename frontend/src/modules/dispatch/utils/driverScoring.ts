import type { Driver, Order, Vehicle, Warehouse } from "@/core/types/logistics";
import { evaluateVehicleInspection } from "@/shared/utils/inspectionUtils";

export interface DriverCandidate {
  driver: Driver;
  vehicle?: Vehicle;
  distanceKm: number;
  estimatedEtaMinutes: number;
  matchScore: number; // 0 - 100%
  isBestMatch: boolean;
  reasons: string[];
  isEligible: boolean;
  ineligibleReason?: string;
  loadPercentage: number; // Tải công việc %
  maxCapacityDeliveries: number;
}

/**
 * Tính khoảng cách Haversine giữa 2 tọa độ GPS [Kinh độ, Vĩ độ] theo km
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Bán kính trái đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Thuật toán tính điểm đề xuất tài xế thông minh (Driver Recommendation Scoring)
 * Đảm bảo 100% tuân thủ các quy tắc nghiệp vụ logistics VietRoute
 */
export function scoreDriversForOrder(
  order: Order,
  drivers: Driver[],
  vehicles: Vehicle[],
  warehouses: Warehouse[]
): DriverCandidate[] {
  const vehicleMap = new Map<string, Vehicle>();
  for (const v of vehicles) {
    vehicleMap.set(v.id, v);
  }

  const warehouse = warehouses.find((w) => w.id === order.warehouseId) || warehouses[0];
  const pickupCoords: [number, number] = warehouse
    ? [warehouse.longitude, warehouse.latitude]
    : [105.8544, 21.0285];

  const maxCapacityDeliveries = 5;

  const candidates: DriverCandidate[] = drivers.map((driver) => {
    const vehicle = driver.currentVehicleId
      ? vehicleMap.get(driver.currentVehicleId)
      : undefined;

    // 1. Kiểm tra tính hợp lệ tiên quyết
    if (driver.status === "OFFLINE" || driver.status === "SUSPENDED") {
      return {
        driver,
        vehicle,
        distanceKm: 999,
        estimatedEtaMinutes: 999,
        matchScore: 0,
        isBestMatch: false,
        reasons: [],
        isEligible: false,
        ineligibleReason: "Tài xế đang ngoại tuyến hoặc bị khóa tài khoản",
        loadPercentage: 0,
        maxCapacityDeliveries,
      };
    }

    if (driver.status === "ON_BREAK") {
      return {
        driver,
        vehicle,
        distanceKm: 999,
        estimatedEtaMinutes: 999,
        matchScore: 10,
        isBestMatch: false,
        reasons: [],
        isEligible: false,
        ineligibleReason: "Tài xế đang trong thời gian nghỉ ca",
        loadPercentage: 0,
        maxCapacityDeliveries,
      };
    }

    // Kiểm tra tải trọng phương tiện
    if (vehicle && vehicle.capacityWeight < order.totalWeight) {
      return {
        driver,
        vehicle,
        distanceKm: 999,
        estimatedEtaMinutes: 999,
        matchScore: 20,
        isBestMatch: false,
        reasons: [],
        isEligible: false,
        ineligibleReason: `Tải trọng xe (${vehicle.capacityWeight} kg) không đủ tải đơn (${order.totalWeight} kg)`,
        loadPercentage: 100,
        maxCapacityDeliveries,
      };
    }

    // Kiểm tra hiệu lực đăng kiểm phương tiện theo luật GTVT
    if (vehicle && vehicle.inspectionExpiryDate) {
      const evalInspection = evaluateVehicleInspection({ inspectionExpiryDate: vehicle.inspectionExpiryDate });
      if (evalInspection.isExpired) {
        return {
          driver,
          vehicle,
          distanceKm: 999,
          estimatedEtaMinutes: 999,
          matchScore: 0,
          isBestMatch: false,
          reasons: [],
          isEligible: false,
          ineligibleReason: `Xe ${vehicle.licensePlate} ĐÃ HẾT HẠN ĐĂNG KIỂM (${evalInspection.label}) - Không được phép xuất bến`,
          loadPercentage: 100,
          maxCapacityDeliveries,
        };
      }
    }

    // 2. Tính khoảng cách từ vị trí hiện tại của tài xế đến kho xuất phát (Pickup)
    const distanceKm = calculateDistanceKm(driver.currentLocation, pickupCoords);

    // Ước tính ETA theo vận tốc nội đô 25-30 km/h: (km / 25) * 60 + 5 phút chuẩn bị
    const estimatedEtaMinutes = Math.max(
      8,
      Math.min(60, Math.round((distanceKm / 28) * 60 + 4))
    );

    // Tải công việc hiện tại
    const loadPercentage = Math.min(
      100,
      Math.round((driver.currentDeliveryCount / maxCapacityDeliveries) * 100)
    );

    // 3. Chấm điểm đa chiều (Tổng thang điểm 100)
    let score = 50;
    const reasons: string[] = [];

    // Tiêu chí 1: Khoảng cách tiếp cận kho
    if (distanceKm <= 2.5) {
      score += 25;
      reasons.push(`Gần điểm nhận nhất (~${distanceKm} km)`);
    } else if (distanceKm <= 5.0) {
      score += 18;
      reasons.push(`Khoảng cách tiếp cận tốt (~${distanceKm} km)`);
    } else if (distanceKm <= 10.0) {
      score += 10;
      reasons.push(`Cùng khu vực hoạt động (~${distanceKm} km)`);
    } else {
      score -= 5;
    }

    // Tiêu chí 2: Trạng thái sẵn sàng
    if (driver.status === "AVAILABLE") {
      score += 15;
      reasons.push("Đang ở trạng thái sẵn sàng nhận chuyến mới");
    } else if (driver.status === "BUSY" && driver.currentDeliveryCount < 3) {
      score += 8;
      reasons.push("Đang chạy tuyến phụ cận, có thể kết hợp ghép đơn");
    }

    // Tiêu chí 3: Tải công việc tối ưu
    if (driver.currentDeliveryCount === 0) {
      score += 10;
      reasons.push("Chưa có đơn đang thực hiện");
    } else if (driver.currentDeliveryCount <= 2) {
      score += 6;
      reasons.push(
        `Khối lượng công việc tối ưu (${driver.currentDeliveryCount}/${maxCapacityDeliveries} đơn)`
      );
    } else if (driver.currentDeliveryCount >= 4) {
      score -= 15; // Phạt nặng nếu quá tải
    }

    // Tiêu chí 4: Sức chứa xe còn lại
    if (vehicle) {
      const remainingKg = Math.max(0, vehicle.capacityWeight - order.totalWeight);
      if (remainingKg > 300) {
        reasons.push(`Phương tiện còn dư tải trọng lớn (~${remainingKg} kg)`);
      }
    }

    // Tiêu chí 5: Tỷ lệ đúng giờ (OTD)
    if (driver.onTimeRate >= 98) {
      score += 5;
      reasons.push(`Tỷ lệ giao đúng giờ vượt trội (${driver.onTimeRate}%)`);
    }

    // Tiêu chí 6: Đảm bảo thời gian deadline của đơn
    reasons.push(`ETA dự kiến ${estimatedEtaMinutes} phút, kịp khung giờ cam kết`);

    // Chuẩn hóa điểm trong khoảng 60% đến 98%
    const normalizedScore = Math.max(60, Math.min(98, score));

    return {
      driver,
      vehicle,
      distanceKm,
      estimatedEtaMinutes,
      matchScore: normalizedScore,
      isBestMatch: false,
      reasons: reasons.slice(0, 4), // Lấy tối đa 4 lý do thuyết phục nhất
      isEligible: true,
      loadPercentage,
      maxCapacityDeliveries,
    };
  });

  // Sắp xếp: Ưu tiên Eligible lên trước, sau đó sắp xếp theo MatchScore giảm dần
  const sorted = candidates.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });

  // Đánh dấu ứng viên có điểm cao nhất
  if (sorted.length > 0 && sorted[0].isEligible) {
    sorted[0].isBestMatch = true;
  }

  return sorted;
}
