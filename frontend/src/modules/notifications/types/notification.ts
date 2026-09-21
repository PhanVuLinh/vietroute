import type { NotificationType } from "@/core/types/logistics";

/**
 * Phân loại nhóm thông báo để filter
 */
export type NotificationCategory =
  | "ALL"
  | "ORDER"       // ORDER_CREATED, ORDER_ASSIGNED, ORDER_ACCEPTED
  | "DELIVERY"    // DELIVERY_SUCCESS, DELIVERY_FAILED
  | "ALERT"       // LATE_WARNING, GPS_ALERT, VEHICLE_ALERT
  | "SYSTEM";     // Thông báo hệ thống chung

/**
 * Tab hiển thị trên trang thông báo
 */
export type NotificationTab = "ALL" | "UNREAD" | "ALERTS";

/**
 * Mapping notification type → category
 */
export const NOTIFICATION_CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
  ORDER_CREATED: "ORDER",
  ORDER_ASSIGNED: "ORDER",
  ORDER_ACCEPTED: "ORDER",
  DELIVERY_SUCCESS: "DELIVERY",
  DELIVERY_FAILED: "DELIVERY",
  LATE_WARNING: "ALERT",
  GPS_ALERT: "ALERT",
  VEHICLE_ALERT: "ALERT",
};

/**
 * Metadata cho mỗi category
 */
export const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; color: string }
> = {
  ALL: { label: "Tất cả", color: "text-foreground" },
  ORDER: { label: "Đơn hàng", color: "text-emerald-600 dark:text-emerald-400" },
  DELIVERY: { label: "Giao hàng", color: "text-blue-600 dark:text-blue-400" },
  ALERT: { label: "Cảnh báo", color: "text-rose-600 dark:text-rose-400" },
  SYSTEM: { label: "Hệ thống", color: "text-violet-600 dark:text-violet-400" },
};

/**
 * Bộ lọc thông báo
 */
export interface NotificationFilters {
  tab: NotificationTab;
  category: NotificationCategory;
  priority: "ALL" | "LOW" | "NORMAL" | "HIGH" | "URGENT";
  searchQuery: string;
}

/**
 * Quy tắc cảnh báo tự động
 */
export type AlertRuleType =
  | "SLA_BREACH"
  | "SPEED_LIMIT"
  | "LOW_FUEL"
  | "INSPECTION_EXPIRY"
  | "GPS_LOST"
  | "CAPACITY_WARNING";

export interface AlertRule {
  id: string;
  type: AlertRuleType;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  unit?: string;
  notifyRoles: string[];
  severity: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: "rule-sla",
    type: "SLA_BREACH",
    name: "Cảnh báo trễ SLA",
    description: "Phát cảnh báo khi đơn hàng chậm hơn ETA dự kiến",
    enabled: true,
    threshold: 30,
    unit: "phút",
    notifyRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
    severity: "HIGH",
  },
  {
    id: "rule-speed",
    type: "SPEED_LIMIT",
    name: "Cảnh báo quá tốc độ",
    description: "Phát cảnh báo khi phương tiện vượt quá tốc độ cho phép",
    enabled: true,
    threshold: 80,
    unit: "km/h",
    notifyRoles: ["ADMIN", "DISPATCHER"],
    severity: "HIGH",
  },
  {
    id: "rule-fuel",
    type: "LOW_FUEL",
    name: "Nhiên liệu thấp",
    description: "Phát cảnh báo khi nhiên liệu phương tiện dưới ngưỡng",
    enabled: true,
    threshold: 15,
    unit: "%",
    notifyRoles: ["ADMIN", "DISPATCHER"],
    severity: "NORMAL",
  },
  {
    id: "rule-inspection",
    type: "INSPECTION_EXPIRY",
    name: "Đăng kiểm sắp hết hạn",
    description: "Phát cảnh báo trước khi đăng kiểm phương tiện hết hạn",
    enabled: true,
    threshold: 30,
    unit: "ngày",
    notifyRoles: ["ADMIN", "MANAGER"],
    severity: "NORMAL",
  },
  {
    id: "rule-gps",
    type: "GPS_LOST",
    name: "Mất tín hiệu GPS",
    description: "Phát cảnh báo khi phương tiện mất GPS quá thời gian cho phép",
    enabled: true,
    threshold: 10,
    unit: "phút",
    notifyRoles: ["ADMIN", "DISPATCHER"],
    severity: "URGENT",
  },
  {
    id: "rule-capacity",
    type: "CAPACITY_WARNING",
    name: "Kho đạt ngưỡng tải",
    description: "Phát cảnh báo khi kho bãi đạt ngưỡng công suất lưu trữ",
    enabled: true,
    threshold: 85,
    unit: "%",
    notifyRoles: ["ADMIN", "MANAGER", "WAREHOUSE_STAFF"],
    severity: "HIGH",
  },
];
