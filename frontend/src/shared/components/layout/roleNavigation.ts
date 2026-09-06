import React from "react";
import {
  LayoutDashboard,
  Package,
  Waypoints,
  Map,
  UserRound,
  Truck,
  Warehouse,
  Route,
  ChartNoAxesCombined,
  Sparkles,
  Settings,
  CircleHelp,
  CircleUser,
} from "lucide-react";
import type { UserRole } from "@/core/types/auth";

export interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
}

export interface NavGroupConfig {
  groupTitle?: string;
  items: NavItemConfig[];
}

/**
 * Danh sách nhóm phân hệ trên thanh điều hướng Sidebar
 */
export const NAV_GROUPS: NavGroupConfig[] = [
  {
    groupTitle: "Điều hành & Vận tải",
    items: [
      {
        label: "Tổng quan",
        path: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
      {
        label: "Đơn hàng",
        path: "/orders",
        icon: Package,
        allowedRoles: ["ADMIN", "DISPATCHER", "WAREHOUSE_STAFF"],
      },
      {
        label: "Điều phối",
        path: "/dispatch",
        icon: Waypoints,
        allowedRoles: ["ADMIN", "DISPATCHER"],
      },
      {
        label: "Giám sát",
        path: "/tracking",
        icon: Map,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER", "DRIVER"],
      },
    ],
  },
  {
    groupTitle: "Nguồn lực & Hạ tầng",
    items: [
      {
        label: "Tài xế",
        path: "/drivers",
        icon: UserRound,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
      {
        label: "Phương tiện",
        path: "/fleet",
        icon: Truck,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
      {
        label: "Kho hàng",
        path: "/warehouses",
        icon: Warehouse,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER", "WAREHOUSE_STAFF"],
      },
      {
        label: "Tuyến đường",
        path: "/routes",
        icon: Route,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
    ],
  },
  {
    groupTitle: "Phân tích & Thông minh",
    items: [
      {
        label: "Báo cáo & phân tích",
        path: "/reports",
        icon: ChartNoAxesCombined,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
      {
        label: "Trợ lý AI",
        path: "/ai-assistant",
        icon: Sparkles,
        allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER"],
      },
    ],
  },
];

/**
 * Danh sách toàn bộ menu chính
 */
export const MAIN_NAV_ITEMS: NavItemConfig[] = NAV_GROUPS.flatMap((g) => g.items);

/**
 * Danh sách menu tiện ích dưới chân Sidebar
 */
export const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Cài đặt",
    path: "/settings",
    icon: Settings,
    allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER", "WAREHOUSE_STAFF", "DRIVER"],
  },
  {
    label: "Trợ giúp",
    path: "/help",
    icon: CircleHelp,
    allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER", "WAREHOUSE_STAFF", "DRIVER"],
  },
  {
    label: "Tài khoản",
    path: "/profile",
    icon: CircleUser,
    allowedRoles: ["ADMIN", "MANAGER", "DISPATCHER", "WAREHOUSE_STAFF", "DRIVER"],
  },
];

/**
 * Kiểm tra xem một Role có quyền truy cập vào đường dẫn cụ thể hay không
 */
export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  if (role === "ADMIN") return true;

  const allItems = [...MAIN_NAV_ITEMS, ...BOTTOM_NAV_ITEMS];
  const matchedItem = allItems.find((item) => path.startsWith(item.path));

  if (!matchedItem || !matchedItem.allowedRoles) {
    return true;
  }

  return matchedItem.allowedRoles.includes(role);
}
