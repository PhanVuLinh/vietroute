/**
 * 5 Vai trò phân quyền trong hệ thống VietRoute (đồng bộ với Prisma schema)
 */
export type UserRole =
  | "ADMIN"           // Quản trị viên hệ thống
  | "MANAGER"         // Quản lý vận hành logistics
  | "DISPATCHER"      // Điều phối viên giao hàng & đội xe
  | "DRIVER"          // Tài xế vận chuyển
  | "WAREHOUSE_STAFF"; // Nhân viên thủ kho

/**
 * Trạng thái tài khoản
 */
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/**
 * Thông tin người dùng đăng nhập
 */
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
}

/**
 * Thông tin gửi lên khi đăng nhập
 */
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Dữ liệu trả về khi đăng nhập thành công
 */
export interface LoginResponseData {
  access_token: string;
  user: AuthUser;
}

/**
 * Tên tiếng Việt hiển thị cho từng vai trò
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị hệ thống",
  MANAGER: "Quản lý vận hành",
  DISPATCHER: "Điều phối viên",
  DRIVER: "Tài xế",
  WAREHOUSE_STAFF: "Nhân viên kho",
};
