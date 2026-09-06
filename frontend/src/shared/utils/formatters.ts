/**
 * vietroute - Các hàm tiện ích định dạng dữ liệu chuẩn Việt Nam & Logistics
 */

/**
 * Định dạng số tiền Việt Nam Đồng (VNĐ)
 * @example formatCurrency(1500000) => "1.500.000 ₫"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Định dạng ngày giờ chuẩn Việt Nam (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return "--/--/---- --:--";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--/--/---- --:--";

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Định dạng chỉ ngày (dd/MM/yyyy)
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "--/--/----";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--/--/----";

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Định dạng chỉ giờ (HH:mm)
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (!date) return "--:--";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--:--";

  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Định dạng khoảng cách kilomet
 * @example formatDistance(12.45) => "12,5 km"
 */
export function formatDistance(km: number, decimals: number = 1): string {
  if (isNaN(km)) return "0 km";
  const formatted = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(km);
  return `${formatted} km`;
}

/**
 * Định dạng khối lượng / tải trọng (tự động chuyển sang 'tấn' nếu >= 1000 kg)
 * @example formatWeight(850) => "850 kg", formatWeight(2500) => "2,5 tấn"
 */
export function formatWeight(kg: number): string {
  if (isNaN(kg)) return "0 kg";
  if (kg >= 1000) {
    const tons = kg / 1000;
    const formatted = new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(tons);
    return `${formatted} tấn`;
  }
  return `${new Intl.NumberFormat("vi-VN").format(kg)} kg`;
}

/**
 * Định dạng thể tích thùng hàng (m³)
 * @example formatVolume(12.5) => "12,5 m³"
 */
export function formatVolume(m3: number, decimals: number = 1): string {
  if (isNaN(m3)) return "0 m³";
  const formatted = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(m3);
  return `${formatted} m³`;
}

/**
 * Định dạng tỷ lệ phần trăm
 * @example formatPercent(98.54) => "98,5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value)) return "0%";
  const formatted = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${formatted}%`;
}

/**
 * Debounce hàm thực thi chống spam
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}
