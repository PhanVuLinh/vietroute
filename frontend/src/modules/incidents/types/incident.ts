/**
 * Quản lý Sự cố & Khiếu nại
 */

export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "NEW" | "IN_PROGRESS" | "PENDING_REVIEW" | "RESOLVED" | "CLOSED";
export type IncidentType =
  | "DAMAGED_GOODS"
  | "LATE_DELIVERY"
  | "LOST_PACKAGE"
  | "WRONG_DELIVERY"
  | "VEHICLE_ACCIDENT"
  | "CUSTOMER_COMPLAINT"
  | "THEFT"
  | "OTHER";

export interface IncidentComment {
  id: string;
  incidentId: string;
  user: string;
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  incidentCode: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  orderCode?: string;
  driverName?: string;
  vehiclePlate?: string;
  warehouseName?: string;
  reportedBy: string;
  assignedTo?: string;
  comments: IncidentComment[];
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  DAMAGED_GOODS: "Hàng hư hỏng",
  LATE_DELIVERY: "Giao trễ",
  LOST_PACKAGE: "Mất hàng",
  WRONG_DELIVERY: "Giao sai",
  VEHICLE_ACCIDENT: "Tai nạn xe",
  CUSTOMER_COMPLAINT: "Khiếu nại KH",
  THEFT: "Trộm cắp",
  OTHER: "Khác",
};

export const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; color: string; bg: string; dot: string }
> = {
  CRITICAL: {
    label: "Nghiêm trọng",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/25",
    dot: "bg-red-500",
  },
  HIGH: {
    label: "Cao",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/25",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    label: "Trung bình",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/25",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "Thấp",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/25",
    dot: "bg-slate-400",
  },
};

export const STATUS_META: Record<
  IncidentStatus,
  { label: string; color: string; bg: string }
> = {
  NEW: { label: "Mới", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
  IN_PROGRESS: { label: "Đang xử lý", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
  PENDING_REVIEW: { label: "Chờ duyệt", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/25" },
  RESOLVED: { label: "Đã giải quyết", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
  CLOSED: { label: "Đã đóng", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10 border-slate-500/25" },
};
