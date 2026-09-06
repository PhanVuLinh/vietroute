/**
 * vietroute - Hệ thống Design Tokens cho Enterprise Logistics Platform
 */

export const THEME_TOKENS = {
  colors: {
    // Màu thương hiệu chính (Xanh Logistics tin cậy)
    brand: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#2563eb",
      600: "#1d4ed8",
      700: "#1e40af",
      800: "#1e3a8a",
      900: "#172554",
    },
    // Trạng thái vận hành
    status: {
      success: "#059669", // Giao thành công, Xe sẵn sàng
      warning: "#d97706", // Chậm chuyến, Đang bốc dỡ, Cảnh báo tải
      danger: "#dc2626",  // Giao thất bại, Sự cố xe, Mất GPS
      info: "#0284c7",    // Đang giao hàng, Thông tin tuyến
      neutral: "#64748b", // Đang chờ duyệt, Không hoạt động
    },
    // Nền giao diện vận hành
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
  },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },
  radius: {
    sm: "0.25rem",  // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem",   // 8px
    xl: "0.75rem",  // 12px
    full: "9999px",
  },
} as const;

export type ThemeTokens = typeof THEME_TOKENS;
