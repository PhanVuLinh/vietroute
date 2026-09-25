/**
 * vietroute - Biến môi trường và cấu hình hệ thống
 */

export const ENV = {
  /** Địa chỉ máy chủ API backend */
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",

  /** Địa chỉ máy chủ Socket.IO cho luồng Realtime GPS */
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",

  /** Chế độ dùng dữ liệu giả lập (Mock Data) - ĐÃ TẮT ĐỂ DÙNG 100% DATA THẬT TỪ POSTGRESQL & NESTJS */
  USE_MOCK: false,

  /** Thời gian timeout mặc định cho request HTTP (15 giây) */
  API_TIMEOUT_MS: 15000,

  /** Tọa độ trung tâm mặc định trên bản đồ: Hà Nội [Kinh độ, Vĩ độ] */
  MAP_DEFAULT_CENTER_HN: [105.8544, 21.0285] as [number, number],

  /** Tọa độ trung tâm TP. Hồ Chí Minh [Kinh độ, Vĩ độ] */
  MAP_DEFAULT_CENTER_HCM: [106.6297, 10.8231] as [number, number],
} as const;
