import React from "react";
import { useAuthStore } from "@/shared/stores/authStore";
import type { UserRole } from "@/core/types/auth";

/**
 * Bản đồ phân quyền cơ sở mặc định theo vai trò người dùng VietRoute TMS & WMS
 */
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "orders:view", "orders:create", "orders:edit", "orders:delete", "orders:pod",
    "dispatch:view", "dispatch:auto", "dispatch:manual", "dispatch:3d_load",
    "tracking:view", "tracking:telemetry", "tracking:geofence",
    "fleet:view", "fleet:manage", "drivers:view", "drivers:manage", "drivers:ranking",
    "warehouses:view", "warehouses:manage", "warehouses:kiosk", "warehouses:inventory",
    "routes:view", "routes:create", "routes:optimize",
    "finance:cod_view", "finance:cod_reconcile", "finance:billing_view", "finance:debt_remind",
    "reports:view", "reports:export", "ai:assistant", "audit:view",
    "staff:view", "staff:manage", "roles:manage",
  ],
  MANAGER: [
    "orders:view", "orders:create", "orders:edit", "orders:pod",
    "dispatch:view", "dispatch:auto", "dispatch:manual", "dispatch:3d_load",
    "tracking:view", "tracking:telemetry",
    "fleet:view", "drivers:view", "drivers:manage", "drivers:ranking",
    "warehouses:view", "warehouses:manage", "warehouses:kiosk", "warehouses:inventory",
    "routes:view", "routes:create", "routes:optimize",
    "finance:cod_view", "finance:billing_view",
    "reports:view", "reports:export", "ai:assistant", "audit:view",
    "staff:view",
  ],
  DISPATCHER: [
    "orders:view", "orders:create", "orders:edit",
    "dispatch:view", "dispatch:auto", "dispatch:manual", "dispatch:3d_load",
    "tracking:view", "tracking:telemetry",
    "fleet:view", "drivers:view", "drivers:ranking",
    "warehouses:view",
    "routes:view", "routes:create", "routes:optimize",
    "ai:assistant",
  ],
  WAREHOUSE_STAFF: [
    "orders:view", "orders:pod",
    "dispatch:view", "dispatch:3d_load",
    "warehouses:view", "warehouses:kiosk", "warehouses:inventory",
  ],
  DRIVER: [
    "orders:view", "orders:pod",
    "tracking:view",
    "routes:view",
  ],
};

/**
 * Hook kiểm tra quyền hạn của tài khoản đăng nhập hiện tại
 */
export function usePermission(
  permission?: string | string[],
  mode: "any" | "all" = "all"
): boolean {
  const user = useAuthStore((s) => s.user);

  if (!user) return false;
  // Quản trị viên luôn có toàn quyền
  if (user.role === "ADMIN") return true;

  if (!permission) return true;

  const perms = Array.isArray(permission) ? permission : [permission];
  const activePermissions =
    user.permissions && user.permissions.length > 0
      ? user.permissions
      : DEFAULT_ROLE_PERMISSIONS[user.role] || [];

  if (mode === "any") {
    return perms.some((p) => activePermissions.includes(p));
  }
  return perms.every((p) => activePermissions.includes(p));
}

/**
 * Hook kiểm tra vai trò cụ thể
 */
export function useRole(allowedRoles: UserRole | UserRole[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

export interface CanProps {
  permission?: string | string[];
  role?: UserRole | UserRole[];
  mode?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component <Can> bọc các nút hành động hoặc giao diện cần bảo vệ theo RBAC
 */
export const Can: React.FC<CanProps> = ({
  permission,
  role,
  mode = "all",
  fallback = null,
  children,
}) => {
  const user = useAuthStore((s) => s.user);
  const hasPerm = usePermission(permission, mode);

  if (!user) return <>{fallback}</>;
  if (user.role === "ADMIN") return <>{children}</>;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  if (permission && !hasPerm) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
