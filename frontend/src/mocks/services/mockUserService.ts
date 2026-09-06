import type { ApiResponse } from "@/core/types/api";
import type { AuthUser, UserRole } from "@/core/types/auth";
import { MOCK_USERS } from "../data/users";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export const mockUserService = {
  /** Lấy danh sách toàn bộ người dùng */
  async getUsers(options?: MockServiceOptions): Promise<ApiResponse<AuthUser[]>> {
    await simulateLatency(options);
    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách người dùng thành công",
      data: MOCK_USERS,
    };
  },

  /** Tìm người dùng theo ID */
  async getUserById(id: string, options?: MockServiceOptions): Promise<ApiResponse<AuthUser | null>> {
    await simulateLatency(options);
    const user = MOCK_USERS.find((u) => u.id === id) || null;
    return {
      success: Boolean(user),
      statusCode: user ? 200 : 404,
      message: user ? "Lấy thông tin người dùng thành công" : "Không tìm thấy người dùng",
      data: user,
    };
  },

  /** Lọc người dùng theo vai trò */
  async getUsersByRole(role: UserRole, options?: MockServiceOptions): Promise<ApiResponse<AuthUser[]>> {
    await simulateLatency(options);
    const filtered = MOCK_USERS.filter((u) => u.role === role);
    return {
      success: true,
      statusCode: 200,
      message: `Lấy danh sách người dùng vai trò ${role} thành công`,
      data: filtered,
    };
  },
};
