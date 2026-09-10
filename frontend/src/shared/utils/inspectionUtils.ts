import type { Vehicle, VehicleInspectionStatus } from "@/core/types/logistics";

export interface InspectionEvaluation {
  status: VehicleInspectionStatus;
  daysRemaining: number;
  label: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isValid: boolean;
}

/**
 * Đánh giá tình trạng đăng kiểm thực tế của phương tiện
 * @param vehicle Đối tượng phương tiện cần kiểm tra
 * @param referenceDate Mốc ngày so sánh (mặc định là thời điểm hiện tại)
 */
export function evaluateVehicleInspection(
  vehicle: Pick<Vehicle, "inspectionExpiryDate">,
  referenceDate: Date = new Date()
): InspectionEvaluation {
  if (!vehicle.inspectionExpiryDate) {
    return {
      status: "VALID",
      daysRemaining: 999,
      label: "Chưa có dữ liệu",
      isExpired: false,
      isExpiringSoon: false,
      isValid: true,
    };
  }

  const expiry = new Date(vehicle.inspectionExpiryDate);
  const diffTime = expiry.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: "EXPIRED",
      daysRemaining,
      label: `Quá hạn ${Math.abs(daysRemaining)} ngày`,
      isExpired: true,
      isExpiringSoon: false,
      isValid: false,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "EXPIRING_SOON",
      daysRemaining,
      label: daysRemaining === 0 ? "Hết hạn hôm nay" : `Còn ${daysRemaining} ngày`,
      isExpired: false,
      isExpiringSoon: true,
      isValid: true,
    };
  }

  return {
    status: "VALID",
    daysRemaining,
    label: `Còn hạn (${Math.round(daysRemaining / 30)} tháng)`,
    isExpired: false,
    isExpiringSoon: false,
    isValid: true,
  };
}

/**
 * Gợi ý mốc hạn đăng kiểm tiếp theo theo chu kỳ quy định
 * @param lastDate Ngày đăng kiểm (YYYY-MM-DD)
 * @param months Số tháng chu kỳ (6, 12, 18, 24 tháng)
 */
export function calculateNextInspectionDate(lastDate: string, months: number): string {
  const d = new Date(lastDate || new Date().toISOString().slice(0, 10));
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
