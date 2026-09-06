import type { ApiResponse } from "@/core/types/api";
import type { AuthUser, LoginCredentials, LoginResponseData, UserRole } from "@/core/types/auth";
import { MOCK_USERS } from "../data/users";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export interface DemoAccountItem {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  defaultPassword: string;
}

/**
 * 5 Tài khoản mẫu phục vụ kiểm thử nhanh đa vai trò (RBAC) trong môi trường phát triển
 */
export const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    role: "DISPATCHER",
    label: "Điều phối viên",
    name: "Nguyễn Minh Anh",
    email: "dieuphoi@vietroute.vn",
    defaultPassword: "password123",
  },
  {
    role: "MANAGER",
    label: "Quản lý",
    name: "Hoàng Minh Tuấn",
    email: "manager.hanoi@vietroute.vn",
    defaultPassword: "password123",
  },
  {
    role: "DRIVER",
    label: "Tài xế",
    name: "Nguyễn Văn An",
    email: "taixe.an@vietroute.vn",
    defaultPassword: "password123",
  },
  {
    role: "WAREHOUSE_STAFF",
    label: "Nhân viên kho",
    name: "Lê Văn Cường",
    email: "kho.longbien@vietroute.vn",
    defaultPassword: "password123",
  },
  {
    role: "ADMIN",
    label: "Quản trị viên",
    name: "Phan Vũ Linh",
    email: "admin@vietroute.vn",
    defaultPassword: "password123",
  },
];

export const mockAuthService = {
  /**
   * Giả lập xử lý đăng nhập hệ thống
   */
  async login(
    credentials: LoginCredentials,
    options?: MockServiceOptions
  ): Promise<ApiResponse<LoginResponseData | null>> {
    // Độ trễ mạng thực tế 400ms để trải nghiệm loading mượt mà
    await simulateLatency({ delayMs: options?.delayMs ?? 400 });

    const normalizedEmail = credentials.email.trim().toLowerCase();

    // Giả lập kịch bản mật khẩu sai khi nhập "wrong" hoặc "error" để kiểm thử Error State
    if (credentials.password === "wrong" || credentials.password === "error") {
      return {
        success: false,
        statusCode: 401,
        message: "Email hoặc mật khẩu không chính xác.",
        data: null,
      };
    }

    // Tìm kiếm trong danh mục người dùng mock
    let user: AuthUser | undefined = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // Nếu không có trong danh sách chuẩn nhưng là email demo
    if (!user) {
      const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === normalizedEmail);
      if (demo) {
        user = {
          id: `usr-${demo.role.toLowerCase()}-demo`,
          email: demo.email,
          full_name: demo.name,
          role: demo.role,
          status: "ACTIVE",
        };
      }
    }

    // Kiểm tra tài khoản không tồn tại
    if (!user) {
      return {
        success: false,
        statusCode: 401,
        message: "Email hoặc mật khẩu không chính xác.",
        data: null,
      };
    }

    // Tạo token giả lập
    const accessToken = `vietroute_mock_jwt_${user.id}_${Date.now()}`;

    return {
      success: true,
      statusCode: 200,
      message: "Đăng nhập thành công",
      data: {
        access_token: accessToken,
        user,
      },
    };
  },

  /**
   * Lấy danh sách tài khoản demo kiểm thử
   */
  getDemoAccounts(): DemoAccountItem[] {
    return DEMO_ACCOUNTS;
  },
};
